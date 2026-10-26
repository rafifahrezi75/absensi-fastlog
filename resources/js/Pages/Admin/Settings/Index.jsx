import React, { useState, useEffect, useCallback } from 'react';
import {
    Save,
    Calendar,
    Trash2,
    Plus,
    Clock,
    AlertCircle,
    Loader2,
    Briefcase,
    CheckCircle2,
    X,
    Edit3,
    Lock,
    ShieldCheck
} from 'lucide-react';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import ModalKategoriLembur from './Components/ModalKategoriLembur';
import ModalKategoriTerlambat from '../MasterPayroll/Components/ModalKategoriTerlambat';
import TabKategoriTerlambat from '../MasterPayroll/Components/TabKategoriTerlambat';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('schedule');
    const [errorMsg, setErrorMsg] = useState(null);

    const [settings, setSettings] = useState({
        normal_check_in: '',
        normal_check_out: '',
        normal_tolerance: '',
        saturday_check_in: '',
        saturday_check_out: '',
        saturday_tolerance: '',
    });

    const [holidays, setHolidays] = useState([]);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayDesc, setNewHolidayDesc] = useState('');
    const [isNational, setIsNational] = useState(false);

    const [lateCategories, setLateCategories] = useState([]);
    const [exemptEmployees, setExemptEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);

    const [overtimeCategories, setOvertimeCategories] = useState([]);

    const [modalLateRule, setModalLateRule] = useState({ isOpen: false, data: null });
    const [modalOvertimeRule, setModalOvertimeRule] = useState({ isOpen: false, data: null });

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/settings');
            setSettings(res.data.settings || {});
            setHolidays(res.data.holidays || []);
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal mengambil data pengaturan.');
        }
    }, []);

    const fetchLateRules = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/late-rules');
            setLateCategories(res.data.categories || []);
            setExemptEmployees(res.data.exempt_employees || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchAllEmployees = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/employees');
            setAllEmployees(res.data.employees || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchOvertimeRules = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/overtime-rules');
            setOvertimeCategories(res.data.categories || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                fetchSettings(),
                fetchLateRules(),
                fetchAllEmployees(),
                fetchOvertimeRules()
            ]);
            setLoading(false);
        };
        loadAll();
    }, [fetchSettings, fetchLateRules, fetchAllEmployees, fetchOvertimeRules]);

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

    const openModalLateRule = (data = null) => setModalLateRule({ isOpen: true, data });
    const closeModalLateRule = () => setModalLateRule({ isOpen: false, data: null });

    const handleSaveLateCategory = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/api/admin/late-rules/${formData.id}`, formData);
                showSuccess('Kategori keterlambatan berhasil diperbarui.');
            } else {
                await api.post('/api/admin/late-rules', formData);
                showSuccess('Kategori keterlambatan berhasil ditambahkan.');
            }
            closeModalLateRule();
            fetchLateRules();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan kategori keterlambatan.';
            showError(msg);
        }
    };

    const handleDeleteLateCategory = async (id, nama) => {
        const confirmed = await showConfirm({
            title: 'Hapus Kategori Keterlambatan',
            text: `Apakah Anda yakin ingin menghapus kategori "${nama}"?`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/late-rules/${id}`);
            showSuccess('Kategori keterlambatan berhasil dihapus.');
            fetchLateRules();
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal menghapus kategori keterlambatan.');
        }
    };

    const handleToggleExemption = async (employeeId) => {
        try {
            const res = await api.post(`/api/admin/late-rules/toggle-exemption/${employeeId}`);
            showSuccess(res.data.message || 'Status pengkhususan diperbarui.');
            fetchLateRules();
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal mengubah status pengkhususan.');
        }
    };

    const openModalOvertimeRule = (data = null) => setModalOvertimeRule({ isOpen: true, data });
    const closeModalOvertimeRule = () => setModalOvertimeRule({ isOpen: false, data: null });

    const handleSaveOvertimeCategory = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/api/admin/overtime-rules/${formData.id}`, formData);
                showSuccess('Kategori lembur berhasil diperbarui.');
            } else {
                await api.post('/api/admin/overtime-rules', formData);
                showSuccess('Kategori lembur berhasil ditambahkan.');
            }
            closeModalOvertimeRule();
            fetchOvertimeRules();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan kategori lembur.';
            showError(msg);
        }
    };

    const handleDeleteOvertimeCategory = async (id, nama) => {
        const confirmed = await showConfirm({
            title: 'Hapus Kategori Lembur',
            text: `Apakah Anda yakin ingin menghapus kategori "${nama}"?`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/admin/overtime-rules/${id}`);
            showSuccess('Kategori lembur berhasil dihapus.');
            fetchOvertimeRules();
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal menghapus kategori lembur.');
        }
    };

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val || 0);
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
                    <p className="text-sm text-slate-500">Kelola jam kerja operasional, kategori keterlambatan, aturan lembur, dan kalender libur.</p>
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
                        className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        {activeTab === 'schedule' && <Clock className="w-4 h-4 text-indigo-600" />}
                        {activeTab === 'late_rules' && <Clock className="w-4 h-4 text-indigo-600" />}
                        {activeTab === 'overtime' && <Briefcase className="w-4 h-4 text-amber-600" />}
                        {activeTab === 'holidays' && <Calendar className="w-4 h-4 text-emerald-600" />}
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            {activeTab === 'schedule' && 'Jadwal Operasional'}
                            {activeTab === 'late_rules' && 'Kategori & Aturan Keterlambatan'}
                            {activeTab === 'overtime' && 'Aturan Lembur Flat / Ritase'}
                            {activeTab === 'holidays' && 'Kelola Hari Libur & Tanggal Merah'}
                        </h2>
                    </div>

                    <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg w-full lg:w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab('schedule')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Jam Kerja
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('late_rules')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'late_rules' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            Kategori Terlambat
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('overtime')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'overtime' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            Aturan Lembur
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('holidays')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'holidays' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
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

                {activeTab === 'late_rules' && (
                    <div className="p-6">
                        <TabKategoriTerlambat
                            categories={lateCategories}
                            exemptEmployees={exemptEmployees}
                            allEmployees={allEmployees}
                            onOpenModal={openModalLateRule}
                            onDeleteCategory={handleDeleteLateCategory}
                            onToggleExemption={handleToggleExemption}
                        />
                    </div>
                )}

                {activeTab === 'overtime' && (
                    <div className="p-6 space-y-6">
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                            <div>
                                <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                                    <Briefcase className="w-4 h-4 text-amber-600" />
                                    <span>Standar Aturan Lembur Flat / Ritase</span>
                                </div>
                                <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                                    Kelola standar kategori lembur dinamis untuk Staf Kantor, Staf Lapangan, maupun divisi lainnya. Setiap standar dapat disesuaikan jam mulai dan tarif flat harian untuk hari kerja, akhir pekan, dan hari libur nasional.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => openModalOvertimeRule(null)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Kategori Lembur
                            </button>
                        </div>

                        {overtimeCategories.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 font-medium">Belum ada standar kategori lembur terdaftar.</p>
                                <button
                                    type="button"
                                    onClick={() => openModalOvertimeRule(null)}
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Standar Sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {overtimeCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
                                    >
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-sm text-slate-900">{cat.nama}</h3>
                                                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                            {cat.kode}
                                                        </span>
                                                        {cat.is_default && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                                Default
                                                            </span>
                                                        )}
                                                        {cat.is_locked && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                                                <Lock className="w-3 h-3 text-slate-400" /> Terkunci
                                                            </span>
                                                        )}
                                                    </div>
                                                    {cat.deskripsi && (
                                                        <p className="text-xs text-slate-500 leading-snug">{cat.deskripsi}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModalOvertimeRule(cat)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                                        title="Edit Standar Kategori"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {!cat.is_locked && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteOvertimeCategory(cat.id, cat.nama)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                            title="Hapus Standar Kategori"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                                        Departemen Terkait:
                                                    </span>
                                                    {Array.isArray(cat.departemen_list) && cat.departemen_list.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {cat.departemen_list.map((dept, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                                                                >
                                                                    {dept}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">Semua Departemen (Fallback / Umum)</span>
                                                    )}
                                                </div>

                                                {Array.isArray(cat.jabatan_keywords) && cat.jabatan_keywords.length > 0 && (
                                                    <div>
                                                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                                            Kata Kunci Jabatan:
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {cat.jabatan_keywords.map((kw, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-100"
                                                                >
                                                                    {kw}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                        Standby Daily
                                                    </span>
                                                    <div className="text-xs font-bold text-slate-800 mt-1">
                                                        {formatIDR(cat.daily_rate)} <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        Mulai {cat.daily_start || '17:00'} WIB
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                        Standby Weekends
                                                    </span>
                                                    <div className="text-xs font-bold text-slate-800 mt-1">
                                                        {formatIDR(cat.weekend_rate)} <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        Mulai {cat.weekend_start || '13:00'} WIB
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                        Hari Besar
                                                    </span>
                                                    <div className="text-xs font-bold text-slate-800 mt-1">
                                                        {formatIDR(cat.holiday_rate)} <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        Flat Libur Nasional
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

            <ModalKategoriTerlambat
                isOpen={modalLateRule.isOpen}
                onClose={closeModalLateRule}
                onSave={handleSaveLateCategory}
                initialData={modalLateRule.data}
            />

            <ModalKategoriLembur
                isOpen={modalOvertimeRule.isOpen}
                onClose={closeModalOvertimeRule}
                onSave={handleSaveOvertimeCategory}
                data={modalOvertimeRule.data}
            />
        </div>
    );
};

export default Settings;