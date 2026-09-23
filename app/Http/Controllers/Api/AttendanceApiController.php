<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceAnomaly;
use App\Models\OvertimeLog;
use App\Services\AttendanceTimeWindowService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function tap(Request $request, AttendanceTimeWindowService $service): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'nullable',
            'pin' => 'nullable',
            'user_id' => 'nullable',
            'nik' => 'nullable',
            'tap_time' => 'nullable|date',
            'waktu_tap' => 'nullable|date',
            'reason' => 'nullable|string|max:500',
            'alasan' => 'nullable|string|max:500',
        ]);

        $identifier = $validated['employee_id'] 
            ?? $validated['pin'] 
            ?? $validated['user_id'] 
            ?? $validated['nik'] 
            ?? ($request->user()?->id);

        if (!$identifier) {
            return response()->json([
                'success' => false,
                'status' => 'IDENTIFIKASI_TIDAK_VALID',
                'message' => 'Identifikasi karyawan (employee_id, pin, atau user_id) wajib disertakan.',
            ], 422);
        }

        $tapTime = $validated['waktu_tap'] ?? $validated['tap_time'] ?? null;
        $reason = $validated['alasan'] ?? $validated['reason'] ?? null;

        $result = $service->processTap($identifier, $tapTime, $reason);

        $httpCode = $result['success'] ? 200 : 400;

        return response()->json($result, $httpCode);
    }

    public function getAnomalies(Request $request): JsonResponse
    {
        $status = $request->query('status', 'MENUNGGU');
        $type = $request->query('type', 'all');
        $date = $request->query('date') ?? $request->query('tanggal');

        $anomaliesQuery = AttendanceAnomaly::with(['employee', 'attendance'])->latest('waktu_tap');
        $overtimeQuery = OvertimeLog::with(['employee', 'attendance'])->latest('waktu_tap');

        if ($status !== 'all') {
            $statusVal = strtoupper($status) === 'PENDING' ? 'MENUNGGU' : strtoupper($status);
            $anomaliesQuery->where('status', $statusVal);
            $overtimeQuery->where('status', $statusVal);
        }

        if ($date) {
            $anomaliesQuery->whereDate('waktu_tap', $date);
            $overtimeQuery->whereDate('waktu_tap', $date);
        }

        $pendingAnomaliesCount = AttendanceAnomaly::where('status', 'MENUNGGU')->count();
        $pendingOvertimeCount = OvertimeLog::where('status', 'MENUNGGU')->count();

        $anomalies = ($type === 'overtime') ? [] : $anomaliesQuery->get();
        $overtimes = ($type === 'anomaly') ? [] : $overtimeQuery->get();

        return response()->json([
            'success' => true,
            'counts' => [
                'pending_anomalies' => $pendingAnomaliesCount,
                'pending_overtime' => $pendingOvertimeCount,
                'total_pending' => $pendingAnomaliesCount + $pendingOvertimeCount,
            ],
            'anomalies' => $anomalies,
            'overtime' => $overtimes,
        ]);
    }

    public function approve(Request $request, string|int $id, AttendanceTimeWindowService $service): JsonResponse
    {
        $type = $request->input('type');
        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');
        $as = $request->input('as', 'permission');
        $durationMinutes = $request->input('durasi_menit') ?? $request->input('duration_minutes');
        $syncCheckout = $request->boolean('sync_checkout', true);

        if ($type === 'overtime' || $type === 'lembur') {
            $overtime = OvertimeLog::find($id);
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

        if ($type === 'anomaly' || $type === 'di_luar_jadwal') {
            $anomaly = AttendanceAnomaly::find($id);
            if (!$anomaly) {
                return response()->json(['success' => false, 'message' => 'Data di luar jadwal tidak ditemukan.'], 404);
            }
            $res = $service->approveAnomaly($anomaly, [
                'as' => $as,
                'admin_note' => $adminNote,
            ]);
            return response()->json($res);
        }

        $anomaly = AttendanceAnomaly::find($id);
        if ($anomaly) {
            $res = $service->approveAnomaly($anomaly, [
                'as' => $as,
                'admin_note' => $adminNote,
            ]);
            return response()->json($res);
        }

        $overtime = OvertimeLog::find($id);
        if ($overtime) {
            $res = $service->approveOvertime($overtime, [
                'admin_note' => $adminNote,
                'duration_minutes' => $durationMinutes,
                'sync_checkout' => $syncCheckout,
            ]);
            return response()->json($res);
        }

        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
    }

    public function reject(Request $request, string|int $id, AttendanceTimeWindowService $service): JsonResponse
    {
        $type = $request->input('type');
        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');

        if ($type === 'overtime' || $type === 'lembur') {
            $overtime = OvertimeLog::find($id);
            if (!$overtime) {
                return response()->json(['success' => false, 'message' => 'Data lembur tidak ditemukan.'], 404);
            }
            $res = $service->rejectOvertime($overtime, $adminNote);
            return response()->json($res);
        }

        if ($type === 'anomaly' || $type === 'di_luar_jadwal') {
            $anomaly = AttendanceAnomaly::find($id);
            if (!$anomaly) {
                return response()->json(['success' => false, 'message' => 'Data di luar jadwal tidak ditemukan.'], 404);
            }
            $res = $service->rejectAnomaly($anomaly, $adminNote);
            return response()->json($res);
        }

        $anomaly = AttendanceAnomaly::find($id);
        if ($anomaly) {
            $res = $service->rejectAnomaly($anomaly, $adminNote);
            return response()->json($res);
        }

        $overtime = OvertimeLog::find($id);
        if ($overtime) {
            $res = $service->rejectOvertime($overtime, $adminNote);
            return response()->json($res);
        }

        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
    }
}
