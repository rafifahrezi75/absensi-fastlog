import React, { useState, useEffect, useCallback } from 'react';
import { 
    Cpu, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, 
    Clock, Calendar, MapPin, Fingerprint, Users, Activity, 
    FileText, Settings, Edit3, Server, Radio, ShieldCheck, 
    Loader2, X, Send, Database, HardDrive, Smartphone
} from 'lucide-react';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const DevicesIndex = () => {
    const [deviceData, setDeviceData] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentSyncLogs, setRecentSyncLogs] = useState([]);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('scans');

    const [pingLoading, setPingLoading] = useState(false);
    const [pingResult, setPingResult] = useState(null);

    const [syncLoading, setSyncLoading] = useState(false);
    const [syncUserLoading, setSyncUserLoading] = useState(false);
    const [notif, setNotif] = useState(null);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', location: '', status: 'aktif' });
    const [editSaving, setEditSaving] = useState(false);

    const [isFetchLogOpen, setIsFetchLogOpen] = useState(false);
    const [fetchDates, setFetchDates] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const loadDevice = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/devices');
            setDeviceData(res.data.device);
            setStats(res.data.stats);
            setRecentSyncLogs(res.data.recent_sync_logs || []);
            setRecentScans(res.data.recent_scans || []);

            if (res.data.device) {
                setEditForm({
                    name: res.data.device.name || '',
                    location: res.data.device.location || '',
                    status: res.data.device.status || 'aktif'
                });
            }
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memuat data perangkat mesin sidik jari.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDevice();
    }, [loadDevice]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const handlePing = async () => {
        try {
            setPingLoading(true);
            setPingResult(null);
            const res = await api.post('/api/admin/devices/ping');
            setPingResult(res.data);
            showSuccess(res.data.message || 'Koneksi ke Fingerspot Cloud berhasil.');
        } catch (err) {
            const errData = err.response?.data || {};
            setPingResult({
                success: false,
                status: 'offline',
                latency_ms: errData.latency_ms || null,
                message: errData.message || 'Gagal melakukan tes ping ke Fingerspot Cloud.'
            });
            setNotif({
                type: 'error',
                message: errData.message || 'Koneksi ke mesin terputus atau timeout.'
            });
        } finally {
            setPingLoading(false);
        }
    };

    const handleSyncLogs = async (e) => {
        if (e) e.preventDefault();
        try {
            setSyncLoading(true);
            const res = await api.post('/api/admin/devices/sync-logs', fetchDates);
            showSuccess(res.data.message || `Berhasil menarik ${res.data.total_inserted || 0} scan log baru dari cloud.`);
            setIsFetchLogOpen(false);
            await loadDevice();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal menyinkronkan data log absensi dari mesin.'
            });
        } finally {
            setSyncLoading(false);
        }
    };

    const handleSyncUsers = async () => {
        try {
            setSyncUserLoading(true);
            const res = await api.post('/api/admin/devices/sync-users');
            showSuccess(res.data.message || 'Permintaan sinkronisasi data user berhasil dikirim ke mesin.');
            await loadDevice();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal menyinkronkan data pengguna.'
            });
        } finally {
            setSyncUserLoading(false);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!deviceData) return;

        try {
            setEditSaving(true);
            const res = await api.put(`/api/admin/devices/${deviceData.id}`, editForm);
            showSuccess(res.data.message || 'Data mesin berhasil diperbarui.');
            setIsEditOpen(false);
            await loadDevice();
        } catch (err) {
            setNotif({
                type: 'error',
                message: err.response?.data?.message || 'Gagal menyimpan perubahan perangkat.'
            });
        } finally {
            setEditSaving(false);
        }
    };

    if (loading && !deviceData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Memuat informasi perangkat mesin...</p>
            </div>
        );
    }

    const isDeviceActive = deviceData?.status === 'aktif' || deviceData?.status === 'active';

    return (
        <div className="space-y-6">
            {notif && notif.type === 'error' && (
                <div className="p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm bg-rose-50 text-rose-800 border border-rose-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
                    <h1 className="text-2xl font-bold text-slate-900">Mesin Sidik Jari</h1>
                    <p className="text-sm text-slate-500">Monitoring terminal biometrik Fingerspot, status telemetri, dan sinkronisasi cloud.</p>
                </div>
                <div className="flex items-center flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={handlePing}
                        disabled={pingLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs cursor-pointer disabled:opacity-60"
                    >
                        <Radio className={`w-3.5 h-3.5 text-indigo-600 ${pingLoading ? 'animate-pulse' : ''}`} />
                        <span>{pingLoading ? 'Menguji Ping...' : 'Uji Koneksi (Ping)'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSyncUsers}
                        disabled={syncUserLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition shadow-xs cursor-pointer disabled:opacity-60"
                    >
                        <Users className={`w-3.5 h-3.5 ${syncUserLoading ? 'animate-spin' : ''}`} />
                        <span>{syncUserLoading ? 'Menyinkronkan Karyawan...' : 'Sinkron Data Karyawan'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFetchLogOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync Log Absensi</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                                    <Cpu className="w-5 h-5 text-indigo-400" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-white text-base leading-tight">{deviceData?.name}</h3>
                                    <span className="text-xs text-slate-400 font-mono">{deviceData?.model}</span>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                isDeviceActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${isDeviceActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                                {isDeviceActive ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>

                        <div className="my-5 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
                            <img
                                src={deviceData?.photo_url || '/images/mesin-fingerspot.png'}
                                alt="Mesin Fingerspot"
                                className="max-h-56 object-contain drop-shadow-2xl transition hover:scale-105 duration-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-slate-400 block mb-0.5">Cloud ID Mesin</span>
                                <span className="font-mono font-bold text-slate-100 text-sm">{deviceData?.cloud_id}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-slate-400 block mb-0.5">Lokasi Terminal</span>
                                <div className="flex items-center gap-1 font-semibold text-slate-100 truncate">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span className="truncate">{deviceData?.location}</span>
                                </div>
                            </div>
                        </div>

                        {pingResult && (
                            <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
                                pingResult.success
                                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
                                    : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
                            }`}>
                                <div className="flex items-center gap-2 truncate">
                                    {pingResult.success ? <Wifi className="w-4 h-4 text-emerald-400 shrink-0" /> : <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />}
                                    <span className="truncate">{pingResult.message}</span>
                                </div>
                                {pingResult.latency_ms && (
                                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                                        {pingResult.latency_ms} ms
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
                        <span>Aktivitas: {deviceData?.last_activity}</span>
                        <button
                            type="button"
                            onClick={() => setIsEditOpen(true)}
                            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Ubah Info
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Scan Log</span>
                                <Fingerprint className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{stats?.total_scans || 0}</div>
                            <span className="text-[11px] text-slate-400 mt-1 block">Tersimpan di database</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pegawai Terdaftar</span>
                                <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{stats?.total_employees || 0}</div>
                            <span className="text-[11px] text-emerald-600 mt-1 block">Data pengguna aktif</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sinkron Terakhir</span>
                                <Activity className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-sm font-bold text-slate-900 truncate">{stats?.last_sync_time || '-'}</div>
                            <span className="text-[11px] text-slate-400 mt-1 block truncate">
                                Status: <span className="font-semibold text-emerald-600">{stats?.last_sync_status || 'none'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-sm">Spesifikasi & Konfigurasi Cloud</h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">Push Protocol ADMS</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-slate-400 block font-medium">Server API Endpoint</span>
                                <span className="font-mono text-slate-800 break-all">{deviceData?.api_url}</span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-slate-400 block font-medium">Metode Verifikasi Mesin</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Sidik Jari</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-semibold">PIN / Sandi</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">Kartu RFID</span>
                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">Sensor Wajah</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('scans')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                        activeTab === 'scans'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    Log Tap Terkini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('syncs')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                        activeTab === 'syncs'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    Riwayat Sinkronisasi Cloud
                                </button>
                            </div>
                            <span className="text-[11px] text-slate-400">
                                {activeTab === 'scans' ? `${recentScans.length} data terbaru` : `${recentSyncLogs.length} riwayat sinkron`}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            {activeTab === 'scans' ? (
                                <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2.5 font-semibold">Karyawan</th>
                                            <th className="px-4 py-2.5 font-semibold">PIN</th>
                                            <th className="px-4 py-2.5 font-semibold">Waktu Scan</th>
                                            <th className="px-4 py-2.5 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentScans.length > 0 ? (
                                            recentScans.map((scan) => (
                                                <tr key={scan.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                                                        {scan.nama}
                                                        <span className="text-[10px] text-slate-400 block">{scan.dept}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">{scan.pin}</td>
                                                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{scan.scan_at}</td>
                                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                            scan.status_scan === 'Keluar'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {scan.status_scan}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                                                    Belum ada data scan yang tersimpan di database.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2.5 font-semibold">Waktu</th>
                                            <th className="px-4 py-2.5 font-semibold">Aksi</th>
                                            <th className="px-4 py-2.5 font-semibold">Status</th>
                                            <th className="px-4 py-2.5 font-semibold">Record</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentSyncLogs.length > 0 ? (
                                            recentSyncLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{log.created_at}</td>
                                                    <td className="px-4 py-2.5 font-mono text-slate-700 whitespace-nowrap">{log.action}</td>
                                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                            log.status === 'success' || log.status === 'sukses'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                                                        {log.records_inserted} Masuk / {log.records_received} Total
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                                                    Belum ada riwayat sinkronisasi tersimpan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Ubah Info Mesin Sidik Jari</h3>
                                <p className="text-xs text-slate-500">Perbarui nama identifikasi dan lokasi terminal</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Perangkat</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi Terminal</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                    required
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Terminal</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="aktif">Aktif (Online)</option>
                                    <option value="nonaktif">Nonaktif (Offline / Pemeliharaan)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                                >
                                    {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isFetchLogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Sync Log Absensi Mesin</h3>
                                <p className="text-xs text-slate-500">Rentang sinkronisasi data maksimal 2 hari berturut-turut</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFetchLogOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSyncLogs} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={fetchDates.start_date}
                                        onChange={(e) => setFetchDates(prev => ({ ...prev, start_date: e.target.value }))}
                                        required
                                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={fetchDates.end_date}
                                        onChange={(e) => setFetchDates(prev => ({ ...prev, end_date: e.target.value }))}
                                        required
                                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>API Fingerspot Cloud membatasi pengambilan log maksimal 2 hari kalender dalam satu kali request.</span>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFetchLogOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={syncLoading}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                                    <span>{syncLoading ? 'Menyinkronkan...' : 'Mulai Sync Log'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicesIndex;
