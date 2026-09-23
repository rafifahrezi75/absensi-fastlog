<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceAnomaly;
use App\Models\Employee;
use App\Models\OvertimeLog;
use App\Models\SystemSetting;
use Carbon\Carbon;

class AttendanceTimeWindowService
{
    public function resolveEmployee(mixed $identifier): ?Employee
    {
        if ($identifier instanceof Employee) {
            return $identifier;
        }

        if (is_numeric($identifier)) {
            $emp = Employee::find($identifier);
            if ($emp) {
                return $emp;
            }
        }

        $emp = Employee::where('pin', (string) $identifier)->first();
        if ($emp) {
            return $emp;
        }

        $emp = Employee::where('nik', (string) $identifier)->first();
        if ($emp) {
            return $emp;
        }

        if (is_numeric($identifier)) {
            $emp = Employee::where('user_id', $identifier)->first();
            if ($emp) {
                return $emp;
            }
        }

        return null;
    }

    public function isCoolingDown(int $employeeId, Carbon $tapTime): bool
    {
        $windowStart = $tapTime->copy()->subSeconds(59);
        $windowEnd = $tapTime->copy()->addSeconds(59);

        $hasRecentAnomaly = AttendanceAnomaly::where('employee_id', $employeeId)
            ->whereBetween('waktu_tap', [$windowStart, $windowEnd])
            ->exists();

        if ($hasRecentAnomaly) {
            return true;
        }

        $hasRecentOvertime = OvertimeLog::where('employee_id', $employeeId)
            ->whereBetween('waktu_tap', [$windowStart, $windowEnd])
            ->exists();

        if ($hasRecentOvertime) {
            return true;
        }

        $hasRecentAttendance = Attendance::where('employee_id', $employeeId)
            ->where(function ($q) use ($windowStart, $windowEnd) {
                $q->whereBetween('jam_masuk', [$windowStart, $windowEnd])
                  ->orWhereBetween('jam_pulang', [$windowStart, $windowEnd]);
            })
            ->exists();

        return $hasRecentAttendance;
    }

    public function processTap(mixed $employeeIdentifier, mixed $rawTapTime = null, ?string $reason = null, bool $ignoreCooldown = false): array
    {
        $employee = $this->resolveEmployee($employeeIdentifier);

        if (!$employee) {
            return [
                'success' => false,
                'status' => 'EMPLOYEE_NOT_FOUND',
                'message' => 'Karyawan tidak ditemukan.',
            ];
        }

        $tapTime = $rawTapTime ? Carbon::parse($rawTapTime) : Carbon::now();
        $date = $tapTime->toDateString();
        $timeStr = $tapTime->format('H:i:s');

        if (!$ignoreCooldown && $this->isCoolingDown($employee->id, $tapTime)) {
            return [
                'success' => false,
                'status' => 'COOLDOWN',
                'message' => 'Tap diabaikan karena berada dalam rentang jeda (< 1 menit).',
                'employee' => [
                    'id' => $employee->id,
                    'nama' => $employee->nama,
                    'pin' => $employee->pin,
                ],
                'waktu_tap' => $tapTime->toDateTimeString(),
            ];
        }

        if ($timeStr <= '09:00:59') {
            return $this->handleCheckIn($employee, $tapTime, $date, $timeStr);
        }

        if ($timeStr >= '09:01:00' && $timeStr <= '15:59:59') {
            return $this->handleAnomaly($employee, $tapTime, $date, $reason);
        }

        if ($timeStr >= '16:00:00' && $timeStr <= '17:30:59') {
            return $this->handleCheckOut($employee, $tapTime, $date);
        }

        return $this->handleOvertime($employee, $tapTime, $date);
    }

