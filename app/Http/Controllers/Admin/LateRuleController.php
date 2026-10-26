<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LateRuleCategory;
use App\Models\LateRuleTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LateRuleController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = LateRuleCategory::with('tiers')
            ->withCount('employees')
            ->orderBy('id', 'asc')
            ->get();

        $exemptEmployees = Employee::where('is_exempt', true)
            ->select('id', 'nama', 'nik', 'pin', 'dept', 'jabatan', 'is_exempt')
            ->get();

        return response()->json([
            'categories' => $categories,
            'exempt_employees' => $exemptEmployees,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:late_rule_categories,kode',
            'nama' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'toleransi_bulanan' => 'required|integer|min:0',
            'departemen_list' => 'nullable|array',
            'jabatan_keywords' => 'nullable|array',
            'is_default' => 'nullable|boolean',
            'tiers' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_default'])) {
                LateRuleCategory::where('is_default', true)->update(['is_default' => false]);
            }

            $category = LateRuleCategory::create([
                'kode' => strtoupper(trim($validated['kode'])),
                'nama' => $validated['nama'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'toleransi_bulanan' => $validated['toleransi_bulanan'],
                'departemen_list' => $validated['departemen_list'] ?? [],
                'jabatan_keywords' => $validated['jabatan_keywords'] ?? [],
                'is_default' => $validated['is_default'] ?? false,
            ]);

            if (!empty($validated['tiers']) && is_array($validated['tiers'])) {
                foreach ($validated['tiers'] as $index => $tierData) {
                    $category->tiers()->create([
                        'tier_order' => $tierData['tier_order'] ?? ($index + 1),
                        'nama_tier' => $tierData['nama_tier'] ?? 'Tier ' . ($index + 1),
                        'min_menit' => (int)($tierData['min_menit'] ?? 1),
                        'max_menit' => isset($tierData['max_menit']) && $tierData['max_menit'] !== '' ? (int)$tierData['max_menit'] : null,
                        'ada_toleransi' => !empty($tierData['ada_toleransi']),
                        'nominal_denda' => (float)($tierData['nominal_denda'] ?? 0),
                        'deskripsi' => $tierData['deskripsi'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Kategori keterlambatan berhasil ditambahkan.',
                'category' => $category->load('tiers'),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan kategori keterlambatan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $category = LateRuleCategory::findOrFail($id);

        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:late_rule_categories,kode,' . $category->id,
            'nama' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'toleransi_bulanan' => 'required|integer|min:0',
            'departemen_list' => 'nullable|array',
            'jabatan_keywords' => 'nullable|array',
            'is_default' => 'nullable|boolean',
            'tiers' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            if (!empty($validated['is_default']) && !$category->is_default) {
                LateRuleCategory::where('id', '!=', $category->id)->update(['is_default' => false]);
            }

            $category->update([
                'kode' => strtoupper(trim($validated['kode'])),
                'nama' => $validated['nama'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'toleransi_bulanan' => $validated['toleransi_bulanan'],
                'departemen_list' => $validated['departemen_list'] ?? [],
                'jabatan_keywords' => $validated['jabatan_keywords'] ?? [],
                'is_default' => $validated['is_default'] ?? false,
            ]);

            if (isset($validated['tiers']) && is_array($validated['tiers'])) {
                $category->tiers()->delete();
                foreach ($validated['tiers'] as $index => $tierData) {
                    $category->tiers()->create([
                        'tier_order' => $tierData['tier_order'] ?? ($index + 1),
                        'nama_tier' => $tierData['nama_tier'] ?? 'Tier ' . ($index + 1),
                        'min_menit' => (int)($tierData['min_menit'] ?? 1),
                        'max_menit' => isset($tierData['max_menit']) && $tierData['max_menit'] !== '' ? (int)$tierData['max_menit'] : null,
                        'ada_toleransi' => !empty($tierData['ada_toleransi']),
                        'nominal_denda' => (float)($tierData['nominal_denda'] ?? 0),
                        'deskripsi' => $tierData['deskripsi'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Kategori keterlambatan berhasil diperbarui.',
                'category' => $category->load('tiers'),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui kategori keterlambatan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroyCategory(string $id): JsonResponse
    {
        $category = LateRuleCategory::findOrFail($id);

        Employee::where('late_category_id', $category->id)->update(['late_category_id' => null]);
        $category->delete();

        return response()->json([
            'message' => 'Kategori keterlambatan berhasil dihapus.',
        ]);
    }

    public function toggleExemption(Request $request, string $employeeId): JsonResponse
    {
        $employee = Employee::findOrFail($employeeId);
        $employee->is_exempt = !$employee->is_exempt;
        $employee->save();

        return response()->json([
            'message' => 'Status pengkhususan karyawan berhasil diperbarui.',
            'is_exempt' => $employee->is_exempt,
            'employee' => $employee,
        ]);
    }
}
