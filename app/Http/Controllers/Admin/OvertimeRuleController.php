<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OvertimeRuleCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OvertimeRuleController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = OvertimeRuleCategory::orderBy('id', 'asc')->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:overtime_rule_categories,kode',
            'nama' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'departemen_list' => 'nullable|array',
            'jabatan_keywords' => 'nullable|array',
            'daily_start' => 'required|string|max:10',
            'daily_rate' => 'required|numeric|min:0',
            'weekend_start' => 'required|string|max:10',
            'weekend_rate' => 'required|numeric|min:0',
            'holiday_rate' => 'required|numeric|min:0',
            'is_default' => 'nullable|boolean',
            'is_locked' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_default'])) {
                OvertimeRuleCategory::where('is_default', true)->update(['is_default' => false]);
            }

            $category = OvertimeRuleCategory::create([
                'kode' => strtoupper(trim($validated['kode'])),
                'nama' => $validated['nama'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'departemen_list' => $validated['departemen_list'] ?? [],
                'jabatan_keywords' => $validated['jabatan_keywords'] ?? [],
                'daily_start' => $validated['daily_start'],
                'daily_rate' => (float)$validated['daily_rate'],
                'weekend_start' => $validated['weekend_start'],
                'weekend_rate' => (float)$validated['weekend_rate'],
                'holiday_rate' => (float)$validated['holiday_rate'],
                'is_default' => $validated['is_default'] ?? false,
                'is_locked' => $validated['is_locked'] ?? false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Kategori lembur berhasil ditambahkan.',
                'category' => $category,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan kategori lembur.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $category = OvertimeRuleCategory::findOrFail($id);

        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:overtime_rule_categories,kode,' . $category->id,
            'nama' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'departemen_list' => 'nullable|array',
            'jabatan_keywords' => 'nullable|array',
            'daily_start' => 'required|string|max:10',
            'daily_rate' => 'required|numeric|min:0',
            'weekend_start' => 'required|string|max:10',
            'weekend_rate' => 'required|numeric|min:0',
            'holiday_rate' => 'required|numeric|min:0',
            'is_default' => 'nullable|boolean',
            'is_locked' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_default']) && !$category->is_default) {
                OvertimeRuleCategory::where('id', '!=', $category->id)->update(['is_default' => false]);
            }

            $category->update([
                'kode' => strtoupper(trim($validated['kode'])),
                'nama' => $validated['nama'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'departemen_list' => $validated['departemen_list'] ?? [],
                'jabatan_keywords' => $validated['jabatan_keywords'] ?? [],
                'daily_start' => $validated['daily_start'],
                'daily_rate' => (float)$validated['daily_rate'],
                'weekend_start' => $validated['weekend_start'],
                'weekend_rate' => (float)$validated['weekend_rate'],
                'holiday_rate' => (float)$validated['holiday_rate'],
                'is_default' => $validated['is_default'] ?? false,
                'is_locked' => $validated['is_locked'] ?? false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Kategori lembur berhasil diperbarui.',
                'category' => $category,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui kategori lembur.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroyCategory(string $id): JsonResponse
    {
        $category = OvertimeRuleCategory::findOrFail($id);

        if ($category->is_locked) {
            return response()->json([
                'message' => 'Kategori lembur ini terkunci. Hilangkan centang kunci terlebih dahulu melalui menu edit jika ingin menghapusnya.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori lembur berhasil dihapus.',
        ]);
    }
}
