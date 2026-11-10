<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount(['users', 'permissions'])->orderBy('id')->get();

        return response()->json([
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:roles,name'],
            'label' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'show_in_matrix' => ['nullable', 'boolean'],
        ]);

        $role = Role::create([
            'name' => strtolower($validated['name']),
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_system' => false,
            'is_active' => true,
            'show_in_matrix' => $request->boolean('show_in_matrix', true),
        ]);

        return response()->json([
            'message' => 'Role baru berhasil ditambahkan.',
            'role' => $role->loadCount(['users', 'permissions']),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $rules = [
            'label' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'show_in_matrix' => ['nullable', 'boolean'],
        ];

        if (! $role->is_system) {
            $rules['name'] = ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('roles')->ignore($role->id)];
        }

        $validated = $request->validate($rules);

        if (! $role->is_system && isset($validated['name'])) {
            $validated['name'] = strtolower($validated['name']);
        } else {
            unset($validated['name']);
        }

        if ($request->has('show_in_matrix')) {
            $validated['show_in_matrix'] = $request->boolean('show_in_matrix');
        }

        $role->update($validated);

        return response()->json([
            'message' => 'Data role berhasil diperbarui.',
            'role' => $role->loadCount(['users', 'permissions']),
        ]);
    }

    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system) {
            return response()->json([
                'message' => 'Role bawaan sistem tidak dapat dihapus.',
            ], 422);
        }

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Role tidak dapat dihapus karena masih terhubung dengan beberapa pengguna.',
            ], 422);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json([
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
