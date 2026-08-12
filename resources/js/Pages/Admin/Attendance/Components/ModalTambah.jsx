import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

const ModalTambahManual = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        karyawanId: '',
        tanggal: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        jamMasuk: '',
        jamKeluar: '',
        alasan: ''
    });

    // Jika modal tidak terbuka, jangan tampilkan apapun
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simpan logika ke API / Backend di sini
        console.log('Data Absensi Baru:', formData);
        
        alert('Data absensi berhasil ditambahkan!');
        
        // Reset Form & Tutup Modal
        setFormData({
            karyawanId: '',
            tanggal: new Date().toISOString().split('T')[0],
            jamMasuk: '',
            jamKeluar: '',
            alasan: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
                
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">Tambah Absensi Manual</h3>
                        <p className="text-xs text-slate-500">Input catatan kehadiran pegawai secara manual</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* MODAL BODY / FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Pilih Karyawan */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Pilih Karyawan <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="karyawanId"
                                value={formData.karyawanId}
                                onChange={handleChange}
                                required
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none"
                            >
                                <option value="">-- Pilih Karyawan --</option>
                                <option value="1">Budi Santoso (NIK: 20260101)</option>
                                <option value="2">Ahmad Rizky (NIK: 20260104)</option>
                                <option value="3">Siti Aminah (NIK: 20260108)</option>
                                <option value="4">Dewi Lestari (NIK: 20260112)</option>
                            </select>
                            <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    {/* Tanggal Absensi */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Tanggal <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                required
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    {/* Jam Masuk & Jam Keluar */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jam Masuk <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    name="jamMasuk"
                                    value={formData.jamMasuk}
                                    onChange={handleChange}
                                    required
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                />
                                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jam Keluar
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    name="jamKeluar"
                                    value={formData.jamKeluar}
                                    onChange={handleChange}
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                />
                                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Alasan Input Manual */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Alasan Tambah Manual <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="alasan"
                                value={formData.alasan}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Contoh: Lupa membawa ID Card / Perbaikan dari HRD..."
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* FOOTER / TOMBOL AKSI */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition shadow-sm cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Simpan Data
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default ModalTambahManual;