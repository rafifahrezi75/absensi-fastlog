import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const homePath = (user) => (user?.role === 'admin' ? '/admin/dashboard' : '/user/home');

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
    const { user } = useAuth();

    if (user?.role !== role) {
        return <Navigate to={homePath(user)} replace />;
    }

    return children;
};

const GuestOnly = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to={homePath(user)} replace />;
    }

    return children;
};

const RootRedirect = () => {
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

    return <Navigate to={homePath(user)} replace />;
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
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="attendance" element={<Attendance />} />
                            <Route path="permissions" element={<Permissions />} />
                            <Route path="employees" element={<Employees />} />
                            <Route path="payroll" element={<Payroll />} />
                            <Route path="payroll/:id" element={<PayrollDetail />} />
                            <Route path="master-payroll" element={<MasterPayroll />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="reports/preview" element={<RekapPreview />} />
                            <Route path="reports/:employeeId" element={<EmployeeReportDetail />} />
                            <Route path="reports/:employeeId/preview" element={<EmployeePreview />} />
                            <Route path="master-akun" element={<MasterAkun />} />
                            <Route path="devices" element={<Devices />} />
                            <Route path="settings" element={<Settings />} />
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
