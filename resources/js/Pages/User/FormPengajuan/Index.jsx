import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

const FormPengajuan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formType, setFormType] = useState('Izin');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');
        if (type) setFormType(type);
    }, [location]);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Pengajuan ${formType} berhasil disubmit (Simulasi)!`);
        navigate('/user/riwayat');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate('/user/home')} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Form Pengajuan</h2>
                    <p className="text-sm text-gray-500">Isi data dengan lengkap dan benar</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Pengajuan</label>
                        <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition">
                            <option value="Izin">Izin (Keperluan Pribadi)</option>
                            <option value="Sakit">Sakit (Sertakan Surat Dokter jika &gt; 1 hari)</option>
                            <option value="Dinas">Dinas Luar Kota</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Mulai</label>
                            <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Selesai</label>
                            <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / Alasan</label>
                        <textarea required rows="4" placeholder="Jelaskan alasan pengajuan Anda di sini..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition resize-none"></textarea>
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Kirim Pengajuan
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormPengajuan;
