import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const ModalGolongan = ({ isOpen, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({
        kode: '',
        nama: '',
        gajiPokok: '',
        tarifLembur: '',
        keterangan: '',
        status: 'aktif'
    });

    useEffect(() => {
        if (data) {
            setFormData({
                kode: data.kode || '',
                nama: data.nama || '',
                gajiPokok: data.gajiPokok || '',
                tarifLembur: data.tarifLembur || '',
                keterangan: data.keterangan || '',
                status: data.status || 'aktif'
            });
        } else {
            setFormData({
                kode: '',
                nama: '',
                gajiPokok: '',
                tarifLembur: '',
                keterangan: '',
                status: 'aktif'
            });
        }
    }, [data, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: data?.id,
            gajiPokok: Number(formData.gajiPokok),
            tarifLembur: Number(formData.tarifLembur),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {data ? 'Edit Golongan Gaji' : 'Tambah Golongan Gaji'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Silakan isi detail informasi golongan gaji di bawah ini.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="form-golongan" onSubmit={handleSubmit} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Kode Golongan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="kode"
                                    value={formData.kode}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: GOL-01"
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Nama Golongan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Manager"
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Gaji Pokok (Rp) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="gajiPokok"
                                    value={formData.gajiPokok}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="Contoh: 5000000"
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Tarif Lembur/Jam (Rp) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tarifLembur"
                                    value={formData.tarifLembur}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="Contoh: 50000"
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Keterangan (Opsional)
                            </label>
                            <textarea
                                name="keterangan"
                                value={formData.keterangan}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Tambahkan catatan jika diperlukan..."
                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow resize-none"
                            ></textarea>
                        </div>
                        
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex gap-2.5 mt-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Golongan yang disimpan akan digunakan sebagai template dasar gaji pokok dan tarif lembur karyawan.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm">
                        Batal
                    </button>
                    <button type="submit" form="form-golongan" className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Simpan Data
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ModalGolongan;
