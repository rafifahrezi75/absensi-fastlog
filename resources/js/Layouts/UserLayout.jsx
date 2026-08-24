import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, LayoutGrid, Clock, LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';

const UserLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const closeSidebar = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="bg-[#f8f9fa] font-sans antialiased text-gray-800 h-screen overflow-hidden flex">
            
            {/* Overlay Mobile */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
               {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/10">
                <img 
                    src="/images/front-end/logo2.png" 
                    alt="Logo Fastlog Era Mandiri" 
                    className="h-14 w-auto object-contain"
                />
            </div>

                {/* Profile Card */}
                <div className="p-5">
                    <div className="bg-slate-800 rounded-2xl p-4 flex items-center space-x-3 border border-white/10">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{user?.name || 'Karyawan'}</h3>
                            <p className="text-xs text-white/50 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5">
                    <NavLink 
                        to="/user/home" 
                        onClick={closeSidebar}
                        className={({ isActive }) => 
                            `w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition text-sm font-medium ${
                                isActive 
                                ? 'bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <LayoutGrid className="w-[18px] h-[18px]" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink 
                        to="/user/riwayat" 
                        onClick={closeSidebar}
                        className={({ isActive }) => 
                            `w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition text-sm font-medium ${
                                isActive 
                                ? 'bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Clock className="w-[18px] h-[18px]" />
                        <span>Riwayat Pengajuan</span>
                    </NavLink>
                </nav>

                {/* Logout */}
                <div className="p-5 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-xl transition text-sm font-medium">
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Right Area Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                            <Menu className="w-6 h-6" />
                        </button>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Sistem Absensi Karyawan</h2>
                            <p className="text-sm text-gray-400 hidden sm:block">PT Fastlog Era Mandiri</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 text-orange-500 border border-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold">
                            <User className="w-3.5 h-3.5" />
                            <span>Karyawan</span>
                        </div>
                        <div className="text-sm text-gray-400 font-medium hidden md:block">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
