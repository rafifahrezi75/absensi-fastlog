import React, { useState, useMemo, useEffect } from 'react';
import { X, Clock, Search, Send, Loader2 } from 'lucide-react';

const ModalEksekusiTindakan = ({
    isOpen,
    onClose,
    statusTitle,
    kategoriTitle,
    tindakanTitle,
    dataKaryawan = [],
    listKategori = [],
    defaultKategori = 'Semua',
    getOpsiTindakanForCategory,
    opsiTindakan = [],
    onChangeAction,
    onBatchApply,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryTab, setActiveCategoryTab] = useState(defaultKategori || 'Semua');
    const [selectedBatchAction, setSelectedBatchAction] = useState('');
    const [selectedPins, setSelectedPins] = useState([]);
    const [isBatchSaving, setIsBatchSaving] = useState(false);

    useEffect(() => {
        if (defaultKategori) {
            setActiveCategoryTab(defaultKategori);
        }
    }, [defaultKategori, isOpen]);

    const availableCategories = useMemo(() => {
        const set = new Set();
        listKategori.forEach((c) => {
            if (c) set.add(c);
        });
        dataKaryawan.forEach((item) => {
            if (item.kategori) set.add(item.kategori);
        });
        return Array.from(set);
    }, [listKategori, dataKaryawan]);

    const currentCategoryForBatch = activeCategoryTab !== 'Semua' ? activeCategoryTab : (availableCategories[0] || kategoriTitle);

    const batchOptions = useMemo(() => {
        if (getOpsiTindakanForCategory && currentCategoryForBatch) {
            return getOpsiTindakanForCategory(currentCategoryForBatch);
        }
        const list = ['Tidak Ada Tindakan'];
        opsiTindakan.forEach((opt) => {
            if (opt && !list.includes(opt)) {
                list.push(opt);
            }
        });
        return list;
    }, [getOpsiTindakanForCategory, currentCategoryForBatch, opsiTindakan]);

    useEffect(() => {
        if (batchOptions.length > 0) {
            if (!selectedBatchAction || !batchOptions.includes(selectedBatchAction)) {
                const firstActual = batchOptions.find((opt) => opt !== 'Tidak Ada Tindakan');
                setSelectedBatchAction(firstActual || batchOptions[0] || 'Tidak Ada Tindakan');
            }
        }
    }, [batchOptions, selectedBatchAction]);

    const stats = useMemo(() => {
        let tidakAda = 0;
        let sudahDitindak = 0;
        dataKaryawan.forEach((item) => {
            const current = item.aksi || 'Tidak Ada Tindakan';
            if (current === 'Tidak Ada Tindakan') {
                tidakAda += 1;
            } else {
                sudahDitindak += 1;
            }
        });
        return { total: dataKaryawan.length, tidakAda, sudahDitindak };
    }, [dataKaryawan]);

    const filteredKaryawan = useMemo(() => {
        return dataKaryawan.filter((item) => {
            const matchesSearch =
                !searchQuery ||
                String(item.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(item.pin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(item.dept || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(item.kategori || '').toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeCategoryTab === 'Semua') return true;
            return (item.kategori || '') === activeCategoryTab;
        });
    }, [dataKaryawan, searchQuery, activeCategoryTab]);

    const allVisiblePins = useMemo(() => {
        return filteredKaryawan.map((item) => String(item.pin));
    }, [filteredKaryawan]);

    const isAllSelected =
        allVisiblePins.length > 0 &&
        allVisiblePins.every((pin) => selectedPins.includes(pin));

    const isSomeSelected =
        allVisiblePins.some((pin) => selectedPins.includes(pin)) && !isAllSelected;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedPins((prev) => prev.filter((pin) => !allVisiblePins.includes(pin)));
        } else {
            setSelectedPins((prev) => Array.from(new Set([...prev, ...allVisiblePins])));
        }
    };

    const toggleSelectPin = (pin) => {
        const pinStr = String(pin);
        setSelectedPins((prev) =>
            prev.includes(pinStr) ? prev.filter((p) => p !== pinStr) : [...prev, pinStr]
        );
    };

    if (!isOpen) return null;

    const isPositiveCategory =
        String(kategoriTitle).toLowerCase().includes('tepat') ||
        String(kategoriTitle).toLowerCase().includes('awal');

    const handleSelectChange = (pin, newAksi, itemKategori) => {
        if (onChangeAction) {
            onChangeAction(pin, newAksi, itemKategori);
        }
    };

    const handleExecuteSelected = async () => {
        if (onBatchApply && selectedBatchAction && selectedPins.length > 0) {
            setIsBatchSaving(true);
            try {
                await onBatchApply(
                    selectedBatchAction,
                    selectedPins,
                    activeCategoryTab !== 'Semua' ? activeCategoryTab : null
                );
                setSelectedPins([]);
            } finally {
                setIsBatchSaving(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">

                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                    isPositiveCategory
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                            >
                                Eksekusi Tindakan HR
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                                {kategoriTitle}
                            </span>
                            {tindakanTitle && tindakanTitle !== 'Semua Tindakan' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    {tindakanTitle}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                            Daftar Pegawai
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3 bg-slate-50/70 border-b border-slate-200 space-y-2 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, PIN..."
                                className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        {onBatchApply && batchOptions.length > 0 && selectedPins.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100 flex-wrap">
                                <span className="text-[11px] font-bold text-indigo-800">
                                    {selectedPins.length} Dipilih
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPins([])}
                                    className="text-[10px] text-slate-500 hover:text-rose-600 underline cursor-pointer mr-1"
                                >
                                    Batal
                                </button>
                                <select
                                    value={selectedBatchAction}
                                    onChange={(e) => setSelectedBatchAction(e.target.value)}
                                    className="text-xs border border-slate-300 rounded-md py-0.5 px-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium max-w-[160px]"
                                >
                                    {batchOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleExecuteSelected}
                                    disabled={isBatchSaving}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs cursor-pointer"
                                >
                                    {isBatchSaving ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Send className="w-3 h-3" />
                                    )}
                                    Terapkan
                                </button>
                            </div>
                        )}
                    </div>

                    {availableCategories.length > 1 && (
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs thin-scrollbar [scrollbar-width:thin]">
                            <button
                                type="button"
                                onClick={() => setActiveCategoryTab('Semua')}
                                className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 text-[11px] ${
                                    activeCategoryTab === 'Semua'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                Semua ({stats.total})
                            </button>
                            {availableCategories.map((cat) => {
                                const count = dataKaryawan.filter((item) => (item.kategori || '') === cat).length;
                                const isCurrentTab = activeCategoryTab === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveCategoryTab(cat)}
                                        className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 text-[11px] ${
                                            isCurrentTab
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cat} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="overflow-y-auto flex-1 thin-scrollbar [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                    {filteredKaryawan && filteredKaryawan.length > 0 ? (
                        <div className="w-full overflow-x-auto thin-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-2 px-2.5 w-8 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                ref={(el) => {
                                                    if (el) el.indeterminate = isSomeSelected;
                                                }}
                                                onChange={toggleSelectAll}
                                                className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                title="Pilih Semua Pegawai"
                                            />
                                        </th>
                                        <th className="py-2 px-3">Pegawai</th>
                                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Jam Masuk</th>
                                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Kategori</th>
                                        <th className="py-2 px-3 text-right whitespace-nowrap">Tindakan HR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredKaryawan.map((item) => {
                                        const currentAksi = item.aksi || 'Tidak Ada Tindakan';
                                        const isNoAction = currentAksi === 'Tidak Ada Tindakan';
                                        const isChecked = selectedPins.includes(String(item.pin));

                                        const itemOptions = getOpsiTindakanForCategory
                                            ? getOpsiTindakanForCategory(item.kategori || currentCategoryForBatch)
                                            : batchOptions;

                                        const catLower = String(item.kategori || item.keterangan || '').toLowerCase();
                                        const isPositive = catLower.includes('tepat') || catLower.includes('awal');
                                        const isLate = catLower.includes('telat') || catLower.includes('terlambat') || catLower.includes('toleransi') || catLower.includes('sedang') || catLower.includes('berat');
                                        const isPerm = catLower.includes('izin') || catLower.includes('sakit') || catLower.includes('dinas') || catLower.includes('cuti');

                                        return (
                                            <tr
                                                key={`${item.pin}_${item.kategori || ''}`}
                                                className={`transition ${
                                                    isChecked ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                                                }`}
                                            >
                                                <td className="py-2 px-2.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSelectPin(item.pin)}
                                                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>

                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[10px] shrink-0">
                                                            {String(item.nama || 'K')
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 text-xs">
                                                                {item.nama}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                                <span className="font-mono text-slate-400">PIN: {item.pin}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-slate-600">{item.dept || 'Umum'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-2 px-2.5 text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
                                                        <Clock className="w-3 h-3 text-indigo-500" />
                                                        {item.jamMasuk || '-'}
                                                    </span>
                                                </td>

                                                <td className="py-2 px-2.5 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                                            isPositive
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                : isLate
                                                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                                : isPerm
                                                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                                : 'bg-amber-100 text-amber-800 border-amber-300'
                                                        }`}
                                                    >
                                                        {item.kategori || item.keterangan || 'Tepat Waktu'}
                                                    </span>
                                                </td>

                                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                                    <select
                                                        value={currentAksi}
                                                        onChange={(e) => handleSelectChange(item.pin, e.target.value, item.kategori)}
                                                        className={`text-xs border rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer font-medium ${
                                                            isNoAction
                                                                ? 'bg-slate-50 text-slate-700 border-slate-300'
                                                                : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                                                        }`}
                                                    >
                                                        {itemOptions.map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-xs space-y-1">
                            <p className="font-semibold text-slate-600 text-xs">
                                Tidak ada data pegawai ditemukan.
                            </p>
                            <p className="text-slate-400 text-[11px]">
                                {searchQuery
                                    ? 'Coba ganti kata kunci pencarian Anda.'
                                    : `Belum ada pegawai pada kategori "${activeCategoryTab}".`}
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                    <div className="text-[11px] text-slate-500">
                        Total: <strong className="text-slate-800">{stats.total}</strong> Pegawai
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalEksekusiTindakan;
