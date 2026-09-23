import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Clock, Filter, Search, X, CheckCircle2, AlertCircle, 
    FileText, Trash2, ExternalLink, Image as ImageIcon, Loader2, Plus 
} from 'lucide-react';
import api from '../../../lib/api';

const Riwayat = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterJenis, setFilterJenis] = useState('Semua Jenis');
    const [filterStatus, setFilterStatus] = useState('Semua Status');
    const [filterOpen, setFilterOpen] = useState(false);
    const [notif, setNotif] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '' });

    useEffect(() => {
        if (location.state?.flashMessage) {
            setNotif({
                type: 'success',
                message: location.state.flashMessage
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const loadRiwayat = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterJenis !== 'Semua Jenis') params.jenis = filterJenis;
            if (filterStatus !== 'Semua Status') params.status = filterStatus;
            if (search.trim()) params.search = search.trim();

            const res = await api.get('/api/user/permissions', { params });
            setRiwayat(res.data.permissions || []);
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memuat riwayat pengajuan.'
            });
        } finally {
            setLoading(false);
        }
    }, [filterJenis, filterStatus, search]);

    useEffect(() => {
        loadRiwayat();
    }, [loadRiwayat]);

    const handleBatalPengajuan = async (id, jenis) => {
        if (!window.confirm(`Yakin ingin membatalkan pengajuan ${jenis} ini?`)) return;

        try {
            setDeletingId(id);
            const res = await api.delete(`/api/user/permissions/${id}`);
            setNotif({
                type: 'success',
                message: res.data.message || 'Pengajuan berhasil dibatalkan.'
            });
            await loadRiwayat();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal membatalkan pengajuan.'
            });
        } finally {
            setDeletingId(null);
        }
    };

    const hasActiveFilter = filterJenis !== 'Semua Jenis' || filterStatus !== 'Semua Status';

    const resetFilter = () => {
        setFilterJenis('Semua Jenis');
        setFilterStatus('Semua Status');
        setSearch('');
    };

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'disetujui') {
            return {
                dot: 'bg-emerald-500',
                badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            };
        }
        if (s === 'ditolak') {
            return {
                dot: 'bg-rose-500',
                badge: 'bg-rose-50 text-rose-700 border border-rose-200'
            };
        }
        return {
            dot: 'bg-amber-500',
            badge: 'bg-amber-50 text-amber-700 border border-amber-200'
        };
    };

    return (
        <div className="space-y-6">
            {notif && (
                <div className={`p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm ${
                    notif.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {notif.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-medium">{notif.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotif(null)}
                        className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Riwayat Pengajuan</h2>
                    <p className="text-sm text-gray-500">Daftar semua pengajuan izin, sakit, dinas, cuti, dan lembur Anda</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/user/pengajuan')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-orange-500/20 cursor-pointer w-fit"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Pengajuan Baru</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari tanggal, jenis, atau keterangan..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterOpen((v) => !v)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition cursor-pointer ${
                                hasActiveFilter
                                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            {hasActiveFilter && (
                                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                                    {(filterJenis !== 'Semua Jenis' ? 1 : 0) + (filterStatus !== 'Semua Status' ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {filterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)}></div>

                                <div className="absolute right-0 sm:right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-gray-500">FILTER</p>
                                        {hasActiveFilter && (
                                            <button
                                                type="button"
                                                onClick={resetFilter}
                                                className="text-xs text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <X className="w-3 h-3" /> Reset
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis</label>
                                        <select
                                            value={filterJenis}
                                            onChange={(e) => setFilterJenis(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none cursor-pointer"
                                        >
                                            <option value="Semua Jenis">Semua Jenis</option>
                                            <option value="Izin">Izin</option>
                                            <option value="Sakit">Sakit</option>
                                            <option value="Dinas">Dinas</option>
                                            <option value="Cuti">Cuti</option>
                                            <option value="Lembur">Lembur</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none cursor-pointer"
                                        >
                                            <option value="Semua Status">Semua Status</option>
                                            <option value="Menunggu">Menunggu</option>
                                            <option value="Disetujui">Disetujui</option>
                                            <option value="Ditolak">Ditolak</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">
                        {hasActiveFilter || search ? 'Hasil Pencarian / Filter' : 'Semua Riwayat Pengajuan'}
                    </h3>
                    <span className="text-xs text-gray-400">{riwayat.length} pengajuan</span>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
                            <p className="text-xs font-medium">Memuat data dari database...</p>
                        </div>
                    ) : riwayat.length > 0 ? (
                        riwayat.map((item) => {
                            const style = getStatusStyle(item.raw_status);
                            return (
                                <div key={item.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${style.dot} mt-1.5 shrink-0`}></div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-800 text-sm">{item.kategori}</span>
                                                <span className="text-xs text-gray-500 font-medium">({item.tanggal_format})</span>
                                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                                    {item.durasi}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed max-w-xl">{item.keterangan}</p>
                                            
                                            {item.catatan_admin && (
                                                <div className="mt-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 inline-block">
                                                    <span className="font-semibold">Catatan Admin: </span>{item.catatan_admin}
                                                </div>
                                            )}

                                            {item.lampiran && (
                                                <div className="pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewModal({ isOpen: true, url: item.lampiran, title: `Lampiran ${item.kategori}` })}
                                                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> Lihat Lampiran
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0">
                                        <span className={`${style.badge} font-semibold px-3 py-1 rounded-full text-xs`}>
                                            {item.status}
                                        </span>

                                        {item.raw_status === 'menunggu' && (
                                            <button
                                                type="button"
                                                disabled={deletingId === item.id}
                                                onClick={() => handleBatalPengajuan(item.id, item.kategori)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                                title="Batalkan pengajuan"
                                            >
                                                {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm font-medium">Tidak ada data pengajuan yang cocok.</p>
                            <p className="text-xs text-gray-400 mt-1">Gunakan tombol Buat Pengajuan Baru untuk mengajukan permohonan.</p>
                        </div>
                    )}
                </div>
            </div>

            {previewModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <h4 className="font-bold text-sm truncate">{previewModal.title}</h4>
                            <button
                                type="button"
                                onClick={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
                                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[250px] max-h-[70vh] overflow-y-auto">
                            {previewModal.url.match(/\.(jpe?g|png|webp|gif)$/i) ? (
                                <img src={previewModal.url} alt="Lampiran" className="max-h-80 rounded-lg object-contain shadow-xs" />
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                                    <a
                                        href={previewModal.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                    >
                                        <span>Buka Dokumen PDF</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
                                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Riwayat;