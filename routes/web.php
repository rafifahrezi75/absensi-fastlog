<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// ==================== AUTH (Session, porting dari compro-fastlog) ====================
Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Cek sesi untuk SPA
    Route::get('/api/user', [AuthController::class, 'me'])->name('api.user');
});

// ==================== MASTER AKUN (Register oleh admin, JSON API) ====================
Route::middleware(['auth', 'admin'])->prefix('api/admin')->group(function () {
    Route::get('/akun', [AkunController::class, 'index'])->name('api.admin.akun.index');
    Route::post('/akun', [AkunController::class, 'store'])->name('api.admin.akun.store');
    Route::put('/akun/{id}', [AkunController::class, 'update'])->name('api.admin.akun.update');
    Route::delete('/akun/{id}', [AkunController::class, 'destroy'])->name('api.admin.akun.destroy');
});

// Catch-all route to serve the React SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
