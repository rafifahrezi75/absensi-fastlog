<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponent;
use App\Models\SalaryGrade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterPayrollController extends Controller
{
    public function indexGolongan(): JsonResponse
    {
        $grades = SalaryGrade::orderBy('kode', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'kode' => $item->kode,
                'nama' => $item->nama,
                'gajiPokok' => (float)$item->gaji_pokok,
                'tarifLembur' => (float)$item->tarif_lembur,
                'keterangan' => $item->keterangan ?: '',
                'status' => $item->status,
            ];
        });

        return response()->json([
            'golongan' => $grades,
        ]);
    }

    public function storeGolongan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:salary_grades,kode',
            'nama' => 'required|string|max:100',
            'gajiPokok' => 'required|numeric|min:0',
            'tarifLembur' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $grade = SalaryGrade::create([
            'kode' => $validated['kode'],
            'nama' => $validated['nama'],
            'gaji_pokok' => $validated['gajiPokok'],
            'tarif_lembur' => $validated['tarifLembur'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Golongan gaji berhasil ditambahkan.',
            'golongan' => [
                'id' => $grade->id,
                'kode' => $grade->kode,
                'nama' => $grade->nama,
                'gajiPokok' => (float)$grade->gaji_pokok,
                'tarifLembur' => (float)$grade->tarif_lembur,
                'keterangan' => $grade->keterangan ?: '',
                'status' => $grade->status,
            ],
        ], 201);
    }

    public function updateGolongan(Request $request, string $id): JsonResponse
    {
        $grade = SalaryGrade::findOrFail($id);

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', Rule::unique('salary_grades')->ignore($grade->id)],
            'nama' => 'required|string|max:100',
            'gajiPokok' => 'required|numeric|min:0',
            'tarifLembur' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $grade->update([
            'kode' => $validated['kode'],
            'nama' => $validated['nama'],
            'gaji_pokok' => $validated['gajiPokok'],
            'tarif_lembur' => $validated['tarifLembur'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Golongan gaji berhasil diperbarui.',
            'golongan' => [
                'id' => $grade->id,
                'kode' => $grade->kode,
                'nama' => $grade->nama,
                'gajiPokok' => (float)$grade->gaji_pokok,
                'tarifLembur' => (float)$grade->tarif_lembur,
                'keterangan' => $grade->keterangan ?: '',
                'status' => $grade->status,
            ],
        ]);
    }

    public function destroyGolongan(string $id): JsonResponse
    {
        $grade = SalaryGrade::findOrFail($id);
        $grade->delete();

        return response()->json([
            'message' => 'Golongan gaji berhasil dihapus.',
        ]);
    }

    public function indexKomponen(): JsonResponse
    {
        $components = SalaryComponent::orderBy('id', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'tipe' => $item->tipe,
                'metode' => $item->metode,
                'nilai' => (float)$item->nilai,
                'basis' => $item->basis,
                'batasDasar' => $item->batas_dasar !== null ? (float)$item->batas_dasar : null,
                'kenaPajak' => (bool)$item->kena_pajak,
                'status' => $item->status,
            ];
        });

        return response()->json([
            'komponen' => $components,
        ]);
    }

    public function storeKomponen(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'tipe' => ['required', Rule::in(['tambahan', 'potongan'])],
            'metode' => ['required', Rule::in(['nominal', 'persen', 'per_satuan', 'harian'])],
            'nilai' => 'required|numeric|min:0',
            'basis' => 'nullable|string|max:50',
            'batasDasar' => 'nullable|numeric|min:0',
            'kenaPajak' => 'nullable|boolean',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $component = SalaryComponent::create([
            'nama' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'metode' => $validated['metode'],
            'nilai' => $validated['nilai'],
            'basis' => $validated['basis'] ?? null,
            'batas_dasar' => $validated['batasDasar'] ?? null,
            'kena_pajak' => $validated['kenaPajak'] ?? false,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Komponen gaji berhasil ditambahkan.',
            'komponen' => [
                'id' => $component->id,
                'nama' => $component->nama,
                'tipe' => $component->tipe,
                'metode' => $component->metode,
                'nilai' => (float)$component->nilai,
                'basis' => $component->basis,
                'batasDasar' => $component->batas_dasar !== null ? (float)$component->batas_dasar : null,
                'kenaPajak' => (bool)$component->kena_pajak,
                'status' => $component->status,
            ],
        ], 201);
    }

    public function updateKomponen(Request $request, string $id): JsonResponse
    {
        $component = SalaryComponent::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'tipe' => ['required', Rule::in(['tambahan', 'potongan'])],
            'metode' => ['required', Rule::in(['nominal', 'persen', 'per_satuan', 'harian'])],
            'nilai' => 'required|numeric|min:0',
            'basis' => 'nullable|string|max:50',
            'batasDasar' => 'nullable|numeric|min:0',
            'kenaPajak' => 'nullable|boolean',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $component->update([
            'nama' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'metode' => $validated['metode'],
            'nilai' => $validated['nilai'],
            'basis' => $validated['basis'] ?? null,
            'batas_dasar' => $validated['batasDasar'] ?? null,
            'kena_pajak' => $validated['kenaPajak'] ?? false,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Komponen gaji berhasil diperbarui.',
            'komponen' => [
                'id' => $component->id,
                'nama' => $component->nama,
                'tipe' => $component->tipe,
                'metode' => $component->metode,
                'nilai' => (float)$component->nilai,
                'basis' => $component->basis,
                'batasDasar' => $component->batas_dasar !== null ? (float)$component->batas_dasar : null,
                'kenaPajak' => (bool)$component->kena_pajak,
                'status' => $component->status,
            ],
        ]);
    }

    public function destroyKomponen(string $id): JsonResponse
    {
        $component = SalaryComponent::findOrFail($id);
        $component->delete();

        return response()->json([
            'message' => 'Komponen gaji berhasil dihapus.',
        ]);
    }
}
