<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use App\Models\FingerspotSyncLog;
use App\Models\TLog;
use App\Services\AttendanceTimeWindowService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $raw = $request->getContent();
        if (empty($raw)) {
            $raw = file_get_contents('php://input');
        }
        if (empty($raw) && !empty($request->all())) {
            $raw = json_encode($request->all());
        }

        $payload = json_decode((string)$raw, true);

        if (!is_array($payload) && !empty($request->all())) {
            $payload = $request->all();
        }

        $type = is_array($payload) && isset($payload['type']) ? (string)$payload['type'] : 'unknown';
        $cloudId = is_array($payload) && isset($payload['cloud_id'])
            ? (string)$payload['cloud_id']
            : config('services.fingerspot.cloud_id', 'C260503403233826');

        if (!empty($raw)) {
            TLog::create([
                'cloud_id' => $cloudId,
                'type' => $type,
                'original_data' => is_string($raw) ? $raw : json_encode($raw),
                'created_at' => now(),
            ]);
        }

        if (!is_array($payload) || !isset($payload['type'])) {
            return response('OK', 200)->header('Content-Type', 'text/plain');
        }

        if ($type === 'get_userinfo' && isset($payload['data']) && is_array($payload['data']) && isset($payload['data']['pin'])) {
            $data = $payload['data'];
            $pin = trim((string)$data['pin']);

            $cloudName = isset($data['name']) && trim((string)$data['name']) !== ''
                ? (string)$data['name']
                : null;

            $updateData = [
                'nama' => $cloudName,
                'cloud_id' => $cloudId,
                'trans_id' => isset($payload['trans_id']) ? (string)$payload['trans_id'] : null,
                'privilege' => isset($data['privilege']) ? (string)$data['privilege'] : null,
                'finger' => isset($data['finger']) ? (string)$data['finger'] : null,
                'face' => isset($data['face']) ? (string)$data['face'] : null,
                'password' => isset($data['password']) ? (string)$data['password'] : null,
                'rfid' => isset($data['rfid']) ? (string)$data['rfid'] : null,
                'vein' => isset($data['vein']) ? (string)$data['vein'] : null,
                'template' => isset($data['template']) ? (string)$data['template'] : null,
                'raw_data' => $data,
                'status' => 'active',
            ];

            if (isset($data['employee_number']) && trim((string)$data['employee_number']) !== '') {
                $updateData['nik'] = trim((string)$data['employee_number']);
            }

            Employee::updateOrCreate(
                ['pin' => $pin],
                $updateData
            );

            FingerspotSyncLog::create([
                'cloud_id' => $cloudId,
                'action' => 'webhook_userinfo',
                'records_received' => 1,
                'records_inserted' => 1,
                'status' => 'success',
                'response_message' => 'Processed get_userinfo for PIN ' . $pin . ' name: ' . ($cloudName ?? 'null'),
            ]);
        }

        if ($type === 'attlog' && isset($payload['data']) && is_array($payload['data']) && isset($payload['data']['pin'])) {
            $data = $payload['data'];
            $pin = trim((string)$data['pin']);
            $scanAt = Carbon::parse($data['scan'] ?? ($data['scan_date'] ?? now()))->format('Y-m-d H:i:s');
            $verify = isset($data['verify']) ? (string)$data['verify'] : '1';
            $statusScan = isset($data['status_scan']) ? (string)$data['status_scan'] : '0';

            $device = Device::firstOrCreate(
                ['cloud_id' => $cloudId],
                ['name' => 'Mesin Fingerprint Utama', 'location' => 'Kantor Fastlog', 'status' => 'active']
            );

            $employee = Employee::firstOrCreate(
                ['pin' => $pin],
                [
                    'cloud_id' => $cloudId,
                    'status' => 'active',
                ]
            );

            AttendanceLog::firstOrCreate(
                [
                    'cloud_id' => $cloudId,
                    'pin' => $pin,
                    'scan_at' => $scanAt,
                ],
                [
                    'employee_id' => $employee->id,
                    'device_id' => $device->id,
                    'verify_method' => $verify,
                    'status_scan' => $statusScan,
                    'raw_data' => $data,
                ]
            );

            app(AttendanceTimeWindowService::class)->processTap($employee, $scanAt);
        }

        return response('OK', 200)->header('Content-Type', 'text/plain');
    }
}
