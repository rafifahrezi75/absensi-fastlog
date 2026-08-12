import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Admin Layout & Pages
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './Pages/Admin/Dashboard/Index';
import Attendance from './Pages/Admin/Attendance/Index';
import Permissions from './Pages/Admin/Permissions/Index';
import Employees from './Pages/Admin/Employees/Index';
import Payroll from './Pages/Admin/Payroll/Index';
import Reports from './Pages/Admin/Reports/Index';

// User Layout & Pages
import UserLayout from './Layouts/UserLayout';
import Home from './Pages/User/Home/Index';
import FormPengajuan from './Pages/User/FormPengajuan/Index';
import Riwayat from './Pages/User/Riwayat/Index';
import Login from './Pages/User/Auth/Login';

// Auth
import AuthLogin from './Pages/Auth/Login';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Route */}
                <Route path="/login" element={<Login />} />

                {/* Redirect root '/' langsung ke admin/dashboard */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    {/* Default jika mengakses /admin */}
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="permissions" element={<Permissions />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* User Routes */}
                <Route path="/user" element={<UserLayout />}>
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
    );
}

export default App;