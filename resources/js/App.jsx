import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './Contexts/AuthContext';

import AdminLayout from './Layouts/AdminLayout';
import UserLayout from './Layouts/UserLayout';

const AdminDashboard = lazy(() => import('./Pages/Admin/Dashboard/Index'));
const Attendance = lazy(() => import('./Pages/Admin/Attendance/Index'));
const Permissions = lazy(() => import('./Pages/Admin/Permissions/Index'));
const Employees = lazy(() => import('./Pages/Admin/Employees/Index'));
const Payroll = lazy(() => import('./Pages/Admin/Payroll/Index'));
const PayrollDetail = lazy(() => import('./Pages/Admin/Payroll/Detail'));
const MasterPayroll = lazy(() => import('./Pages/Admin/MasterPayroll/Index'));
const Reports = lazy(() => import('./Pages/Admin/Reports/Index'));
const RekapPreview = lazy(() => import('./Pages/Admin/Reports/RekapPreview'));
const EmployeeReportDetail = lazy(() => import('./Pages/Admin/Reports/Detail'));
const EmployeePreview = lazy(() => import('./Pages/Admin/Reports/EmployeePreview'));
const MasterAkun = lazy(() => import('./Pages/Admin/MasterAkun/Index'));
const Roles = lazy(() => import('./Pages/Admin/Roles/Index'));
const HakAkses = lazy(() => import('./Pages/Admin/HakAkses/Index'));
const Devices = lazy(() => import('./Pages/Admin/Devices/Index'));
const Settings = lazy(() => import('./Pages/Admin/Settings/Index'));

const Home = lazy(() => import('./Pages/User/Home/Index'));
const FormPengajuan = lazy(() => import('./Pages/User/FormPengajuan/Index'));
const Riwayat = lazy(() => import('./Pages/User/Riwayat/Index'));
const SlipGaji = lazy(() => import('./Pages/User/SlipGaji/Index'));
const UserSlipDetail = lazy(() => import('./Pages/User/SlipGaji/Detail'));
const Login = lazy(() => import('./Pages/User/Auth/Login'));

const ForgotPassword = lazy(() => import('./Pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/Auth/ResetPassword'));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const ADMIN_ROUTE_PERMISSIONS = [
    { path: '/admin/dashboard', permissions: ['dashboard.view'] },
    { path: '/admin/attendance', permissions: ['attendance.view'] },
    { path: '/admin/permissions', permissions: ['permissions.view'] },
    { path: '/admin/employees', permissions: ['employees.view'] },
    { path: '/admin/payroll', permissions: ['payroll.view'] },
    { path: '/admin/master-payroll', permissions: ['master_payroll.view'] },
    { path: '/admin/reports', permissions: ['reports.view'] },
    { path: '/admin/settings', permissions: ['settings.view', 'settings.holidays', 'late_rules.view', 'late_rules.exemption', 'overtime_rules.view'] },
    { path: '/admin/master-akun', permissions: ['master_akun.view'] },
    { path: '/admin/roles', permissions: ['master_role.view'] },
    { path: '/admin/hak-akses', permissions: ['hak_akses.view'] },
    { path: '/admin/devices', permissions: ['devices.view'] },
];

const getFirstAllowedAdminPath = (permissions = []) => {
    const matched = ADMIN_ROUTE_PERMISSIONS.find((entry) =>
        entry.permissions.some((perm) => permissions.includes(perm))
    );
    return matched ? matched.path : null;
};

const homePath = (user, roles = [], permissions = []) => {
    if (user?.role === 'admin' || (roles && roles.some(r => r !== 'karyawan')) || (permissions && permissions.length > 0)) {
        return getFirstAllowedAdminPath(permissions) || '/admin/dashboard';
    }
    return '/user/home';
};

const ForbiddenPage = ({ fallbackPath }) => (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Akses Ditolak</h2>
            <p className="text-sm text-slate-500 mb-6">
                Anda tidak memiliki hak akses untuk membuka halaman ini. Hubungi administrator jika Anda memerlukan akses.
            </p>
            {fallbackPath && (
                <Link
                    to={fallbackPath}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#FF7A3D] text-white text-sm font-semibold hover:bg-orange-600 transition"
                >
                    Kembali ke Halaman Tersedia
                </Link>
            )}
        </div>
    </div>
);

