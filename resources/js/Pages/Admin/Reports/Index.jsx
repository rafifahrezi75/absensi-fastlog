import React from 'react';
import { FileSpreadsheet, Printer, Search } from 'lucide-react';

const Reports = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Laporan Rekap Presensi & OT</h1>
                    <p className="text-sm text-slate-500">Rekapitulasi kehadiran dan jam lembur (Overtime) karyawan per periode.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                    </button>
                    <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Printer className="w-4 h-4" /> Cetak PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                        <input type="date" defaultValue="2026-08-01" className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                        <input type="date" defaultValue="2026-08-15" className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Departemen</label>
                        <select className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & GA</option>
                            <option value="finance">Finance</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-sm">
                            Tampilkan Laporan
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 border-r border-slate-200 pr-4">Keterangan Status:</span>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px]">H</span>
                    <span>Hadir Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px]">T</span>
                    <span>Terlambat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px]">OT</span>
                    <span>Overtime (Lembur)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px]">I</span>
                    <span>Izin / Cuti</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-[10px]">S</span>
                    <span>Sakit</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-slate-200 text-slate-500 border border-slate-300 flex items-center justify-center text-[10px]">L</span>
                    <span>Libur Pekan / Nasional</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-200 text-center">
                        <thead>
                            <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                                <th className="px-4 py-2.5 text-left border-r border-slate-800 min-w-[180px] sticky left-0 bg-slate-900 z-10" rowSpan="2">Karyawan</th>
                                <th className="py-2 border-r border-slate-800" colSpan="15">Agustus 2026</th>
                                <th className="px-3 py-2 border-l border-slate-800 text-indigo-300 min-w-[60px]" rowSpan="2">Hari</th>
                            </tr>
                            <tr className="bg-slate-800 text-slate-200 border-b border-slate-700">
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">1</div><div className="text-[9px] text-slate-400 font-normal">Sab</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-rose-950/40 text-rose-300"><div className="font-bold text-xs">2</div><div className="text-[9px] font-normal">Min</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">3</div><div class="text-[9px] text-slate-400 font-normal">Sen</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">4</div><div class="text-[9px] text-slate-400 font-normal">Sel</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">5</div><div class="text-[9px] text-slate-400 font-normal">Rab</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">6</div><div class="text-[9px] text-slate-400 font-normal">Kam</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">7</div><div class="text-[9px] text-slate-400 font-normal">Jum</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">8</div><div className="text-[9px] text-slate-400 font-normal">Sab</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-rose-950/40 text-rose-300"><div className="font-bold text-xs">9</div><div className="text-[9px] font-normal">Min</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">10</div><div className="text-[9px] text-slate-400 font-normal">Sen</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">11</div><div className="text-[9px] text-slate-400 font-normal">Sel</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-indigo-900/60"><div className="font-bold text-xs text-indigo-200">12</div><div className="text-[9px] text-indigo-300 font-normal">Rab</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">13</div><div className="text-[9px] text-slate-400 font-normal">Kam</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">14</div><div className="text-[9px] text-slate-400 font-normal">Jum</div></th>
                                <th className="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div className="font-bold text-xs text-white">15</div><div className="text-[9px] text-slate-400 font-normal">Sab</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                            
                            <tr className="hover:bg-slate-100/60 transition">
                                <td className="px-4 py-2.5 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-10 shadow-sm">
                                    <div className="text-slate-900 font-bold">Budi Santoso</div>
                                    <div className="text-[10px] font-normal text-slate-400">IT & Tech</div>
                                </td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 bg-amber-50 text-amber-800 font-bold">T</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 bg-rose-50 text-rose-700 font-bold">OT</td>
                                <td className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-indigo-700 bg-indigo-50/50">H</td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="px-3 py-2.5 font-bold border-l border-slate-200 bg-slate-100 text-slate-900 text-sm">9</td>
                            </tr>

                            <tr className="hover:bg-slate-100/60 transition">
                                <td className="px-4 py-2.5 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-10 shadow-sm">
                                    <div className="text-slate-900 font-bold">Ahmad Rizky</div>
                                    <div className="text-[10px] font-normal text-slate-400">Marketing</div>
                                </td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                                <td className="p-1 border-r border-slate-200 bg-blue-50 text-blue-700 font-bold">I</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                                <td className="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                                <td className="p-1 border-r border-slate-200 font-bold text-indigo-700 bg-indigo-50/50">T</td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="p-1 border-r border-slate-200"></td>
                                <td className="px-3 py-2.5 font-bold border-l border-slate-200 bg-slate-100 text-slate-900 text-sm">8</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
