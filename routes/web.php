<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/api/webhook/fingerspot', [WebhookController::class, 'handle'])->name('webhook.fingerspot');
Route::match(['get', 'post'], '/api/store', [WebhookController::class, 'handle'])->name('webhook.store');
Route::match(['get', 'post'], '/api/store.php', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/store.php', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/webhook/fingerspot', [WebhookController::class, 'handle']);

Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/api/user', [AuthController::class, 'me'])->name('api.user');
});

Route::middleware(['auth', 'admin'])->prefix('api/admin')->group(function () {
    Route::get('/akun', [AkunController::class, 'index'])->name('api.admin.akun.index');
    Route::post('/akun', [AkunController::class, 'store'])->name('api.admin.akun.store');
    Route::put('/akun/{id}', [AkunController::class, 'update'])->name('api.admin.akun.update');
    Route::delete('/akun/{id}', [AkunController::class, 'destroy'])->name('api.admin.akun.destroy');

    Route::get('/attendance', [AttendanceController::class, 'index'])->name('api.admin.attendance.index');
    Route::post('/attendance/fetch', [AttendanceController::class, 'fetch'])->name('api.admin.attendance.fetch');

    Route::get('/employees', [EmployeeController::class, 'index'])->name('api.admin.employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('api.admin.employees.store');
    Route::post('/employees/sync-cloud', [EmployeeController::class, 'syncCloud'])->name('api.admin.employees.sync-cloud');
    Route::put('/employees/{id}', [EmployeeController::class, 'update'])->name('api.admin.employees.update');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('api.admin.employees.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('api.admin.reports.index');

    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('api.admin.settings.index');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('api.admin.settings.update');
    Route::post('/settings/holidays', [\App\Http\Controllers\Admin\SettingController::class, 'addHoliday'])->name('api.admin.settings.holidays.add');
    Route::delete('/settings/holidays/{id}', [\App\Http\Controllers\Admin\SettingController::class, 'deleteHoliday'])->name('api.admin.settings.holidays.delete');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
