import React, { useState, useMemo } from 'react';
import { Clock, Filter, Search, X } from 'lucide-react';

const Riwayat = () => {
    const riwayat = [
        { id: 1, tanggal: 'Senin, 10 Agu 2026', ket: 'Acara Keluarga', jenis: 'Izin', status: 'Menunggu', dot: 'bg-blue-500', badge: 'bg-amber-50 text-amber-600' },
        { id: 2, tanggal: 'Jumat, 7 Agu 2026', ket: 'Meeting Klien Cabang', jenis: 'Dinas', status: 'Disetujui', dot: 'bg-orange-500', badge: 'bg-emerald-50 text-emerald-600' },
        { id: 3, tanggal: 'Rabu, 5 Agu 2026', ket: 'Demam Berdarah', jenis: 'Sakit', status: 'Disetujui', dot: 'bg-rose-500', badge: 'bg-emerald-50 text-emerald-600' },
        { id: 4, tanggal: 'Jumat, 31 Jul 2026', ket: 'Urusan Keluarga', jenis: 'Izin', status: 'Ditolak', dot: 'bg-blue-500', badge: 'bg-rose-50 text-rose-600' },
    ];

    const [search, setSearch] = useState('');
    const [filterJenis, setFilterJenis] = useState('Semua Jenis');
    const [filterStatus, setFilterStatus] = useState('Semua Status');
    const [filterOpen, setFilterOpen] = useState(false);

    const filtered = useMemo(() => {
        return riwayat.filter((item) => {
            const matchSearch =
                item.tanggal.toLowerCase().includes(search.toLowerCase()) ||
                item.ket.toLowerCase().includes(search.toLowerCase());
            const matchJenis = filterJenis === 'Semua Jenis' || item.jenis === filterJenis;
            const matchStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
            return matchSearch && matchJenis && matchStatus;
        });
    }, [search, filterJenis, filterStatus]);

    const hasActiveFilter = filterJenis !== 'Semua Jenis' || filterStatus !== 'Semua Status';

    const resetFilter = () => {
        setFilterJenis('Semua Jenis');
        setFilterStatus('Semua Status');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Riwayat Pengajuan</h2>
                    <p className="text-sm text-gray-500">Daftar semua pengajuan izin, sakit, dan dinas Anda</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Search bar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari tanggal atau keterangan..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen((v) => !v)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                                hasActiveFilter
                                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            {hasActiveFilter && (
                                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                                    {(filterJenis !== 'Semua Jenis' ? 1 : 0) + (filterStatus !== 'Semua Status' ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {filterOpen && (
                            <>
                                {/* klik di luar buat nutup */}
                                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)}></div>

                                <div className="absolute right-0 sm:right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-gray-500">FILTER</p>
                                        {hasActiveFilter && (
                                            <button
                                                onClick={resetFilter}
                                                className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" /> Reset
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis</label>
                                        <select
                                            value={filterJenis}
                                            onChange={(e) => setFilterJenis(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                        >
                                            <option>Semua Jenis</option>
                                            <option>Izin</option>
                                            <option>Sakit</option>
                                            <option>Dinas</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                        >
                                            <option>Semua Status</option>
                                            <option>Menunggu</option>
                                            <option>Disetujui</option>
                                            <option>Ditolak</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Header label + counter */}
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">
                        {hasActiveFilter || search ? 'Hasil Filter' : 'Semua Riwayat'}
                    </h3>
                    <span className="text-xs text-gray-400">{filtered.length} data</span>
                </div>

                <div className="space-y-0.5">
                    {filtered.length > 0 ? filtered.map((item, index) => (
                        <div key={item.id} className={`flex items-center justify-between p-4 ${index !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`}></div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">{item.tanggal}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.jenis} &middot; {item.ket}</p>
                                </div>
                            </div>
                            <span className={`${item.badge} font-semibold px-3 py-1 rounded-full text-xs`}>
                                {item.status}
                            </span>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-400">
                            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm">Tidak ada pengajuan yang cocok.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Riwayat;