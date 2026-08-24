<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AkunController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::latest()->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'user'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return response()->json([
            'message' => 'Akun berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'user'])],
        ];

        // Jika password diisi, maka divalidasi dan diubah
        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8';
        }

        $validated = $request->validate($rules);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Akun berhasil diperbarui.',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Mencegah hapus diri sendiri (porting dari compro-fastlog)
        if (auth()->id() == $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang login.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Akun berhasil dihapus.',
        ]);
    }
}
