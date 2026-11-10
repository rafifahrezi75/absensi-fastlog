<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\OperationalSchedule;
use App\Models\OvertimeLog;
use App\Models\SystemSetting;
use App\Services\AttendanceTimeWindowService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function tap(Request $request, AttendanceTimeWindowService $service): JsonResponse
    {
        $identifier = $request->input('pin')
            ?? $request->input('employee_id')
            ?? $request->input('nik')
            ?? $request->input('user_id')
            ?? $request->input('cloud_id');

        if (!$identifier) {
            return response()->json([
                'success' => false,
                'status' => 'INVALID_PAYLOAD',
                'message' => 'PIN, NIK, atau ID Karyawan wajib diisi.',
            ], 422);
        }

        $tapTime = $request->input('waktu_tap')
            ?? $request->input('tap_time')
            ?? $request->input('timestamp')
            ?? $request->input('jam');

        $reason = $request->input('alasan') ?? $request->input('reason');
        $ignoreCooldown = $request->boolean('ignore_cooldown', false);

        $result = $service->processTap($identifier, $tapTime, $reason, $ignoreCooldown);

        $httpCode = match ($result['status'] ?? null) {
            'EMPLOYEE_NOT_FOUND' => 404,
            'COOLDOWN' => 429,
            default => $result['success'] ? 200 : 400,
        };

        return response()->json($result, $httpCode);
    }

    public function getOvertimeLogs(Request $request): JsonResponse
    {
        $status = $request->query('status', 'MENUNGGU');
        $date = $request->query('date') ?? $request->query('tanggal');

        $overtimeQuery = OvertimeLog::nonAdmin()->with(['employee', 'attendance'])->latest('waktu_tap');

        if ($status !== 'all') {
            $statusVal = strtoupper($status) === 'PENDING' ? 'MENUNGGU' : strtoupper($status);
            $overtimeQuery->where('status', $statusVal);
        }

        if ($date) {
            $overtimeQuery->whereDate('waktu_tap', $date);
        }

        $pendingOvertimeCount = OvertimeLog::nonAdmin()->where('status', 'MENUNGGU')->count();
        $overtimes = $overtimeQuery->get();

        return response()->json([
            'success' => true,
            'counts' => [
                'pending_overtime' => $pendingOvertimeCount,
                'total_pending' => $pendingOvertimeCount,
            ],
            'overtime' => $overtimes,
        ]);
    }

    public function getAnomalies(Request $request): JsonResponse
    {
        return $this->getOvertimeLogs($request);
    }

    public function approve(Request $request, string|int $id, AttendanceTimeWindowService $service): JsonResponse
    {
        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');
        $durationMinutes = $request->input('durasi_menit') ?? $request->input('duration_minutes');
        $syncCheckout = $request->boolean('sync_checkout', true);

        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $overtime = OvertimeLog::find($cleanId);

        if (!$overtime) {
            return response()->json(['success' => false, 'message' => 'Data lembur tidak ditemukan.'], 404);
        }

        $res = $service->approveOvertime($overtime, [
            'admin_note' => $adminNote,
            'duration_minutes' => $durationMinutes,
            'sync_checkout' => $syncCheckout,
        ]);

        return response()->json($res);
    }

    public function reject(Request $request, string|int $id, AttendanceTimeWindowService $service): JsonResponse
    {
        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');
        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $overtime = OvertimeLog::find($cleanId);

        if (!$overtime) {
            return response()->json(['success' => false, 'message' => 'Data lembur tidak ditemukan.'], 404);
        }

        $res = $service->rejectOvertime($overtime, $adminNote);
        return response()->json($res);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $status = $request->input('status');
        $statusUpper = $status ? strtoupper($status) : null;
        if ($statusUpper === 'PENDING') {
            $statusUpper = 'MENUNGGU';
        }

        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');
        $overtime = OvertimeLog::find($cleanId);

        if (!$overtime) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        if ($statusUpper) {
            $overtime->status = $statusUpper;
        }

        if ($adminNote !== null) {
            $overtime->catatan_admin = $adminNote;
        }

        $overtime->save();

        return response()->json([
            'success' => true,
            'message' => 'Data lembur berhasil diperbarui.',
            'overtime' => $overtime->load('employee'),
        ]);
    }

    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $overtime = OvertimeLog::find($cleanId);

        if ($overtime) {
            return response()->json(['success' => false, 'message' => 'Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.'], 403);
        }

        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
    }
}
