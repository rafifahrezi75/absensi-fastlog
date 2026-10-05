import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Clock, LogOut, Menu, User, Bell, Check, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import LogoutModal from '../Components/LogoutModal';
import api from '../lib/api';

const UserLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            if (res.data && res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (err) {
            console.error('Gagal mengambil notifikasi:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeSidebar = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = (e) => {
        if (e) e.preventDefault();
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/mark-all-read');
            setNotifications(prev => prev.map(item => ({ ...item, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Gagal menandai semua notifikasi dibaca:', err);
        }
    };

    const handleNotificationClick = async (item) => {
        if (!item.read_at) {
            try {
                await api.post(`/api/notifications/${item.id}/read`);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Gagal menandai notifikasi dibaca:', err);
            }
        }
        setShowNotifications(false);
        const targetUrl = item.data?.action_url || '/user/riwayat';
        navigate(targetUrl);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'izin':
            case 'cuti':
            case 'sakit':
            case 'dinas':
            case 'permission':
                return <FileText className="w-4 h-4 text-orange-500" />;
            case 'lembur':
            case 'overtime':
                return <Clock className="w-4 h-4 text-purple-600" />;
            case 'system':
                return <ShieldAlert className="w-4 h-4 text-rose-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-600" />;
        }
    };

    return (
        <div className="bg-[#f8f9fa] font-sans antialiased text-gray-800 h-screen overflow-hidden flex">
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                ></div>
            )}

            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-slate-900 flex flex-col transition-all duration-300 lg:static ${
                    sidebarOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-72'
                }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <img 
                        src="/images/front-end/logo2.png" 
                        alt="Logo Fastlog Era Mandiri" 
                        className="h-14 w-auto object-contain"
                    />
                </div>

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
                        <span>Dasbor</span>
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

                <div className="p-5 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-xl transition text-sm font-medium">
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Sistem Absensi Karyawan</h2>
                            <p className="text-sm text-gray-400 hidden sm:block">PT Fastlog Era Mandiri</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition focus:outline-none"
                                title="Notifikasi"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                            {unreadCount > 0 && (
                                                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {unreadCount} Baru
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Tandai Dibaca
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                                        {notifications.length > 0 ? (
                                            notifications.map((item) => {
                                                const isUnread = !item.read_at;
                                                const title = item.data?.title || 'Notifikasi';
                                                const desc = item.data?.message || '';
                                                const category = item.data?.category || 'default';
                                                const time = item.created_at || '';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className={`p-3.5 flex gap-3 hover:bg-slate-50 transition cursor-pointer ${isUnread ? 'bg-orange-50/40' : ''}`}
                                                    >
                                                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm h-fit">
                                                            {getNotificationIcon(category)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <p className={`text-xs truncate ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                                                    {title}
                                                                </p>
                                                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                                    {time}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                                {desc}
                                                            </p>
                                                        </div>
                                                        {isUnread && (
                                                            <span className="w-2 h-2 rounded-full bg-orange-500 self-center flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-6 text-center text-slate-400 text-xs">
                                                Tidak ada notifikasi saat ini.
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                                        <button
                                            onClick={() => {
                                                setShowNotifications(false);
                                                navigate('/user/riwayat');
                                            }}
                                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition block w-full text-center"
                                        >
                                            Lihat Riwayat Pengajuan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-orange-50 text-orange-500 border border-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold">
                            <User className="w-3.5 h-3.5" />
                            <span>Karyawan</span>
                        </div>
                        <div className="text-sm text-gray-400 font-medium hidden md:block">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="w-full space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </div>
    );
};

export default UserLayout;
