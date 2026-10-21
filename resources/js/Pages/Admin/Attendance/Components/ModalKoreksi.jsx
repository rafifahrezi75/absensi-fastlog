import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../../lib/api';
import { showConfirm } from '../../../../lib/swal';

const ModalKoreksi = ({ isOpen, onClose, data, onSuccess }) => {
    const [jamMasuk, setJamMasuk] = useState('');
    const [jamKeluar, setJamKeluar] = useState('');
    const [alasan, setAlasan] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const formatTimeValue = (val) => {
        if (!val || val === '-') return '';
        const parts = val.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return val;
    };

    useEffect(() => {
        if (isOpen && data) {
            setJamMasuk(formatTimeValue(data.masuk));
            setJamKeluar(formatTimeValue(data.keluar));
            setAlasan('');
            setErrorMsg(null);
        }
    }, [isOpen, data]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!jamMasuk && !jamKeluar) {
            setErrorMsg('Minimal salah satu jam (Jam Masuk atau Jam Keluar) harus diisi.');
            return;
        }

        if (jamMasuk && jamKeluar && jamKeluar < jamMasuk) {
            setErrorMsg('Jam keluar tidak boleh lebih awal dari jam masuk.');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);

            const payload = {
                employee_id: data.employee_id || null,
                pin: data.pin || null,
                tanggal: data.tanggal,
                jam_masuk: jamMasuk || null,
                jam_keluar: jamKeluar || null,
                alasan: alasan || 'Koreksi log absensi oleh Admin',
            };

            const res = await api.put('/api/admin/attendance/koreksi', payload);

            if (onSuccess) {
                onSuccess(res.data.message || 'Log absensi berhasil diperbarui.');
            }

            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menyimpan perubahan log absensi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await showConfirm({
            title: 'Hapus Log Absensi?',
            text: `Data log absensi untuk ${data.nama || 'karyawan'} pada tanggal ${data.tanggalDisplay || data.tanggal} akan dihapus secara permanen.`,
            confirmButtonColor: '#e11d48',
            confirmText: 'Ya, Hapus Log',
            cancelText: 'Batal',
        });

        if (!isConfirmed) return;

        try {
            setDeleting(true);
            setErrorMsg(null);

            const res = await api.delete('/api/admin/attendance/koreksi', {
                data: {
                    employee_id: data.employee_id || null,
                    pin: data.pin || null,
                    tanggal: data.tanggal,
                },
            });

            if (onSuccess) {
                onSuccess(res.data.message || 'Data log absensi berhasil dihapus.');
            }

            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menghapus log absensi.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">Koreksi Log Absensi</h3>
                        <p className="text-xs text-slate-500">Sesuaikan jam kehadiran atau hapus scan absensi</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting || deleting}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-900 text-sm truncate">
                                    {data?.nama || (data?.pin ? `Karyawan PIN #${data.pin}` : '-')}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    ID Finger: {data?.pin || '-'} {data?.deptDisplay ? `• ${data.deptDisplay}` : ''}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-medium">Tanggal:</span>
                            <span className="text-slate-800 font-semibold">{data?.tanggalDisplay || data?.tanggal || '-'}</span>
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
                                    value={jamMasuk}
                                    onChange={(e) => setJamMasuk(e.target.value)}
                                    disabled={submitting || deleting}
                                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jam Keluar
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={jamKeluar}
                                    onChange={(e) => setJamKeluar(e.target.value)}
                                    disabled={submitting || deleting}
                                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Alasan Koreksi Admin
                        </label>
                        <textarea
                            rows="3"
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            disabled={submitting || deleting}
                            placeholder="Contoh: Lupa scan keluar / Mesin finger maintenance"
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={submitting || deleting}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Hapus Log
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting || deleting}
                                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || deleting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKoreksi;
