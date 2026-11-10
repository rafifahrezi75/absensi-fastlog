<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppPermission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class HakAksesController extends Controller
{
    public function index()
    {
        $roles = Role::where('show_in_matrix', true)->with('permissions')->orderBy('id')->get();
        $users = User::with(['roles.permissions', 'directPermissions'])->orderBy('name')->get();
        $permissions = AppPermission::orderBy('group_name')->orderBy('name')->get();

        return response()->json([
            'roles' => $roles,
            'users' => $users,
            'permissions' => $permissions,
        ]);
    }

    public function updateRole(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:app_permissions,id'],
        ]);

        $requestedIds = $validated['permission_ids'] ?? [];

        $protectedPermissionIds = AppPermission::whereIn('name', ['hak_akses.view', 'hak_akses.update'])
            ->pluck('id')
            ->toArray();

        if ($role->name === 'super_admin') {
            $safePermissionIds = array_unique(array_merge($requestedIds, $protectedPermissionIds));
        } else {
            $safePermissionIds = $requestedIds;
        }

        $role->permissions()->sync($safePermissionIds);

        return response()->json([
            'message' => 'Hak akses role ' . $role->label . ' berhasil diperbarui.',
            'role' => $role->load('permissions'),
        ]);
    }

    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if ($request->boolean('reset')) {
            $user->directPermissions()->detach();

            return response()->json([
                'message' => 'Hak akses khusus pengguna ' . $user->name . ' telah direset ke aturan default role.',
                'user' => $user->load(['roles.permissions', 'directPermissions']),
            ]);
        }

        $validated = $request->validate([
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:app_permissions,id'],
        ]);

        $requestedIds = $validated['permission_ids'] ?? [];

        $protectedPermissionIds = AppPermission::whereIn('name', ['hak_akses.view', 'hak_akses.update'])
            ->pluck('id')
            ->toArray();

        if ($user->hasRole('super_admin') || $user->role === 'admin') {
            $safePermissionIds = array_unique(array_merge($requestedIds, $protectedPermissionIds));
        } else {
            $safePermissionIds = $requestedIds;
        }

        $user->directPermissions()->sync($safePermissionIds);

        return response()->json([
            'message' => 'Hak akses khusus pengguna ' . $user->name . ' berhasil diperbarui.',
            'user' => $user->load(['roles.permissions', 'directPermissions']),
        ]);
    }
}

