<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Holiday;
use App\Models\OvertimeLog;
use App\Models\Permission;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OvertimeCalculationService
{
    public function getSettings(): array
    {
        $keys = [
            'overtime_kantor_daily_start' => '17:00',
            'overtime_kantor_daily_rate' => '50000',
            'overtime_kantor_weekend_start' => '13:00',
            'overtime_kantor_weekend_rate' => '75000',
            'overtime_kantor_holiday_rate' => '300000',
            'overtime_lapangan_daily_start' => '16:31',
            'overtime_lapangan_daily_rate' => '50000',
            'overtime_lapangan_weekend_start' => '12:01',
            'overtime_lapangan_weekend_rate' => '75000',
            'overtime_lapangan_holiday_rate' => '300000',
        ];

        $fromDb = SystemSetting::whereIn('kunci', array_keys($keys))->pluck('nilai', 'kunci')->all();

        $result = [];
        foreach ($keys as $k => $defaultVal) {
            $val = $fromDb[$k] ?? $defaultVal;
            if (str_ends_with($k, '_rate')) {
                $result[$k] = (float) $val;
            } else {
                $result[$k] = (string) $val;
            }
        }

        return $result;
    }

    public function determineStaffCategory(Employee $employee): string
    {
        $lateService = app(LateCalculationService::class);
        $cat = $lateService->determineCategory($employee);
        $code = strtoupper((string)($cat->kode ?? ''));

        if (str_contains($code, 'LAPANGAN') || str_contains($code, 'OPERASIONAL')) {
            return 'LAPANGAN';
        }

        return 'KANTOR';
    }

    public function evaluateOvertimeDay(Employee $employee, Carbon|string $dateTime): array
    {
        $dt = Carbon::parse($dateTime);
        $dateStr = $dt->toDateString();
        $timeStr = $dt->format('H:i:s');
        $staffCategory = $this->determineStaffCategory($employee);
        $catLower = strtolower($staffCategory);
        $settings = $this->getSettings();

        $isHoliday = Holiday::whereDate('tanggal', $dateStr)->exists();
        $isWeekend = $dt->isSaturday() || $dt->isSunday();

        if ($isHoliday) {
            $rate = $settings['overtime_' . $catLower . '_holiday_rate'] ?? 300000;
            return [
                'staff_category' => $staffCategory,
                'category_name' => $staffCategory === 'LAPANGAN' ? 'Staf Lapangan' : 'Staf Kantor',
                'tipe_lembur' => 'HARI_BESAR',
                'nama_tipe' => 'Lembur Hari Besar',
                'nominal' => (float)$rate,
                'start_time' => '00:00',
                'qualifies' => true,
                'date' => $dateStr,
            ];
        }

        if ($isWeekend) {
            $rate = $settings['overtime_' . $catLower . '_weekend_rate'] ?? 75000;
            if ($dt->isSunday()) {
                $start = '00:00';
                $qualifies = true;
            } else {
                $start = $settings['overtime_' . $catLower . '_weekend_start'] ?? ($staffCategory === 'LAPANGAN' ? '12:01' : '13:00');
                $startThreshold = $start . (strlen($start) === 5 ? ':00' : '');
                $qualifies = $timeStr >= $startThreshold;
            }

            return [
                'staff_category' => $staffCategory,
                'category_name' => $staffCategory === 'LAPANGAN' ? 'Staf Lapangan' : 'Staf Kantor',
                'tipe_lembur' => 'WEEKENDS',
                'nama_tipe' => 'Lembur Standby Weekends',
                'nominal' => (float)$rate,
                'start_time' => $start,
                'qualifies' => $qualifies,
                'date' => $dateStr,
            ];
        }

        $start = $settings['overtime_' . $catLower . '_daily_start'] ?? ($staffCategory === 'LAPANGAN' ? '16:31' : '17:00');
        $rate = $settings['overtime_' . $catLower . '_daily_rate'] ?? 50000;
        $startThreshold = $start . (strlen($start) === 5 ? ':00' : '');
        $qualifies = $timeStr >= $startThreshold;

        return [
            'staff_category' => $staffCategory,
            'category_name' => $staffCategory === 'LAPANGAN' ? 'Staf Lapangan' : 'Staf Kantor',
            'tipe_lembur' => 'DAILY',
            'nama_tipe' => 'Lembur Standby Daily',
            'nominal' => (float)$rate,
            'start_time' => $start,
            'qualifies' => $qualifies,
            'date' => $dateStr,
        ];
    }

    public function calculateMonthOvertime(Employee $employee, Carbon $startDate, Carbon $endDate): array
    {
        if ($employee->is_exempt) {
            return [
                'is_exempt' => true,
                'total_days' => 0,
                'total_pay' => 0,
                'daily_days' => 0,
                'weekend_days' => 0,
                'holiday_days' => 0,
                'details' => [],
            ];
        }

        $startStr = $startDate->format('Y-m-d 00:00:00');
        $endStr = $endDate->format('Y-m-d 23:59:59');

        $approvedLogs = OvertimeLog::where('employee_id', $employee->id)
            ->whereBetween('waktu_tap', [$startStr, $endStr])
            ->whereIn(DB::raw('UPPER(status)'), ['DISETUJUI', 'APPROVED'])
            ->get();

        $approvedPermissions = Permission::where('employee_id', $employee->id)
            ->where(DB::raw('LOWER(category)'), 'lembur')
            ->whereIn(DB::raw('LOWER(status)'), ['disetujui', 'approved'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal_mulai', [$startDate->toDateString(), $endDate->toDateString()])
                  ->orWhereBetween('tanggal_selesai', [$startDate->toDateString(), $endDate->toDateString()]);
            })
            ->get();

        $daysApproved = [];

        foreach ($approvedLogs as $log) {
            $d = Carbon::parse($log->waktu_tap)->format('Y-m-d');
            if (!isset($daysApproved[$d])) {
                $daysApproved[$d] = [
                    'source' => 'mesin',
                    'time' => Carbon::parse($log->waktu_tap),
                    'ref_id' => $log->id,
                ];
            }
        }

        foreach ($approvedPermissions as $perm) {
            $pStart = Carbon::parse($perm->tanggal_mulai);
            $pEnd = $perm->tanggal_selesai ? Carbon::parse($perm->tanggal_selesai) : $pStart;
            $curr = $pStart->copy();
            while ($curr->lte($pEnd)) {
                $d = $curr->format('Y-m-d');
                if ($curr->gte($startDate) && $curr->lte($endDate)) {
                    if (!isset($daysApproved[$d])) {
                        $tapTime = Carbon::parse($d . ' ' . ($perm->jam_mulai ?: '18:00:00'));
                        $daysApproved[$d] = [
                            'source' => 'pengajuan',
                            'time' => $tapTime,
                            'ref_id' => $perm->id,
                        ];
                    }
                }
                $curr->addDay();
            }
        }

        ksort($daysApproved);

        $dailyDays = 0;
        $weekendDays = 0;
        $holidayDays = 0;
        $totalPay = 0;
        $details = [];

        foreach ($daysApproved as $dateStr => $info) {
            $eval = $this->evaluateOvertimeDay($employee, $info['time']);
            $nominal = (float)$eval['nominal'];

            if ($eval['tipe_lembur'] === 'HARI_BESAR') {
                $holidayDays++;
            } elseif ($eval['tipe_lembur'] === 'WEEKENDS') {
                $weekendDays++;
            } else {
                $dailyDays++;
            }

            $totalPay += $nominal;

            $details[$dateStr] = [
                'date' => $dateStr,
                'source' => $info['source'],
                'ref_id' => $info['ref_id'],
                'tipe_lembur' => $eval['tipe_lembur'],
                'nama_tipe' => $eval['nama_tipe'],
                'nominal' => $nominal,
                'staff_category' => $eval['staff_category'],
            ];
        }

        return [
            'is_exempt' => false,
            'total_days' => count($daysApproved),
            'total_pay' => $totalPay,
            'daily_days' => $dailyDays,
            'weekend_days' => $weekendDays,
            'holiday_days' => $holidayDays,
            'details' => $details,
        ];
    }
}
