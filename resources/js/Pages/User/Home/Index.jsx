import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, AlertCircle, XCircle, Thermometer, Briefcase, Clock } from 'lucide-react';
import PengajuanModal from '../../../Components/PengajuanModal';

const Home = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('Izin');

    const openForm = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const riwayat = [
        { id: 1, tanggal: 'Senin, 10 Agu 2026', ket: 'Acara Keluarga', status: 'Izin', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600' },
        { id: 2, tanggal: 'Jumat, 7 Agu 2026', ket: 'Meeting Klien Cabang', status: 'Dinas', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600' },
        { id: 3, tanggal: 'Rabu, 5 Agu 2026', ket: 'Demam Berdarah', status: 'Sakit', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <div className="space-y-5">
            {/* Greeting Banner */}
            <div className="bg-slate-900 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                    <p className="text-white/60 text-xs mb-1">Selamat Siang,</p>
                    <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                        Budi Santoso <span>👋</span>
                    </h2>
                    <p className="text-white/50 text-xs mt-1">Desainer Grafis · Kreatif</p>
                </div>
                <div className="relative text-left md:text-right">
                    <p className="text-orange-500 text-2xl md:text-3xl font-bold tracking-wide font-mono">
                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Izin</p>
                        <p className="text-lg font-bold text-blue-600">1 <span className="text-xs font-medium text-gray-400">pengajuan</span></p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Sakit</p>
                        <p className="text-lg font-bold text-rose-600">1 <span className="text-xs font-medium text-gray-400">pengajuan</span></p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                        <Thermometer className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Dinas Luar</p>
                        <p className="text-lg font-bold text-orange-600">1 <span className="text-xs font-medium text-gray-400">pengajuan</span></p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Briefcase className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => openForm('Izin')} className="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
                    <FileText className="w-4 h-4" />
                    <span>Ajukan Izin</span>
                </button>

                <button onClick={() => openForm('Sakit')} className="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
                    <Thermometer className="w-4 h-4" />
                    <span>Ajukan Sakit</span>
                </button>

                <button onClick={() => openForm('Dinas')} className="flex items-center justify-center gap-2.5 py-3.5 bg-orange-50 border-2 border-transparent text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>Dinas Luar</span>
                </button>
            </div>

            {/* Riwayat Terbaru */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Riwayat Terbaru</h3>
                </div>

                <div className="space-y-0.5">
                    {riwayat.map((item, index) => (
                        <div key={item.id} className={`flex items-center justify-between py-3 ${index !== riwayat.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`}></div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 text-xs">{item.tanggal}</h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{item.ket}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                {item.jam && <span className="text-[11px] text-gray-400 font-medium hidden sm:block">{item.jam}</span>}
                                <span className={`${item.badge} font-semibold px-2.5 py-0.5 rounded-full text-[11px]`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Pengajuan */}
            <PengajuanModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                type={modalType} 
            />
        </div>
    );
};

export default Home;
