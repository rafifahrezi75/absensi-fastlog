import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layers, Plus, Search, Edit3, Trash2, CheckCircle, XCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import ModalGolongan from './Components/ModalGolongan';
import ModalKomponen from './Components/ModalKomponen';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const MasterPayroll = () => {
    const [activeTab, setActiveTab] = useState('golongan');
    const [searchQuery, setSearchQuery] = useState('');

    const [golonganList, setGolonganList] = useState([]);
    const [komponenList, setKomponenList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState(null);

    const [modalGolongan, setModalGolongan] = useState({ isOpen: false, data: null });
    const [modalKomponen, setModalKomponen] = useState({ isOpen: false, data: null });

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

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchGolongan(), fetchKomponen()]);
            setLoading(false);
        };
        loadAll();
    }, [fetchGolongan, fetchKomponen]);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
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

    const stats = useMemo(() => {
        const totalGolongan = golonganList.filter(g => g.status === 'aktif').length;
        const totalTambahan = komponenList.filter(k => k.tipe === 'tambahan' && k.status === 'aktif').length;
        const totalPotongan = komponenList.filter(k => k.tipe === 'potongan' && k.status === 'aktif').length;
        return { totalGolongan, totalTambahan, totalPotongan };
    }, [golonganList, komponenList]);

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
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal menghapus komponen gaji.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Payroll</h1>
                    <p className="text-sm text-slate-500">Kelola master golongan gaji dan komponen penggajian.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (activeTab === 'golongan') openModalGolongan();
                            else openModalKomponen();
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> 
                        {activeTab === 'golongan' ? 'Tambah Golongan' : 'Tambah Komponen'}
                    </button>
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
                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            {activeTab === 'golongan' ? (
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
                                                    <td className="px-6 py-4 font-medium text-slate-900">{formatIDR(item.gaji_pokok)}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{formatIDR(item.tarif_lembur_per_jam)}</td>
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
                            ) : (
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3.5 font-semibold">Nama Komponen</th>
                                            <th className="px-6 py-3.5 font-semibold">Tipe</th>
                                            <th className="px-6 py-3.5 font-semibold">Nilai / Metode</th>
                                            <th className="px-6 py-3.5 font-semibold">Sifat</th>
                                            <th className="px-6 py-3.5 font-semibold">Status</th>
                                            <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredKomponen.length > 0 ? (
                                            filteredKomponen.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-800">{item.nama}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{item.keterangan || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${item.tipe === 'tambahan' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {item.tipe === 'tambahan' ? 'Tambahan' : 'Potongan'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{formatMetodeTampilan(item)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs text-slate-600 font-medium">
                                                            {item.opsional ? 'Opsional / Variabel' : 'Wajib (Default)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                            {item.status === 'aktif' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
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
                                                <td colSpan="6" className="py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Layers className="w-8 h-8 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-500">Tidak ada data komponen gaji</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ModalGolongan isOpen={modalGolongan.isOpen} onClose={closeModalGolongan} onSave={handleSaveGolongan} data={modalGolongan.data} />
            <ModalKomponen isOpen={modalKomponen.isOpen} onClose={closeModalKomponen} onSave={handleSaveKomponen} data={modalKomponen.data} />
        </div>
    );
};

export default MasterPayroll;
