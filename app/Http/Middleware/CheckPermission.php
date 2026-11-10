<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Akses ditolak. Anda tidak memiliki hak akses: ' . $permission,
        ], 403);
    }
}

