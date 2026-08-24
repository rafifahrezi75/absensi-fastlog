import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    X, LayoutDashboard, Clock, FileCheck2, 
    Users, Wallet, FileBarChart, Cpu, Settings, LogOut, PanelLeft, Bell,
    Check, AlertCircle, FileText, UserCheck, ShieldAlert
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // State Notifikasi
    const [unreadCount, setUnreadCount] = useState(4);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Data Dummy Notifikasi beserta Rute Halaman Tujuan (link)
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Pengajuan Cuti Baru',
            desc: 'Budi Santoso mengajukan Cuti Tahunan (2 Hari)',
            time: '5 menit yang lalu',
            type: 'permission',
            link: '/admin/permissions',
            read: false
        },
        {
            id: 2,
            title: 'Pengajuan Overtime',
            desc: 'Ahmad Rizky meminta persetujuan Lembur 3 jam',
            time: '20 menit yang lalu',
            type: 'overtime',
            link: '/admin/permissions',
            read: false
        },
        {
            id: 3,
            title: 'Keterlambatan Presensi',
            desc: 'Siti Aminah check-in terlambat (08:45 WIB)',
            time: '1 jam yang lalu',
            type: 'attendance',
            link: '/admin/attendance',
            read: false
        },
        {
            id: 4,
            title: 'Mesin Fingerprint Offline',
            desc: 'Device LT-2 sempat terputus dari jaringan',
            time: '2 jam yang lalu',
            type: 'system',
            link: '/admin/dashboard',
            read: false
        }
    ]);

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

    // Close Notification Dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(item => ({ ...item, read: true })));
        setUnreadCount(0);
    };

    // Fungsi Hendel Klik Notifikasi: Tandai Dibaca -> Tutup Popover -> Navigasi
    const handleNotificationClick = (item) => {
        if (!item.read) {
            setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setShowNotifications(false);
        if (item.link) {
            navigate(item.link);
        }
    };

    // Helper Icon Notifikasi
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'permission':
                return <FileText className="w-4 h-4 text-[#FF7A3D]" />;
            case 'overtime':
                return <Clock className="w-4 h-4 text-purple-600" />;
            case 'attendance':
                return <UserCheck className="w-4 h-4 text-amber-600" />;
            case 'system':
                return <ShieldAlert className="w-4 h-4 text-rose-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-600" />;
        }
    };

    // Styling untuk link navigasi dengan warna oranye Fastlog saat aktif
    const navLinkClass = ({ isActive }) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive 
            ? 'bg-[#FF7A3D] text-white shadow-md shadow-[#FF7A3D]/20' 
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`;

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-[#FAF6EF] text-slate-800 font-sans antialiased">
            
            {/* Overlay untuk Layar HP / Mobile */}
            {isMobile && sidebarOpen && (
                <div 
                    onClick={toggleSidebar} 
                    className="fixed inset-0 bg-slate-900/50 z-20 backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* ================= SIDEBAR (Menggunakan warna biru Fastlog #052B35) ================= */}
            <aside 
                className={`w-64 bg-[#052B35] text-white/90 min-h-screen flex flex-col border-r border-[#052B35]/20 fixed lg:static z-30 transition-all duration-300 ease-in-out flex-shrink-0 ${
                    isMobile 
                        ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') 
                        : (sidebarOpen ? 'ml-0' : '-ml-64')
                }`}
            >
                {/* Logo & Tombol Close Mobile */}
                <div className="h-16 flex items-center justify-between px-6 bg-[#042028] font-bold text-white text-lg border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {/* Menggunakan Logo Fastlog yang sama dengan halaman login */}
                        <img 
                            src="/images/front-end/logo2.png" 
                            alt="Fastlog" 
                            className="h-8 w-auto object-contain" 
                        />
                        <span className="text-base tracking-wide mt-1">Sistem Absensi</span>
                    </div>
                    {isMobile && (
                        <button onClick={toggleSidebar} className="text-white/50 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigasi Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">Utama</div>
                    
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

                    <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mt-5 mb-2">Kepegawaian & Gaji</div>
                    
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

                    <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mt-5 mb-2">Sistem & Device</div>
                    
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-white/60 hover:bg-white/10 hover:text-white">
                        <Cpu className="w-4 h-4" />
                        <span>Mesin Fingerprint</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-white/60 hover:bg-white/10 hover:text-white">
                        <Settings className="w-4 h-4" />
                        <span>Pengaturan System</span>
                    </a>
                </nav>

                {/* Profil Admin / Logout */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#042028]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-[#FF7A3D] flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                            AD
                        </div>
                        <div className="truncate">
                            <div className="text-sm font-medium text-white truncate">Admin Utama</div>
                            <div className="text-xs text-white/50 truncate">admin@fastlogem.co.id</div>
                        </div>
                    </div>
                    <button title="Logout" className="text-white/50 hover:text-[#FF7A3D] p-1 transition flex-shrink-0">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>
            
            {/* ================= CONTENT WRAPPER ================= */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header / Navbar */}
                <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    
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

                        {/* ================= NOTIFICATION DROPDOWN ================= */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={toggleNotifications}
                                className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition focus:outline-none"
                                title="Notifikasi"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A3D] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A3D]"></span>
                                    </span>
                                )}
                            </button>

                            {/* Menu Dropdown Popover */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                            {unreadCount > 0 && (
                                                <span className="bg-orange-100 text-[#FF7A3D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {unreadCount} Baru
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-[#FF7A3D] hover:text-orange-700 font-medium flex items-center gap-1 transition"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Tandai Dibaca
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                                        {notifications.length > 0 ? (
                                            notifications.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleNotificationClick(item)}
                                                    className={`p-3.5 flex gap-3 hover:bg-slate-50 transition cursor-pointer ${!item.read ? 'bg-orange-50/40' : ''
                                                        }`}
                                                >
                                                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm h-fit">
                                                        {getNotificationIcon(item.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <p className={`text-xs font-semibold truncate ${!item.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                                {item.title}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    {!item.read && (
                                                        <span className="w-2 h-2 rounded-full bg-[#FF7A3D] self-center flex-shrink-0"></span>
                                                    )}
                                                </div>
                                            ))
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
                                                navigate('/admin/permissions');
                                            }}
                                            className="text-xs font-semibold text-[#FF7A3D] hover:text-orange-700 transition block w-full text-center"
                                        >
                                            Lihat Semua Kelola Izin & Lembur
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

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