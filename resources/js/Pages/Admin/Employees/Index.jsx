import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Users, Plus, Search, Download, CheckCircle2, AlertCircle, Edit3, Trash2, UserX, Loader2, RefreshCw, X } from 'lucide-react';
import ModalKaryawan from './Components/ModalKaryawan';
import api from '../../../lib/api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncingCloud, setSyncingCloud] = useState(false);
    const [notif, setNotif] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [syncFilter, setSyncFilter] = useState('');

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        data: null
    });

    const loadEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/employees');
            const list = (res.data.employees || []).map(emp => ({
                id: emp.id,
                nama: emp.nama,
                nik: emp.nik || '',
                idFinger: emp.pin || '',
                dept: emp.dept || 'Umum',
                jabatan: emp.jabatan || '',
                syncStatus: emp.pin ? 'synced' : 'unsynced'
            }));
            setEmployees(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const handleSyncCloud = async () => {
        try {
            setSyncingCloud(true);
            const res = await api.post('/api/admin/employees/sync-cloud');
            setNotif({
                type: 'success',
                message: res.data.message || 'Permintaan sinkronisasi info nama dari cloud berhasil dikirim.',
            });
            await loadEmployees();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal menyinkronkan nama karyawan dari cloud.',
            });
        } finally {
            setSyncingCloud(false);
        }
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '-';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0 || !parts[0]) return '-';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const nameStr = emp.nama || '';
            const nikStr = emp.nik || '';
            const pinStr = emp.idFinger || '';
            const q = searchQuery.toLowerCase();

            const matchesSearch = nameStr.toLowerCase().includes(q) ||
                nikStr.toLowerCase().includes(q) ||
                pinStr.includes(searchQuery);
            const matchesDept = deptFilter ? emp.dept.toLowerCase() === deptFilter.toLowerCase() : true;
            const matchesSync = syncFilter ? emp.syncStatus === syncFilter : true;

            return matchesSearch && matchesDept && matchesSync;
        });
    }, [employees, searchQuery, deptFilter, syncFilter]);

    const stats = useMemo(() => {
        const total = employees.length;
        const synced = employees.filter(e => e.idFinger && e.syncStatus === 'synced').length;
        const unsynced = total - synced;
        return { total, synced, unsynced };
    }, [employees]);

    const handleOpenModal = (employee = null) => {
        setModalConfig({ isOpen: true, data: employee });
    };

    const handleCloseModal = () => {
        setModalConfig({ isOpen: false, data: null });
    };

    const handleSaveEmployee = async (formData) => {
        try {
            const payload = {
                nama: formData.nama,
                nik: formData.nik || null,
                pin: formData.idFinger || null,
                dept: formData.dept || null,
                jabatan: formData.jabatan || null,
            };

            if (formData.id) {
                await api.put(`/api/admin/employees/${formData.id}`, payload);
            } else {
                await api.post('/api/admin/employees', payload);
            }
            handleCloseModal();
            loadEmployees();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan data karyawan.');
        }
    };

    const handleDeleteEmployee = async (id, nama) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus data "${nama}"?`)) {
            try {
                await api.delete(`/api/admin/employees/${id}`);
                loadEmployees();
            } catch (err) {
                alert(err.response?.data?.message || 'Gagal menghapus data karyawan.');
            }
        }
    };

    const handleExport = () => {
        if (filteredEmployees.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const headers = ['NIK', 'Nama Lengkap', 'ID Fingerprint', 'Departemen', 'Jabatan', 'Status Sync'];
        const csvRows = [
            headers.join(','),
            ...filteredEmployees.map(emp => [
                `"${emp.nik}"`,
                `"${emp.nama}"`,
                `"${emp.idFinger || '-'}"`,
                `"${emp.dept}"`,
                `"${emp.jabatan}"`,
                `"${emp.syncStatus === 'synced' ? 'Sync Mesin' : 'Belum Sync'}"`
            ].join(','))
        ];

        const csvContent = 'sep=,\n' + csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <h1 className="text-2xl font-bold text-slate-900">Data Karyawan</h1>
                    <p className="text-sm text-slate-500">Kelola informasi pegawai dan pemetaan ID mesin fingerprint (Jam Kerja: 08:00 - 16:30 WIB).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={syncingCloud}
                        onClick={handleSyncCloud}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingCloud ? 'animate-spin' : ''}`} />
                        <span>{syncingCloud ? 'Menghubungkan...' : 'Sync Nama dari Mesin'}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Tambah Karyawan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
                    <span className="text-[11px] text-slate-500">Pegawai Terdaftar</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Terhubung Mesin</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.synced}</div>
                    <span className="text-[11px] text-emerald-600 font-medium">ID Fingerprint Mapping Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/50">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Belum Setting ID</span>
                        {stats.unsynced > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                    </div>
                    <div className="text-2xl font-bold text-rose-700 mt-1">{stats.unsynced}</div>
                    <span className="text-[11px] text-rose-600 font-medium">
                        {stats.unsynced > 0 ? 'Segera assign ID Fingerprint!' : 'Semua ID tersinkronisasi'}
                    </span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, NIK, atau PIN..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600"
                >
                    <option value="">Semua Departemen</option>
                    <option value="IT & Tech">IT & Tech</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HRD & GA">HRD & GA</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Umum">Umum</option>
                </select>
                <select
                    value={syncFilter}
                    onChange={(e) => setSyncFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600"
                >
                    <option value="">Semua Status Sinkronisasi</option>
                    <option value="synced">Sudah Tersinkron</option>
                    <option value="unsynced">Belum Tersinkron</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Pegawai</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">ID Fingerprint</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Departemen</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jabatan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Status Sync</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                            <p className="text-sm font-medium text-slate-600">Memuat data karyawan...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {getInitials(emp.nama)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{emp.nama || <span className="text-slate-400 italic font-normal">(Nama belum sinkron)</span>}</div>
                                                    <div className="text-xs text-slate-400">NIK: {emp.nik || <span className="italic text-slate-300">-</span>}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                                            {emp.idFinger ? (
                                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">
                                                    {emp.idFinger}
                                                </span>
                                            ) : (
                                                <span className="text-rose-500 text-xs italic font-medium">Belum diset</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                                            {emp.dept || <span className="text-slate-300 italic">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {emp.jabatan || <span className="text-slate-300 italic">Belum diisi</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.syncStatus === 'synced' ? (
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Sync Mesin
                                                </span>
                                            ) : (
                                                <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Belum Sync
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(emp)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                    title="Edit Data"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id, emp.nama)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserX className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {searchQuery || deptFilter || syncFilter ? 'Data tidak ditemukan' : 'Belum ada data karyawan'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {searchQuery || deptFilter || syncFilter
                                                        ? 'Coba ubah filter atau kata kunci pencarian.'
                                                        : 'Klik "Tambah Karyawan" untuk menambahkan data baru.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalKaryawan
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                onSave={handleSaveEmployee}
                data={modalConfig.data}
            />
        </div>
    );
};

export default Employees;