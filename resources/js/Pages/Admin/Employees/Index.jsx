import React, { useState, useCallback } from 'react';
import { Users, Plus, Search, Download, CheckCircle2, Edit3, Trash2, X } from 'lucide-react';
import ModalKaryawan from './Components/ModalKaryawan';

const Employees = () => {
    const [modalData, setModalData] = useState({ isOpen: false, nama: '', nik: '', idFinger: '', dept: '', jabatan: '' });

    const openModalKaryawan = useCallback((nama = '', nik = '', idFinger = '', dept = '', jabatan = '') => {
        setModalData({ isOpen: true, nama, nik, idFinger, dept, jabatan });
    }, []);

    const closeModalKaryawan = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Karyawan</h1>
                    <p className="text-sm text-slate-500">Kelola informasi pegawai dan pemetaan ID mesin fingerprint (Jam Kerja: 08:00 - 16:30 WIB).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button onClick={() => openModalKaryawan()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Plus className="w-4 h-4" /> Tambah Karyawan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">48</div>
                    <span className="text-[11px] text-slate-500">Pegawai Terdaftar</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Terhubung Mesin</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">46</div>
                    <span className="text-[11px] text-emerald-600 font-medium">ID Fingerprint Mapping Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/50">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Belum Setting ID</span>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    </div>
                    <div className="text-2xl font-bold text-rose-700 mt-1">2</div>
                    <span className="text-[11px] text-rose-600 font-medium">Segera assign ID Fingerprint!</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari nama atau NIK..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600">
                    <option value="">Semua Departemen</option>
                    <option value="it">IT & Tech</option>
                    <option value="marketing">Marketing</option>
                    <option value="hrd">HRD & GA</option>
                </select>
                <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600">
                    <option value="">Semua Status Sinkronisasi</option>
                    <option value="synced">Sudah Tersinkron</option>
                    <option value="unsynced">Belum Tersinkron (Error)</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Pegawai</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">ID Fingerprint</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Departemen</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jabatan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Status Sync</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                        <div>
                                            <div className="font-semibold text-sm">Budi Santoso</div>
                                            <div className="text-xs text-slate-400">NIK: 20260101</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                                    <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">101</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                                    IT & Tech
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                    Software Engineer
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Sync Mesin
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openModalKaryawan('Budi Santoso', '20260101', '101', 'IT & Tech', 'Software Engineer')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Data">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                        <div>
                                            <div className="font-semibold text-sm">Ahmad Rizky</div>
                                            <div className="text-xs text-slate-400">NIK: 20260104</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                                    <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">104</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                                    Marketing
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                    Digital Marketer
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Sync Mesin
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openModalKaryawan('Ahmad Rizky', '20260104', '104', 'Marketing', 'Digital Marketer')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Data">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalKaryawan isOpen={modalData.isOpen} onClose={closeModalKaryawan} data={modalData} />
        </div>
    );
};

export default Employees;
