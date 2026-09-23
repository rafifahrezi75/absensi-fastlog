import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Trash2, Settings2 } from 'lucide-react';
import { KATEGORI_TINDAKAN } from '../data/dashboardMock';

const emptyForm = { nama: '', kategori: KATEGORI_TINDAKAN[0], jumlahKasus: 0, status: 'aktif' };

const kategoriBadgeColor = (kategori) => {
    if (kategori.startsWith('Toleransi')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (kategori.startsWith('Sedang')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (kategori.startsWith('Berat')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
};

const ModalKelolaTindakan = ({ isOpen, onClose, tindakanList, onSave, onDelete }) => {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setForm(emptyForm);
            setEditingId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setForm({ nama: item.nama, kategori: item.kategori, jumlahKasus: item.jumlahKasus, status: item.status });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nama.trim()) return;
        onSave({
            id: editingId,
            nama: form.nama.trim(),
            kategori: form.kategori,
            jumlahKasus: Number(form.jumlahKasus) || 0,
            status: form.status,
        });
        handleCancelEdit();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-base">Kelola Tindakan HR</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 bg-indigo-50/40 border-b border-slate-100 shrink-0 space-y-3">
                    <p className="text-xs font-semibold text-slate-500">
                        {editingId ? 'Edit tindakan yang dipilih' : 'Tambah tindakan baru'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                            type="text" name="nama" value={form.nama} onChange={handleChange} required
                            placeholder="Nama tindakan"
                            className="sm:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <select
                            name="kategori" value={form.kategori} onChange={handleChange}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            {KATEGORI_TINDAKAN.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <input
                            type="number" name="jumlahKasus" value={form.jumlahKasus} onChange={handleChange} min="0"
                            placeholder="Jml kasus"
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <select
                            name="status" value={form.status} onChange={handleChange}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                        <div className="flex gap-2">
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition">
                                    Batal
                                </button>
                            )}
                            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition">
                                {editingId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                {editingId ? 'Simpan Perubahan' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                    {tindakanList.length > 0 ? tindakanList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.nama}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${kategoriBadgeColor(item.kategori)}`}>
                                        {item.kategori}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{item.jumlahKasus} kasus</span>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { if (window.confirm(`Hapus tindakan "${item.nama}"?`)) onDelete(item.id); }}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-xs text-slate-400 py-8">Belum ada tindakan terdaftar.</p>
                    )}
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalKelolaTindakan;