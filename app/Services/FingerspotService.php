<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use App\Models\FingerspotSyncLog;
use App\Models\TLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class FingerspotService
{
    protected string $cloudId;
    protected string $apiToken;
    protected string $apiUrl;

    public function __construct()
    {
        $this->cloudId = config('services.fingerspot.cloud_id', 'C260503403233826');
        $this->apiToken = config('services.fingerspot.api_token', 'JQY4F93WNJ28QYG8');
        $this->apiUrl = rtrim(config('services.fingerspot.api_url', 'https://developer.fingerspot.io/api'), '/');
    }

    public function requestUserInfo(string $pin): array
    {
        $endpoint = $this->apiUrl . '/get_userinfo';
        $payload = [
            'trans_id' => (string)time(),
            'cloud_id' => $this->cloudId,
            'pin' => $pin,
        ];

        try {
            $response = Http::withoutVerifying()
                ->withToken($this->apiToken)
                ->asJson()
                ->acceptJson()
                ->timeout(10)
                ->post($endpoint, $payload);

            TLog::create([
                'cloud_id' => $this->cloudId,
                'type' => 'get_userinfo',
                'original_data' => $response->body(),
                'created_at' => now(),
            ]);

            if ($response->successful()) {
                $resData = $response->json();
                if (isset($resData['data']) && is_array($resData['data'])) {
                    $userData = $resData['data'];
                    $cloudName = isset($userData['name']) && trim((string)$userData['name']) !== ''
                        ? trim((string)$userData['name'])
                        : null;

                    Employee::updateOrCreate(
                        ['pin' => $pin],
                        [
                            'nama' => $cloudName,
                            'cloud_id' => $this->cloudId,
                            'trans_id' => $resData['trans_id'] ?? null,
                            'privilege' => isset($userData['privilege']) ? (string)$userData['privilege'] : null,
                            'finger' => isset($userData['finger']) ? (string)$userData['finger'] : null,
                            'face' => isset($userData['face']) ? (string)$userData['face'] : null,
                            'password' => isset($userData['password']) ? (string)$userData['password'] : null,
                            'rfid' => isset($userData['rfid']) ? (string)$userData['rfid'] : null,
                            'vein' => isset($userData['vein']) ? (string)$userData['vein'] : null,
                            'template' => isset($userData['template']) ? (string)$userData['template'] : null,
                            'raw_data' => $userData,
                            'status' => 'active',
                        ]
                    );

                    return [
                        'success' => true,
                        'name' => $cloudName,
                        'data' => $userData,
                    ];
                }

                return [
                    'success' => true,
                    'message' => 'Triggered user info from cloud',
                    'data' => $resData,
                ];
            }

            return [
                'success' => false,
                'message' => 'HTTP error: ' . $response->status(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function syncAllUserInfo(): array
    {
        $employees = Employee::whereNotNull('pin')->get();
        $synced = 0;

        foreach ($employees as $emp) {
            $res = $this->requestUserInfo((string)$emp->pin);
            if (!empty($res['name'])) {
                $synced++;
            }
        }

        return [
            'success' => true,
            'total' => $employees->count(),
            'synced' => $synced,
            'message' => "Permintaan info user ke cloud berhasil dikirimkan untuk {$employees->count()} PIN karyawan.",
        ];
    }

    public function fetchAttLog(?string $startDate = null, ?string $endDate = null): array
    {
        if (empty($startDate)) {
            $startDate = Carbon::now()->subDay()->format('Y-m-d');
        }
        if (empty($endDate)) {
            $endDate = Carbon::now()->format('Y-m-d');
        }

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($start->gt($end)) {
            $temp = $startDate;
            $startDate = $endDate;
            $endDate = $temp;
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
        }

        if ($start->diffInDays($end) > 2) {
            return [
                'success' => false,
                'message' => 'Rentang tanggal tidak boleh lebih dari 2 hari.',
                'total_received' => 0,
                'total_inserted' => 0,
                'total_skipped' => 0,
            ];
        }

        $endpoint = $this->apiUrl . '/get_attlog';
        $payload = [
            'trans_id' => '1',
            'cloud_id' => $this->cloudId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];

        try {
            $response = Http::withoutVerifying()
                ->withToken($this->apiToken)
                ->asJson()
                ->acceptJson()
                ->timeout(20)
                ->post($endpoint, $payload);

            TLog::create([
                'cloud_id' => $this->cloudId,
                'type' => 'get_attlog',
                'original_data' => $response->body(),
                'created_at' => now(),
            ]);

            if (!$response->successful()) {
                FingerspotSyncLog::create([
                    'cloud_id' => $this->cloudId,
                    'action' => 'get_attlog',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'records_received' => 0,
                    'records_inserted' => 0,
                    'status' => 'error',
                    'response_message' => 'HTTP error: ' . $response->status(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Gagal menghubungi server Fingerspot Cloud (HTTP ' . $response->status() . ').',
                    'total_received' => 0,
                    'total_inserted' => 0,
                    'total_skipped' => 0,
                ];
            }

            $data = $response->json();
            $records = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];
            $totalReceived = count($records);
            $totalInserted = 0;
            $totalSkipped = 0;

            $device = Device::firstOrCreate(
                ['cloud_id' => $this->cloudId],
                ['name' => 'Mesin Fingerprint Utama', 'location' => 'Kantor Fastlog', 'status' => 'active']
            );

            foreach ($records as $item) {
                if (!isset($item['pin']) || !isset($item['scan_date'])) {
                    continue;
                }

                $pin = trim((string)$item['pin']);
                $scanAt = Carbon::parse($item['scan_date'])->format('Y-m-d H:i:s');
                $verifyMethod = isset($item['verify']) ? (string)$item['verify'] : '1';
                $statusScan = isset($item['status_scan']) ? (string)$item['status_scan'] : '0';

                $cloudName = null;
                if (isset($item['name']) && trim((string)$item['name']) !== '') {
                    $cloudName = trim((string)$item['name']);
                }

                $employee = Employee::where('pin', $pin)->first();
                if (!$employee) {
                    $employee = Employee::create([
                        'pin' => $pin,
                        'nama' => $cloudName,
                        'cloud_id' => $this->cloudId,
                        'status' => 'active',
                    ]);

                    $this->requestUserInfo($pin);
                } elseif ($cloudName && $employee->nama !== $cloudName) {
                    $employee->update(['nama' => $cloudName]);
                }

                $log = AttendanceLog::firstOrCreate(
                    [
                        'cloud_id' => $this->cloudId,
                        'pin' => $pin,
                        'scan_at' => $scanAt,
                    ],
                    [
                        'employee_id' => $employee->id,
                        'device_id' => $device->id,
                        'verify_method' => $verifyMethod,
                        'status_scan' => $statusScan,
                        'raw_data' => $item,
                    ]
                );

                if ($log->wasRecentlyCreated) {
                    $totalInserted++;
                } else {
                    $totalSkipped++;
                }
            }

            FingerspotSyncLog::create([
                'cloud_id' => $this->cloudId,
                'action' => 'get_attlog',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'records_received' => $totalReceived,
                'records_inserted' => $totalInserted,
                'status' => 'success',
                'response_message' => "Diterima: {$totalReceived}, Masuk: {$totalInserted}, Dilewati: {$totalSkipped}",
            ]);

            return [
                'success' => true,
                'message' => "Sinkronisasi berhasil: {$totalReceived} data diterima, {$totalInserted} data baru tersimpan, {$totalSkipped} duplikat dilewati.",
                'total_received' => $totalReceived,
                'total_inserted' => $totalInserted,
                'total_skipped' => $totalSkipped,
            ];
        } catch (\Throwable $e) {
            FingerspotSyncLog::create([
                'cloud_id' => $this->cloudId,
                'action' => 'get_attlog',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'records_received' => 0,
                'records_inserted' => 0,
                'status' => 'error',
                'response_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses data cloud: ' . $e->getMessage(),
                'total_received' => 0,
                'total_inserted' => 0,
                'total_skipped' => 0,
            ];
        }
    }
}
