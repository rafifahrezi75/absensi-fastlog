import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

const ModalTambahManual = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        karyawanId: '',
        tanggal: new Date().toISOString().split('T')[0],
        jamMasuk: '',
        jamKeluar: '',
        alasan: ''
    });

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadEmployees();
            setErrorMsg(null);
        }
    }, [isOpen]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/employees');
            const emps = res.data.employees || [];
            setEmployees(emps);
            if (emps.length > 0 && !formData.karyawanId) {
                setFormData(prev => ({ ...prev, karyawanId: String(emps[0].id) }));
            }
        } catch (err) {
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.jamMasuk && !formData.jamKeluar) {
            setErrorMsg('Minimal salah satu jam (Jam Masuk atau Jam Keluar) harus diisi.');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);

            const payload = {
                karyawan_id: formData.karyawanId,
                tanggal: formData.tanggal,
                jam_masuk: formData.jamMasuk || null,
                jam_keluar: formData.jamKeluar || null,
                alasan: formData.alasan || null
            };

            const res = await api.post('/api/admin/attendance/manual', payload);

            if (onSuccess) {
                onSuccess(res.data.message || 'Data absensi berhasil ditambahkan.');
            }

            setFormData({
                karyawanId: employees.length > 0 ? String(employees[0].id) : '',
                tanggal: new Date().toISOString().split('T')[0],
                jamMasuk: '',
                jamKeluar: '',
                alasan: ''
            });

            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data absensi manual.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">Tambah Absensi Manual</h3>
                        <p className="text-xs text-slate-500">Input catatan kehadiran pegawai secara manual</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        type="button"
                        disabled={submitting}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                            {errorMsg}
                        </div>
                    )}

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
                                disabled={loading}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="">-- Pilih Karyawan --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nama} ({emp.nik || `PIN: ${emp.pin}`}) - {emp.dept || 'Umum'}
                                    </option>
                                ))}
                            </select>
                            <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>

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
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jam Masuk
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    name="jamMasuk"
                                    value={formData.jamMasuk}
                                    onChange={handleChange}
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                />
                                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            </div>
                        </div>
                    </div>

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
                                placeholder="Contoh: Lupa membawa ID Card / Tugas dinas luar..."
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition shadow-sm cursor-pointer disabled:opacity-60"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>{submitting ? 'Menyimpan...' : 'Simpan Data'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalTambahManual;