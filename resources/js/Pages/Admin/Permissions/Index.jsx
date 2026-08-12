import React, { useState, useCallback } from 'react';
import { FileCheck2, Search, Download, Clock, Check, X, Paperclip, Stethoscope, Briefcase, Image as ImageIcon } from 'lucide-react';
import ModalPreview from './Components/ModalPreview';

const Permissions = () => {
    const [modalData, setModalData] = useState({ isOpen: false, title: '', filename: '' });

    const openModalPreview = useCallback((title, filename) => {
        setModalData({ isOpen: true, title, filename });
    }, []);

    const closeModalPreview = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Persetujuan Izin & Cuti</h1>
                    <p className="text-sm text-slate-500">Tinjau dan proses pengajuan izin, sakit, cuti, dinas, atau lembur dari karyawan.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm w-fit">
                    <Download className="w-4 h-4" /> Export Laporan
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Menunggu Diproses</span>
                        <div className="p-1.5 bg-indigo-100 rounded-lg"><Clock className="w-4 h-4 text-indigo-700" /></div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900">12</div>
                    <span className="text-[11px] text-indigo-600">Perlu tinjauan segera</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Izin / Cuti</span>
                        <div className="p-1.5 bg-slate-50 rounded-lg"><FileCheck2 className="w-4 h-4 text-slate-500" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">8</div>
                    <span className="text-[11px] text-slate-500">Bulan ini</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sakit</span>
                        <div className="p-1.5 bg-slate-50 rounded-lg"><Stethoscope className="w-4 h-4 text-slate-500" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">4</div>
                    <span className="text-[11px] text-slate-500">Bulan ini</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dinas & Lembur</span>
                        <div className="p-1.5 bg-slate-50 rounded-lg"><Briefcase className="w-4 h-4 text-slate-500" /></div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">15</div>
                    <span className="text-[11px] text-slate-500">Bulan ini</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari nama karyawan atau jenis izin..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600">
                    <option value="">Semua Kategori</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="cuti">Cuti</option>
                    <option value="dinas">Dinas Luar</option>
                    <option value="lembur">Lembur</option>
                </select>
                <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600">
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Karyawan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Kategori</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Waktu / Tanggal</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Keterangan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Lampiran</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            
                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">SA</div>
                                        <div>
                                            <div className="font-semibold text-sm">Siti Aminah</div>
                                            <div className="text-xs text-slate-400">Finance & Accounting</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                        <Stethoscope className="w-3.5 h-3.5" /> Sakit
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                    <div className="font-medium text-slate-800">10 Agt 2026</div>
                                    <div className="text-slate-400">1 Hari</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                                    Demam tinggi dan flu, disarankan istirahat oleh dokter.
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => openModalPreview('Surat Dokter - Siti Aminah', 'Surat_Dokter_Siti.jpg')} className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                        <Paperclip className="w-3.5 h-3.5" /> Surat_Dokter.jpg
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Setujui
                                        </button>
                                        <button className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1">
                                            <X className="w-3.5 h-3.5" /> Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                        <div>
                                            <div className="font-semibold text-sm">Budi Santoso</div>
                                            <div className="text-xs text-slate-400">Software Engineer</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Lembur
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                    <div className="font-medium text-slate-800">10 Agt 2026</div>
                                    <div className="text-slate-400">17:00 - 20:00 (3 Jam)</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                                    Penyelesaian modul payment gateway deadline minggu ini.
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs text-slate-400">-</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Setujui
                                        </button>
                                        <button className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1">
                                            <X className="w-3.5 h-3.5" /> Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalPreview isOpen={modalData.isOpen} onClose={closeModalPreview} data={modalData} />
        </div>
    );
};

export default Permissions;
