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
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
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
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal menambahkan hari libur. Pastikan tanggal belum terdaftar.');
        }
    };

    const deleteHoliday = async (id) => {
        if (!window.confirm('Yakin ingin menghapus hari libur ini?')) return;

        try {
            await api.delete(`/api/admin/settings/holidays/${id}`);
            setHolidays(holidays.filter(h => h.id !== id));
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal menghapus hari libur.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
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

            {saveSuccess && (
                <div className="p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-medium">Pengaturan berhasil diperbarui dan disimpan ke database.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSaveSuccess(false)}
                        className="p-1 hover:bg-black/5 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

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
                        {activeTab === 'schedule' && <Briefcase className="w-4 h-4 text-indigo-600" />}
                        {activeTab === 'fines' && <DollarSign className="w-4 h-4 text-rose-600" />}
                        {activeTab === 'holidays' && <Calendar className="w-4 h-4 text-emerald-600" />}
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            {activeTab === 'schedule' && 'Jadwal Operasional'}
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

                {activeTab === 'fines' && (
                    <div>
                        <div className="p-6 space-y-6">
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