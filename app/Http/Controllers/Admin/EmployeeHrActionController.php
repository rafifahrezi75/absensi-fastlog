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
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();
        $kategori = $request->query('kategori');

        $query = EmployeeHrAction::whereDate('tanggal', $tanggal);

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
        $kategori = $validated['kategori'];
        $tindakan = $validated['tindakan'];

        $record = EmployeeHrAction::updateOrCreate(
            [
                'finger' => $finger,
                'tanggal' => $tanggal,
                'kategori' => $kategori,
            ],
            [
                'nama' => $validated['nama'] ?? null,
                'tindakan' => $tindakan,
                'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($validated['status'] ?? 'Selesai'),
                'catatan' => $validated['catatan'] ?? null,
            ]
        );

        $allForDate = EmployeeHrAction::whereDate('tanggal', $tanggal)->get();

        return response()->json([
            'success' => true,
            'message' => 'Tindakan pegawai berhasil disimpan.',
            'data' => $record,
            'all_actions' => $allForDate,
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

        $tanggal = null;
        foreach ($validated['items'] as $item) {
            $tgl = Carbon::parse($item['tanggal'])->toDateString();
            if (!$tanggal) {
                $tanggal = $tgl;
            }
            $tindakan = $item['tindakan'];
            EmployeeHrAction::updateOrCreate(
                [
                    'finger' => (string)$item['finger'],
                    'tanggal' => $tgl,
                    'kategori' => $item['kategori'],
                ],
                [
                    'nama' => $item['nama'] ?? null,
                    'tindakan' => $tindakan,
                    'status' => $tindakan === 'Tidak Ada Tindakan' ? 'Pending' : ($item['status'] ?? 'Selesai'),
                    'catatan' => $item['catatan'] ?? null,
                ]
            );
        }

        $allForDate = $tanggal ? EmployeeHrAction::whereDate('tanggal', $tanggal)->get() : [];

        return response()->json([
            'success' => true,
            'message' => 'Batch tindakan pegawai berhasil disimpan.',
            'all_actions' => $allForDate,
        ]);
    }
}
