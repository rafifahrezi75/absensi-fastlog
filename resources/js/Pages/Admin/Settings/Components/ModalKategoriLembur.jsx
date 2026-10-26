import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, AlertCircle, Briefcase, Lock } from 'lucide-react';

const DEPARTMENTS_OPTIONS = [
    'Finance & Accounting',
    'Operasional',
    'IT & Tech',
    'Marketing',
    'HRD & GA'
];

const ModalKategoriLembur = ({ isOpen, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({
        id: null,
        kode: '',
        nama: '',
        deskripsi: '',
        departemen_list: [],
        jabatan_keywords_str: '',
        daily_start: '17:00',
        daily_rate: 50000,
        weekend_start: '13:00',
        weekend_rate: 75000,
        holiday_rate: 300000,
        is_default: false,
        is_locked: false,
    });

    useEffect(() => {
        if (data) {
            setFormData({
                id: data.id || null,
                kode: data.kode || '',
                nama: data.nama || '',
                deskripsi: data.deskripsi || '',
                departemen_list: Array.isArray(data.departemen_list) ? data.departemen_list : [],
                jabatan_keywords_str: Array.isArray(data.jabatan_keywords) ? data.jabatan_keywords.join(', ') : '',
                daily_start: data.daily_start || '17:00',
                daily_rate: Number(data.daily_rate) || 50000,
                weekend_start: data.weekend_start || '13:00',
                weekend_rate: Number(data.weekend_rate) || 75000,
                holiday_rate: Number(data.holiday_rate) || 300000,
                is_default: Boolean(data.is_default),
                is_locked: Boolean(data.is_locked),
            });
        } else {
            setFormData({
                id: null,
                kode: '',
                nama: '',
                deskripsi: '',
                departemen_list: [],
                jabatan_keywords_str: '',
                daily_start: '17:00',
                daily_rate: 50000,
                weekend_start: '13:00',
                weekend_rate: 75000,
                holiday_rate: 300000,
                is_default: false,
                is_locked: false,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama || !formData.kode) {
            alert('Kode dan Nama Kategori Lembur wajib diisi.');
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
            departemen_list: formData.departemen_list,
            jabatan_keywords: keywords,
            daily_start: formData.daily_start,
            daily_rate: Number(formData.daily_rate) || 0,
            weekend_start: formData.weekend_start,
            weekend_rate: Number(formData.weekend_rate) || 0,
            holiday_rate: Number(formData.holiday_rate) || 0,
            is_default: formData.is_default,
            is_locked: formData.is_locked,
        };

        onSave(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {formData.id ? 'Edit Kategori Lembur' : 'Tambah Kategori Lembur Baru'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Kelola tarif lembur flat harian, jam minimal lembur, dan lingkup jabatan/departemen.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kode Kategori *</label>
                            <input
                                type="text"
                                name="kode"
                                value={formData.kode}
                                onChange={handleFieldChange}
                                placeholder="Contoh: KANTOR, LAPANGAN, DRIVER"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                                placeholder="Contoh: Staf Kantor, Staf Lapangan (Operasional)"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                        <input
                            type="text"
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleFieldChange}
                            placeholder="Contoh: CS/Dokumen/Finance/Accounting/Procurement"
                            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                            Cakupan Departemen (Opsional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DEPARTMENTS_OPTIONS.map((dept) => {
                                const selected = formData.departemen_list.includes(dept);
                                return (
                                    <button
                                        type="button"
                                        key={dept}
                                        onClick={() => handleDeptToggle(dept)}
                                        className={`px-2.5 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                                            selected
                                                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                                        }`}
                                    >
                                        {dept}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Kata Kunci Jabatan (Pisahkan dengan koma)
                        </label>
                        <input
                            type="text"
                            name="jabatan_keywords_str"
                            value={formData.jabatan_keywords_str}
                            onChange={handleFieldChange}
                            placeholder="Contoh: cs, dokumen, finance, accounting, pricing, procurement, operasional, driver"
                            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>

                    <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                        <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Skema Waktu Minimal & Tarif Flat Lembur
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-xs space-y-2">
                                <p className="font-bold text-slate-900 text-xs">Lembur Standby Daily</p>
                                <p className="text-[10px] text-slate-500">Hari Kerja (Senin – Jumat)</p>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Mulai Jam</label>
                                    <input
                                        type="time"
                                        name="daily_start"
                                        value={formData.daily_start}
                                        onChange={handleFieldChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Tarif (Rp / Hari)</label>
                                    <input
                                        type="number"
                                        name="daily_rate"
                                        value={formData.daily_rate}
                                        onChange={handleFieldChange}
                                        step="1000"
                                        min="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-xs space-y-2">
                                <p className="font-bold text-slate-900 text-xs">Standby Weekends</p>
                                <p className="text-[10px] text-slate-500">Akhir Pekan (Sabtu / Minggu)</p>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Mulai Jam (Sabtu)</label>
                                    <input
                                        type="time"
                                        name="weekend_start"
                                        value={formData.weekend_start}
                                        onChange={handleFieldChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Tarif (Rp / Hari)</label>
                                    <input
                                        type="number"
                                        name="weekend_rate"
                                        value={formData.weekend_rate}
                                        onChange={handleFieldChange}
                                        step="1000"
                                        min="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-xs space-y-2">
                                <p className="font-bold text-slate-900 text-xs">Lembur Hari Besar</p>
                                <p className="text-[10px] text-slate-500">Tanggal Merah / Libur Nasional</p>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Mulai Jam</label>
                                    <input
                                        type="text"
                                        value="00:00 (Flat Seharian)"
                                        disabled
                                        className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-600 font-medium mb-1">Tarif (Rp / Hari)</label>
                                    <input
                                        type="number"
                                        name="holiday_rate"
                                        value={formData.holiday_rate}
                                        onChange={handleFieldChange}
                                        step="1000"
                                        min="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-slate-800 block text-xs">Jadikan Kategori Default</span>
                            <span className="text-[11px] text-slate-500 block">
                                Digunakan sebagai aturan fallback jika departemen/jabatan karyawan belum terdaftar.
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleFieldChange}
                            className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-amber-900 block text-xs flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Kunci Kategori (Cegah Hapus)
                            </span>
                            <span className="text-[11px] text-amber-700 block">
                                Jika dicentang, tombol hapus akan disembunyikan. Untuk menghapusnya nanti, buka menu edit dan hilangkan centang ini.
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            name="is_locked"
                            checked={formData.is_locked}
                            onChange={handleFieldChange}
                            className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                        >
                            Simpan Kategori Lembur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKategoriLembur;
