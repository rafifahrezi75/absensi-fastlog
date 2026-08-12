@extends('admin.layouts.app')

@section('title', 'Laporan Presensi - System Absensi')

@section('content')
<div class="space-y-6">

    <!-- 1. HEADER HALAMAN -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Laporan Rekap Presensi & OT</h1>
            <p class="text-sm text-slate-500">Rekapitulasi kehadiran dan jam lembur (Overtime) karyawan per periode.</p>
        </div>
        <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Excel
            </button>
            <button class="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="printer" class="w-4 h-4"></i> Cetak PDF
            </button>
        </div>
    </div>

    <!-- 2. BAR FILTER PERIODE DATES -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                <input type="date" value="2026-08-01" class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                <input type="date" value="2026-08-15" class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Departemen</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Semua Departemen</option>
                    <option value="it">IT & Tech</option>
                    <option value="hrd">HRD & GA</option>
                    <option value="finance">Finance</option>
                </select>
            </div>
            <div class="flex items-end">
                <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-sm">
                    Tampilkan Laporan
                </button>
            </div>
        </div>
    </div>

    <!-- 3. KETERANGAN SINGKATAN STATUS (LEGEND) -->
    <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-700">
        <span class="font-bold text-slate-900 border-r border-slate-200 pr-4">Keterangan Status:</span>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px]">H</span>
            <span>Hadir Tepat Waktu</span>
        </div>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px]">T</span>
            <span>Terlambat</span>
        </div>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px]">OT</span>
            <span>Overtime (Lembur)</span>
        </div>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px]">I</span>
            <span>Izin / Cuti</span>
        </div>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-[10px]">S</span>
            <span>Sakit</span>
        </div>
        <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded font-bold bg-slate-200 text-slate-500 border border-slate-300 flex items-center justify-center text-[10px]">L</span>
            <span>Libur Pekan / Nasional</span>
        </div>
    </div>

    <!-- 4. TABEL REKAP MATRIKS (STYLE SLATE / INDIGO) -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-xs border-collapse border border-slate-200 text-center">
                <thead>
                    <!-- HEADER BARIS 1: BULAN & TAHUN -->
                    <tr class="bg-slate-900 text-white font-bold border-b border-slate-800">
                        <th class="px-4 py-2.5 text-left border-r border-slate-800 min-w-[180px] sticky left-0 bg-slate-900 z-10" rowspan="2">Karyawan</th>
                        <th class="py-2 border-r border-slate-800" colspan="15">Agustus 2026</th>
                        <th class="px-3 py-2 border-l border-slate-800 text-indigo-300 min-w-[60px]" rowspan="2">Hari</th>
                    </tr>
                    
                    <!-- HEADER BARIS 2: TANGGAL & NAMA HARI -->
                    <tr class="bg-slate-800 text-slate-200 border-b border-slate-700">
                        <!-- Tanggal 1 s/d 15 -->
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">1</div><div class="text-[9px] text-slate-400 font-normal">Sab</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-rose-950/40 text-rose-300"><div class="font-bold text-xs">2</div><div class="text-[9px] font-normal">Min</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">3</div><div class="text-[9px] text-slate-400 font-normal">Sen</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">4</div><div class="text-[9px] text-slate-400 font-normal">Sel</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">5</div><div class="text-[9px] text-slate-400 font-normal">Rab</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">6</div><div class="text-[9px] text-slate-400 font-normal">Kam</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">7</div><div class="text-[9px] text-slate-400 font-normal">Jum</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">8</div><div class="text-[9px] text-slate-400 font-normal">Sab</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-rose-950/40 text-rose-300"><div class="font-bold text-xs">9</div><div class="text-[9px] font-normal">Min</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">10</div><div class="text-[9px] text-slate-400 font-normal">Sen</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">11</div><div class="text-[9px] text-slate-400 font-normal">Sel</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px] bg-indigo-900/60"><div class="font-bold text-xs text-indigo-200">12</div><div class="text-[9px] text-indigo-300 font-normal">Rab</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">13</div><div class="text-[9px] text-slate-400 font-normal">Kam</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">14</div><div class="text-[9px] text-slate-400 font-normal">Jum</div></th>
                        <th class="px-2 py-1.5 border-r border-slate-700 min-w-[36px]"><div class="font-bold text-xs text-white">15</div><div class="text-[9px] text-slate-400 font-normal">Sab</div></th>
                    </tr>
                </thead>

                <!-- BODY DATA -->
                <tbody class="divide-y divide-slate-200 text-slate-700">
                    
                    <!-- Row 1: Budi Santoso -->
                    <tr class="hover:bg-slate-100/60 transition">
                        <td class="px-4 py-2.5 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-10 shadow-sm">
                            <div class="text-slate-900 font-bold">Budi Santoso</div>
                            <div class="text-[10px] font-normal text-slate-400">IT & Tech</div>
                        </td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-amber-50 text-amber-800 font-bold">T</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-rose-50 text-rose-700 font-bold">OT</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-indigo-700 bg-indigo-50/50">H</td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="px-3 py-2.5 font-bold border-l border-slate-200 bg-slate-100 text-slate-900 text-sm">9</td>
                    </tr>

                    <!-- Row 2: Ahmad Rizky -->
                    <tr class="hover:bg-slate-100/60 transition">
                        <td class="px-4 py-2.5 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-10 shadow-sm">
                            <div class="text-slate-900 font-bold">Ahmad Rizky</div>
                            <div class="text-[10px] font-normal text-slate-400">Marketing</div>
                        </td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 bg-blue-50 text-blue-700 font-bold">I</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-rose-50 text-rose-700 font-bold">OT</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-indigo-700 bg-indigo-50/50">H</td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="px-3 py-2.5 font-bold border-l border-slate-200 bg-slate-100 text-slate-900 text-sm">9</td>
                    </tr>

                    <!-- Row 3: Siti Aminah -->
                    <tr class="hover:bg-slate-100/60 transition">
                        <td class="px-4 py-2.5 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-10 shadow-sm">
                            <div class="text-slate-900 font-bold">Siti Aminah</div>
                            <div class="text-[10px] font-normal text-slate-400">Finance</div>
                        </td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 bg-purple-50 text-purple-700 font-bold">S</td>
                        <td class="p-1 border-r border-slate-200 bg-purple-50 text-purple-700 font-bold">S</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 bg-slate-100 text-slate-400">L</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-slate-700">H</td>
                        <td class="p-1 border-r border-slate-200 font-bold text-indigo-700 bg-indigo-50/50">H</td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="p-1 border-r border-slate-200"></td>
                        <td class="px-3 py-2.5 font-bold border-l border-slate-200 bg-slate-100 text-slate-900 text-sm">8</td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection