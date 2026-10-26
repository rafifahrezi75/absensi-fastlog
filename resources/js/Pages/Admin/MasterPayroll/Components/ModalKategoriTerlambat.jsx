import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

const DEPARTMENTS_OPTIONS = [
    'Finance & Accounting',
    'Operasional',
    'IT & Tech',
    'Marketing',
    'HRD & GA'
];

const DEFAULT_TIERS = [
    { tier_order: 1, nama_tier: '1 – 30 Menit', min_menit: 1, max_menit: 30, ada_toleransi: true, nominal_denda: 10000, deskripsi: 'Toleransi 3x sebulan. Ke-4 dst: Rp 10.000 / kejadian' },
    { tier_order: 2, nama_tier: '31 – 60 Menit', min_menit: 31, max_menit: 60, ada_toleransi: false, nominal_denda: 15000, deskripsi: 'Potongan Rp 15.000 / kejadian' },
    { tier_order: 3, nama_tier: '61 – 90 Menit', min_menit: 61, max_menit: 90, ada_toleransi: false, nominal_denda: 20000, deskripsi: 'Potongan Rp 20.000 / kejadian' },
    { tier_order: 4, nama_tier: '> 90 Menit', min_menit: 91, max_menit: '', ada_toleransi: false, nominal_denda: 30000, deskripsi: 'Potongan Rp 30.000 / kejadian' }
];

const ModalKategoriTerlambat = ({ isOpen, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({
        id: null,
        kode: '',
        nama: '',
        deskripsi: '',
        toleransi_bulanan: 3,
        departemen_list: [],
        jabatan_keywords_str: '',
        is_default: false,
        tiers: DEFAULT_TIERS
    });

    useEffect(() => {
        if (data) {
            setFormData({
                id: data.id || null,
                kode: data.kode || '',
                nama: data.nama || '',
                deskripsi: data.deskripsi || '',
                toleransi_bulanan: data.toleransi_bulanan ?? 3,
                departemen_list: Array.isArray(data.departemen_list) ? data.departemen_list : [],
                jabatan_keywords_str: Array.isArray(data.jabatan_keywords) ? data.jabatan_keywords.join(', ') : '',
                is_default: Boolean(data.is_default),
                tiers: data.tiers && data.tiers.length > 0 ? data.tiers.map(t => ({
                    id: t.id,
                    tier_order: t.tier_order,
                    nama_tier: t.nama_tier || '',
                    min_menit: t.min_menit,
                    max_menit: t.max_menit !== null ? t.max_menit : '',
                    ada_toleransi: Boolean(t.ada_toleransi),
                    nominal_denda: Number(t.nominal_denda) || 0,
                    deskripsi: t.deskripsi || ''
                })) : DEFAULT_TIERS
            });
        } else {
            setFormData({
                id: null,
                kode: '',
                nama: '',
                deskripsi: '',
                toleransi_bulanan: 3,
                departemen_list: [],
                jabatan_keywords_str: '',
                is_default: false,
                tiers: DEFAULT_TIERS
            });
        }
    }, [data, isOpen]);

    if (!isOpen) return null;

    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDeptToggle = (dept) => {
        setFormData(prev => {
            const list = [...prev.departemen_list];
            const idx = list.indexOf(dept);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(dept);
            }
            return { ...prev, departemen_list: list };
        });
    };

    const handleTierChange = (index, field, value) => {
        setFormData(prev => {
            const newTiers = [...prev.tiers];
            newTiers[index] = {
                ...newTiers[index],
                [field]: value
            };
            return { ...prev, tiers: newTiers };
        });
    };

    const handleAddTier = () => {
        setFormData(prev => {
            const last = prev.tiers[prev.tiers.length - 1];
            const nextMin = last && last.max_menit !== '' ? Number(last.max_menit) + 1 : 121;
            const nextTierOrder = prev.tiers.length + 1;
            return {
                ...prev,
                tiers: [
                    ...prev.tiers,
                    {
                        tier_order: nextTierOrder,
                        nama_tier: `> ${nextMin - 1} Menit`,
                        min_menit: nextMin,
                        max_menit: '',
                        ada_toleransi: false,
                        nominal_denda: 30000,
                        deskripsi: `Potongan Rp 30.000 / kejadian`
                    }
                ]
            };
        });
    };

    const handleRemoveTier = (index) => {
        if (formData.tiers.length <= 1) {
            alert('Minimal harus ada 1 tier!');
            return;
        }
        setFormData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_, i) => i !== index).map((t, i) => ({ ...t, tier_order: i + 1 }))
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama || !formData.kode) {
            alert('Kode dan Nama Kategori wajib diisi!');
            return;
        }

        const keywords = formData.jabatan_keywords_str
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);

        const payload = {
            id: formData.id,
            kode: formData.kode.toUpperCase().trim(),
            nama: formData.nama.trim(),
            deskripsi: formData.deskripsi.trim(),
            toleransi_bulanan: Number(formData.toleransi_bulanan) || 0,
            departemen_list: formData.departemen_list,
            jabatan_keywords: keywords,
            is_default: formData.is_default,
            tiers: formData.tiers.map((t, idx) => ({
                tier_order: idx + 1,
                nama_tier: t.nama_tier || `Tier ${idx + 1}`,
                min_menit: Number(t.min_menit) || 0,
                max_menit: t.max_menit === '' || t.max_menit === null ? null : Number(t.max_menit),
                ada_toleransi: Boolean(t.ada_toleransi),
                nominal_denda: Number(t.nominal_denda) || 0,
                deskripsi: t.deskripsi || ''
            }))
        };

        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <div>
                            <h3 className="font-bold text-sm">
                                {formData.id ? 'Edit Kategori Keterlambatan' : 'Tambah Kategori Keterlambatan'}
                            </h3>
                            <p className="text-[11px] text-slate-300">
                                Konfigurasi durasi keterlambatan, kuota toleransi, dan besaran denda
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Kode Kategori *</label>
                                <input
                                    type="text"
                                    name="kode"
                                    value={formData.kode}
                                    onChange={handleFieldChange}
                                    placeholder="Contoh: KANTOR, LAPANGAN"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Nama Kategori *</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleFieldChange}
                                    placeholder="Contoh: Staf Kantor, Staf Lapangan"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                                <input
                                    type="text"
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleFieldChange}
                                    placeholder="Contoh: CS, Dokumen, Finance, Accounting, Pricing"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Kuota Toleransi Bulanan (Kejadian)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        name="toleransi_bulanan"
                                        value={formData.toleransi_bulanan}
                                        onChange={handleFieldChange}
                                        min="0"
                                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                    <span className="text-slate-500 text-xs shrink-0">Kali / Bulan</span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Jumlah toleransi Tier 1 sebelum mulai dipotong denda.
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Departemen Otomatis Terkait</label>
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                {DEPARTMENTS_OPTIONS.map(dept => {
                                    const checked = formData.departemen_list.includes(dept);
                                    return (
                                        <button
                                            type="button"
                                            key={dept}
                                            onClick={() => handleDeptToggle(dept)}
                                            className={`px-2.5 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                                                checked
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                            }`}
                                        >
                                            {dept} {checked && '✓'}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Karyawan dalam departemen ini otomatis menggunakan aturan keterlambatan ini.
                            </span>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kata Kunci Jabatan (Pisahkan dengan koma)</label>
                            <input
                                type="text"
                                name="jabatan_keywords_str"
                                value={formData.jabatan_keywords_str}
                                onChange={handleFieldChange}
                                placeholder="Contoh: cs, dokumen, finance, accounting, pricing, doc, admin"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Digunakan untuk mendeteksi staf berdasarkan nama jabatan jika departemen tidak cocok.
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-slate-800 block text-xs">Jadikan Kategori Default</span>
                                <span className="text-[11px] text-slate-500 block">
                                    Gunakan aturan ini sebagai fallback jika departemen/jabatan karyawan belum ditentukan.
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleFieldChange}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                        Tingkat Keterlambatan & Sanksi (Tiers)
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Toleransi hanya aktif untuk tier yang dicentang toleransinya.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddTier}
                                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded border border-indigo-200 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Tambah Tier
                                </button>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-2.5 w-12 text-center">Tier</th>
                                            <th className="p-2.5">Nama / Label</th>
                                            <th className="p-2.5 w-24">Min (m)</th>
                                            <th className="p-2.5 w-24">Maks (m)</th>
                                            <th className="p-2.5 w-24 text-center">Toleransi?</th>
                                            <th className="p-2.5 w-32">Denda (Rp)</th>
                                            <th className="p-2.5 w-10 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.tiers.map((tier, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-2 text-center font-bold text-slate-600">
                                                    {index + 1}
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={tier.nama_tier}
                                                        onChange={(e) => handleTierChange(index, 'nama_tier', e.target.value)}
                                                        placeholder="Label Tier"
                                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={tier.min_menit}
                                                        onChange={(e) => handleTierChange(index, 'min_menit', e.target.value)}
                                                        min="0"
                                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={tier.max_menit}
                                                        onChange={(e) => handleTierChange(index, 'max_menit', e.target.value)}
                                                        placeholder="Tak hingga"
                                                        min="0"
                                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={tier.ada_toleransi}
                                                        onChange={(e) => handleTierChange(index, 'ada_toleransi', e.target.checked)}
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={tier.nominal_denda}
                                                        onChange={(e) => handleTierChange(index, 'nominal_denda', e.target.value)}
                                                        step="1000"
                                                        min="0"
                                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTier(index)}
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                                                        title="Hapus Tier"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKategoriTerlambat;
