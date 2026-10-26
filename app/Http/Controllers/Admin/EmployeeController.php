<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\SalaryGrade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(): JsonResponse
    {
        $employees = Employee::with(['salaryGrade', 'lateCategory'])->orderByRaw('nama IS NULL, nama ASC, CAST(pin AS UNSIGNED) ASC')->get();

        return response()->json([
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:150',
            'nik' => 'nullable|string|max:50|unique:employees,nik',
            'pin' => 'nullable|string|max:50|unique:employees,pin',
            'dept' => 'nullable|string|max:100',
            'jabatan' => 'nullable|string|max:100',
            'salary_grade_id' => 'nullable|exists:salary_grades,id',
            'late_category_id' => 'nullable|exists:late_rule_categories,id',
            'is_exempt' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'aktif', 'nonaktif'])],
        ]);

        if (empty($validated['salary_grade_id'])) {
            $defaultGrade = SalaryGrade::where('kode', 'GOL-03')->first() ?? SalaryGrade::first();
            $validated['salary_grade_id'] = $defaultGrade?->id;
        }

        if (isset($validated['status'])) {
            $validated['status'] = match($validated['status']) {
                'active' => 'aktif',
                'inactive' => 'nonaktif',
                default => $validated['status'],
            };
        }

        $employee = Employee::create($validated);
        $employee->load(['salaryGrade', 'lateCategory']);

        return response()->json([
            'message' => 'Data karyawan berhasil ditambahkan.',
            'employee' => $employee,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:150',
            'nik' => ['nullable', 'string', 'max:50', Rule::unique('employees')->ignore($employee->id)],
            'pin' => ['nullable', 'string', 'max:50', Rule::unique('employees')->ignore($employee->id)],
            'dept' => 'nullable|string|max:100',
            'jabatan' => 'nullable|string|max:100',
            'salary_grade_id' => 'nullable|exists:salary_grades,id',
            'late_category_id' => 'nullable|exists:late_rule_categories,id',
            'is_exempt' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'aktif', 'nonaktif'])],
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = match($validated['status']) {
                'active' => 'aktif',
                'inactive' => 'nonaktif',
                default => $validated['status'],
            };
        }

        $employee->update($validated);
        $employee->load(['salaryGrade', 'lateCategory']);

        return response()->json([
            'message' => 'Data karyawan berhasil diperbarui.',
            'employee' => $employee,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        return response()->json([
            'message' => 'Data karyawan berhasil dihapus.',
        ]);
    }

    public function syncCloud(\App\Services\FingerspotService $service): JsonResponse
    {
        $result = $service->syncAllUserInfo();

        return response()->json($result);
    }
}
