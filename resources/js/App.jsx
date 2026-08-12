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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Route */}
                <Route path="/login" element={<Login />} />

                {/* Redirect root to /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="permissions" element={<Permissions />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* User Routes */}
                <Route path="/user" element={<UserLayout />}>
                    <Route path="home" element={<Home />} />
                    <Route path="pengajuan" element={<FormPengajuan />} />
                    <Route path="riwayat" element={<Riwayat />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
