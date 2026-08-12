import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
    Fingerprint, X, LayoutDashboard, Clock, FileCheck2, 
    Users, Wallet, FileBarChart, Cpu, Settings, LogOut, PanelLeft, Bell 
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const navLinkClass = ({ isActive }) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`;

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-slate-50 text-slate-800 font-sans antialiased">
            
            {/* Overlay untuk Layar HP / Mobile */}
            {isMobile && sidebarOpen && (
                <div 
                    onClick={toggleSidebar} 
                    className="fixed inset-0 bg-slate-900/50 z-20 backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* ================= SIDEBAR ================= */}
            <aside 
                className={`w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 fixed lg:static z-30 transition-all duration-300 ease-in-out flex-shrink-0 ${
                    isMobile 
                        ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') 
                        : (sidebarOpen ? 'ml-0' : '-ml-64')
                }`}
            >
                {/* Logo & Tombol Close Mobile */}
                <div className="h-16 flex items-center justify-between px-6 bg-slate-950 font-bold text-white text-lg border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Fingerprint className="w-5 h-5 text-white" />
                        </div>
                        <span className="logo-text">AbsensiPro</span>
                    </div>
                    {isMobile && (
                        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigasi Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Utama</div>
                    
                    <NavLink to="/admin/dashboard" className={navLinkClass}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/attendance" className={navLinkClass}>
                        <Clock className="w-4 h-4" />
                        <span>Log Absensi</span>
                    </NavLink>
                    <NavLink to="/admin/permissions" className={navLinkClass}>
                        <FileCheck2 className="w-4 h-4" />
                        <span>Izin & Lembur</span>
                    </NavLink>

                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mt-5 mb-2">Kepegawaian & Gaji</div>
                    
                    <NavLink to="/admin/employees" className={navLinkClass}>
                        <Users className="w-4 h-4" />
                        <span>Data Karyawan</span>
                    </NavLink>
                    <NavLink to="/admin/payroll" className={navLinkClass}>
                        <Wallet className="w-4 h-4" />
                        <span>Penggajian (Payroll)</span>
                    </NavLink>
                    <NavLink to="/admin/reports" className={navLinkClass}>
                        <FileBarChart className="w-4 h-4" />
                        <span>Laporan Presensi</span>
                    </NavLink>

                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mt-5 mb-2">Sistem & Device</div>
                    
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                        <Cpu className="w-4 h-4" />
                        <span>Mesin Fingerprint</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                        <Settings className="w-4 h-4" />
                        <span>Pengaturan System</span>
                    </a>
                </nav>

                {/* Profil Admin / Logout */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                            AD
                        </div>
                        <div className="truncate">
                            <div className="text-sm font-medium text-white truncate">Admin Utama</div>
                            <div className="text-xs text-slate-500 truncate">admin@absensi.com</div>
                        </div>
                    </div>
                    <button title="Logout" className="text-slate-400 hover:text-rose-400 p-1 transition flex-shrink-0">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>
            
            {/* ================= CONTENT WRAPPER ================= */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header / Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
                    
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition border border-slate-200" title="Geser Sidebar">
                            <PanelLeft className="w-5 h-5" />
                        </button>

                        <span className="hidden sm:inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Mesin Fingerprint Online
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="text-xs text-slate-500 font-medium">
                            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;
