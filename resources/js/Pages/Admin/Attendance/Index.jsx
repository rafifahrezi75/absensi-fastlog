import React, { useState, useCallback, useMemo } from 'react';
import { Download, Plus, Search, Calendar, Filter, FileText, Check, X, Clock, Fingerprint, Globe, MapPin } from 'lucide-react';
import ModalKoreksi from './Components/ModalKoreksi';

const Attendance = () => {
    const [modalData, setModalData] = useState({ isOpen: false, nama: '', masuk: '', keluar: '' });

    const openModalKoreksi = useCallback((nama, masuk, keluar) => {
        setModalData({ isOpen: true, nama, masuk, keluar });
    }, []);

    const closeModalKoreksi = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Memoize the table data
    const dummyData = useMemo(() => [
        { id: 1, type: 'hadir', nama: 'Budi Santoso', nik: '20260101', finger: '101', initials: 'BS', tgl: '10 Agt 2026', in: '07:55:10', out: '17:05:30', dur: '9j 10m', inStatus: 'Tepat', outStatus: 'Tepat', locIn: 'Mesin Lobi', locOut: 'Mesin Lobi' },
    ], []);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Log Absensi</h1>
                    <p className="text-sm text-slate-500">Pantau kehadiran harian, keterlambatan, jam pulang, dan sinkronisasi mesin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Plus className="w-4 h-4" /> Tambah Manual
                    </button>
                </div>
            </div>

            {/* WIDGET RINGKASAN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">42 <span className="text-sm font-medium text-slate-500">/ 48</span></div>
                    <span className="text-[11px] text-emerald-600 font-medium">+2 dari kemarin</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Terlambat</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">5</div>
                    <span className="text-[11px] text-rose-600 font-medium">Potongan akumulatif aktif</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Izin / Sakit</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">2</div>
                    <span className="text-[11px] text-blue-600 font-medium">Disetujui Admin</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Belum Tap Pulang</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">4</div>
                    <span className="text-[11px] text-amber-600 font-medium">Menunggu jam pulang</span>
                </div>
            </div>

            {/* BAR FILTER */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Absen</label>
                        <div className="relative">
                            <input type="date" defaultValue="2026-08-10" className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Departemen</label>
                        <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & General Affair</option>
                            <option value="finance">Finance & Accounting</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status Kehadiran</label>
                        <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Semua Status</option>
                            <option value="ontime">Hadir Tepat Waktu</option>
                            <option value="late">Terlambat</option>
                            <option value="absen">Tidak Hadir / Alpha</option>
                            <option value="izin">Izin / Sakit / Cuti</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input type="text" placeholder="Nama atau NIK..." className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL DATA ABSENSI */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Karyawan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Tanggal</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jam Masuk</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jam Keluar</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Keterangan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Log Lokasi</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            
                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                        <div>
                                            <div className="font-semibold text-sm">Budi Santoso</div>
                                            <div className="text-xs text-slate-400">NIK: 20260101 • ID Finger: 101</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">10 Agt 2026</td>
                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                    <div className="font-bold text-slate-800">07:55:10</div>
                                    <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> Tepat</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                    <div className="font-bold text-slate-800">17:05:30</div>
                                    <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> Tepat</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                                        Hadir (9j 10m)
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> Mesin Lobi
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button onClick={() => openModalKoreksi('Budi Santoso', '07:55', '17:05')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Koreksi Data">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>

                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                        <div>
                                            <div className="font-semibold text-sm">Ahmad Rizky</div>
                                            <div className="text-xs text-slate-400">NIK: 20260104 • ID Finger: 104</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">10 Agt 2026</td>
                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">08:14:22</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                    <span className="text-slate-400 bg-slate-50 px-2 py-1 rounded">Belum Tap</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                        Telat 14 Mnt
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> Mesin Lobi
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button onClick={() => openModalKoreksi('Ahmad Rizky', '08:14', '17:01')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Koreksi Data">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div>Menampilkan 1 - 4 dari 104 data absensi</div>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium">1</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">2</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">3</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Next</button>
                    </div>
                </div>
            </div>

            <ModalKoreksi isOpen={modalData.isOpen} onClose={closeModalKoreksi} data={modalData} />
        </div>
    );
};

export default Attendance;
