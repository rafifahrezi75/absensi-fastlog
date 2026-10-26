import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UploadCloud, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/api';

const FormPengajuan = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];
    const [formType, setFormType] = useState('Izin');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [keterangan, setKeterangan] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [employeeData, setEmployeeData] = useState(null);
    const [overtimeRules, setOvertimeRules] = useState(null);
    const [tipeLembur, setTipeLembur] = useState('DAILY');
    const [jamMulaiLembur, setJamMulaiLembur] = useState('');

    const isLapangan = employeeData?.kategori_staf === 'LAPANGAN' || overtimeRules?.staff_category === 'LAPANGAN';
    const dailyRate = overtimeRules?.daily_rate ?? 50000;
    const weekendRate = overtimeRules?.weekend_rate ?? 75000;
    const holidayRate = overtimeRules?.holiday_rate ?? 300000;
    const dailyStart = overtimeRules?.daily_start ?? (isLapangan ? '16:31' : '17:00');
    const weekendStart = overtimeRules?.weekend_start ?? (isLapangan ? '12:01' : '13:00');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/api/user/dashboard');
                if (res.data) {
                    setEmployeeData(res.data.employee || null);
                    setOvertimeRules(res.data.overtime_rules || null);
                }
            } catch (err) { }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');
        if (type) {
            const formatted = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            setFormType(formatted);
        }
    }, [location]);

    useEffect(() => {
        if (formType === 'Lembur' && startDate) {
            const d = new Date(startDate + 'T00:00:00');
            const day = d.getDay();
            if (day === 0 || day === 6) {
                setTipeLembur('WEEKENDS');
            } else {
                setTipeLembur('DAILY');
            }
        }
    }, [startDate, formType]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!keterangan.trim()) {
            setErrorMsg('Keterangan atau alasan pengajuan wajib diisi.');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);

            const formData = new FormData();
            formData.append('category', formType.toLowerCase());
            formData.append('tanggal_mulai', startDate);
            formData.append('tanggal_selesai', endDate);
            formData.append('keterangan', keterangan);

            if (formType === 'Lembur') {
                formData.append('tipe_lembur', tipeLembur);
                if (jamMulaiLembur) {
                    formData.append('jam_mulai', jamMulaiLembur);
                }
            }

            if (selectedFile) {
                formData.append('lampiran', selectedFile);
            }

            const res = await api.post('/api/user/permissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/user/riwayat', {
                state: {
                    flashMessage: res.data.message || `Pengajuan ${formType} berhasil dikirimkan ke admin.`
                }
            });
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal mengirimkan pengajuan ke admin.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <button
                    type="button"
                    onClick={() => navigate('/user/home')}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Form Pengajuan</h2>
                    <p className="text-sm text-gray-500">Permohonan izin, sakit, dinas, cuti, atau lembur ke bagian admin</p>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Pengajuan</label>
                        <select
                            value={formType}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormType(val);
                                if (val === 'Dinas' && !keterangan.trim()) {
                                    setKeterangan("Instansi / Tempat Tujuan: \nKeperluan / Agenda: \nEstimasi Jam: \nKendaraan: ");
                                }
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="Izin">Izin (Keperluan Pribadi)</option>
                            <option value="Sakit">Sakit (Lampirkan Surat Dokter)</option>
                            <option value="Dinas">Dinas Luar Kantor</option>
                            <option value="Cuti">Cuti Tahunan / Khusus</option>
                            <option value="Lembur">Lembur Pekerjaan</option>
                        </select>
                    </div>

                    {formType === 'Lembur' && (
                        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 space-y-3.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-xs font-bold text-purple-900">Pilih Kategori Lembur</label>
                                    <p className="text-[11px] text-purple-700">
                                        Sistem Lembur Flat/Ritase ({isLapangan ? 'Staf Lapangan / Operasional' : 'Staf Kantor'})
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200/70 text-purple-800">
                                    {isLapangan ? 'Operasional' : 'Kantor'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setTipeLembur('DAILY')}
                                    className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'DAILY'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                        }`}
                                >
                                    <div>
                                        <p className="text-xs font-bold">Standby Daily</p>
                                        <p className={`text-[10px] mt-0.5 ${tipeLembur === 'DAILY' ? 'text-purple-100' : 'text-slate-500'}`}>
                                            Senin – Jumat
                                        </p>
                                        <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'DAILY' ? 'text-purple-200' : 'text-purple-600'}`}>
                                            Mulai {dailyStart} WIB
                                        </p>
                                    </div>
                                    <p className={`text-xs font-bold mt-2.5 ${tipeLembur === 'DAILY' ? 'text-amber-300' : 'text-purple-700'}`}>
                                        Rp {Number(dailyRate).toLocaleString('id-ID')}
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipeLembur('WEEKENDS')}
                                    className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'WEEKENDS'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                        }`}
                                >
                                    <div>
                                        <p className="text-xs font-bold">Standby Weekends</p>
                                        <p className={`text-[10px] mt-0.5 ${tipeLembur === 'WEEKENDS' ? 'text-purple-100' : 'text-slate-500'}`}>
                                            Sabtu / Minggu
                                        </p>
                                        <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'WEEKENDS' ? 'text-purple-200' : 'text-purple-600'}`}>
                                            Mulai {weekendStart} WIB
                                        </p>
                                    </div>
                                    <p className={`text-xs font-bold mt-2.5 ${tipeLembur === 'WEEKENDS' ? 'text-amber-300' : 'text-purple-700'}`}>
                                        Rp {Number(weekendRate).toLocaleString('id-ID')}
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipeLembur('HARI_BESAR')}
                                    className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'HARI_BESAR'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                        }`}
                                >
                                    <div>
                                        <p className="text-xs font-bold">Hari Besar</p>
                                        <p className={`text-[10px] mt-0.5 ${tipeLembur === 'HARI_BESAR' ? 'text-purple-100' : 'text-slate-500'}`}>
                                            Libur Nasional
                                        </p>
                                        <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'HARI_BESAR' ? 'text-purple-200' : 'text-purple-600'}`}>
                                            Tarif Flat Harian
                                        </p>
                                    </div>
                                    <p className={`text-xs font-bold mt-2.5 ${tipeLembur === 'HARI_BESAR' ? 'text-amber-300' : 'text-purple-700'}`}>
                                        Rp {Number(holidayRate).toLocaleString('id-ID')}
                                    </p>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-purple-900 mb-1">Jam Mulai Lembur</label>
                                    <input
                                        type="time"
                                        value={jamMulaiLembur}
                                        onChange={(e) => setJamMulaiLembur(e.target.value)}
                                        placeholder={tipeLembur === 'DAILY' ? dailyStart : tipeLembur === 'WEEKENDS' ? weekendStart : '08:00'}
                                        className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="flex flex-col justify-end text-[11px] text-purple-700 pb-1">
                                    <span>Minimal jam: <strong className="text-purple-900">{tipeLembur === 'DAILY' ? dailyStart : tipeLembur === 'WEEKENDS' ? weekendStart : 'Fleksibel'}</strong> WIB</span>
                                    <span>Tarif Flat: <strong className="text-purple-900 font-bold">Rp {Number(tipeLembur === 'DAILY' ? dailyRate : tipeLembur === 'WEEKENDS' ? weekendRate : holidayRate).toLocaleString('id-ID')} / hari</strong></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Mulai</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Selesai</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Keterangan / Alasan</label>
                            {formType === 'Dinas' && (
                                <span className="text-xs text-orange-600 font-medium">Format Dinas Luar Kantor</span>
                            )}
                        </div>
                        <textarea
                            required
                            rows={formType === 'Dinas' ? 5 : 4}
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder={
                                formType === 'Dinas'
                                    ? "Instansi / Tempat Tujuan: \nKeperluan / Agenda: \nEstimasi Jam: \nKendaraan: "
                                    : "Jelaskan secara rinci alasan atau keperluan pengajuan Anda..."
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition resize-none font-mono text-xs"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Lampiran Dokumen / Bukti Foto (Opsional)
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                                <p className="text-xs text-gray-600 font-medium">Klik untuk memilih file lampiran (Foto / PDF)</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Maksimal ukuran file 10MB</p>
                                {fileName && (
                                    <span className="text-xs text-orange-600 font-semibold mt-2 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 truncate max-w-xs">
                                        {fileName}
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-orange-500/20 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{submitting ? 'Mengirimkan Pengajuan...' : 'Kirim Pengajuan ke Admin'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormPengajuan;
