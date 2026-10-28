import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, FileText, Trash2, Loader2, AlertCircle, Camera, MapPin, ExternalLink, Navigation } from 'lucide-react';
import api from '../../../../lib/api';
import { showConfirm } from '../../../../lib/swal';

const ModalKoreksi = ({ isOpen, onClose, data, onSuccess }) => {
    const [jamMasuk, setJamMasuk] = useState('');
    const [jamKeluar, setJamKeluar] = useState('');
    const [alasan, setAlasan] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedTapIdx, setSelectedTapIdx] = useState(0);

    const isOutdoor = Boolean(data?.is_outdoor || data?.foto || data?.outdoor_info?.photo);
    const tapsList = data?.outdoor_info?.taps && data.outdoor_info.taps.length > 0 
        ? data.outdoor_info.taps 
        : (data?.foto || data?.outdoor_info?.photo ? [{
            tap_type: data?.outdoor_info?.tap_label?.toLowerCase()?.includes('out') ? 'out' : 'in',
            photo: data?.foto || data?.outdoor_info?.photo,
            address: data?.address || data?.outdoor_info?.address,
            keterangan: data?.keterangan || data?.outdoor_info?.keterangan,
            time: data?.masuk || data?.keluar || ''
        }] : []);

    const activeTap = tapsList[selectedTapIdx] || tapsList[0] || null;
    const activePhoto = activeTap?.photo || data?.foto || data?.outdoor_info?.photo;
    const activeAddress = activeTap?.address || data?.address || data?.outdoor_info?.address;
    const activeKeterangan = activeTap?.keterangan || data?.keterangan || data?.outdoor_info?.keterangan;
    const activeLat = activeTap?.lat || activeTap?.latitude || data?.lat || data?.outdoor_info?.lat || null;
    const activeLng = activeTap?.lng || activeTap?.longitude || data?.lng || data?.outdoor_info?.lng || null;

    const googleMapsUrl = (activeLat && activeLng)
        ? `https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`
        : (activeAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeAddress)}` : null);

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
            setSelectedTapIdx(0);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${isOutdoor ? 'max-w-4xl' : 'max-w-md'} max-h-[92vh] flex flex-col overflow-hidden transform transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-150`}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">
                            {isOutdoor ? 'Pemeriksaan & Koreksi Absensi Luar' : 'Koreksi Log Absensi'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {isOutdoor ? 'Tinjau bukti foto GPS dan sesuaikan jam scan kehadiran' : 'Sesuaikan jam kehadiran atau hapus scan absensi'}
                        </p>
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

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {isOutdoor ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                            <div className="space-y-3.5">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
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
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                                            {data?.outdoor_info?.tap_label || 'Absen Luar'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 text-xs text-slate-600">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                        <span className="font-medium">Tanggal:</span>
                                        <span className="text-slate-800 font-semibold">{data?.tanggalDisplay || data?.tanggal || '-'}</span>
                                    </div>
                                </div>

                                {tapsList.length > 1 && (
                                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                                        {tapsList.map((tap, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedTapIdx(idx)}
                                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                                    selectedTapIdx === idx
                                                        ? 'bg-teal-600 text-white shadow-xs'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                                }`}
                                            >
                                                <Navigation className="w-3 h-3" />
                                                <span>{tap.tap_type === 'in' ? 'Tap In' : 'Tap Out'} {tap.time ? `(${tap.time.substring(0, 5)})` : ''}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                                            <Camera className="w-3.5 h-3.5 text-teal-600" />
                                            Bukti Foto GPS {activeTap?.tap_type ? `(${activeTap.tap_type === 'in' ? 'Tap In' : 'Tap Out'})` : ''}
                                        </span>
                                        {activePhoto && (
                                            <a 
                                                href={activePhoto} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition"
                                            >
                                                Lihat Penuh <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    {activePhoto ? (
                                        <div className="rounded-lg overflow-hidden border border-teal-200 bg-slate-900 max-h-56 flex items-center justify-center shadow-xs">
                                            <img 
                                                src={activePhoto} 
                                                alt="Bukti Absensi Luar" 
                                                className="w-full max-h-56 object-contain bg-slate-950" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-teal-200">
                                            Foto bukti tidak tersedia
                                        </div>
                                    )}

                                    {activeAddress && (
                                        <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100 space-y-1.5">
                                            <div className="flex items-start gap-1.5 text-[11px] text-teal-950">
                                                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                                <span className="leading-tight font-medium flex-1">{activeAddress}</span>
                                            </div>
                                            {googleMapsUrl && (
                                                <div className="flex items-center justify-between pt-1 border-t border-teal-100/70 text-[10px]">
                                                    <span className="text-teal-700 font-mono">
                                                        {activeLat && activeLng ? `GPS: ${activeLat}, ${activeLng}` : 'Lokasi Terverifikasi'}
                                                    </span>
                                                    <a
                                                        href={googleMapsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer"
                                                    >
                                                        <span>Buka Google Maps</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeKeterangan && activeKeterangan.replace(/^\[Tap (?:In|Out)\]\s*/i, '').trim() && (
                                        <div className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-teal-100 whitespace-pre-line">
                                            <span className="font-semibold text-slate-800 block mb-0.5">Keterangan / Alasan Karyawan:</span>
                                            {activeKeterangan.replace(/^\[Tap (?:In|Out)\]\s*/i, '').trim()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span>Penyesuaian Jam Scan</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Jam Masuk
                                            </label>
                                            <input
                                                type="time"
                                                value={jamMasuk}
                                                onChange={(e) => setJamMasuk(e.target.value)}
                                                disabled={submitting || deleting}
                                                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Jam Keluar
                                            </label>
                                            <input
                                                type="time"
                                                value={jamKeluar}
                                                onChange={(e) => setJamKeluar(e.target.value)}
                                                disabled={submitting || deleting}
                                                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Alasan Koreksi Admin
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        disabled={submitting || deleting}
                                        placeholder="Tuliskan catatan alasan koreksi..."
                                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
                                    Data absensi ini tercatat dari verifikasi mobile GPS. Anda dapat menyesuaikan jam masuk/keluar atau menghapus log secara permanen.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                    <input
                                        type="time"
                                        value={jamMasuk}
                                        onChange={(e) => setJamMasuk(e.target.value)}
                                        disabled={submitting || deleting}
                                        className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Jam Keluar
                                    </label>
                                    <input
                                        type="time"
                                        value={jamKeluar}
                                        onChange={(e) => setJamKeluar(e.target.value)}
                                        disabled={submitting || deleting}
                                        className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
                                    />
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
                        </>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
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
