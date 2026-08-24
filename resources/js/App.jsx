import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Contexts/AuthContext';

// Admin Layout & Pages
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './Pages/Admin/Dashboard/Index';
import Attendance from './Pages/Admin/Attendance/Index';
import Permissions from './Pages/Admin/Permissions/Index';
import Employees from './Pages/Admin/Employees/Index';
import Payroll from './Pages/Admin/Payroll/Index';
import Reports from './Pages/Admin/Reports/Index';
import MasterAkun from './Pages/Admin/MasterAkun/Index';

// User Layout & Pages
import UserLayout from './Layouts/UserLayout';
import Home from './Pages/User/Home/Index';
import FormPengajuan from './Pages/User/FormPengajuan/Index';
import Riwayat from './Pages/User/Riwayat/Index';
import Login from './Pages/User/Auth/Login';

// Auth
import AuthLogin from './Pages/Auth/Login';

const homePath = (user) => (user?.role === 'admin' ? '/admin/dashboard' : '/user/home');

// Guard: wajib login
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

// Guard: khusus role tertentu
const RequireRole = ({ role, children }) => {
    const { user } = useAuth();

    if (user?.role !== role) {
        return <Navigate to={homePath(user)} replace />;
    }

    return children;
};

// Halaman login: jika sudah login, lempar ke home sesuai role
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

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Auth Route */}
                    <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

                    {/* Redirect root '/' langsung ke admin/dashboard */}
                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                    {/* Admin Routes (khusus admin) */}
                    <Route path="/admin" element={<RequireAuth><RequireRole role="admin"><AdminLayout /></RequireRole></RequireAuth>}>
                        {/* Default jika mengakses /admin */}
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />

                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="permissions" element={<Permissions />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="payroll" element={<Payroll />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="master-akun" element={<MasterAkun />} />
                    </Route>

                    {/* User Routes */}
                    <Route path="/user" element={<RequireAuth><UserLayout /></RequireAuth>}>
                        {/* Default jika mengakses /user */}
                        <Route index element={<Navigate to="/user/home" replace />} />

                        <Route path="home" element={<Home />} />
                        <Route path="pengajuan" element={<FormPengajuan />} />
                        <Route path="riwayat" element={<Riwayat />} />
                    </Route>

                    {/* Catch-all route jika URL tidak ditemukan */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
