<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeHrAction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeHrActionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bulan = $request->query('bulan');
        $tanggal = $request->query('tanggal');
        $kategori = $request->query('kategori');

        $query = EmployeeHrAction::query();

        if (!empty($bulan)) {
            $query->where('tanggal', 'like', $bulan . '%');
        } elseif (!empty($tanggal)) {
            $query->whereDate('tanggal', $tanggal);
        } else {
            $curMonth = Carbon::today()->format('Y-m');
            $query->where('tanggal', 'like', $curMonth . '%');
        }

        if (!empty($kategori)) {
            $query->where('kategori', $kategori);
        }

        $actions = $query->get();

        return response()->json([
            'success' => true,
            'data' => $actions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'finger' => 'required|string',
            'nama' => 'nullable|string',
            'tanggal' => 'required|date',
            'kategori' => 'required|string',
            'tindakan' => 'required|string',
            'status' => 'nullable|string',
            'catatan' => 'nullable|string',
        ]);

        $finger = (string)$validated['finger'];
        $tanggal = Carbon::parse($validated['tanggal'])->toDateString();
        $monthStr = Carbon::parse($tanggal)->format('Y-m');
        $kategori = $validated['kategori'];
        $tindakan = $validated['tindakan'];

        $existing = EmployeeHrAction::where('finger', $finger)
            ->where('kategori', $kategori)
            ->where('tanggal', 'like', $monthStr . '%')
            ->first();

        if ($existing) {
            $existing->update([
                'nama' => $validated['nama'] ?? $existing->nama,
                'tindakan' => $tindakan,
                'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($validated['status'] ?? 'Selesai'),
                'catatan' => $validated['catatan'] ?? $existing->catatan,
                'tanggal' => $tanggal,
            ]);
            $record = $existing;
        } else {
            $record = EmployeeHrAction::create([
                'finger' => $finger,
                'nama' => $validated['nama'] ?? null,
                'tanggal' => $tanggal,
                'kategori' => $kategori,
                'tindakan' => $tindakan,
                'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($validated['status'] ?? 'Selesai'),
                'catatan' => $validated['catatan'] ?? null,
            ]);
        }

        $allForMonth = EmployeeHrAction::where('tanggal', 'like', $monthStr . '%')->get();

        return response()->json([
            'success' => true,
            'message' => 'Tindakan pegawai berhasil disimpan.',
            'data' => $record,
            'all_actions' => $allForMonth,
        ]);
    }

    public function batchStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.finger' => 'required|string',
            'items.*.nama' => 'nullable|string',
            'items.*.tanggal' => 'required|date',
            'items.*.kategori' => 'required|string',
            'items.*.tindakan' => 'required|string',
            'items.*.status' => 'nullable|string',
            'items.*.catatan' => 'nullable|string',
        ]);

        $monthStr = Carbon::today()->format('Y-m');
        foreach ($validated['items'] as $item) {
            $tgl = Carbon::parse($item['tanggal'])->toDateString();
            $monthStr = Carbon::parse($tgl)->format('Y-m');
            $tindakan = $item['tindakan'];
            $finger = (string)$item['finger'];
            $kategori = $item['kategori'];

            $existing = EmployeeHrAction::where('finger', $finger)
                ->where('kategori', $kategori)
                ->where('tanggal', 'like', $monthStr . '%')
                ->first();

            if ($existing) {
                $existing->update([
                    'nama' => $item['nama'] ?? $existing->nama,
                    'tindakan' => $tindakan,
                    'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($item['status'] ?? 'Selesai'),
                    'catatan' => $item['catatan'] ?? $existing->catatan,
                    'tanggal' => $tgl,
                ]);
            } else {
                EmployeeHrAction::create([
                    'finger' => $finger,
                    'nama' => $item['nama'] ?? null,
                    'tanggal' => $tgl,
                    'kategori' => $kategori,
                    'tindakan' => $tindakan,
                    'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($item['status'] ?? 'Selesai'),
                    'catatan' => $item['catatan'] ?? null,
                ]);
            }
        }

        $allForMonth = EmployeeHrAction::where('tanggal', 'like', $monthStr . '%')->get();

        return response()->json([
            'success' => true,
            'message' => 'Batch tindakan pegawai berhasil disimpan.',
            'all_actions' => $allForMonth,
        ]);
    }
}
