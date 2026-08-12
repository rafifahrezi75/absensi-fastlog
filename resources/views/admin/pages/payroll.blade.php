@extends('admin.layouts.app')

@section('title', 'Data Payroll - System Absensi')

@section('content')
<div class="space-y-6">

    <!-- 1. HEADER HALAMAN -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Penggajian & Payroll</h1>
            <p class="text-sm text-slate-500">Kalkulasi gaji otomatis berdasarkan rekap absensi, keterlambatan, dan lembur.</p>
        </div>
        <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Export Slip Gaji
            </button>
            <button class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="calculator" class="w-4 h-4"></i> Hitung Payroll Bulan Ini
            </button>
        </div>
    </div>

    <!-- 2. WIDGET RINGKASAN PAYROLL -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Output Gaji (Agustus 2026)</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">Rp 284.500.000</div>
            <span class="text-[11px] text-slate-500">48 Karyawan</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-brand-orange uppercase tracking-wider">Total Lembur Diterima</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">Rp 12.850.000</div>
            <span class="text-[11px] text-brand-orange font-medium">Berdasarkan Jam Lembur Valid</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Potongan Absensi</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">Rp 3.200.000</div>
            <span class="text-[11px] text-rose-600 font-medium">Terlambat & Alpa</span>
        </div>
    </div>

    <!-- 3. BAR FILTER DATA -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Periode Bulan</label>
                <input type="month" value="2026-08" class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Departemen / Divisi</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    <option value="">Semua Departemen</option>
                    <option value="it">IT & Tech</option>
                    <option value="hrd">HRD & General Affair</option>
                    <option value="finance">Finance & Accounting</option>
                    <option value="marketing">Marketing</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Status Pembayaran</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    <option value="">Semua Status</option>
                    <option value="paid">Sudah Dibayar</option>
                    <option value="pending">Draft / Belum Transfer</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                <div class="relative">
                    <input type="text" placeholder="Nama / NIK..." class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- 4. TABEL PAYROLL -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-600">
                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th scope="col" class="px-6 py-3.5">Karyawan</th>
                        <th scope="col" class="px-6 py-3.5">Gaji Pokok</th>
                        <th scope="col" class="px-6 py-3.5">Bonus & Lembur</th>
                        <th scope="col" class="px-6 py-3.5">Potongan</th>
                        <th scope="col" class="px-6 py-3.5">Total Diterima (THP)</th>
                        <th scope="col" class="px-6 py-3.5">Status</th>
                        <th scope="col" class="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    
                    <!-- Row 1 -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-brand-orange/20 text-brand-orange font-bold flex items-center justify-center text-xs">BS</div>
                                <div>
                                    <div class="font-semibold text-sm">Budi Santoso</div>
                                    <div class="text-xs text-slate-400">IT & Tech • Software Engineer</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                            Rp 8.000.000
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">
                            + Rp 750.000
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">
                            - Rp 50.000
                        </td>
                        <td class="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            Rp 8.700.000
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <i data-lucide="check-circle" class="w-3 h-3"></i> Paid
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="openModalSlip('Budi Santoso', '20260101', 'Software Engineer', 'Rp 8.000.000', 'Rp 750.000', 'Rp 50.000', 'Rp 8.700.000')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5">
                                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Slip Gaji
                            </button>
                        </td>
                    </tr>

                    <!-- Row 2 -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                <div>
                                    <div class="font-semibold text-sm">Ahmad Rizky</div>
                                    <div class="text-xs text-slate-400">Marketing • Digital Marketer</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                            Rp 6.500.000
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">
                            + Rp 300.000
                        </td>
                        <td class="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">
                            - Rp 150.000
                        </td>
                        <td class="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            Rp 6.650.000
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                <i data-lucide="clock" class="w-3 h-3"></i> Pending
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="openModalSlip('Ahmad Rizky', '20260104', 'Digital Marketer', 'Rp 6.500.000', 'Rp 300.000', 'Rp 150.000', 'Rp 6.650.000')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5">
                                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Slip Gaji
                            </button>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>

</div>

<!-- MODAL SLIP GAJI -->
<div id="modalSlip" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">Preview Slip Gaji</h3>
            <button onclick="closeModalSlip()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div class="p-6 space-y-4 text-xs">
            <div class="text-center border-b pb-4">
                <h4 class="font-bold text-sm text-slate-900">PT. TECH INDONESIA</h4>
                <p class="text-slate-500">Slip Gaji Periode: Agustus 2026</p>
            </div>

            <div class="space-y-1.5 text-slate-700">
                <div class="flex justify-between"><span>Nama:</span> <strong id="slipNama">-</strong></div>
                <div class="flex justify-between"><span>NIK:</span> <strong id="slipNik">-</strong></div>
                <div class="flex justify-between"><span>Jabatan:</span> <strong id="slipJabatan">-</strong></div>
            </div>

            <hr>

            <div class="space-y-2">
                <div class="flex justify-between text-slate-600"><span>Gaji Pokok:</span> <span id="slipGapok" class="font-mono">-</span></div>
                <div class="flex justify-between text-emerald-600"><span>Lembur & Tunjangan:</span> <span id="slipBonus" class="font-mono">-</span></div>
                <div class="flex justify-between text-rose-600"><span>Potongan Absensi:</span> <span id="slipPotongan" class="font-mono">-</span></div>
            </div>

            <div class="p-3 bg-slate-100 rounded-lg flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Netto (THP):</span>
                <span id="slipThp" class="font-mono text-brand-orange">-</span>
            </div>
        </div>
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button onclick="closeModalSlip()" class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Tutup</button>
            <button class="px-4 py-2 bg-brand-orange text-white rounded-lg text-xs font-semibold hover:bg-brand-orange transition flex items-center gap-1.5">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i> Cetak PDF
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function openModalSlip(nama, nik, jabatan, gapok, bonus, potongan, thp) {
        document.getElementById('slipNama').innerText = nama;
        document.getElementById('slipNik').innerText = nik;
        document.getElementById('slipJabatan').innerText = jabatan;
        document.getElementById('slipGapok').innerText = gapok;
        document.getElementById('slipBonus').innerText = bonus;
        document.getElementById('slipPotongan').innerText = potongan;
        document.getElementById('slipThp').innerText = thp;
        
        document.getElementById('modalSlip').classList.remove('hidden');
    }
    
    function closeModalSlip() {
        document.getElementById('modalSlip').classList.add('hidden');
    }
</script>
@endpush