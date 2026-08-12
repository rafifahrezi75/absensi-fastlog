import React, { useState, useCallback, useMemo } from 'react';
import { Download, Plus, Search, Calendar, Filter, FileText, Check, X, Clock, Fingerprint, RefreshCw } from 'lucide-react';
import ModalKoreksi from './Components/ModalKoreksi';
import ModalTambahManual from './Components/ModalTambah';

const Attendance = () => {
    // State Modal
    const [modalData, setModalData] = useState({ isOpen: false, nama: '', masuk: '', keluar: '' });
    const [isTambahOpen, setIsTambahOpen] = useState(false);

    // State Filters
    const [filterTanggal, setFilterTanggal] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const openModalKoreksi = useCallback((nama, masuk, keluar) => {
        setModalData({ isOpen: true, nama, masuk, keluar });
    }, []);

    const closeModalKoreksi = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Master Data Dummy Absensi
    const rawData = useMemo(() => [
        { 
            id: 1, 
            nama: 'Budi Santoso', 
            nik: '20260101', 
            finger: '101', 
            initials: 'BS', 
            dept: 'it', 
            tgl: '2026-08-10', 
            tglDisplay: '10 Agt 2026', 
            in: '07:55:10', 
            out: '17:05:30', 
            dur: '9j 10m', 
            status: 'ontime', 
            inStatus: 'Tepat', 
            outStatus: 'Tepat', 
            locIn: 'Mesin Lobi' 
        },
        { 
            id: 2, 
            nama: 'Ahmad Rizky', 
            nik: '20260104', 
            finger: '104', 
            initials: 'AR', 
            dept: 'hrd', 
            tgl: '2026-08-10', 
            tglDisplay: '10 Agt 2026', 
            in: '08:14:22', 
            out: '', 
            dur: '-', 
            status: 'late', 
            inStatus: 'Telat 14 Mnt', 
            outStatus: 'Belum Tap', 
            locIn: 'Mesin Lobi' 
        },
        { 
            id: 3, 
            nama: 'Siti Aminah', 
            nik: '20260108', 
            finger: '108', 
            initials: 'SA', 
            dept: 'finance', 
            tgl: '2026-08-10', 
            tglDisplay: '10 Agt 2026', 
            in: '07:45:00', 
            out: '17:00:10', 
            dur: '9j 15m', 
            status: 'ontime', 
            inStatus: 'Tepat', 
            outStatus: 'Tepat', 
            locIn: 'Mesin Lobi' 
        },
        { 
            id: 4, 
            nama: 'Dewi Lestari', 
            nik: '20260112', 
            finger: '112', 
            initials: 'DL', 
            dept: 'marketing', 
            tgl: '2026-08-09', 
            tglDisplay: '09 Agt 2026', 
            in: '-', 
            out: '-', 
            dur: '-', 
            status: 'izin', 
            inStatus: 'Izin Sakit', 
            outStatus: '-', 
            locIn: 'Web Input' 
        },
    ], []);

    // Logika Filter Data
    const filteredData = useMemo(() => {
        return rawData.filter((item) => {
            // Filter Tanggal
            const matchTanggal = filterTanggal ? item.tgl === filterTanggal : true;

            // Filter Departemen
            const matchDept = filterDept ? item.dept === filterDept : true;

            // Filter Status
            const matchStatus = filterStatus ? item.status === filterStatus : true;

            // Filter Search Query (Nama atau NIK)
            const matchSearch = searchQuery
                ? item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.nik.includes(searchQuery)
                : true;

            return matchTanggal && matchDept && matchStatus && matchSearch;
        });
    }, [rawData, filterTanggal, filterDept, filterStatus, searchQuery]);

    // Reset Semua Filter
    const handleResetFilter = () => {
        setFilterTanggal('');
        setFilterDept('');
        setFilterStatus('');
        setSearchQuery('');
    };

    const isFilterActive = filterTanggal || filterDept || filterStatus || searchQuery;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Log Absensi</h1>
                    <p className="text-sm text-slate-500">Pantau kehadiran harian, keterlambatan, jam pulang, dan sinkronisasi mesin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => setIsTambahOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
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
                    {/* Filter Tanggal */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Absen</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={filterTanggal}
                                onChange={(e) => setFilterTanggal(e.target.value)}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer" 
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Filter Departemen */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Departemen</label>
                        <select 
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & General Affair</option>
                            <option value="finance">Finance & Accounting</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>

                    {/* Filter Status Kehadiran */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status Kehadiran</label>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="ontime">Hadir Tepat Waktu</option>
                            <option value="late">Terlambat</option>
                            <option value="izin">Izin / Sakit / Cuti</option>
                        </select>
                    </div>

                    {/* Cari Karyawan */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nama atau NIK..." 
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Tombol Reset Filter jika ada filter yang aktif */}
                {isFilterActive && (
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
                        </button>
                    </div>
                )}
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
                            {filteredData.length > 0 ? (
                                filteredData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {row.initials}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{row.nama}</div>
                                                    <div className="text-xs text-slate-400">NIK: {row.nik} • ID Finger: {row.finger}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">{row.tglDisplay}</td>
                                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                            <div className={`font-bold ${row.status === 'late' ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit' : 'text-slate-800'}`}>
                                                {row.in}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${row.status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {row.status === 'ontime' && <Check className="w-3 h-3" />}
                                                {row.inStatus}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                            <div className="font-bold text-slate-800">{row.out || <span className="text-slate-400 font-normal">Belum Tap</span>}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{row.outStatus}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {row.status === 'ontime' && (
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                                                    Hadir ({row.dur})
                                                </span>
                                            )}
                                            {row.status === 'late' && (
                                                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                                    {row.inStatus}
                                                </span>
                                            )}
                                            {row.status === 'izin' && (
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                                    Izin / Sakit
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> {row.locIn}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button 
                                                onClick={() => openModalKoreksi(row.nama, row.in, row.out)} 
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer" 
                                                title="Koreksi Data"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-xs">
                                        Data absensi tidak ditemukan berdasarkan filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div>Menampilkan {filteredData.length} dari {rawData.length} data absensi</div>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium">1</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Next</button>
                    </div>
                </div>
            </div>

            {/* MODAL COMPONENTS */}
            <ModalKoreksi isOpen={modalData.isOpen} onClose={closeModalKoreksi} data={modalData} />
            <ModalTambahManual isOpen={isTambahOpen} onClose={() => setIsTambahOpen(false)} />
        </div>
    );
};

export default Attendance;