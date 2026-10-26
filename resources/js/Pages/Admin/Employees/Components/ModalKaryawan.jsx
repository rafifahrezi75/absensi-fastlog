import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

const ModalKaryawan = ({ isOpen, onClose, onSave, data, salaryGrades = [], lateCategories = [] }) => {
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        idFinger: '',
        dept: '',
        jabatan: '',
        salary_grade_id: '',
        late_category_id: '',
        is_exempt: false,
    });

    useEffect(() => {
        if (data) {
            setFormData({
                id: data.id || null,
                nama: data.nama || '',
                idFinger: data.idFinger || '',
                dept: data.dept || '',
                jabatan: data.jabatan || '',
                salary_grade_id: data.salary_grade_id || '',
                late_category_id: data.late_category_id || '',
                is_exempt: Boolean(data.is_exempt),
            });
        } else {
            setFormData({
                id: null,
                nama: '',
                idFinger: '',
                dept: '',
                jabatan: '',
                salary_grade_id: '',
                late_category_id: '',
                is_exempt: false,
            });
        }
    }, [data, isOpen, salaryGrades, lateCategories]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama) {
            alert('Nama Lengkap wajib diisi!');
            return;
        }
        if (!formData.dept) {
            alert('Departemen wajib dipilih!');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-sm">{formData.id ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4 text-xs">
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
                                <label className="block font-medium text-slate-700 mb-1">Departemen *</label>
                                <select
                                    name="dept"
                                    value={formData.dept}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="" disabled hidden>-- Pilih Departemen --</option>
                                    <option value="IT & Tech">IT & Tech</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="HRD & GA">HRD & GA</option>
                                    <option value="Finance & Accounting">Finance & Accounting</option>
                                    <option value="Operasional">Operasional</option>
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

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Golongan Gaji & Payroll</label>
                            <select
                                name="salary_grade_id"
                                value={formData.salary_grade_id}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">-- Pilih Golongan Gaji --</option>
                                {salaryGrades.map(sg => (
                                    <option key={sg.id} value={sg.id}>
                                        {sg.kode} - {sg.nama} (Gapok: Rp {Number(sg.gajiPokok || sg.gaji_pokok || 0).toLocaleString('id-ID')})
                                    </option>
                                ))}
                            </select>
                            <span className="text-[10px] text-slate-400">Menentukan gaji pokok dan tarif lembur karyawan</span>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Kategori Aturan Keterlambatan</label>
                            <select
                                name="late_category_id"
                                value={formData.late_category_id}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">Otomatis (Sesuai Departemen / Jabatan)</option>
                                {lateCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nama} ({cat.kode}) - {cat.deskripsi || ''}
                                    </option>
                                ))}
                            </select>
                            <span className="text-[10px] text-slate-400">Pilih spesifik atau biarkan otomatis mendeteksi berdasarkan departemen/jabatan</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="is_exempt"
                                        checked={formData.is_exempt}
                                        onChange={handleChange}
                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                                            <span>Bebas Aturan Keterlambatan & Lembur (Karyawan Khusus)</span>
                                        </div>
                                        <p className="text-[11px] text-amber-800/80 mt-1 leading-relaxed">
                                            Centang untuk mengecualikan karyawan ini. Karyawan ini tidak akan terkena sanksi/potongan denda keterlambatan (Rp 0) dan tidak diperhitungkan dalam pembayaran lembur.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKaryawan;