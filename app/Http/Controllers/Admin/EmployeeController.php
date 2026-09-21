<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(): JsonResponse
    {
        $employees = Employee::orderByRaw('nama IS NULL, nama ASC, CAST(pin AS UNSIGNED) ASC')->get();

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
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $employee = Employee::create($validated);

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
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $employee->update($validated);

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
