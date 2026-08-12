import React, { useState, useCallback } from 'react';
import { Download, Calculator, Search, CheckCircle, FileText, Clock, Printer, X } from 'lucide-react';
import ModalSlip from './Components/ModalSlip';

const Payroll = () => {
    const [modalData, setModalData] = useState({ isOpen: false, nama: '', nik: '', jabatan: '', gapok: '', bonus: '', potongan: '', thp: '' });

    const openModalSlip = useCallback((nama, nik, jabatan, gapok, bonus, potongan, thp) => {
        setModalData({ isOpen: true, nama, nik, jabatan, gapok, bonus, potongan, thp });
    }, []);

    const closeModalSlip = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Penggajian & Payroll</h1>
                    <p className="text-sm text-slate-500">Kalkulasi gaji otomatis berdasarkan rekap absensi, keterlambatan, dan lembur.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Download className="w-4 h-4" /> Export Slip Gaji
                    </button>
                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Calculator className="w-4 h-4" /> Hitung Payroll Bulan Ini
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Output Gaji (Agustus 2026)</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">Rp 284.500.000</div>
                    <span className="text-[11px] text-slate-500">48 Karyawan</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Lembur Diterima</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">Rp 12.850.000</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Berdasarkan Jam Lembur Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Potongan Absensi</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">Rp 3.200.000</div>
                    <span className="text-[11px] text-rose-600 font-medium">Terlambat & Alpa</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Periode Bulan</label>
                        <input type="month" defaultValue="2026-08" className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Departemen / Divisi</label>
                        <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & General Affair</option>
                            <option value="finance">Finance & Accounting</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status Pembayaran</label>
                        <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Semua Status</option>
                            <option value="paid">Sudah Dibayar</option>
                            <option value="pending">Draft / Belum Transfer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input type="text" placeholder="Nama / NIK..." className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">Karyawan</th>
                                <th className="px-6 py-3.5">Gaji Pokok</th>
                                <th className="px-6 py-3.5">Bonus & Lembur</th>
                                <th className="px-6 py-3.5">Potongan</th>
                                <th className="px-6 py-3.5">Total Diterima (THP)</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            
                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                        <div>
                                            <div className="font-semibold text-sm">Budi Santoso</div>
                                            <div className="text-xs text-slate-400">IT & Tech • Software Engineer</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">Rp 8.000.000</td>
                                <td className="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">+ Rp 750.000</td>
                                <td className="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">- Rp 50.000</td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">Rp 8.700.000</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button onClick={() => openModalSlip('Budi Santoso', '20260101', 'Software Engineer', 'Rp 8.000.000', 'Rp 750.000', 'Rp 50.000', 'Rp 8.700.000')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Slip Gaji
                                    </button>
                                </td>
                            </tr>

                            <tr className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                        <div>
                                            <div className="font-semibold text-sm">Ahmad Rizky</div>
                                            <div className="text-xs text-slate-400">Marketing • Digital Marketer</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">Rp 6.500.000</td>
                                <td className="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">+ Rp 300.000</td>
                                <td className="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">- Rp 150.000</td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">Rp 6.650.000</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Draft
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button onClick={() => openModalSlip('Ahmad Rizky', '20260104', 'Digital Marketer', 'Rp 6.500.000', 'Rp 300.000', 'Rp 150.000', 'Rp 6.650.000')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Slip Gaji
                                    </button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            <ModalSlip isOpen={modalData.isOpen} onClose={closeModalSlip} data={modalData} />
        </div>
    );
};

export default Payroll;
