<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceAnomaly;
use App\Models\Employee;
use App\Models\OvertimeLog;
use App\Models\Permission;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category') ?? $request->query('kategori');
        $status = $request->query('status');
        $search = $request->query('search') ?? $request->query('cari');

        $query = Permission::with('employee')->latest('created_at');

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($status) && $status !== 'all') {
            $statusVal = match(strtolower($status)) {
                'pending' => 'menunggu',
                'approved' => 'disetujui',
                'rejected' => 'ditolak',
                default => strtolower($status),
            };
            $query->where('status', $statusVal);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%")
                         ->orWhere('dept', 'like', "%{$search}%");
                  });
            });
        }

        $permissions = $query->get();

        $anomaliesQuery = AttendanceAnomaly::with('employee')->latest('waktu_tap');
        $overtimeQuery = OvertimeLog::with('employee')->latest('waktu_tap');

        if (!empty($status) && $status !== 'all') {
            $statusUpper = match(strtoupper($status)) {
                'PENDING', 'MENUNGGU' => 'MENUNGGU',
                'APPROVED', 'DISETUJUI' => 'DISETUJUI',
                'REJECTED', 'DITOLAK' => 'DITOLAK',
                default => strtoupper($status),
            };
            $anomaliesQuery->where('status', $statusUpper);
            $overtimeQuery->where('status', $statusUpper);
        }

        if (!empty($search)) {
            $anomaliesQuery->where(function ($q) use ($search) {
                $q->where('alasan', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
            $overtimeQuery->where(function ($q) use ($search) {
                $q->where('catatan_admin', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
        }

        $anomalies = $anomaliesQuery->get();
        $overtimes = $overtimeQuery->get();

        $pendingPermissionsCount = Permission::where('status', 'menunggu')->count();
        $pendingAnomaliesCount = AttendanceAnomaly::where('status', 'MENUNGGU')->count();
        $pendingOvertimeCount = OvertimeLog::where('status', 'MENUNGGU')->count();

        $stats = [
            'pending' => $pendingPermissionsCount + $pendingAnomaliesCount + $pendingOvertimeCount,
            'menunggu' => $pendingPermissionsCount + $pendingAnomaliesCount + $pendingOvertimeCount,
            'di_luar_jadwal' => AttendanceAnomaly::count(),
            'izin_cuti' => Permission::whereIn('category', ['izin', 'cuti'])->count(),
            'sakit' => Permission::where('category', 'sakit')->count(),
            'lembur_dinas' => Permission::whereIn('category', ['lembur', 'dinas'])->count() + OvertimeLog::count(),
        ];

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
            'anomalies' => $anomalies,
            'overtime' => $overtimes,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $startDate = $request->input('tanggal_mulai') ?? $request->input('start_date');
        $endDate = $request->input('tanggal_selesai') ?? $request->input('end_date') ?? $startDate;
        $startTime = $request->input('jam_mulai') ?? $request->input('start_time');
        $endTime = $request->input('jam_selesai') ?? $request->input('end_time');
        $duration = $request->input('durasi') ?? $request->input('duration');
        $description = $request->input('keterangan') ?? $request->input('description');
        $status = $request->input('status') ?? 'menunggu';

        $statusVal = match(strtolower($status)) {
            'pending' => 'menunggu',
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            default => strtolower($status),
        };

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'category' => 'required|in:izin,sakit,cuti,dinas,lembur',
            'attachment' => 'nullable|file|max:5120',
            'lampiran' => 'nullable|file|max:5120',
        ]);

        if (!$startDate) {
            return response()->json(['success' => false, 'message' => 'Tanggal mulai wajib diisi.'], 422);
        }

        $employee = Employee::findOrFail($validated['employee_id']);

        $attachmentPath = null;
        $file = $request->file('attachment') ?? $request->file('lampiran');
        if ($file) {
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $file->move(public_path('uploads/permissions'), $filename);
            $attachmentPath = $filename;
        }

        if (empty($duration)) {
            if (!empty($startTime) && !empty($endTime)) {
                $duration = $startTime . ' - ' . $endTime;
            } elseif (!empty($endDate) && $endDate !== $startDate) {
                $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
                $duration = $days . ' Hari';
            } else {
                $duration = '1 Hari';
            }
        }

        $permission = Permission::create([
            'employee_id' => $employee->id,
            'user_id' => $employee->user_id,
            'category' => $validated['category'],
            'tanggal_mulai' => $startDate,
            'tanggal_selesai' => $endDate,
            'jam_mulai' => $startTime ?: null,
            'jam_selesai' => $endTime ?: null,
            'durasi' => $duration,
            'keterangan' => $description ?: null,
            'lampiran' => $attachmentPath,
            'status' => $statusVal,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin / lembur berhasil disimpan ke database.',
            'permission' => $permission->load('employee'),
        ], 201);
    }

    public function approve(Request $request, string|int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');

        $permission->status = 'disetujui';
        $permission->catatan_admin = $adminNote;
        $permission->save();

        if (in_array($permission->category, ['izin', 'sakit', 'cuti'])) {
            $startDate = Carbon::parse($permission->tanggal_mulai);
            $endDate = $permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : $startDate;

            $curr = $startDate->copy();
            while ($curr->lte($endDate)) {
                $attendance = Attendance::firstOrNew([
                    'employee_id' => $permission->employee_id,
                    'tanggal' => $curr->toDateString(),
                ]);
                if (!$attendance->exists) {
                    $attendance->user_id = $permission->user_id;
                    $attendance->status = 'hadir';
                    $attendance->save();
                }
                $curr->addDay();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil disetujui.',
            'permission' => $permission->load('employee'),
        ]);
    }

    public function reject(Request $request, string|int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');

        $permission->status = 'ditolak';
        $permission->catatan_admin = $adminNote;
        $permission->save();

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan telah ditolak.',
            'permission' => $permission->load('employee'),
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        if ($permission->lampiran && file_exists(public_path('uploads/permissions/' . $permission->lampiran))) {
            @unlink(public_path('uploads/permissions/' . $permission->lampiran));
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pengajuan berhasil dihapus.',
        ]);
    }
}
