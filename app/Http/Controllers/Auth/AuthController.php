<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Proses login (porting dari compro-fastlog).
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {

            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login berhasil.',
                'user' => Auth::user()->load('employee'),
            ]);
        }

        throw ValidationException::withMessages([
            'email' => 'Email atau password salah.',
        ]);
    }

    /**
     * Logout (porting dari compro-fastlog).
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Data user yang sedang login (untuk cek sesi SPA).
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('employee'),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.exists' => 'Email tidak terdaftar di sistem.',
        ]);

        $email = $request->email;
        $token = Str::random(64);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $token,
                'created_at' => now(),
            ]
        );

        $resetUrl = url('/reset-password?token=' . $token . '&email=' . urlencode($email));

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Halo,\n\nKami menerima permintaan untuk mereset password akun Anda di Fastlog Era Mandiri.\n\nSilakan klik tautan berikut untuk membuat password baru:\n{$resetUrl}\n\nTautan ini berlaku selama 60 menit.\n\nJika Anda tidak melakukan permintaan ini, abaikan email ini.",
                function ($message) use ($email) {
                    $message->to($email)->subject('Permintaan Reset Password - Fastlog Era Mandiri');
                }
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error sending reset email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Tautan reset password telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record || \Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kedaluwarsa.',
            ], 400);
        }

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan masuk menggunakan password baru Anda.',
        ]);
    }
}