    protected function handleCheckIn(Employee $employee, Carbon $tapTime, string $date, string $timeStr): array
    {
        $attendance = Attendance::firstOrNew([
            'employee_id' => $employee->id,
            'tanggal' => $date,
        ]);

        if (!$attendance->exists) {
            $attendance->user_id = $employee->user_id;
        }

        $toleranceTime = SystemSetting::where('kunci', 'normal_tolerance')->value('nilai') ?? '15';
        $toleranceMinute = (int) $toleranceTime;
        $lateThreshold = Carbon::parse($date . ' 08:00:00')->addMinutes($toleranceMinute)->format('H:i:s');

        $status = $timeStr <= $lateThreshold ? 'hadir' : 'terlambat';

        if (!$attendance->jam_masuk) {
            $attendance->jam_masuk = $tapTime;
            $attendance->status = $status;
            $attendance->save();

            return [
                'success' => true,
                'window' => 'JAM_MASUK',
                'action' => 'JAM_MASUK_TERCATAT',
                'status' => $status,
                'message' => 'Jam masuk berhasil dicatat.',
                'attendance' => $attendance,
            ];
        }

        $existingCheckIn = Carbon::parse($attendance->jam_masuk);
        if ($tapTime->lt($existingCheckIn)) {
            $attendance->jam_masuk = $tapTime;
            $attendance->status = $status;
            $attendance->save();

            return [
                'success' => true,
                'window' => 'JAM_MASUK',
                'action' => 'JAM_MASUK_DIPERBARUI_TERAWAL',
                'status' => $status,
                'message' => 'Jam masuk diperbarui ke waktu terawal.',
                'attendance' => $attendance,
            ];
        }

        return [
            'success' => true,
            'window' => 'JAM_MASUK',
            'action' => 'JAM_MASUK_DIPERTAHANKAN_TERAWAL',
            'status' => $attendance->status,
            'message' => 'Tap berulang jam masuk diabaikan, waktu terawal dipertahankan.',
            'attendance' => $attendance,
        ];
    }

    protected function handleAnomaly(Employee $employee, Carbon $tapTime, string $date, ?string $reason): array
    {
        $attendance = Attendance::where('employee_id', $employee->id)->where('tanggal', $date)->first();

        $anomaly = AttendanceAnomaly::create([
            'employee_id' => $employee->id,
            'user_id' => $employee->user_id,
            'attendance_id' => $attendance?->id,
            'waktu_tap' => $tapTime,
            'alasan' => $reason,
            'status' => 'MENUNGGU',
        ]);

        return [
            'success' => true,
            'window' => 'DI_LUAR_JADWAL',
            'action' => 'DI_LUAR_JADWAL_TERCATAT',
            'message' => 'Tap terdeteksi pada rentang di luar jadwal. Menunggu persetujuan admin.',
            'anomaly' => $anomaly->load('employee'),
        ];
    }

    protected function handleCheckOut(Employee $employee, Carbon $tapTime, string $date): array
    {
        $attendance = Attendance::firstOrNew([
            'employee_id' => $employee->id,
            'tanggal' => $date,
        ]);

        if (!$attendance->exists) {
            $attendance->user_id = $employee->user_id;
            $attendance->status = 'hadir';
        }

        if (!$attendance->jam_pulang) {
            $attendance->jam_pulang = $tapTime;
            $attendance->save();

            return [
                'success' => true,
                'window' => 'JAM_PULANG',
                'action' => 'JAM_PULANG_TERCATAT',
                'message' => 'Jam pulang berhasil dicatat.',
                'attendance' => $attendance,
            ];
        }

        $existingCheckOut = Carbon::parse($attendance->jam_pulang);
        if ($tapTime->gt($existingCheckOut)) {
            $attendance->jam_pulang = $tapTime;
            $attendance->save();

            return [
                'success' => true,
                'window' => 'JAM_PULANG',
                'action' => 'JAM_PULANG_DIPERBARUI_TERAKHIR',
                'message' => 'Jam pulang diperbarui ke waktu terakhir.',
                'attendance' => $attendance,
            ];
        }

        return [
            'success' => true,
            'window' => 'JAM_PULANG',
            'action' => 'JAM_PULANG_DIPERTAHANKAN_TERAKHIR',
            'message' => 'Tap berulang jam pulang diabaikan, waktu terakhir dipertahankan.',
            'attendance' => $attendance,
        ];
    }

