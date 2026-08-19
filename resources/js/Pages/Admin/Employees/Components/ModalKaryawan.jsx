import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ModalKaryawan = ({ isOpen, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        nik: '',
        idFinger: '',
        dept: 'IT & Tech',
        jabatan: ''
    });

    useEffect(() => {
        if (data) {
            setFormData({
                id: data.id || null,
                nama: data.nama || '',
                nik: data.nik || '',
                idFinger: data.idFinger || '',
                dept: data.dept || 'IT & Tech',
                jabatan: data.jabatan || ''
            });
        } else {
            setFormData({
                id: null,
                nama: '',
                nik: '',
                idFinger: '',
                dept: 'IT & Tech',
                jabatan: ''
            });
        }
    }, [data, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama || !formData.nik) {
            alert('Nama Lengkap dan NIK wajib diisi!');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">{formData.id ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">NIK Karyawan *</label>
                                <input
                                    type="text"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    placeholder="Contoh: 20260101"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">ID Mesin Fingerprint</label>
                            <input
                                type="text"
                                name="idFinger"
                                value={formData.idFinger}
                                onChange={handleChange}
                                placeholder="Contoh: 101"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">Harus sesuai dengan ID di Mesin</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Departemen</label>
                                <select
                                    name="dept"
                                    value={formData.dept}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="IT & Tech">IT & Tech</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="HRD & GA">HRD & GA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Jabatan</label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleChange}
                                    placeholder="Contoh: Software Engineer"
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKaryawan;