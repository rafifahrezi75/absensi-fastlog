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

        $requiredPermissions = array_filter(array_map('trim', explode('|', $permission)));

        foreach ($requiredPermissions as $required) {
            if ($user->hasPermission($required)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Akses ditolak. Anda tidak memiliki hak akses: ' . $permission,
        ], 403);
    }
}

