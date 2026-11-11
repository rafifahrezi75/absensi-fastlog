<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\DeviceController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\EmployeeHrActionController;
use App\Http\Controllers\Admin\HakAksesController;
use App\Http\Controllers\Admin\LateRuleController;
use App\Http\Controllers\Admin\MasterPayrollController;
use App\Http\Controllers\Admin\MasterTindakanController;
use App\Http\Controllers\Admin\OvertimeRuleController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\NotificationController;
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
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
    Route::post('/api/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/api/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/api/user', [AuthController::class, 'me'])->name('api.user');

    Route::prefix('api/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('api.notifications.index');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
    });

    Route::prefix('api/user')->group(function () {
        Route::get('/dashboard', [UserPermissionController::class, 'dashboard'])->name('api.user.dashboard');
        Route::get('/permissions', [UserPermissionController::class, 'index'])->name('api.user.permissions.index');
        Route::post('/permissions', [UserPermissionController::class, 'store'])->name('api.user.permissions.store');
        Route::delete('/permissions/{id}', [UserPermissionController::class, 'destroy'])->name('api.user.permissions.destroy');
        Route::get('/payroll', [PayrollController::class, 'userSlip'])->name('api.user.payroll');
        Route::get('/payroll/{id}/detail', [PayrollController::class, 'userSlipDetail'])->name('api.user.payroll.detail');
        Route::get('/payroll/{id}/pdf', [PayrollController::class, 'userPdfStream'])->name('api.user.payroll.pdf');
        Route::get('/payroll/{id}/download', [PayrollController::class, 'userPdfDownload'])->name('api.user.payroll.download');
    });
});

