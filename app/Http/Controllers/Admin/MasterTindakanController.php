<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterTindakan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterTindakanController extends Controller
{
    public function index(): JsonResponse
    {
        $items = MasterTindakan::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'jumlah_kasus' => 'nullable|integer',
            'jumlahKasus' => 'nullable|integer',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        $jumlahKasus = $validated['jumlah_kasus'] ?? $validated['jumlahKasus'] ?? 0;

        $tindakan = MasterTindakan::create([
            'nama' => $validated['nama'],
            'kategori' => $validated['kategori'],
            'jumlah_kasus' => $jumlahKasus,
            'status' => $validated['status'] ?? 'aktif',
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil ditambahkan.',
            'data' => $tindakan,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tindakan = MasterTindakan::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'nullable|string|max:255',
            'kategori' => 'nullable|string|max:255',
            'jumlah_kasus' => 'nullable|integer',
            'jumlahKasus' => 'nullable|integer',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        if (isset($validated['nama'])) {
            $tindakan->nama = $validated['nama'];
        }
        if (isset($validated['kategori'])) {
            $tindakan->kategori = $validated['kategori'];
        }
        if (array_key_exists('jumlah_kasus', $validated)) {
            $tindakan->jumlah_kasus = $validated['jumlah_kasus'];
        } elseif (array_key_exists('jumlahKasus', $validated)) {
            $tindakan->jumlah_kasus = $validated['jumlahKasus'];
        }
        if (isset($validated['status'])) {
            $tindakan->status = $validated['status'];
        }
        if (array_key_exists('keterangan', $validated)) {
            $tindakan->keterangan = $validated['keterangan'];
        }

        $tindakan->save();

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil diperbarui.',
            'data' => $tindakan,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tindakan = MasterTindakan::findOrFail($id);
        $tindakan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil dihapus.',
        ]);
    }
}
