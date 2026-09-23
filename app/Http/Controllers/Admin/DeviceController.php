<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use App\Models\FingerspotSyncLog;
use App\Services\FingerspotService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DeviceController extends Controller
{
    public function index(): JsonResponse
    {
        $cloudId = config('services.fingerspot.cloud_id', 'C260503403233826');
        $apiUrl = config('services.fingerspot.api_url', 'https://developer.fingerspot.io/api');

        $device = Device::firstOrCreate(
            ['cloud_id' => $cloudId],
            [
                'name' => 'Mesin Fingerprint Utama',
                'location' => 'Kantor Fastlog',
                'status' => 'aktif',
            ]
        );

        $totalScans = AttendanceLog::count();
        $totalEmployees = Employee::count();
        $lastSync = FingerspotSyncLog::latest('id')->first();
        
        $recentSyncLogs = FingerspotSyncLog::latest('id')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'status' => $log->status,
                    'records_received' => $log->records_received,
                    'records_inserted' => $log->records_inserted,
                    'message' => $log->response_message,
                    'created_at' => Carbon::parse($log->created_at)->translatedFormat('d M Y H:i:s'),
                ];
            });

        $recentScans = AttendanceLog::with('employee')
            ->latest('scan_at')
            ->limit(8)
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'pin' => $scan->pin,
                    'nama' => $scan->employee ? $scan->employee->nama : 'Belum Sinkron',
                    'dept' => $scan->employee ? $scan->employee->dept : 'Umum',
                    'scan_at' => Carbon::parse($scan->scan_at)->translatedFormat('d M Y H:i:s'),
                    'verify_method' => $scan->verify_method,
                    'status_scan' => $scan->status_scan === '1' ? 'Keluar' : 'Masuk',
                ];
            });

        return response()->json([
            'device' => [
                'id' => $device->id,
                'name' => $device->name,
                'model' => 'Fingerspot Revo / LXP Series',
                'cloud_id' => $device->cloud_id,
                'location' => $device->location,
                'status' => $device->status,
                'api_url' => $apiUrl,
                'photo_url' => '/images/mesin-fingerspot.png',
                'last_activity' => $lastSync ? Carbon::parse($lastSync->created_at)->diffForHumans() : 'Belum pernah',
            ],
            'stats' => [
                'total_scans' => $totalScans,
                'total_employees' => $totalEmployees,
                'total_sync_runs' => FingerspotSyncLog::count(),
                'last_sync_time' => $lastSync ? Carbon::parse($lastSync->created_at)->translatedFormat('d M Y H:i:s') : '-',
                'last_sync_status' => $lastSync ? $lastSync->status : 'none',
            ],
            'recent_sync_logs' => $recentSyncLogs,
            'recent_scans' => $recentScans,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'location' => 'required|string|max:200',
            'status' => 'required|string|in:aktif,nonaktif,active,inactive',
        ]);

        $device = Device::findOrFail($id);
        $device->update([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'status' => in_array($validated['status'], ['aktif', 'active']) ? 'aktif' : 'nonaktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Informasi mesin sidik jari berhasil diperbarui.',
            'device' => $device,
        ]);
    }

    public function ping(): JsonResponse
    {
        $apiUrl = rtrim(config('services.fingerspot.api_url', 'https://developer.fingerspot.io/api'), '/');
        $cloudId = config('services.fingerspot.cloud_id', 'C260503403233826');
        $apiToken = config('services.fingerspot.api_token', 'JQY4F93WNJ28QYG8');

        $startTime = microtime(true);
        try {
            $response = Http::withoutVerifying()
                ->withToken($apiToken)
                ->asJson()
                ->acceptJson()
                ->timeout(6)
                ->post($apiUrl . '/get_attlog', [
                    'trans_id' => 'ping_' . time(),
                    'cloud_id' => $cloudId,
                    'start_date' => date('Y-m-d'),
                    'end_date' => date('Y-m-d'),
                ]);

            $latency = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'status' => 'online',
                    'latency_ms' => $latency,
                    'message' => 'Koneksi ke Fingerspot Cloud berhasil. Latensi: ' . $latency . ' ms.',
                ]);
            }

            return response()->json([
                'success' => false,
                'status' => 'terkendala',
                'latency_ms' => $latency,
                'message' => 'Server Cloud merespons dengan status HTTP ' . $response->status(),
            ], 400);
        } catch (\Throwable $e) {
            $latency = round((microtime(true) - $startTime) * 1000);
            return response()->json([
                'success' => false,
                'status' => 'offline',
                'latency_ms' => $latency,
                'message' => 'Gagal terhubung ke Fingerspot Cloud: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function syncLogs(Request $request, FingerspotService $service): JsonResponse
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $result = $service->fetchAttLog($startDate, $endDate);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function syncUsers(FingerspotService $service): JsonResponse
    {
        $result = $service->syncAllUserInfo();

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}