    protected function handleOvertime(Employee $employee, Carbon $tapTime, string $date): array
    {
        $attendance = Attendance::where('employee_id', $employee->id)->where('tanggal', $date)->first();

        $overtimeBase = Carbon::parse($date . ' 17:30:00');
        $durationMinutes = max(0, $overtimeBase->diffInMinutes($tapTime, false));

        $overtime = OvertimeLog::create([
            'employee_id' => $employee->id,
            'user_id' => $employee->user_id,
            'attendance_id' => $attendance?->id,
            'waktu_tap' => $tapTime,
            'durasi_menit' => (int) $durationMinutes,
            'status' => 'MENUNGGU',
        ]);

        return [
            'success' => true,
            'window' => 'LEMBUR',
            'action' => 'LEMBUR_TERCATAT',
            'message' => 'Tap lembur berhasil dicatat. Menunggu persetujuan admin.',
            'overtime' => $overtime->load('employee'),
        ];
    }

    public function approveAnomaly(AttendanceAnomaly $anomaly, array $options = []): array
    {
        $as = $options['as'] ?? 'permission';
        $adminNote = $options['admin_note'] ?? null;

        $anomaly->status = 'DISETUJUI';
        $anomaly->catatan_admin = $adminNote;
        $anomaly->save();

        $tapTime = Carbon::parse($anomaly->waktu_tap);
        $date = $tapTime->toDateString();

        $attendance = Attendance::firstOrNew([
            'employee_id' => $anomaly->employee_id,
            'tanggal' => $date,
        ]);

        if (!$attendance->exists) {
            $attendance->user_id = $anomaly->user_id;
            $attendance->status = 'hadir';
        }

        if ($as === 'check_in' || $as === 'jam_masuk') {
            $attendance->jam_masuk = $tapTime;
            $attendance->save();
        } elseif ($as === 'check_out' || $as === 'jam_pulang') {
            $attendance->jam_pulang = $tapTime;
            $attendance->save();
        }

        if (!$anomaly->attendance_id && $attendance->exists) {
            $anomaly->attendance_id = $attendance->id;
            $anomaly->save();
        }

        return [
            'success' => true,
            'message' => 'Data di luar jadwal berhasil disetujui.',
            'anomaly' => $anomaly,
            'attendance' => $attendance,
        ];
    }

    public function rejectAnomaly(AttendanceAnomaly $anomaly, ?string $adminNote = null): array
    {
        $anomaly->status = 'DITOLAK';
        $anomaly->catatan_admin = $adminNote;
        $anomaly->save();

        return [
            'success' => true,
            'message' => 'Data di luar jadwal telah ditolak.',
            'anomaly' => $anomaly,
        ];
    }

    public function approveOvertime(OvertimeLog $overtime, array $options = []): array
    {
        $adminNote = $options['admin_note'] ?? null;
        $syncCheckout = !empty($options['sync_checkout']);
        $approvedMinutes = isset($options['duration_minutes'])
            ? (int) $options['duration_minutes']
            : (isset($options['durasi_menit']) ? (int) $options['durasi_menit'] : null);

        $overtime->status = 'DISETUJUI';
        if ($approvedMinutes !== null && $approvedMinutes >= 0) {
            $overtime->durasi_menit = $approvedMinutes;
        }
        $overtime->catatan_admin = $adminNote;
        $overtime->save();

        $tapTime = Carbon::parse($overtime->waktu_tap);
        $date = $tapTime->toDateString();

        $attendance = Attendance::firstOrNew([
            'employee_id' => $overtime->employee_id,
            'tanggal' => $date,
        ]);

        if (!$attendance->exists) {
            $attendance->user_id = $overtime->user_id;
            $attendance->status = 'hadir';
        }

        if ($syncCheckout || !$attendance->jam_pulang) {
            $attendance->jam_pulang = $tapTime;
            $attendance->save();
        }

        if (!$overtime->attendance_id && $attendance->exists) {
            $overtime->attendance_id = $attendance->id;
            $overtime->save();
        }

        return [
            'success' => true,
            'message' => 'Lembur berhasil disetujui.',
            'overtime' => $overtime,
            'attendance' => $attendance,
        ];
    }

    public function rejectOvertime(OvertimeLog $overtime, ?string $adminNote = null): array
    {
        $overtime->status = 'DITOLAK';
        $overtime->catatan_admin = $adminNote;
        $overtime->save();

        return [
            'success' => true,
            'message' => 'Lembur telah ditolak.',
            'overtime' => $overtime,
        ];
    }
}
