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

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');
        if (type) {
            const formatted = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            setFormType(formatted);
        }
    }, [location]);

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
                            onChange={(e) => setFormType(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="Izin">Izin (Keperluan Pribadi)</option>
                            <option value="Sakit">Sakit (Lampirkan Surat Dokter)</option>
                            <option value="Dinas">Dinas Luar Kantor</option>
                            <option value="Cuti">Cuti Tahunan / Khusus</option>
                            <option value="Lembur">Lembur Pekerjaan</option>
                        </select>
                    </div>

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
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / Alasan</label>
                        <textarea 
                            required 
                            rows="4" 
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Jelaskan secara rinci alasan atau keperluan pengajuan Anda..." 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition resize-none"
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
