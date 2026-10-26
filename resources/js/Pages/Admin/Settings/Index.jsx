import React, { useState, useEffect } from 'react';
import {
    Save,
    Calendar,
    Trash2,
    Plus,
    Clock,
    DollarSign,
    AlertCircle,
    Loader2,
    Briefcase,
    CheckCircle2,
    X
} from 'lucide-react';
import api from '../../../lib/api';
import { Link } from 'react-router-dom';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('schedule');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [settings, setSettings] = useState({
        normal_check_in: '',
        normal_check_out: '',
        normal_tolerance: '',
        saturday_check_in: '',
        saturday_check_out: '',
        saturday_tolerance: '',
        late_fine_per_minute: '',
        absent_deduction: '',
        overtime_kantor_daily_start: '',
        overtime_kantor_daily_rate: '',
        overtime_kantor_weekend_start: '',
        overtime_kantor_weekend_rate: '',
        overtime_kantor_holiday_rate: '',
        overtime_lapangan_daily_start: '',
        overtime_lapangan_daily_rate: '',
        overtime_lapangan_weekend_start: '',
        overtime_lapangan_weekend_rate: '',
        overtime_lapangan_holiday_rate: '',
    });

    const [holidays, setHolidays] = useState([]);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayDesc, setNewHolidayDesc] = useState('');
    const [isNational, setIsNational] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/settings');
            setSettings(res.data.settings || {});
            setHolidays(res.data.holidays || []);
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal mengambil data pengaturan.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveSettings = async (e) => {
        if (e) e.preventDefault();
        try {
            setSaving(true);
            setErrorMsg(null);
            await api.post('/api/admin/settings', settings);
            showSuccess('Pengaturan berhasil diperbarui dan disimpan.');
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal menyimpan pengaturan.');
        } finally {
            setSaving(false);
        }
    };

    const addHoliday = async (e) => {
        e.preventDefault();
        if (!newHolidayDate || !newHolidayDesc) {
            setErrorMsg('Tanggal dan keterangan harus diisi.');
            return;
        }

        try {
            const res = await api.post('/api/admin/settings/holidays', {
                tanggal: newHolidayDate,
                date: newHolidayDate,
                keterangan: newHolidayDesc,
                description: newHolidayDesc,
                libur_nasional: isNational,
                is_national: isNational,
            });

            setHolidays([res.data.holiday, ...holidays]);
            setNewHolidayDate('');
            setNewHolidayDesc('');
            setIsNational(false);
            showSuccess('Hari libur berhasil ditambahkan.');
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal menambahkan hari libur. Pastikan tanggal belum terdaftar.');
        }
    };

    const deleteHoliday = async (id) => {
        const confirmed = await showConfirm({
            title: 'Hapus Hari Libur',
            text: 'Yakin ingin menghapus hari libur ini?',
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/settings/holidays/${id}`);
            setHolidays(holidays.filter(h => h.id !== id));
            showSuccess('Hari libur berhasil dihapus.');
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal menghapus hari libur.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const cleanDate = dateString.split(' ')[0];
        const [year, month, day] = cleanDate.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                <p className="text-slate-500 text-sm font-medium">Memuat Pengaturan Sistem...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
                    <p className="text-sm text-slate-500">Kelola jam kerja operasional, kalkulasi denda, dan kalender libur perusahaan.</p>
                </div>
            </div>


            {errorMsg && (
                <div className="p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm bg-rose-50 text-rose-800 border border-rose-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMsg(null)}
                        className="p-1 hover:bg-black/5 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        {activeTab === 'schedule' && <Clock className="w-4 h-4 text-indigo-600" />}
                        {activeTab === 'overtime' && <Briefcase className="w-4 h-4 text-amber-600" />}
                        {activeTab === 'fines' && <DollarSign className="w-4 h-4 text-rose-600" />}
                        {activeTab === 'holidays' && <Calendar className="w-4 h-4 text-emerald-600" />}
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            {activeTab === 'schedule' && 'Jadwal Operasional'}
                            {activeTab === 'overtime' && 'Aturan Lembur Flat / Ritase'}
                            {activeTab === 'fines' && 'Skema Finansial & Denda'}
                            {activeTab === 'holidays' && 'Kelola Hari Libur & Tanggal Merah'}
                        </h2>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('schedule')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Jam Kerja
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('overtime')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === 'overtime' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            Aturan Lembur
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('fines')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === 'fines' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <DollarSign className="w-3.5 h-3.5" />
                            Denda & Potongan
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('holidays')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === 'holidays' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Hari Libur
                        </button>
                    </div>
                </div>

                {activeTab === 'schedule' && (
                    <div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Senin - Jumat (Hari Kerja Normal)</span>
                                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">5 Hari Kerja</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Masuk</label>
                                        <input
                                            type="time"
                                            name="normal_check_in"
                                            value={settings.normal_check_in || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Pulang</label>
                                        <input
                                            type="time"
                                            name="normal_check_out"
                                            value={settings.normal_check_out || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Toleransi (Menit)</label>
                                        <input
                                            type="number"
                                            name="normal_tolerance"
                                            placeholder="0"
                                            value={settings.normal_tolerance || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sabtu (Setengah Hari)</span>
                                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-semibold">Khusus</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Masuk</label>
                                        <input
                                            type="time"
                                            name="saturday_check_in"
                                            value={settings.saturday_check_in || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Pulang</label>
                                        <input
                                            type="time"
                                            name="saturday_check_out"
                                            value={settings.saturday_check_out || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Toleransi (Menit)</label>
                                        <input
                                            type="number"
                                            name="saturday_tolerance"
                                            placeholder="0"
                                            value={settings.saturday_tolerance || ''}
                                            onChange={handleChange}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Nilai toleransi digunakan untuk toleransi keterlambatan scan masuk.</span>
                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'overtime' && (
                    <div>
                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                                        <Briefcase className="w-4 h-4 text-amber-600" />
                                        <span>Sistem Lembur Flat / Ritase per Hari</span>
                                    </div>
                                    <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                                        Kompensasi lembur diberikan dalam tarif flat/ritase per hari mengingat durasi waktu yang tidak menentu. Jam mulai lembur dihitung berdasarkan kategori staf (Kantor vs Lapangan) dan jenis hari (Daily, Weekends, Hari Besar/Libur Nasional).
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                                            <h3 className="font-bold text-sm text-slate-800">A. Staf Kantor</h3>
                                        </div>
                                        <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                            CS, Dokumen, Finance, Accounting, Procurement
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Standby Daily</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Senin - Jumat</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mulai Jam</label>
                                                    <input
                                                        type="time"
                                                        name="overtime_kantor_daily_start"
                                                        value={settings.overtime_kantor_daily_start || '17:00'}
                                                        onChange={handleChange}
                                                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                        <input
                                                            type="number"
                                                            name="overtime_kantor_daily_rate"
                                                            value={settings.overtime_kantor_daily_rate || '50000'}
                                                            onChange={handleChange}
                                                            className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Standby Weekends</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Sabtu & Minggu</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mulai Jam</label>
                                                    <input
                                                        type="time"
                                                        name="overtime_kantor_weekend_start"
                                                        value={settings.overtime_kantor_weekend_start || '13:00'}
                                                        onChange={handleChange}
                                                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                        <input
                                                            type="number"
                                                            name="overtime_kantor_weekend_rate"
                                                            value={settings.overtime_kantor_weekend_rate || '75000'}
                                                            onChange={handleChange}
                                                            className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Hari Besar</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Hari Libur Nasional</span>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                    <input
                                                        type="number"
                                                        name="overtime_kantor_holiday_rate"
                                                        value={settings.overtime_kantor_holiday_rate || '300000'}
                                                        onChange={handleChange}
                                                        className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                            <h3 className="font-bold text-sm text-slate-800">B. Staf Lapangan</h3>
                                        </div>
                                        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                            Operasional / Lapangan
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Standby Daily</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Senin - Jumat</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mulai Jam</label>
                                                    <input
                                                        type="time"
                                                        name="overtime_lapangan_daily_start"
                                                        value={settings.overtime_lapangan_daily_start || '16:31'}
                                                        onChange={handleChange}
                                                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                        <input
                                                            type="number"
                                                            name="overtime_lapangan_daily_rate"
                                                            value={settings.overtime_lapangan_daily_rate || '50000'}
                                                            onChange={handleChange}
                                                            className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Standby Weekends</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Sabtu & Minggu</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mulai Jam</label>
                                                    <input
                                                        type="time"
                                                        name="overtime_lapangan_weekend_start"
                                                        value={settings.overtime_lapangan_weekend_start || '12:01'}
                                                        onChange={handleChange}
                                                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                        <input
                                                            type="number"
                                                            name="overtime_lapangan_weekend_rate"
                                                            value={settings.overtime_lapangan_weekend_rate || '75000'}
                                                            onChange={handleChange}
                                                            className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Lembur Hari Besar</span>
                                                <span className="text-[11px] text-slate-500 font-medium">Hari Libur Nasional</span>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tarif Flat per Hari</label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">Rp</span>
                                                    <input
                                                        type="number"
                                                        name="overtime_lapangan_holiday_rate"
                                                        value={settings.overtime_lapangan_holiday_rate || '300000'}
                                                        onChange={handleChange}
                                                        className="w-full pl-8 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Tarif dan jam acuan lembur tersimpan otomatis untuk kalkulasi payroll dan persetujuan lembur.</span>
                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Lembur'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'fines' && (
                    <div>
                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span>Kategori & Skema Sanksi Keterlambatan</span>
                                    </div>
                                    <p className="text-xs text-indigo-800/80 mt-1">
                                        Aturan keterlambatan menggunakan kategori (Staf Kantor vs Staf Lapangan) dengan 4 tingkatan (tier) denda dan toleransi 3x sebulan.
                                    </p>
                                </div>
                                <Link
                                    to="/admin/master-payroll"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm text-center"
                                >
                                    Buka Kategori Terlambat &rarr;
                                </Link>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600">Denda Keterlambatan per Menit</label>
                                <div className="relative rounded-lg shadow-sm max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                                        Rp
                                    </div>
                                    <input
                                        type="number"
                                        name="late_fine_per_minute"
                                        placeholder="0"
                                        value={settings.late_fine_per_minute || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Denda otomatis dikalkulasikan setelah batas toleransi menit terlewati.</p>
                            </div>

                            <hr className="border-slate-200" />

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-600">Potongan Absen / Mangkir (per Hari)</label>
                                <div className="relative rounded-lg shadow-sm max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                                        Rp
                                    </div>
                                    <input
                                        type="number"
                                        name="absent_deduction"
                                        placeholder="0"
                                        value={settings.absent_deduction || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Potongan gaji untuk karyawan yang tidak hadir tanpa keterangan resmi.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Nilai denda dan potongan disimpan langsung ke basis data.</span>
                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'holidays' && (
                    <div className="p-6 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tambah Hari Libur & Tanggal Merah</h3>
                            <form onSubmit={addHoliday} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal</label>
                                        <input
                                            type="date"
                                            required
                                            value={newHolidayDate}
                                            onChange={(e) => setNewHolidayDate(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan Libur</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: Hari Raya Idul Fitri"
                                            value={newHolidayDesc}
                                            onChange={(e) => setNewHolidayDesc(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isNational}
                                            onChange={(e) => setIsNational(e.target.checked)}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        Kategori Libur Nasional
                                    </label>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition shadow-sm cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Tambah Tanggal Libur
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Hari Libur Terdaftar</h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                    {holidays.length} Hari
                                </span>
                            </div>

                            {holidays.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">Belum ada hari libur tersimpan di database.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    {holidays.map((holiday) => (
                                        <div key={holiday.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${(holiday.libur_nasional ?? holiday.is_national) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-semibold text-slate-800">{holiday.keterangan || holiday.description}</h4>
                                                        {(holiday.libur_nasional ?? holiday.is_national) && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                                Nasional
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {formatDate(holiday.tanggal || holiday.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => deleteHoliday(holiday.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;