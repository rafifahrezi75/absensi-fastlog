import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, RotateCcw, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';
import api from '../../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../../lib/swal';

const formatNumberInput = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = String(val).replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(clean) || 0;
};

const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
};

export default function PanelAturGaji({ isOpen, employeeId, onClose, onSaved }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [employee, setEmployee] = useState(null);

    // Form states
    const [isGapokCustom, setIsGapokCustom] = useState(false);
    const [gapokInput, setGapokInput] = useState('');

    // Overrides: key by component id -> { mode: 'standar'|'kustom'|'tidak_berlaku', metode: 'nominal'|'persen', nilai: number }
    const [overrides, setOverrides] = useState({});

    // Custom items for this employee
    const [customTambahan, setCustomTambahan] = useState([]);
    const [customPotongan, setCustomPotongan] = useState([]);

    // Master components lists for rendering
    const [masterTambahan, setMasterTambahan] = useState([]);
    const [masterPotongan, setMasterPotongan] = useState([]);

    // Errors
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen || !employeeId) return;

        const fetchData = async () => {
            setLoading(true);
            setErrors({});
            try {
                const res = await api.get(`/api/admin/master-payroll/employee-salaries/${employeeId}`);
                const data = res.data;
                setEmployee(data.employee);

                setIsGapokCustom(data.employee.is_gaji_pokok_custom);
                setGapokInput(
                    data.employee.gaji_pokok_kustom !== null
                        ? formatNumberInput(data.employee.gaji_pokok_kustom)
                        : formatNumberInput(data.employee.standard_gapok)
                );

                setMasterTambahan(data.masterTambahan || []);
                setMasterPotongan(data.masterPotongan || []);

                const ovMap = {};
                [...(data.masterTambahan || []), ...(data.masterPotongan || [])].forEach((comp) => {
                    ovMap[comp.id] = {
                        mode: comp.mode || 'standar',
                        metode: comp.metode || comp.master_metode,
                        nilai: comp.nilai !== undefined ? comp.nilai : comp.master_nilai,
                    };
                });
                setOverrides(ovMap);

                setCustomTambahan(
                    (data.customTambahan || []).map((c) => ({
                        id: c.id,
                        nama: c.nama,
                        tipe: 'tambahan',
                        metode: c.metode,
                        nilai: c.nilai,
                    }))
                );

                setCustomPotongan(
                    (data.customPotongan || []).map((c) => ({
                        id: c.id,
                        nama: c.nama,
                        tipe: 'potongan',
                        metode: c.metode,
                        nilai: c.nilai,
                    }))
                );
            } catch (err) {
                console.error(err);
                showError('Gagal memuat pengaturan gaji karyawan.');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, employeeId]);

    // Live calculation of summary numbers
    const calculation = useMemo(() => {
        if (!employee) {
            return { gapok: 0, totalTambahan: 0, totalPotongan: 0, thp: 0 };
        }

        const effectiveGapok = isGapokCustom ? parseNumberInput(gapokInput) : (employee.standard_gapok || 0);

        let totalTambahan = 0;
        masterTambahan.forEach((comp) => {
            const ov = overrides[comp.id] || { mode: 'standar', metode: comp.master_metode, nilai: comp.master_nilai };
            if (ov.mode === 'tidak_berlaku') return;

            const metode = ov.mode === 'kustom' ? ov.metode : comp.master_metode;
            const nilai = ov.mode === 'kustom' ? (parseFloat(ov.nilai) || 0) : comp.master_nilai;

            if (metode === 'persen') {
                totalTambahan += Math.round(effectiveGapok * (nilai / 100));
            } else {
                totalTambahan += nilai;
            }
        });

        customTambahan.forEach((c) => {
            const val = parseFloat(c.nilai) || 0;
            if (c.metode === 'persen') {
                totalTambahan += Math.round(effectiveGapok * (val / 100));
            } else {
                totalTambahan += val;
            }
        });

        let totalPotongan = 0;
        masterPotongan.forEach((comp) => {
            const ov = overrides[comp.id] || { mode: 'standar', metode: comp.master_metode, nilai: comp.master_nilai };
            if (ov.mode === 'tidak_berlaku') return;

            const metode = ov.mode === 'kustom' ? ov.metode : comp.master_metode;
            const nilai = ov.mode === 'kustom' ? (parseFloat(ov.nilai) || 0) : comp.master_nilai;

            if (metode === 'persen') {
                totalPotongan += Math.round(effectiveGapok * (nilai / 100));
            } else {
                totalPotongan += nilai;
            }
        });

        customPotongan.forEach((c) => {
            const val = parseFloat(c.nilai) || 0;
            if (c.metode === 'persen') {
                totalPotongan += Math.round(effectiveGapok * (val / 100));
            } else {
                totalPotongan += val;
            }
        });

        const thp = Math.max(0, effectiveGapok + totalTambahan - totalPotongan);

        return {
            gapok: effectiveGapok,
            totalTambahan,
            totalPotongan,
            thp,
        };
    }, [employee, isGapokCustom, gapokInput, masterTambahan, masterPotongan, overrides, customTambahan, customPotongan]);

    const handleOverrideModeChange = (compId, mode) => {
        setOverrides((prev) => ({
            ...prev,
            [compId]: {
                ...(prev[compId] || {}),
                mode,
            },
        }));
    };

    const handleOverrideValueChange = (compId, val) => {
        setOverrides((prev) => ({
            ...prev,
            [compId]: {
                ...(prev[compId] || {}),
                nilai: val,
            },
        }));
    };

    const handleOverrideMetodeChange = (compId, metode) => {
        setOverrides((prev) => ({
            ...prev,
            [compId]: {
                ...(prev[compId] || {}),
                metode,
            },
        }));
    };

    const addCustomTambahan = () => {
        setCustomTambahan((prev) => [
            ...prev,
            { tempId: Date.now(), nama: '', tipe: 'tambahan', metode: 'nominal', nilai: 0 },
        ]);
    };

    const removeCustomTambahan = (index) => {
        setCustomTambahan((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCustomTambahan = (index, field, value) => {
        setCustomTambahan((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addCustomPotongan = () => {
        setCustomPotongan((prev) => [
            ...prev,
            { tempId: Date.now(), nama: '', tipe: 'potongan', metode: 'nominal', nilai: 0 },
        ]);
    };

    const removeCustomPotongan = (index) => {
        setCustomPotongan((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCustomPotongan = (index, field, value) => {
        setCustomPotongan((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const validateForm = () => {
        const errs = {};

        if (isGapokCustom) {
            const val = parseNumberInput(gapokInput);
            if (val < 0) {
                errs.gapok = 'Gaji pokok tidak boleh minus.';
            }
        }

        Object.entries(overrides).forEach(([compId, ov]) => {
            if (ov.mode === 'kustom') {
                const val = parseFloat(ov.nilai);
                if (isNaN(val) || val < 0) {
                    errs[`override_${compId}`] = 'Nilai tidak boleh negatif.';
                } else if (ov.metode === 'persen' && val > 100) {
                    errs[`override_${compId}`] = 'Persentase tidak boleh lebih dari 100%.';
                }
            }
        });

        customTambahan.forEach((c, idx) => {
            if (!c.nama || !c.nama.trim()) {
                errs[`custom_tambahan_${idx}_nama`] = 'Nama komponen tambahan khusus tidak boleh kosong.';
            }
            const val = parseFloat(c.nilai);
            if (isNaN(val) || val < 0) {
                errs[`custom_tambahan_${idx}_nilai`] = 'Nilai tidak boleh negatif.';
            } else if (c.metode === 'persen' && val > 100) {
                errs[`custom_tambahan_${idx}_nilai`] = 'Persentase tidak boleh lebih dari 100%.';
            }
        });

        customPotongan.forEach((c, idx) => {
            if (!c.nama || !c.nama.trim()) {
                errs[`custom_potongan_${idx}_nama`] = 'Nama komponen potongan khusus tidak boleh kosong.';
            }
            const val = parseFloat(c.nilai);
            if (isNaN(val) || val < 0) {
                errs[`custom_potongan_${idx}_nilai`] = 'Nilai tidak boleh negatif.';
            } else if (c.metode === 'persen' && val > 100) {
                errs[`custom_potongan_${idx}_nilai`] = 'Persentase tidak boleh lebih dari 100%.';
            }
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const overridesList = Object.entries(overrides).map(([compId, ov]) => ({
                salary_component_id: parseInt(compId, 10),
                mode: ov.mode,
                metode: ov.metode,
                nilai: ov.nilai,
            }));

            const customList = [
                ...customTambahan.map((c) => ({
                    nama: c.nama,
                    tipe: 'tambahan',
                    metode: c.metode,
                    nilai: c.nilai,
                })),
                ...customPotongan.map((c) => ({
                    nama: c.nama,
                    tipe: 'potongan',
                    metode: c.metode,
                    nilai: c.nilai,
                })),
            ];

            const payload = {
                is_gaji_pokok_custom: isGapokCustom,
                gaji_pokok_kustom: isGapokCustom ? parseNumberInput(gapokInput) : null,
                overrides: overridesList,
                custom_components: customList,
            };

            const res = await api.post(`/api/admin/master-payroll/employee-salaries/${employee.id}`, payload);
            showSuccess(res.data?.message || 'Pengaturan gaji karyawan berhasil disimpan.');
            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error('Save error', err);
            const msg = err.response?.data?.message || 'Gagal menyimpan pengaturan gaji.';
            showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleResetAllToStandard = async () => {
        const confirmed = await showConfirm({
            title: 'Kembalikan Semua ke Standar?',
            text: `Semua penyesuaian gaji untuk ${employee.nama} akan dihapus dan kembali mengikuti master golongan ${employee.golongan}.`,
            confirmText: 'Ya, Kembalikan',
            confirmColor: '#f97316',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            const res = await api.post(`/api/admin/master-payroll/employee-salaries/${employee.id}/reset`);
            showSuccess(res.data?.message || 'Pengaturan gaji berhasil dikembalikan ke standar.');
            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error('Reset error', err);
            showError(err.response?.data?.message || 'Gagal mengembalikan gaji ke standar.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
                onClick={onClose} 
            />

            {/* Centered Modal Card */}
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 z-10">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold">Atur Gaji Karyawan</h2>
                                {employee?.tipe_staf && (
                                    <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                                        {employee.tipe_staf}
                                    </span>
                                )}
                                {employee?.golongan && (
                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-200 border border-indigo-800">
                                        {employee.golongan}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 font-medium">
                                {employee ? `${employee.nama} • ${employee.jabatan || 'Staff'} (${employee.dept || 'Umum'})` : 'Memuat data...'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px]">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                                <p className="text-xs text-slate-500 font-medium">Memuat pengaturan gaji...</p>
                            </div>
                        ) : employee ? (
                            <>
                                {/* SECTION: GAJI POKOK */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Gaji Pokok</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Standar Golongan: <span className="font-mono font-semibold text-slate-700">{formatIDR(employee.standard_gapok)}</span>
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isGapokCustom}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setIsGapokCustom(checked);
                                                    if (!checked) {
                                                        setGapokInput(formatNumberInput(employee.standard_gapok));
                                                    }
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            <span className="ml-2.5 text-xs font-semibold text-slate-700">
                                                Atur gaji pokok sendiri
                                            </span>
                                        </label>
                                    </div>

                                    {isGapokCustom && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Nominal Gaji Pokok Khusus (Rp)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                                <input
                                                    type="text"
                                                    value={gapokInput}
                                                    onChange={(e) => setGapokInput(formatNumberInput(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                            {errors.gapok && (
                                                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.gapok}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION: TAMBAHAN */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Komponen Tambahan (Tunjangan)</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Atur tunjangan yang berlaku untuk karyawan ini.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addCustomTambahan}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ Tambah tambahan khusus</span>
                                        </button>
                                    </div>

                                    {/* Master Tambahan List */}
                                    <div className="divide-y divide-slate-100">
                                        {masterTambahan.map((comp) => {
                                            const ov = overrides[comp.id] || { mode: 'standar', metode: comp.master_metode, nilai: comp.master_nilai };
                                            return (
                                                <div key={comp.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-800">{comp.nama}</div>
                                                            <div className="text-[11px] text-slate-400">
                                                                Standar Master: {comp.master_metode === 'persen' ? `${comp.master_nilai}%` : formatIDR(comp.master_nilai)}
                                                            </div>
                                                        </div>

                                                        {/* 3 State Radio */}
                                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'standar')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'standar' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Ikut standar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'kustom')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'kustom' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Nilai sendiri
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'tidak_berlaku')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'tidak_berlaku' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Tidak berlaku
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {ov.mode === 'kustom' && (
                                                        <div className="flex items-center gap-2 pt-1 pl-2 border-l-2 border-indigo-400">
                                                            <select
                                                                value={ov.metode || 'nominal'}
                                                                onChange={(e) => handleOverrideMetodeChange(comp.id, e.target.value)}
                                                                className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-medium"
                                                            >
                                                                <option value="nominal">Nominal (Rp)</option>
                                                                <option value="persen">Persen (%)</option>
                                                            </select>
                                                            <input
                                                                type="number"
                                                                value={ov.nilai ?? ''}
                                                                onChange={(e) => handleOverrideValueChange(comp.id, e.target.value)}
                                                                placeholder="0"
                                                                className="text-xs font-mono bg-white border border-slate-300 rounded px-2.5 py-1.5 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    )}
                                                    {errors[`override_${comp.id}`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`override_${comp.id}`]}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pure Custom Tambahan */}
                                    {customTambahan.length > 0 && (
                                        <div className="pt-3 border-t border-slate-200 space-y-3">
                                            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                                Tambahan Khusus Karyawan Ini
                                            </h4>
                                            {customTambahan.map((c, idx) => (
                                                <div key={idx} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={c.nama}
                                                            onChange={(e) => updateCustomTambahan(idx, 'nama', e.target.value)}
                                                            placeholder="Nama komponen khusus (misal: Tunjangan Proyek A)"
                                                            className="flex-1 text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <select
                                                            value={c.metode}
                                                            onChange={(e) => updateCustomTambahan(idx, 'metode', e.target.value)}
                                                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-medium"
                                                        >
                                                            <option value="nominal">Rp</option>
                                                            <option value="persen">%</option>
                                                        </select>
                                                        <input
                                                            type="number"
                                                            value={c.nilai ?? ''}
                                                            onChange={(e) => updateCustomTambahan(idx, 'nilai', e.target.value)}
                                                            placeholder="Nilai"
                                                            className="w-28 text-xs font-mono bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCustomTambahan(idx)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {errors[`custom_tambahan_${idx}_nama`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`custom_tambahan_${idx}_nama`]}</p>
                                                    )}
                                                    {errors[`custom_tambahan_${idx}_nilai`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`custom_tambahan_${idx}_nilai`]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION: POTONGAN */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Komponen Potongan Tetap (BPJS, dsb.)</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Denda telat dan alpa tidak diatur di sini (tetap global).</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addCustomPotongan}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ Tambah potongan khusus</span>
                                        </button>
                                    </div>

                                    {/* Master Potongan List */}
                                    <div className="divide-y divide-slate-100">
                                        {masterPotongan.map((comp) => {
                                            const ov = overrides[comp.id] || { mode: 'standar', metode: comp.master_metode, nilai: comp.master_nilai };
                                            return (
                                                <div key={comp.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-800">{comp.nama}</div>
                                                            <div className="text-[11px] text-slate-400">
                                                                Standar Master: {comp.master_metode === 'persen' ? `${comp.master_nilai}%` : formatIDR(comp.master_nilai)}
                                                            </div>
                                                        </div>

                                                        {/* 3 State Radio */}
                                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'standar')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'standar' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Ikut standar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'kustom')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'kustom' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Nilai sendiri
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOverrideModeChange(comp.id, 'tidak_berlaku')}
                                                                className={`px-2.5 py-1 rounded-md transition ${ov.mode === 'tidak_berlaku' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Tidak berlaku
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {ov.mode === 'kustom' && (
                                                        <div className="flex items-center gap-2 pt-1 pl-2 border-l-2 border-rose-400">
                                                            <select
                                                                value={ov.metode || 'nominal'}
                                                                onChange={(e) => handleOverrideMetodeChange(comp.id, e.target.value)}
                                                                className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-medium"
                                                            >
                                                                <option value="nominal">Nominal (Rp)</option>
                                                                <option value="persen">Persen (%)</option>
                                                            </select>
                                                            <input
                                                                type="number"
                                                                value={ov.nilai ?? ''}
                                                                onChange={(e) => handleOverrideValueChange(comp.id, e.target.value)}
                                                                placeholder="0"
                                                                className="text-xs font-mono bg-white border border-slate-300 rounded px-2.5 py-1.5 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    )}
                                                    {errors[`override_${comp.id}`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`override_${comp.id}`]}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pure Custom Potongan */}
                                    {customPotongan.length > 0 && (
                                        <div className="pt-3 border-t border-slate-200 space-y-3">
                                            <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                                                Potongan Khusus Karyawan Ini
                                            </h4>
                                            {customPotongan.map((c, idx) => (
                                                <div key={idx} className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={c.nama}
                                                            onChange={(e) => updateCustomPotongan(idx, 'nama', e.target.value)}
                                                            placeholder="Nama potongan khusus (misal: Pinjaman Koperasi)"
                                                            className="flex-1 text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <select
                                                            value={c.metode}
                                                            onChange={(e) => updateCustomPotongan(idx, 'metode', e.target.value)}
                                                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-medium"
                                                        >
                                                            <option value="nominal">Rp</option>
                                                            <option value="persen">%</option>
                                                        </select>
                                                        <input
                                                            type="number"
                                                            value={c.nilai ?? ''}
                                                            onChange={(e) => updateCustomPotongan(idx, 'nilai', e.target.value)}
                                                            placeholder="Nilai"
                                                            className="w-28 text-xs font-mono bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCustomPotongan(idx)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {errors[`custom_potongan_${idx}_nama`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`custom_potongan_${idx}_nama`]}</p>
                                                    )}
                                                    {errors[`custom_potongan_${idx}_nilai`] && (
                                                        <p className="text-xs text-rose-600 font-medium">{errors[`custom_potongan_${idx}_nilai`]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* STICKY LIVE CALCULATION FOOTER */}
                    <div className="p-5 bg-white border-t border-slate-200 shadow-lg space-y-4">
                        {/* Live Calc summary table */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Gaji Pokok:</span>
                                    <span className="font-mono font-bold text-slate-900">{formatIDR(calculation.gapok)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Total Tambahan:</span>
                                    <span className="font-mono font-bold text-emerald-600">+{formatIDR(calculation.totalTambahan)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Potongan Tetap:</span>
                                    <span className="font-mono font-bold text-rose-600">-{formatIDR(calculation.totalPotongan)}</span>
                                </div>
                                <div className="border-l pl-2 border-slate-200">
                                    <span className="text-slate-500 block text-[11px]">Perkiraan Bersih (THP):</span>
                                    <span className="font-mono font-extrabold text-indigo-700">{formatIDR(calculation.thp)}</span>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                                * Belum termasuk denda telat dan lembur bulan berjalan.
                            </div>
                        </div>

                        {/* Warning Info */}
                        <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Perubahan berlaku untuk bulan yang belum dibayar. Slip yang sudah dibayar tidak berubah.</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleResetAllToStandard}
                                disabled={saving}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg transition cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Kembalikan semua ke standar</span>
                            </button>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={saving}
                                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>Simpan Pengaturan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
