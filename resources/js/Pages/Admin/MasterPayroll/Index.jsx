import React, { useState, useMemo } from 'react';
import { Layers, Plus, Search, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import ModalGolongan from './Components/ModalGolongan';
import ModalKomponen from './Components/ModalKomponen';
import { INITIAL_GOLONGAN, INITIAL_KOMPONEN, isGolonganDipakai, isKomponenDipakai } from './data/masterPayrollMock';

const MasterPayroll = () => {
    const [activeTab, setActiveTab] = useState('golongan'); // 'golongan' atau 'komponen'
    const [searchQuery, setSearchQuery] = useState('');

    const [golonganList, setGolonganList] = useState(INITIAL_GOLONGAN);
    const [komponenList, setKomponenList] = useState(INITIAL_KOMPONEN);

    const [modalGolongan, setModalGolongan] = useState({ isOpen: false, data: null });
    const [modalKomponen, setModalKomponen] = useState({ isOpen: false, data: null });

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
    
    const handleSaveGolongan = (formData) => {
        if (formData.id) {
            setGolonganList(prev => prev.map(item => item.id === formData.id ? formData : item));
        } else {
            setGolonganList(prev => [{ ...formData, id: Date.now() }, ...prev]);
        }
        closeModalGolongan();
    };

    const handleDeleteGolongan = (id, nama) => {
        if (isGolonganDipakai(id)) {
            alert(`Golongan "${nama}" dipasang di data karyawan! Ubah statusnya menjadi Nonaktif saja.`);
            return;
        }
        if (window.confirm(`Hapus golongan "${nama}"?`)) {
            setGolonganList(prev => prev.filter(item => item.id !== id));
        }
    };

    const openModalKomponen = (data = null) => setModalKomponen({ isOpen: true, data });
    const closeModalKomponen = () => setModalKomponen({ isOpen: false, data: null });

    const handleSaveKomponen = (formData) => {
        if (formData.id) {
            setKomponenList(prev => prev.map(item => item.id === formData.id ? formData : item));
        } else {
            setKomponenList(prev => [{ ...formData, id: Date.now() }, ...prev]);
        }
        closeModalKomponen();
    };

    const handleDeleteKomponen = (id, nama) => {
        if (isKomponenDipakai(id)) {
            alert(`Komponen "${nama}" sudah terpakai dalam kalkulasi riwayat payroll! Ubah statusnya menjadi Nonaktif saja.`);
            return;
        }
        if (window.confirm(`Hapus komponen "${nama}"?`)) {
            setKomponenList(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Payroll</h1>
                    <p className="text-sm text-slate-500">Kelola master data golongan gaji dan komponen penggajian (tunjangan & potongan).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => activeTab === 'golongan' ? openModalGolongan() : openModalKomponen()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> 
                        {activeTab === 'golongan' ? 'Tambah Golongan' : 'Tambah Komponen'}
                    </button>
                </div>
            </div>

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

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('golongan')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'golongan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Golongan Gaji
                    </button>
                    <button
                        onClick={() => setActiveTab('komponen')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'komponen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 text-xs font-mono font-medium text-slate-700 whitespace-nowrap">
                                                {item.kode}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                {item.nama}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                                                {formatIDR(item.gajiPokok)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-indigo-600 whitespace-nowrap">
                                                {formatIDR(item.tarifLembur)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.status === 'aktif' ? (
                                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-slate-200">
                                                        <XCircle className="w-3 h-3" /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openModalGolongan(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteGolongan(item.id, item.nama)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
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
                        <div className="flex flex-col">
                            <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 text-xs text-indigo-700 flex items-center gap-2">
                                <span className="font-semibold">Informasi:</span> Komponen aktif berlaku untuk semua golongan. Tarif lembur diatur di tab Golongan Gaji.
                            </div>
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3.5 font-semibold">Nama Komponen</th>
                                        <th className="px-6 py-3.5 font-semibold">Tipe</th>
                                        <th className="px-6 py-3.5 font-semibold">Metode & Sifat</th>
                                        <th className="px-6 py-3.5 font-semibold">Nilai Format</th>
                                        <th className="px-6 py-3.5 font-semibold">Status</th>
                                        <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredKomponen.length > 0 ? (
                                        filteredKomponen.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                    {item.nama}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${item.tipe === 'tambahan' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                        {item.tipe === 'tambahan' ? '+ Tambahan' : '- Potongan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${['nominal', 'persen'].includes(item.metode) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {['nominal', 'persen'].includes(item.metode) ? 'Tetap' : 'Variabel'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono whitespace-nowrap text-slate-700">
                                                    {formatMetodeTampilan(item)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.status === 'aktif' ? (
                                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-emerald-200">
                                                            <CheckCircle className="w-3 h-3" /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-slate-200">
                                                            <XCircle className="w-3 h-3" /> Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => openModalKomponen(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteKomponen(item.id, item.nama)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
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
                        </div>
                    )}
                </div>
            </div>

            <ModalGolongan isOpen={modalGolongan.isOpen} onClose={closeModalGolongan} onSave={handleSaveGolongan} data={modalGolongan.data} />
            <ModalKomponen isOpen={modalKomponen.isOpen} onClose={closeModalKomponen} onSave={handleSaveKomponen} data={modalKomponen.data} />
        </div>
    );
};

export default MasterPayroll;
