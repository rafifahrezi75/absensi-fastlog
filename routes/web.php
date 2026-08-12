<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('user.layouts.app');
});


// Redirect halaman utama ke dashboard admin (atau ke welcome)
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Group Routes untuk Admin
Route::prefix('admin')->group(function () {

    // 1. Dashboard (admin/pages/index.blade.php)
    Route::get('/dashboard', function () {
        return view('admin.pages.index');
    })->name('dashboard');

    // 2. Log Absensi (admin/pages/attendance.blade.php)
    Route::get('/attendance', function () {
        return view('admin.pages.attendance');
    })->name('attendance.index');

    // 3. Izin & Lembur (admin/pages/permissions.blade.php)
    Route::get('/permissions', function () {
        return view('admin.pages.permissions');
    })->name('permissions.index');

    Route::get('/employees', function () {
        return view('admin.pages.employees');
    })->name('employees.index');

    Route::get('/payroll', function () {
        return view('admin.pages.payroll');
    })->name('payroll.index');

    Route::get('/reports', function () {
        return view('admin.pages.reports');
    })->name('reports.index');
});