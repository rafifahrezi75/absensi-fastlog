import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layers, Plus, Search, Edit3, Trash2, CheckCircle, XCircle, X, Loader2, Users, RotateCcw, Filter } from 'lucide-react';
import ModalGolongan from './Components/ModalGolongan';
import ModalKomponen from './Components/ModalKomponen';
import PanelAturGaji from './Components/PanelAturGaji';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const MasterPayroll = () => {
    const [activeTab, setActiveTab] = useState('gaji_karyawan');
    const [searchQuery, setSearchQuery] = useState('');

    const [golonganList, setGolonganList] = useState([]);
    const [komponenList, setKomponenList] = useState([]);
    const [employeeSalaries, setEmployeeSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [notif, setNotif] = useState(null);

    const [empGrade, setEmpGrade] = useState('');
    const [empOnlyCustomized, setEmpOnlyCustomized] = useState(false);

    const [modalGolongan, setModalGolongan] = useState({ isOpen: false, data: null });
    const [modalKomponen, setModalKomponen] = useState({ isOpen: false, data: null });
    const [panelAturGaji, setPanelAturGaji] = useState({ isOpen: false, employeeId: null });

    const showNotif = (message, type = 'success') => {
        if (type === 'success') {
            showSuccess(message);
        } else {
            setNotif({ message, type });
        }
    };

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const fetchGolongan = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/master-payroll/golongan');
            setGolonganList(res.data.golongan || []);
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal memuat data golongan gaji.', 'error');
        }
    }, []);

    const fetchKomponen = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/master-payroll/komponen');
            setKomponenList(res.data.komponen || []);
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal memuat data komponen gaji.', 'error');
        }
    }, []);

    const fetchEmployeeSalaries = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingEmployees(true);
            const res = await api.get('/api/admin/master-payroll/employee-salaries');
            setEmployeeSalaries(res.data.employees || []);
        } catch (err) {
            console.error('Failed to load employee salaries', err);
            showNotif(err.response?.data?.message || 'Gagal memuat data gaji karyawan.', 'error');
        } finally {
            if (!silent) setLoadingEmployees(false);
        }
    }, []);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                fetchGolongan(),
                fetchKomponen(),
                fetchEmployeeSalaries(true),
            ]);
            setLoading(false);
        };
        loadAll();
    }, [fetchGolongan, fetchKomponen, fetchEmployeeSalaries]);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const formatMetodeTampilan = (item) => {
        if (item.metode === 'nominal') return formatIDR(item.nilai);
        if (item.metode === 'persen') return `${item.nilai}% dari gaji pokok${item.batasDasar ? ` (maks. dasar ${formatIDR(item.batasDasar)})` : ''}`;
        if (item.metode === 'per_satuan') {
            const basisLabel = item.basis?.replace('_', ' ');
            return `${formatIDR(item.nilai)} / ${basisLabel}`;
        }
        if (item.metode === 'harian') return 'Gaji pokok / hari kerja x hari alpha';
        return '-';
    };

    const filteredGolongan = useMemo(() => {
        return golonganList.filter(item => 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.kode && item.kode.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [golonganList, searchQuery]);

    const filteredKomponen = useMemo(() => {
        return komponenList.filter(item => 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [komponenList, searchQuery]);

    const filteredEmployeeSalaries = useMemo(() => {
        return employeeSalaries.filter(emp => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q || (
                (emp.nama && emp.nama.toLowerCase().includes(q)) ||
                (emp.pin && emp.pin.toString().includes(q)) ||
                (emp.id && emp.id.toString().includes(q))
            );
            const matchesGrade = !empGrade || (emp.golongan && emp.golongan.toLowerCase() === empGrade.toLowerCase());
            const matchesCustomOnly = !empOnlyCustomized || emp.status === 'disesuaikan';

            return matchesSearch && matchesGrade && matchesCustomOnly;
        });
    }, [employeeSalaries, searchQuery, empGrade, empOnlyCustomized]);

    const stats = useMemo(() => {
        const totalGolongan = golonganList.filter(g => g.status === 'aktif').length;
        const totalTambahan = komponenList.filter(k => k.tipe === 'tambahan' && k.status === 'aktif').length;
        const totalPotongan = komponenList.filter(k => k.tipe === 'potongan' && k.status === 'aktif').length;
        const karyawanDisesuaikan = employeeSalaries.filter(e => e.status === 'disesuaikan').length;
        return { totalGolongan, totalTambahan, totalPotongan, karyawanDisesuaikan };
    }, [golonganList, komponenList, employeeSalaries]);

    const openModalGolongan = (data = null) => setModalGolongan({ isOpen: true, data });
    const closeModalGolongan = () => setModalGolongan({ isOpen: false, data: null });
    
    const handleSaveGolongan = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/api/admin/master-payroll/golongan/${formData.id}`, formData);
                showNotif('Golongan gaji berhasil diperbarui.', 'success');
            } else {
                await api.post('/api/admin/master-payroll/golongan', formData);
                showNotif('Golongan gaji berhasil ditambahkan.', 'success');
            }
            closeModalGolongan();
            fetchGolongan();
            fetchEmployeeSalaries(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan golongan gaji.';
            showNotif(msg, 'error');
        }
    };

    const handleDeleteGolongan = async (id, nama) => {
        const confirmed = await showConfirm({
            title: 'Hapus Golongan Gaji',
            text: `Apakah Anda yakin ingin menghapus golongan "${nama}"?`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/master-payroll/golongan/${id}`);
            showSuccess('Golongan gaji berhasil dihapus.');
            fetchGolongan();
            fetchEmployeeSalaries(true);
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal menghapus golongan gaji.', 'error');
        }
    };

    const openModalKomponen = (data = null) => setModalKomponen({ isOpen: true, data });
    const closeModalKomponen = () => setModalKomponen({ isOpen: false, data: null });

    const handleSaveKomponen = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/api/admin/master-payroll/komponen/${formData.id}`, formData);
                showSuccess('Komponen gaji berhasil diperbarui.');
            } else {
                await api.post('/api/admin/master-payroll/komponen', formData);
                showSuccess('Komponen gaji berhasil ditambahkan.');
            }
            closeModalKomponen();
            fetchKomponen();
            fetchEmployeeSalaries(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan komponen gaji.';
            showNotif(msg, 'error');
        }
    };

    const handleDeleteKomponen = async (id, nama) => {
        const confirmed = await showConfirm({
            title: 'Hapus Komponen Gaji',
            text: `Apakah Anda yakin ingin menghapus komponen "${nama}"?`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/master-payroll/komponen/${id}`);
            showSuccess('Komponen gaji berhasil dihapus.');
            fetchKomponen();
            fetchEmployeeSalaries(true);
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal menghapus komponen gaji.', 'error');
        }
    };

    const handleResetEmployeeSalary = async (employee) => {
        const confirmed = await showConfirm({
            title: 'Kembalikan ke Standar?',
            text: `Apakah Anda yakin ingin mengembalikan gaji ${employee.nama} ke standar golongan ${employee.golongan}? Semua pengaturan khusus karyawan ini akan dihapus.`,
            confirmText: 'Ya, Kembalikan',
            confirmColor: '#f97316',
        });
        if (!confirmed) return;

        try {
            const res = await api.post(`/api/admin/master-payroll/employee-salaries/${employee.id}/reset`);
            showSuccess(res.data?.message || `Gaji ${employee.nama} berhasil dikembalikan ke standar.`);
            fetchEmployeeSalaries(true);
        } catch (err) {
            console.error('Reset error', err);
            showError(err.response?.data?.message || 'Gagal mengembalikan gaji ke standar.');
        }
    };

    const openPanelAturGaji = (empId) => {
        setPanelAturGaji({ isOpen: true, employeeId: empId });
    };

    const closePanelAturGaji = () => {
        setPanelAturGaji({ isOpen: false, employeeId: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Payroll</h1>
                    <p className="text-sm text-slate-500">Kelola gaji karyawan, master golongan gaji, dan komponen penggajian.</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab !== 'gaji_karyawan' && (
                        <button
                            onClick={() => {
                                if (activeTab === 'golongan') openModalGolongan();
                                else if (activeTab === 'komponen') openModalKomponen();
                            }}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> 
                            {activeTab === 'golongan' ? 'Tambah Golongan' : 'Tambah Komponen'}
                        </button>
                    )}
                </div>
            </div>

            {notif && notif.type === 'error' && (
                <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium bg-white text-rose-700 border-rose-200">
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{notif.message}</span>
                    <button onClick={() => setNotif(null)} className="ml-2 text-slate-300 hover:text-slate-500 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg w-full sm:w-fit gap-1">
                    <button
                        onClick={() => setActiveTab('gaji_karyawan')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'gaji_karyawan' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Gaji Karyawan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('golongan')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer ${activeTab === 'golongan' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Golongan Gaji
                    </button>
                    <button
                        onClick={() => setActiveTab('komponen')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer ${activeTab === 'komponen' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Komponen Gaji
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari data..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                    <p className="text-slate-500 text-sm font-medium">Memuat Data Master...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Golongan Aktif</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalGolongan}</div>
                            <span className="text-[11px] text-slate-500 font-medium">Kategori Level Karyawan</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tambahan Aktif</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTambahan}</div>
                            <span className="text-[11px] text-emerald-600 font-medium">Tunjangan & Insentif Global</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Potongan Aktif</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPotongan}</div>
                            <span className="text-[11px] text-rose-600 font-medium">Potongan Global Lainnya</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Karyawan Disesuaikan</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.karyawanDisesuaikan}</div>
                            <span className="text-[11px] text-amber-600 font-medium">Gaji Berbeda Dari Standar</span>
                        </div>
                    </div>

                    {activeTab === 'golongan' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3.5 font-semibold">Kode</th>
                                            <th className="px-6 py-3.5 font-semibold">Nama Golongan</th>
                                            <th className="px-6 py-3.5 font-semibold">Gaji Pokok</th>
                                            <th className="px-6 py-3.5 font-semibold">Tarif Lembur / Jam</th>
                                            <th className="px-6 py-3.5 font-semibold">Status</th>
                                            <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredGolongan.length > 0 ? (
                                            filteredGolongan.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{item.kode || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-800">{item.nama}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{item.keterangan || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{formatIDR(item.gaji_pokok ?? item.gajiPokok)}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{formatIDR(item.tarif_lembur_per_jam ?? item.tarif_lembur ?? item.tarifLembur)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                            {item.status === 'aktif' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => openModalGolongan(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer" title="Ubah">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteGolongan(item.id, item.nama)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Hapus">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Layers className="w-8 h-8 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-500">Tidak ada data golongan gaji</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'komponen' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex flex-col">
                                <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 text-xs text-indigo-700 flex items-center gap-2">
                                    <span className="font-semibold">Informasi:</span> Komponen aktif berlaku untuk semua karyawan, kecuali diatur khusus di tab Gaji Karyawan. Tarif lembur diatur di tab Golongan Gaji.
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3.5 font-semibold">Nama Komponen</th>
                                                <th className="px-6 py-3.5 font-semibold">Tipe</th>
                                                <th className="px-6 py-3.5 font-semibold">Nilai / Formula</th>
                                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredKomponen.length > 0 ? (
                                                filteredKomponen.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-slate-900">{item.nama}</div>
                                                            {item.deskripsi && <div className="text-xs text-slate-400 mt-0.5">{item.deskripsi}</div>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                                                item.tipe === 'tambahan' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                            }`}>
                                                                {item.tipe === 'tambahan' ? 'Tambahan' : 'Potongan'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-700">
                                                            {formatMetodeTampilan(item)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                                item.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}>
                                                                {item.status === 'aktif' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                                                                {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => openModalKomponen(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer" title="Ubah">
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteKomponen(item.id, item.nama)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Hapus">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Layers className="w-8 h-8 text-slate-300" />
                                                            <p className="text-sm font-medium text-slate-500">Tidak ada data komponen gaji</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gaji_karyawan' && (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span>Filter:</span>
                                    </div>

                                    <select
                                        value={empGrade}
                                        onChange={(e) => setEmpGrade(e.target.value)}
                                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">Semua Golongan</option>
                                        {golonganList.map(g => (
                                            <option key={g.id} value={g.nama}>{g.nama}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto">
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={empOnlyCustomized}
                                            onChange={(e) => setEmpOnlyCustomized(e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                        <span className="ml-2 text-xs font-semibold text-slate-700">
                                            Hanya yang disesuaikan
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3.5 font-semibold">Nama Karyawan</th>
                                                <th className="px-6 py-3.5 font-semibold">Golongan</th>
                                                <th className="px-6 py-3.5 font-semibold">Gaji Pokok</th>
                                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loadingEmployees ? (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                            <p className="text-sm font-medium text-slate-500">Memuat data gaji karyawan...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredEmployeeSalaries.length > 0 ? (
                                                filteredEmployeeSalaries.map((emp) => (
                                                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-semibold text-slate-900">
                                                                {emp.nama || <span className="text-slate-300 italic font-normal">Nama belum terisi</span>}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                                ID: {emp.pin || emp.id || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                                            {emp.golongan}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <span 
                                                                    className={`font-mono font-bold text-xs ${emp.is_gaji_pokok_custom ? 'text-amber-600' : 'text-slate-800'}`}
                                                                    title={emp.is_gaji_pokok_custom ? `Golongan: ${formatIDR(emp.standard_gapok)}` : ''}
                                                                >
                                                                    {formatIDR(emp.gaji_pokok)}
                                                                </span>
                                                                {emp.is_gaji_pokok_custom && (
                                                                    <span 
                                                                        className="cursor-help px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200"
                                                                        title={`Golongan: ${formatIDR(emp.standard_gapok)}`}
                                                                    >
                                                                        Kustom
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {emp.status === 'disesuaikan' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                    Disesuaikan
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                    Standar
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button 
                                                                    onClick={() => openPanelAturGaji(emp.id)} 
                                                                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 cursor-pointer" 
                                                                    title="Atur Gaji Karyawan"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                    <span>Atur Gaji</span>
                                                                </button>
                                                                {emp.status === 'disesuaikan' && (
                                                                    <button 
                                                                        onClick={() => handleResetEmployeeSalary(emp)} 
                                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer" 
                                                                        title="Kembalikan ke standar"
                                                                    >
                                                                        <RotateCcw className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Users className="w-8 h-8 text-slate-300" />
                                                            <p className="text-sm font-medium text-slate-500">Tidak ada data karyawan yang sesuai</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ModalGolongan isOpen={modalGolongan.isOpen} onClose={closeModalGolongan} onSave={handleSaveGolongan} data={modalGolongan.data} />
            <ModalKomponen isOpen={modalKomponen.isOpen} onClose={closeModalKomponen} onSave={handleSaveKomponen} data={modalKomponen.data} />
            <PanelAturGaji
                isOpen={panelAturGaji.isOpen}
                employeeId={panelAturGaji.employeeId}
                onClose={closePanelAturGaji}
                onSaved={() => fetchEmployeeSalaries(true)}
            />
        </div>
    );
};

export default MasterPayroll;
