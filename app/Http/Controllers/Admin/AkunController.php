<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AkunController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['nullable', Rule::in(['admin', 'user'])],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ];

        $user = User::create($userData);

        if (! empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        return response()->json([
            'message' => 'Akun berhasil ditambahkan.',
            'user' => $user->load('roles'),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['nullable', Rule::in(['admin', 'user'])],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8';
        }

        $validated = $request->validate($rules);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (isset($validated['role'])) {
            $userData['role'] = $validated['role'];
        }

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        if (isset($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        return response()->json([
            'message' => 'Akun berhasil diperbarui.',
            'user' => $user->load('roles'),
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() == $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang login.',
            ], 422);
        }

        $user->roles()->detach();
        $user->directPermissions()->detach();
        $user->delete();

        return response()->json([
            'message' => 'Akun berhasil dihapus.',
        ]);
    }
}
