import React, { useState, useEffect } from 'react';
import {
    Save,
    Calendar,
    Trash2,
    Plus,
    Clock,
    DollarSign,
    Settings as SettingsIcon,
    AlertCircle,
    Loader2,
    Briefcase,
    Building2,
    CheckCircle2
} from 'lucide-react';
import api from '../../../lib/api';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'fines' | 'holidays'
    const [saveSuccess, setSaveSuccess] = useState(false);

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
            console.error('Error fetching settings:', error);
            alert('Gagal mengambil data pengaturan.');
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
            await api.post('/api/admin/settings', settings);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setSaving(false);
        }
    };

    const addHoliday = async (e) => {
        e.preventDefault();
        if (!newHolidayDate || !newHolidayDesc) {
            alert('Tanggal dan keterangan harus diisi.');
            return;
        }

        try {
            const res = await api.post('/api/admin/settings/holidays', {
                date: newHolidayDate,
                description: newHolidayDesc,
                is_national: isNational,
            });

            setHolidays([res.data.holiday, ...holidays]);
            setNewHolidayDate('');
            setNewHolidayDesc('');
            setIsNational(false);
        } catch (error) {
            console.error('Error adding holiday:', error);
            alert('Gagal menambahkan hari libur. Pastikan tanggal belum terdaftar.');
        }
    };

    const deleteHoliday = async (id) => {
        if (!window.confirm('Yakin ingin menghapus hari libur ini?')) return;

        try {
            await api.delete(`/api/admin/settings/holidays/${id}`);
            setHolidays(holidays.filter(h => h.id !== id));
        } catch (error) {
            console.error('Error deleting holiday:', error);
            alert('Gagal menghapus hari libur.');
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
                <Loader2 className="w-9 h-9 text-indigo-600 animate-spin mb-3" />
                <p className="text-slate-500 text-sm font-medium">Memuat Pengaturan System...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                        <SettingsIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Pengaturan Sistem</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Kelola jam kerja operasional, kalkulasi denda, dan kalender libur perusahaan.</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'schedule'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Jam Kerja
                    </button>
                    <button
                        onClick={() => setActiveTab('fines')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'fines'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        Denda & Potongan
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'holidays'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Hari Libur
                    </button>
                </div>
            </div>

            {/* Notification Bar */}
            {saveSuccess && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-in fade-in duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Pengaturan berhasil diperbarui dan disimpan ke sistem.</span>
                </div>
            )}

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Settings Panel */}
                <div className={`${activeTab === 'holidays' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>

                    {/* Tab 1: Jam Kerja */}
                    {activeTab === 'schedule' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Jadwal Operasional</h2>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Regular Schedule */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senin — Jumat (Hari Normal)</span>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">5 Hari Kerja</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Masuk</label>
                                            <input
                                                type="time"
                                                name="normal_check_in"
                                                value={settings.normal_check_in || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Pulang</label>
                                            <input
                                                type="time"
                                                name="normal_check_out"
                                                value={settings.normal_check_out || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Saturday Schedule */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sabtu (Setengah Hari)</span>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">Pilihan</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Masuk</label>
                                            <input
                                                type="time"
                                                name="saturday_check_in"
                                                value={settings.saturday_check_in || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jam Pulang</label>
                                            <input
                                                type="time"
                                                name="saturday_check_out"
                                                value={settings.saturday_check_out || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                                                className="w-full text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Denda & Potongan */}
                    {activeTab === 'fines' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-rose-600" />
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Skema Finansial & Denda</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Denda Keterlambatan per Menit</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                                            Rp
                                        </div>
                                        <input
                                            type="number"
                                            name="late_fine_per_minute"
                                            placeholder="0"
                                            value={settings.late_fine_per_minute || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">Denda otomatis dikalkulasikan setelah batas toleransi menit terlewati.</p>
                                </div>

                                <hr className="border-slate-100" />

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Potongan Absen / Mangkir (per Hari)</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                                            Rp
                                        </div>
                                        <input
                                            type="number"
                                            name="absent_deduction"
                                            placeholder="0"
                                            value={settings.absent_deduction || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 text-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">Potongan gaji untuk karyawan yang tidak hadir tanpa keterangan resmi.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Hari Libur */}
                    {activeTab === 'holidays' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kelola Hari Libur & Tanggal Merah</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Form Tambah Libur */}
                                <form onSubmit={addHoliday} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tambah Tanggal Libur Baru</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                                            <input
                                                type="date"
                                                required
                                                value={newHolidayDate}
                                                onChange={(e) => setNewHolidayDate(e.target.value)}
                                                className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Libur</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Cth: Hari Raya Idul Fitri"
                                                value={newHolidayDesc}
                                                onChange={(e) => setNewHolidayDesc(e.target.value)}
                                                className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
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
                                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Tambah Tanggal
                                        </button>
                                    </div>
                                </form>

                                {/* List Hari Libur */}
                                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                    {holidays.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500 font-medium">Belum ada hari libur tersimpan.</p>
                                        </div>
                                    ) : (
                                        holidays.map((holiday) => (
                                            <div key={holiday.id} className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition shadow-2xs">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-lg shrink-0 ${holiday.is_national ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-slate-800">{holiday.description}</h4>
                                                            {holiday.is_national && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                                    Nasional
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {formatDate(holiday.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteHoliday(holiday.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Bar (Save Button) */}
                    {activeTab !== 'holidays' && (
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                            <span className="text-xs text-slate-500">Pastikan konfigurasi waktu dan skema denda sudah sesuai.</span>
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition shadow-sm disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Panel */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Building2 className="w-4 h-4" /> Informasi Sistem
                        </div>
                        <h3 className="text-base font-bold">Aturan Presensi & Denda</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Setiap perubahan pada **Jam Kerja** dan **Denda** akan langsung memengaruhi perhitungan keterlambatan dan pemotongan gaji harian secara otomatis.
                        </p>
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                            Terakhir disinkronkan dengan API Server.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;