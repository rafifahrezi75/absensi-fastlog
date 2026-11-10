<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role === 'admin' || $user->hasRole('super_admin') || $user->roles()->where('name', '!=', 'karyawan')->exists() || $user->directPermissions()->exists()) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Akses ditolak. Halaman ini khusus admin.',
        ], 403);
    }
}
