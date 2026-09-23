<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Permission;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class UserPermissionController extends Controller
{
    protected function getOrCreateUserEmployee($user): Employee
    {
        if ($user->employee) {
            return $user->employee;
        }

        $employee = Employee::where('user_id', $user->id)
            ->orWhere('nama', $user->name)
            ->first();

        if ($employee) {
            if (!$employee->user_id) {
                $employee->update(['user_id' => $user->id]);
            }
            return $employee;
        }

        return Employee::create([
            'user_id' => $user->id,
            'nama' => $user->name,
            'nik' => 'EMP-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
            'dept' => 'Umum',
            'jabatan' => 'Staff',
            'status' => 'aktif',
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $baseQuery = Permission::where(function ($q) use ($employee, $user) {
            $q->where('employee_id', $employee->id)
              ->orWhere('user_id', $user->id);
        });

        $countIzin = (clone $baseQuery)->where('category', 'izin')->count();
        $countSakit = (clone $baseQuery)->where('category', 'sakit')->count();
        $countDinas = (clone $baseQuery)->where('category', 'dinas')->count();
        $countMenunggu = (clone $baseQuery)->where('status', 'menunggu')->count();
        $countDisetujui = (clone $baseQuery)->where('status', 'disetujui')->count();
        $countDitolak = (clone $baseQuery)->where('status', 'ditolak')->count();

        $recentPermissions = (clone $baseQuery)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'kategori' => ucfirst($p->category),
                    'raw_kategori' => $p->category,
                    'tanggal_mulai' => Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y'),
                    'tanggal_selesai' => Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                    'tanggal_format' => Carbon::parse($p->tanggal_mulai)->isSameDay(Carbon::parse($p->tanggal_selesai))
                        ? Carbon::parse($p->tanggal_mulai)->translatedFormat('l, d M Y')
                        : Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y') . ' - ' . Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                    'durasi' => $p->durasi . ' Hari',
                    'keterangan' => $p->keterangan,
                    'status' => ucfirst($p->status),
                    'raw_status' => $p->status,
                    'lampiran' => $p->lampiran ? '/uploads/permissions/' . $p->lampiran : null,
                    'catatan_admin' => $p->catatan_admin,
                    'created_at' => Carbon::parse($p->created_at)->translatedFormat('d M Y H:i'),
                ];
            });

        return response()->json([
            'employee' => [
                'id' => $employee->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'dept' => $employee->dept,
                'jabatan' => $employee->jabatan,
            ],
            'stats' => [
                'izin' => $countIzin,
                'sakit' => $countSakit,
                'dinas' => $countDinas,
                'menunggu' => $countMenunggu,
                'disetujui' => $countDisetujui,
                'ditolak' => $countDitolak,
                'total' => $countIzin + $countSakit + $countDinas,
            ],
            'recent' => $recentPermissions,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $filterJenis = $request->query('jenis');
        $filterStatus = $request->query('status');
        $search = $request->query('search');

        $query = Permission::where(function ($q) use ($employee, $user) {
            $q->where('employee_id', $employee->id)
              ->orWhere('user_id', $user->id);
        })->latest('id');

        if (!empty($filterJenis) && $filterJenis !== 'Semua Jenis') {
            $query->where('category', strtolower($filterJenis));
        }

        if (!empty($filterStatus) && $filterStatus !== 'Semua Status') {
            $query->where('status', strtolower($filterStatus));
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', '%' . $search . '%')
                  ->orWhere('category', 'like', '%' . $search . '%')
                  ->orWhere('tanggal_mulai', 'like', '%' . $search . '%')
                  ->orWhere('tanggal_selesai', 'like', '%' . $search . '%');
            });
        }

        $items = $query->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'kategori' => ucfirst($p->category),
                'raw_kategori' => $p->category,
                'tanggal_mulai' => Carbon::parse($p->tanggal_mulai)->format('Y-m-d'),
                'tanggal_selesai' => Carbon::parse($p->tanggal_selesai)->format('Y-m-d'),
                'tanggal_format' => Carbon::parse($p->tanggal_mulai)->isSameDay(Carbon::parse($p->tanggal_selesai))
                    ? Carbon::parse($p->tanggal_mulai)->translatedFormat('l, d M Y')
                    : Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y') . ' - ' . Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                'durasi' => $p->durasi . ' Hari',
                'keterangan' => $p->keterangan,
                'status' => ucfirst($p->status),
                'raw_status' => $p->status,
                'lampiran' => $p->lampiran ? '/uploads/permissions/' . $p->lampiran : null,
                'lampiran_nama' => $p->lampiran,
                'catatan_admin' => $p->catatan_admin,
                'created_at' => Carbon::parse($p->created_at)->translatedFormat('d M Y H:i'),
            ];
        });

        return response()->json([
            'permissions' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:izin,sakit,dinas,cuti,lembur,Izin,Sakit,Dinas,Cuti,Lembur',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'keterangan' => 'required|string|max:1000',
            'lampiran' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'photo_base64' => 'nullable|string',
            'location_address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $start = Carbon::parse($validated['tanggal_mulai']);
        $end = Carbon::parse($validated['tanggal_selesai']);
        $duration = $start->diffInDays($end) + 1;

        $attachmentName = null;
        $uploadDir = public_path('uploads/permissions');

        if (!File::exists($uploadDir)) {
            File::makeDirectory($uploadDir, 0755, true);
        }

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $ext = $file->getClientOriginalExtension();
            $attachmentName = 'user_' . $user->id . '_' . time() . '_' . Str::random(6) . '.' . $ext;
            $file->move($uploadDir, $attachmentName);
        } elseif (!empty($validated['photo_base64'])) {
            $base64Data = $validated['photo_base64'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $type = strtolower($type[1]);
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $attachmentName = 'cam_' . $user->id . '_' . time() . '_' . Str::random(6) . '.' . $type;
                    file_put_contents($uploadDir . '/' . $attachmentName, $decoded);
                }
            }
        }

        $keterangan = trim($validated['keterangan']);
        if (!empty($validated['location_address'])) {
            $keterangan .= ' (Lokasi: ' . $validated['location_address'] . ')';
        }

        $category = strtolower($validated['category']);

        $permission = Permission::create([
            'employee_id' => $employee->id,
            'user_id' => $user->id,
            'category' => $category,
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'durasi' => $duration,
            'keterangan' => $keterangan,
            'lampiran' => $attachmentName,
            'status' => 'menunggu',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan ' . ucfirst($category) . ' berhasil dikirimkan dan menunggu persetujuan admin.',
            'permission' => $permission,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $permission = Permission::where('id', $id)
            ->where(function ($q) use ($employee, $user) {
                $q->where('employee_id', $employee->id)
                  ->orWhere('user_id', $user->id);
            })
            ->first();

        if (!$permission) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
        }

        if ($permission->status !== 'menunggu') {
            return response()->json([
                'message' => 'Hanya pengajuan dengan status menunggu yang dapat dibatalkan.'
            ], 422);
        }

        if ($permission->lampiran) {
            $filePath = public_path('uploads/permissions/' . $permission->lampiran);
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil dibatalkan.'
        ]);
    }
}
