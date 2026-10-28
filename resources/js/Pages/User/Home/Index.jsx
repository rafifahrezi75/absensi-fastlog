import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, AlertCircle,
    Briefcase, Clock, ArrowRight, Loader2, X, Timer, Navigation, Info
} from 'lucide-react';
import PengajuanModal from '../../../Components/PengajuanModal';
import { useAuth } from '../../../Contexts/AuthContext';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('Izin');
    const [notif, setNotif] = useState(null);

    const [stats, setStats] = useState({ izin: 0, sakit: 0, dinas: 0, lembur: 0, absensi: 0, menunggu: 0, disetujui: 0, total: 0 });
    const [recentList, setRecentList] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [overtimeRules, setOvertimeRules] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [loading, setLoading] = useState(true);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/user/dashboard');
            setStats(res.data.stats || { izin: 0, sakit: 0, dinas: 0, menunggu: 0, disetujui: 0, total: 0 });
            setRecentList(res.data.recent || []);
            setEmployeeData(res.data.employee || null);
            setOvertimeRules(res.data.overtime_rules || null);
            setTodayAttendance(res.data.today_attendance || null);
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memuat data portal karyawan.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const openForm = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleSuccessSubmission = (msg) => {
        showSuccess(msg || 'Pengajuan berhasil dikirimkan.');
        loadDashboard();
    };

    const getGreeting = () => {
        const hour = now.getHours();
        if (hour >= 4 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'disetujui' || s === 'approved') {
            return {
                dot: 'bg-emerald-500',
                badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                label: 'Disetujui'
            };
        }
        if (s === 'ditolak' || s === 'rejected') {
            return {
                dot: 'bg-rose-500',
                badge: 'bg-rose-50 text-rose-700 border border-rose-200',
                label: 'Ditolak'
            };
        }
        return {
            dot: 'bg-amber-500',
            badge: 'bg-amber-50 text-amber-700 border border-amber-200',
            label: 'Menunggu'
        };
    };

    const deptText = employeeData?.dept 
        ? `${employeeData.dept}${employeeData.jabatan ? ` · ${employeeData.jabatan}` : ''}`
        : (user?.role === 'admin' ? 'Administrator' : 'Karyawan');

    return (
        <div className="space-y-5">
            {notif && notif.type === 'error' && (
                <div className="p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm bg-rose-50 text-rose-800 border border-rose-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="font-medium">{notif.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotif(null)}
                        className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden shadow-lg border border-slate-800">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                    <p className="text-white/60 text-xs mb-1">{getGreeting()},</p>
                    <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                        {user?.name || 'Karyawan'}
                    </h2>
                    <p className="text-white/50 text-xs mt-1">
                        {deptText} {employeeData?.pin ? `(ID: ${employeeData.pin})` : (employeeData?.id ? `(ID: ${employeeData.id})` : '')}
                    </p>
                </div>
                <div className="relative text-left md:text-right">
                    <p className="text-orange-500 text-2xl md:text-3xl font-bold tracking-wide font-mono">
                        {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                        {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-semibold text-sky-800 mb-1">Keterangan Jenis Pengajuan</p>
                    <ul className="text-[11px] text-sky-700 space-y-0.5">
                        <li><span className="font-semibold">Izin / Sakit</span> — keperluan pribadi atau keterangan sakit</li>
                        <li><span className="font-semibold">Dinas Luar</span> — penugasan kerja di luar kantor</li>
                        <li><span className="font-semibold">Lembur</span> — kerja di luar jam kerja normal</li>
                        <li><span className="font-semibold">Absensi Luar</span> — tap in/out untuk karyawan lapangan (wajib foto GPS)</li>
                    </ul>
                </div>
            </div>

            {todayAttendance?.has_rejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-rose-900">Pemberitahuan Absensi Hari Ini</p>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                            {todayAttendance.rejected_message || 'Absensi Anda hari ini telah dihapus atau ditolak oleh admin. Mohon lakukan absensi ulang.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openForm('Absensi')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition shadow-xs"
                    >
                        Absen Ulang
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Izin & Sakit</p>
                        <p className="text-lg font-bold text-blue-600">
                            {(stats.izin ?? 0) + (stats.sakit ?? 0)} <span className="text-xs font-medium text-gray-400">pengajuan</span>
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Dinas Luar</p>
                        <p className="text-lg font-bold text-orange-600">
                            {stats.dinas ?? 0} <span className="text-xs font-medium text-gray-400">pengajuan</span>
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Briefcase className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Lembur</p>
                        <p className="text-lg font-bold text-purple-600">
                            {stats.lembur ?? 0} <span className="text-xs font-medium text-gray-400">pengajuan</span>
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Timer className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Absensi Luar</p>
                        <p className="text-lg font-bold text-teal-600">
                            {stats.absensi ?? 0} <span className="text-xs font-medium text-gray-400">pengajuan</span>
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <Navigation className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                    type="button"
                    onClick={() => openForm('IzinSakit')}
                    className="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                    <FileText className="w-4 h-4" />
                    <span>Izin / Sakit</span>
                </button>

                <button
                    type="button"
                    onClick={() => openForm('Dinas')}
                    className="flex items-center justify-center gap-2.5 py-3.5 bg-orange-500 border-2 border-orange-500 text-white hover:bg-orange-600 rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                    <Briefcase className="w-4 h-4" />
                    <span>Dinas Luar</span>
                </button>

                <button
                    type="button"
                    onClick={() => openForm('Lembur')}
                    className="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                    <Timer className="w-4 h-4" />
                    <span>Ajukan Lembur</span>
                </button>

                <button
                    type="button"
                    onClick={() => openForm('Absensi')}
                    className="flex items-center justify-center gap-2.5 py-3.5 bg-teal-600 border-2 border-teal-600 text-white hover:bg-teal-700 rounded-xl font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                    <Navigation className="w-4 h-4" />
                    <span>Absensi Luar</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Riwayat Pengajuan Terkini</h3>
                            <p className="text-xs text-gray-400">Pengajuan Anda yang terhubung langsung dengan admin</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/user/riwayat')}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition cursor-pointer"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="space-y-0.5">
                    {loading ? (
                        <div className="py-8 text-center flex flex-col items-center gap-2 text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            <p className="text-xs">Memuat data riwayat...</p>
                        </div>
                    ) : recentList.length > 0 ? (
                        recentList.map((item, index) => {
                            const badgeInfo = getStatusBadge(item.raw_status);
                            return (
                                <div key={item.id} className={`flex items-center justify-between py-3 ${index !== recentList.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${badgeInfo.dot} shrink-0`}></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-800 text-xs">{item.kategori}</h4>
                                                <span className="text-[11px] text-gray-400 font-normal">({item.tanggal_format})</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{item.keterangan}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                                        <span className={`${badgeInfo.badge} font-semibold px-2.5 py-0.5 rounded-full text-[11px]`}>
                                            {badgeInfo.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            Belum ada riwayat pengajuan. Gunakan tombol di atas untuk mengajukan izin, sakit, dinas luar, atau lembur.
                        </div>
                    )}
                </div>
            </div>

            <PengajuanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
                onSuccess={handleSuccessSubmission}
                employee={employeeData}
                overtimeRules={overtimeRules}
                todayAttendance={todayAttendance}
            />
        </div>
    );
};

export default Home;