const RequirePermission = ({ permission, requireAll = false, children }) => {
    const { permissions, hasPermission } = useAuth();

    const allowed = Array.isArray(permission)
        ? (requireAll ? permission.every((p) => hasPermission(p)) : permission.some((p) => hasPermission(p)))
        : hasPermission(permission);

    if (!allowed) {
        const fallbackPath = getFirstAllowedAdminPath(permissions);
        return <ForbiddenPage fallbackPath={fallbackPath} />;
    }

    return children;
};

const AdminIndexRedirect = () => {
    const { permissions } = useAuth();
    return <Navigate to={getFirstAllowedAdminPath(permissions) || '/admin/dashboard'} replace />;
};

const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const RequireRole = ({ role, children }) => {
    const { user, roles, permissions, hasRole } = useAuth();

    if (role === 'admin') {
        const canAccessAdmin = user?.role === 'admin' || hasRole('super_admin') || (roles && roles.some(r => r !== 'karyawan')) || (permissions && permissions.length > 0);
        if (!canAccessAdmin) {
            return <Navigate to="/user/home" replace />;
        }
        return children;
    }

    if (user?.role !== role) {
        return <Navigate to={homePath(user, roles, permissions)} replace />;
    }

    return children;
};

const GuestOnly = ({ children }) => {
    const { user, roles, permissions, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to={homePath(user, roles, permissions)} replace />;
    }

    return children;
};

const RootRedirect = () => {
    const { user, roles, permissions, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={homePath(user, roles, permissions)} replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
                        <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
                        <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />

                        <Route path="/" element={<RootRedirect />} />

                        <Route path="/admin" element={<RequireAuth><RequireRole role="admin"><AdminLayout /></RequireRole></RequireAuth>}>
                            <Route index element={<AdminIndexRedirect />} />
                            <Route path="dashboard" element={<RequirePermission permission="dashboard.view"><AdminDashboard /></RequirePermission>} />
                            <Route path="attendance" element={<RequirePermission permission="attendance.view"><Attendance /></RequirePermission>} />
                            <Route path="permissions" element={<RequirePermission permission="permissions.view"><Permissions /></RequirePermission>} />
                            <Route path="employees" element={<RequirePermission permission="employees.view"><Employees /></RequirePermission>} />
                            <Route path="payroll" element={<RequirePermission permission="payroll.view"><Payroll /></RequirePermission>} />
                            <Route path="payroll/:id" element={<RequirePermission permission={['payroll.view', 'payroll.slip_detail']} requireAll><PayrollDetail /></RequirePermission>} />
                            <Route path="master-payroll" element={<RequirePermission permission="master_payroll.view"><MasterPayroll /></RequirePermission>} />
                            <Route path="reports" element={<RequirePermission permission="reports.view"><Reports /></RequirePermission>} />
                            <Route path="reports/preview" element={<RequirePermission permission={['reports.view', 'reports.export']} requireAll><RekapPreview /></RequirePermission>} />
                            <Route path="reports/:employeeId" element={<RequirePermission permission={['reports.view', 'reports.employee_detail']} requireAll><EmployeeReportDetail /></RequirePermission>} />
                            <Route path="reports/:employeeId/preview" element={<RequirePermission permission={['reports.view', 'reports.employee_detail', 'reports.export']} requireAll><EmployeePreview /></RequirePermission>} />
                            <Route path="master-akun" element={<RequirePermission permission="master_akun.view"><MasterAkun /></RequirePermission>} />
                            <Route path="roles" element={<RequirePermission permission="master_role.view"><Roles /></RequirePermission>} />
                            <Route path="hak-akses" element={<RequirePermission permission="hak_akses.view"><HakAkses /></RequirePermission>} />
                            <Route path="devices" element={<RequirePermission permission="devices.view"><Devices /></RequirePermission>} />
                            <Route path="settings" element={<RequirePermission permission={['settings.view', 'settings.holidays', 'late_rules.view', 'late_rules.exemption', 'overtime_rules.view']}><Settings /></RequirePermission>} />
                        </Route>

                        <Route path="/user" element={<RequireAuth><UserLayout /></RequireAuth>}>
                            <Route index element={<Navigate to="/user/home" replace />} />
                            <Route path="home" element={<Home />} />
                            <Route path="pengajuan" element={<FormPengajuan />} />
                            <Route path="riwayat" element={<Riwayat />} />
                            <Route path="slip-gaji" element={<SlipGaji />} />
                            <Route path="slip-gaji/:id" element={<UserSlipDetail />} />
                        </Route>

                        <Route path="*" element={<RootRedirect />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