Route::middleware(['auth', 'admin'])->prefix('api/admin')->group(function () {
    Route::middleware('permission:master_role.view|master_akun.view|master_akun.create|master_akun.update')->get('/roles', [RoleController::class, 'index'])->name('api.admin.roles.index');
    Route::middleware('permission:master_role.create')->post('/roles', [RoleController::class, 'store'])->name('api.admin.roles.store');
    Route::middleware('permission:master_role.update')->put('/roles/{id}', [RoleController::class, 'update'])->name('api.admin.roles.update');
    Route::middleware('permission:master_role.delete')->delete('/roles/{id}', [RoleController::class, 'destroy'])->name('api.admin.roles.destroy');

    Route::middleware('permission:hak_akses.view')->get('/hak-akses', [HakAksesController::class, 'index'])->name('api.admin.hak-akses.index');
    Route::middleware('permission:hak_akses.update')->put('/hak-akses/role/{id}', [HakAksesController::class, 'updateRole'])->name('api.admin.hak-akses.role.update');
    Route::middleware('permission:hak_akses.update')->put('/hak-akses/user/{id}', [HakAksesController::class, 'updateUser'])->name('api.admin.hak-akses.user.update');

    Route::middleware('permission:master_akun.view')->get('/akun', [AkunController::class, 'index'])->name('api.admin.akun.index');
    Route::middleware('permission:master_akun.create')->post('/akun', [AkunController::class, 'store'])->name('api.admin.akun.store');
    Route::middleware('permission:master_akun.update')->put('/akun/{id}', [AkunController::class, 'update'])->name('api.admin.akun.update');
    Route::middleware('permission:master_akun.delete')->delete('/akun/{id}', [AkunController::class, 'destroy'])->name('api.admin.akun.destroy');

    Route::middleware('permission:attendance.view|dashboard.view')->get('/attendance', [AttendanceController::class, 'index'])->name('api.admin.attendance.index');
    Route::middleware('permission:attendance.fetch')->post('/attendance/fetch', [AttendanceController::class, 'fetch'])->name('api.admin.attendance.fetch');
    Route::middleware('permission:attendance.manual')->post('/attendance/manual', [AttendanceController::class, 'storeManual'])->name('api.admin.attendance.manual');
    Route::middleware('permission:attendance.koreksi')->match(['put', 'post'], '/attendance/koreksi', [AttendanceController::class, 'updateKoreksi'])->name('api.admin.attendance.koreksi');
    Route::middleware('permission:attendance.delete')->delete('/attendance/koreksi', [AttendanceController::class, 'destroyKoreksi'])->name('api.admin.attendance.destroy');

    Route::middleware('permission:permissions.view')->get('/overtime-logs', [AttendanceApiController::class, 'getOvertimeLogs'])->name('api.admin.overtime-logs.index');
    Route::middleware('permission:permissions.approve')->post('/overtime-logs/{id}/approve', [AttendanceApiController::class, 'approve'])->name('api.admin.overtime-logs.approve');
    Route::middleware('permission:permissions.reject')->post('/overtime-logs/{id}/reject', [AttendanceApiController::class, 'reject'])->name('api.admin.overtime-logs.reject');
    Route::middleware('permission:permissions.update')->put('/overtime-logs/{id}', [AttendanceApiController::class, 'update'])->name('api.admin.overtime-logs.update');
    Route::middleware('permission:permissions.delete')->delete('/overtime-logs/{id}', [AttendanceApiController::class, 'destroy'])->name('api.admin.overtime-logs.destroy');

    Route::middleware('permission:permissions.view')->get('/anomalies', [AttendanceApiController::class, 'getAnomalies']);
    Route::middleware('permission:permissions.approve')->post('/anomalies/{id}/approve', [AttendanceApiController::class, 'approve']);
    Route::middleware('permission:permissions.reject')->post('/anomalies/{id}/reject', [AttendanceApiController::class, 'reject']);
    Route::middleware('permission:permissions.update')->put('/anomalies/{id}', [AttendanceApiController::class, 'update']);
    Route::middleware('permission:permissions.delete')->delete('/anomalies/{id}', [AttendanceApiController::class, 'destroy']);

    Route::middleware('permission:permissions.view|dashboard.view')->get('/permissions', [PermissionController::class, 'index'])->name('api.admin.permissions.index');
    Route::middleware('permission:permissions.create')->post('/permissions', [PermissionController::class, 'store'])->name('api.admin.permissions.store');
    Route::middleware('permission:permissions.update')->put('/permissions/{id}', [PermissionController::class, 'update'])->name('api.admin.permissions.update');
    Route::middleware('permission:permissions.approve')->post('/permissions/{id}/approve', [PermissionController::class, 'approve'])->name('api.admin.permissions.approve');
    Route::middleware('permission:permissions.reject')->post('/permissions/{id}/reject', [PermissionController::class, 'reject'])->name('api.admin.permissions.reject');
    Route::middleware('permission:permissions.delete')->delete('/permissions/{id}', [PermissionController::class, 'destroy'])->name('api.admin.permissions.destroy');

    Route::middleware('permission:employees.view|dashboard.view|permissions.create|attendance.manual|late_rules.view|late_rules.exemption|settings.view')->get('/employees', [EmployeeController::class, 'index'])->name('api.admin.employees.index');
    Route::middleware('permission:employees.create')->post('/employees', [EmployeeController::class, 'store'])->name('api.admin.employees.store');
    Route::middleware('permission:employees.sync_cloud')->post('/employees/sync-cloud', [EmployeeController::class, 'syncCloud'])->name('api.admin.employees.sync-cloud');
    Route::middleware('permission:employees.update')->put('/employees/{id}', [EmployeeController::class, 'update'])->name('api.admin.employees.update');
    Route::middleware('permission:employees.delete')->delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('api.admin.employees.destroy');

    Route::middleware('permission:reports.view')->get('/reports', [ReportController::class, 'index'])->name('api.admin.reports.index');
    Route::middleware('permission:reports.export')->get('/reports/pdf', [ReportController::class, 'rekapPdf'])->name('api.admin.reports.pdf');
    Route::middleware('permission:reports.employee_detail')->get('/reports/employee/{id}', [ReportController::class, 'employeeDetail'])->name('api.admin.reports.employee.detail');
    Route::middleware('permission:reports.export')->get('/reports/employee/{id}/pdf', [ReportController::class, 'employeePdf'])->name('api.admin.reports.employee.pdf');
    Route::middleware('permission:reports.export_excel')->get('/reports/employee/{id}/excel', [ReportController::class, 'employeeExcel'])->name('api.admin.reports.employee.excel');

    Route::middleware('permission:settings.view|settings.holidays|dashboard.view|late_rules.view|late_rules.exemption|overtime_rules.view')->get('/settings', [SettingController::class, 'index'])->name('api.admin.settings.index');
    Route::middleware('permission:settings.update')->post('/settings', [SettingController::class, 'update'])->name('api.admin.settings.update');
    Route::middleware('permission:settings.holidays')->post('/settings/holidays', [SettingController::class, 'addHoliday'])->name('api.admin.settings.holidays.add');
    Route::middleware('permission:settings.holidays')->delete('/settings/holidays/{id}', [SettingController::class, 'deleteHoliday'])->name('api.admin.settings.holidays.delete');

    Route::middleware('permission:devices.view')->get('/devices', [DeviceController::class, 'index'])->name('api.admin.devices.index');
    Route::middleware('permission:devices.update')->put('/devices/{id}', [DeviceController::class, 'update'])->name('api.admin.devices.update');
    Route::middleware('permission:devices.ping')->post('/devices/ping', [DeviceController::class, 'ping'])->name('api.admin.devices.ping');
    Route::middleware('permission:devices.sync')->post('/devices/sync-logs', [DeviceController::class, 'syncLogs'])->name('api.admin.devices.sync-logs');
    Route::middleware('permission:devices.sync_users')->post('/devices/sync-users', [DeviceController::class, 'syncUsers'])->name('api.admin.devices.sync-users');

    Route::middleware('permission:payroll.view')->get('/payroll', [PayrollController::class, 'index'])->name('api.admin.payroll.index');
    Route::middleware('permission:payroll.attendance_detail')->get('/payroll/details', [PayrollController::class, 'details'])->name('api.admin.payroll.details');
    Route::middleware('permission:payroll.slip_detail')->get('/payroll/{id}/detail', [PayrollController::class, 'adminSlipDetail'])->name('api.admin.payroll.detail');
    Route::middleware('permission:payroll.export_pdf')->get('/payroll/{id}/pdf', [PayrollController::class, 'adminPdfStream'])->name('api.admin.payroll.pdf');
    Route::middleware('permission:payroll.export_pdf')->get('/payroll/{id}/download', [PayrollController::class, 'adminPdfDownload'])->name('api.admin.payroll.download');
    Route::middleware('permission:payroll.pay')->post('/payroll/pay', [PayrollController::class, 'markPaid'])->name('api.admin.payroll.pay');
    Route::middleware('permission:payroll.recalculate')->post('/payroll/recalculate', [PayrollController::class, 'recalculate'])->name('api.admin.payroll.recalculate');
    Route::middleware('permission:payroll.dispense')->post('/payroll/dispense', [PayrollController::class, 'dispense'])->name('api.admin.payroll.dispense');

    Route::middleware('permission:master_payroll.view|master_payroll.employee_salary|employees.view|employees.create|employees.update')->get('/master-payroll/golongan', [MasterPayrollController::class, 'indexGolongan'])->name('api.admin.master-payroll.golongan.index');
    Route::middleware('permission:master_payroll.create')->post('/master-payroll/golongan', [MasterPayrollController::class, 'storeGolongan'])->name('api.admin.master-payroll.golongan.store');
    Route::middleware('permission:master_payroll.update')->put('/master-payroll/golongan/{id}', [MasterPayrollController::class, 'updateGolongan'])->name('api.admin.master-payroll.golongan.update');
    Route::middleware('permission:master_payroll.delete')->delete('/master-payroll/golongan/{id}', [MasterPayrollController::class, 'destroyGolongan'])->name('api.admin.master-payroll.golongan.destroy');

    Route::middleware('permission:master_payroll.view|master_payroll.employee_salary')->get('/master-payroll/komponen', [MasterPayrollController::class, 'indexKomponen'])->name('api.admin.master-payroll.komponen.index');
    Route::middleware('permission:master_payroll.create')->post('/master-payroll/komponen', [MasterPayrollController::class, 'storeKomponen'])->name('api.admin.master-payroll.komponen.store');
    Route::middleware('permission:master_payroll.update')->put('/master-payroll/komponen/{id}', [MasterPayrollController::class, 'updateKomponen'])->name('api.admin.master-payroll.komponen.update');
    Route::middleware('permission:master_payroll.delete')->delete('/master-payroll/komponen/{id}', [MasterPayrollController::class, 'destroyKomponen'])->name('api.admin.master-payroll.komponen.destroy');

    Route::middleware('permission:master_payroll.view|master_payroll.employee_salary|master_payroll.reset_salary')->get('/master-payroll/employee-salaries', [MasterPayrollController::class, 'indexEmployeeSalaries'])->name('api.admin.master-payroll.employee-salaries.index');
    Route::middleware('permission:master_payroll.view|master_payroll.employee_salary')->get('/master-payroll/employee-salaries/{id}', [MasterPayrollController::class, 'showEmployeeSalary'])->name('api.admin.master-payroll.employee-salaries.show');
    Route::middleware('permission:master_payroll.employee_salary')->post('/master-payroll/employee-salaries/{id}', [MasterPayrollController::class, 'updateEmployeeSalary'])->name('api.admin.master-payroll.employee-salaries.update');
    Route::middleware('permission:master_payroll.reset_salary')->post('/master-payroll/employee-salaries/{id}/reset', [MasterPayrollController::class, 'resetEmployeeSalary'])->name('api.admin.master-payroll.employee-salaries.reset');

    Route::middleware('permission:master_tindakan.view|dashboard.view')->get('/master-tindakan', [MasterTindakanController::class, 'index'])->name('api.admin.master-tindakan.index');
    Route::middleware('permission:master_tindakan.create')->post('/master-tindakan', [MasterTindakanController::class, 'store'])->name('api.admin.master-tindakan.store');
    Route::middleware('permission:master_tindakan.update')->put('/master-tindakan/{id}', [MasterTindakanController::class, 'update'])->name('api.admin.master-tindakan.update');
    Route::middleware('permission:master_tindakan.delete')->delete('/master-tindakan/{id}', [MasterTindakanController::class, 'destroy'])->name('api.admin.master-tindakan.destroy');

    Route::middleware('permission:late_rules.view|late_rules.exemption|employees.view|employees.create|employees.update')->get('/late-rules', [LateRuleController::class, 'index'])->name('api.admin.late-rules.index');
    Route::middleware('permission:late_rules.create')->post('/late-rules', [LateRuleController::class, 'storeCategory'])->name('api.admin.late-rules.store');
    Route::middleware('permission:late_rules.update')->put('/late-rules/{id}', [LateRuleController::class, 'updateCategory'])->name('api.admin.late-rules.update');
    Route::middleware('permission:late_rules.delete')->delete('/late-rules/{id}', [LateRuleController::class, 'destroyCategory'])->name('api.admin.late-rules.destroy');
    Route::middleware('permission:late_rules.exemption')->post('/late-rules/toggle-exemption/{employeeId}', [LateRuleController::class, 'toggleExemption'])->name('api.admin.late-rules.toggle-exemption');

    Route::middleware('permission:overtime_rules.view')->get('/overtime-rules', [OvertimeRuleController::class, 'index'])->name('api.admin.overtime-rules.index');
    Route::middleware('permission:overtime_rules.create')->post('/overtime-rules', [OvertimeRuleController::class, 'storeCategory'])->name('api.admin.overtime-rules.store');
    Route::middleware('permission:overtime_rules.update')->put('/overtime-rules/{id}', [OvertimeRuleController::class, 'updateCategory'])->name('api.admin.overtime-rules.update');
    Route::middleware('permission:overtime_rules.delete')->delete('/overtime-rules/{id}', [OvertimeRuleController::class, 'destroyCategory'])->name('api.admin.overtime-rules.destroy');

    Route::middleware('permission:employee_hr_actions.view|dashboard.view')->get('/employee-hr-actions', [EmployeeHrActionController::class, 'index'])->name('api.admin.employee-hr-actions.index');
    Route::middleware('permission:employee_hr_actions.create')->post('/employee-hr-actions', [EmployeeHrActionController::class, 'store'])->name('api.admin.employee-hr-actions.store');
    Route::middleware('permission:employee_hr_actions.create')->post('/employee-hr-actions/batch', [EmployeeHrActionController::class, 'batchStore'])->name('api.admin.employee-hr-actions.batch');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
