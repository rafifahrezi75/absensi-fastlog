<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\DeviceController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\MasterPayrollController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\UserPermissionController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/api/webhook/fingerspot', [WebhookController::class, 'handle'])->name('webhook.fingerspot');
Route::match(['get', 'post'], '/api/webhook/fingerprint', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/api/store', [WebhookController::class, 'handle'])->name('webhook.store');
Route::match(['get', 'post'], '/api/store.php', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/store.php', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/webhook/fingerspot', [WebhookController::class, 'handle']);
Route::match(['get', 'post'], '/webhook/fingerprint', [WebhookController::class, 'handle']);
Route::post('/api/attendance/tap', [AttendanceApiController::class, 'tap'])->name('api.attendance.tap');

Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/api/user', [AuthController::class, 'me'])->name('api.user');

    Route::prefix('api/user')->group(function () {
        Route::get('/dashboard', [UserPermissionController::class, 'dashboard'])->name('api.user.dashboard');
        Route::get('/permissions', [UserPermissionController::class, 'index'])->name('api.user.permissions.index');
        Route::post('/permissions', [UserPermissionController::class, 'store'])->name('api.user.permissions.store');
        Route::delete('/permissions/{id}', [UserPermissionController::class, 'destroy'])->name('api.user.permissions.destroy');
    });
});

Route::middleware(['auth', 'admin'])->prefix('api/admin')->group(function () {
    Route::get('/akun', [AkunController::class, 'index'])->name('api.admin.akun.index');
    Route::post('/akun', [AkunController::class, 'store'])->name('api.admin.akun.store');
    Route::put('/akun/{id}', [AkunController::class, 'update'])->name('api.admin.akun.update');
    Route::delete('/akun/{id}', [AkunController::class, 'destroy'])->name('api.admin.akun.destroy');

    Route::get('/attendance', [AttendanceController::class, 'index'])->name('api.admin.attendance.index');
    Route::post('/attendance/fetch', [AttendanceController::class, 'fetch'])->name('api.admin.attendance.fetch');
    Route::post('/attendance/manual', [AttendanceController::class, 'storeManual'])->name('api.admin.attendance.manual');
    Route::get('/anomalies', [AttendanceApiController::class, 'getAnomalies'])->name('api.admin.anomalies.index');
    Route::post('/anomalies/{id}/approve', [AttendanceApiController::class, 'approve'])->name('api.admin.anomalies.approve');
    Route::post('/anomalies/{id}/reject', [AttendanceApiController::class, 'reject'])->name('api.admin.anomalies.reject');

    Route::get('/permissions', [PermissionController::class, 'index'])->name('api.admin.permissions.index');
    Route::post('/permissions', [PermissionController::class, 'store'])->name('api.admin.permissions.store');
    Route::post('/permissions/{id}/approve', [PermissionController::class, 'approve'])->name('api.admin.permissions.approve');
    Route::post('/permissions/{id}/reject', [PermissionController::class, 'reject'])->name('api.admin.permissions.reject');
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy'])->name('api.admin.permissions.destroy');

    Route::get('/employees', [EmployeeController::class, 'index'])->name('api.admin.employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('api.admin.employees.store');
    Route::post('/employees/sync-cloud', [EmployeeController::class, 'syncCloud'])->name('api.admin.employees.sync-cloud');
    Route::put('/employees/{id}', [EmployeeController::class, 'update'])->name('api.admin.employees.update');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('api.admin.employees.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('api.admin.reports.index');

    Route::get('/settings', [SettingController::class, 'index'])->name('api.admin.settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('api.admin.settings.update');
    Route::post('/settings/holidays', [SettingController::class, 'addHoliday'])->name('api.admin.settings.holidays.add');
    Route::delete('/settings/holidays/{id}', [SettingController::class, 'deleteHoliday'])->name('api.admin.settings.holidays.delete');

    Route::get('/devices', [DeviceController::class, 'index'])->name('api.admin.devices.index');
    Route::put('/devices/{id}', [DeviceController::class, 'update'])->name('api.admin.devices.update');
    Route::post('/devices/ping', [DeviceController::class, 'ping'])->name('api.admin.devices.ping');
    Route::post('/devices/sync-logs', [DeviceController::class, 'syncLogs'])->name('api.admin.devices.sync-logs');
    Route::post('/devices/sync-users', [DeviceController::class, 'syncUsers'])->name('api.admin.devices.sync-users');
    Route::get('/master-payroll/golongan', [MasterPayrollController::class, 'indexGolongan'])->name('api.admin.master-payroll.golongan.index');
    Route::post('/master-payroll/golongan', [MasterPayrollController::class, 'storeGolongan'])->name('api.admin.master-payroll.golongan.store');
    Route::put('/master-payroll/golongan/{id}', [MasterPayrollController::class, 'updateGolongan'])->name('api.admin.master-payroll.golongan.update');
    Route::delete('/master-payroll/golongan/{id}', [MasterPayrollController::class, 'destroyGolongan'])->name('api.admin.master-payroll.golongan.destroy');

    Route::get('/master-payroll/komponen', [MasterPayrollController::class, 'indexKomponen'])->name('api.admin.master-payroll.komponen.index');
    Route::post('/master-payroll/komponen', [MasterPayrollController::class, 'storeKomponen'])->name('api.admin.master-payroll.komponen.store');
    Route::put('/master-payroll/komponen/{id}', [MasterPayrollController::class, 'updateKomponen'])->name('api.admin.master-payroll.komponen.update');
    Route::delete('/master-payroll/komponen/{id}', [MasterPayrollController::class, 'destroyKomponen'])->name('api.admin.master-payroll.komponen.destroy');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
