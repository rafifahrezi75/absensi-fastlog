import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Download, Plus, Search, Calendar, Filter, FileText, Check, X, Clock, Fingerprint, RefreshCw, UserCheck, AlertTriangle, Stethoscope, LogOut, CalendarX, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ModalKoreksi from './Components/ModalKoreksi';
import ModalTambahManual from './Components/ModalTambah';
import api from '../../../lib/api';

const Attendance = () => {
    const [modalData, setModalData] = useState({ isOpen: false, nama: '', masuk: '', keluar: '' });
    const [isTambahOpen, setIsTambahOpen] = useState(false);

    const [attendanceData, setAttendanceData] = useState([]);
    const [stats, setStats] = useState({ hadir: 0, terlambat: 0, izin: 0, belum_pulang: 0, total_karyawan: 0 });
    const [loading, setLoading] = useState(true);
    const [fetchingCloud, setFetchingCloud] = useState(false);
    const [notif, setNotif] = useState(null);

    const [filterTanggal, setFilterTanggal] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const openModalKoreksi = useCallback((nama, masuk, keluar) => {
        setModalData({ isOpen: true, nama, masuk, keluar });
    }, []);

    const closeModalKoreksi = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    const loadAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterTanggal) params.tanggal = filterTanggal;
            if (filterDept) params.dept = filterDept;
            if (filterStatus) params.status = filterStatus;
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/api/admin/attendance', { params });
            setAttendanceData(res.data.attendance || []);
            if (res.data.stats) {
                setStats(res.data.stats);
            }
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memuat data absensi.',
            });
        } finally {
            setLoading(false);
        }
    }, [filterTanggal, filterDept, filterStatus, searchQuery]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const handleFetchCloud = async () => {
        try {
            setFetchingCloud(true);
            const payload = {};
            if (filterTanggal) {
                payload.start_date = filterTanggal;
                payload.end_date = filterTanggal;
            }

            const res = await api.post('/api/admin/attendance/fetch', payload);
            setNotif({
                type: 'success',
                message: res.data.message || 'Berhasil melakukan sinkronisasi data dari mesin cloud.',
            });
            await loadAttendance();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal menyinkronkan data dari mesin cloud.',
            });
        } finally {
            setFetchingCloud(false);
        }
    };

    const handleResetFilter = () => {
        setFilterTanggal('');
        setFilterDept('');
        setFilterStatus('');
        setSearchQuery('');
    };

    const isFilterActive = Boolean(filterTanggal || filterDept || filterStatus || searchQuery);

    return (
        <div className="space-y-6">
            {notif && (
                <div className={`p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm ${
                    notif.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {notif.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-medium">{notif.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotif(null)}
                        className="p-1 hover:bg-black/5 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Log Absensi</h1>
                    <p className="text-sm text-slate-500">Pantau kehadiran harian, keterlambatan, jam pulang, dan sinkronisasi mesin online.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        disabled={fetchingCloud}
                        onClick={handleFetchCloud}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${fetchingCloud ? 'animate-spin' : ''}`} />
                        <span>{fetchingCloud ? 'Menarik Data Cloud...' : 'Tarik Data Mesin'}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsTambahOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Tambah Manual
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Hadir Hari Ini</span>
                        <div className="p-1.5 bg-emerald-50 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-600" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats.hadir} <span className="text-sm font-medium text-slate-500">/ {stats.total_karyawan || stats.hadir}</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">Data realtime mesin</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Terlambat</span>
                        <div className="p-1.5 bg-rose-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-rose-600" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.terlambat}</div>
                    <span className="text-[11px] text-rose-600 font-medium">Lewat jam 08:00 WIB</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Izin / Sakit / Dinas</span>
                        <div className="p-1.5 bg-blue-50 rounded-lg"><Stethoscope className="w-4 h-4 text-blue-600" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.izin}</div>
                    <span className="text-[11px] text-blue-600 font-medium">Disetujui Admin</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Belum Tap Pulang</span>
                        <div className="p-1.5 bg-amber-50 rounded-lg"><LogOut className="w-4 h-4 text-amber-600" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.belum_pulang}</div>
                    <span className="text-[11px] text-amber-600 font-medium">Menunggu tap pulang</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Absen</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={filterTanggal}
                                onChange={(e) => setFilterTanggal(e.target.value)}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer" 
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Departemen</label>
                        <select 
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & General Affair</option>
                            <option value="finance">Finance & Accounting</option>
                            <option value="marketing">Marketing</option>
                            <option value="umum">Umum</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status Kehadiran</label>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="ontime">Hadir Tepat Waktu</option>
                            <option value="late">Terlambat</option>
                            <option value="izin">Izin / Sakit / Cuti</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nama, NIK, atau PIN..." 
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {isFilterActive && (
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Karyawan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Tanggal</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jam Masuk</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jam Keluar</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Keterangan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Log Lokasi</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                            <p className="text-sm font-medium text-slate-600">Memuat data absensi...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendanceData.length > 0 ? (
                                attendanceData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {row.initials && row.initials !== '-' ? row.initials : (row.finger ? row.finger : '-')}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{row.nama || <span className="text-slate-400 italic font-normal">(Nama belum sinkron)</span>}</div>
                                                    <div className="text-xs text-slate-400">NIK: {row.nik || '-'} • ID Finger: {row.finger || <span className="italic text-slate-300">Belum diset</span>}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">{row.tglDisplay || <span className="text-slate-300 italic">-</span>}</td>
                                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                            <div className={`font-bold ${row.status === 'late' ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit' : 'text-slate-800'}`}>
                                                {row.in && row.in !== '-' ? row.in : <span className="text-slate-300 font-normal italic">Belum tap masuk</span>}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${row.status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {row.status === 'ontime' && <Check className="w-3 h-3" />}
                                                {row.inStatus || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                            <div className="font-bold text-slate-800">{row.out && row.out !== '-' ? row.out : <span className="text-slate-400 font-normal italic">Belum tap pulang</span>}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{row.outStatus || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {row.status === 'ontime' && (
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                                                    Hadir ({row.dur || '-'})
                                                </span>
                                            )}
                                            {row.status === 'late' && (
                                                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                                    {row.inStatus || 'Terlambat'}
                                                </span>
                                            )}
                                            {row.status === 'izin' && (
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                                    Izin / Sakit
                                                </span>
                                            )}
                                            {!row.status && (
                                                <span className="text-slate-300 italic text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {row.locIn ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> {row.locIn}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 italic text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button 
                                                onClick={() => openModalKoreksi(row.nama, row.in, row.out)} 
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer" 
                                                title="Koreksi Data"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <CalendarX className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {isFilterActive ? 'Data tidak ditemukan' : 'Belum ada data absensi'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {isFilterActive
                                                        ? 'Coba ubah filter atau reset pencarian.'
                                                        : 'Klik tombol "Tarik Data Mesin" di atas untuk mengambil data dari cloud.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div>Menampilkan {attendanceData.length} data absensi</div>
                </div>
            </div>

            <ModalKoreksi isOpen={modalData.isOpen} onClose={closeModalKoreksi} data={modalData} />
            <ModalTambahManual isOpen={isTambahOpen} onClose={() => setIsTambahOpen(false)} />
        </div>
    );
};

export default Attendance;