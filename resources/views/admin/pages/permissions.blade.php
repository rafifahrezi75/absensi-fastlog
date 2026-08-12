@extends('layouts.app')

@section('title', 'Persetujuan Izin & Lembur - System Absensi')

@section('content')
<div class="space-y-6">

    <!-- 1. HEADER HALAMAN -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Persetujuan Izin & Lembur</h1>
            <p class="text-sm text-slate-500">Verifikasi dan kelola formulir pengajuan yang masuk dari portal karyawan.</p>
        </div>
        <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Export Rekap
            </button>
        </div>
    </div>

    <!-- 2. WIDGET RINGKASAN STATUS PENGAJUAN -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-800 uppercase tracking-wider">Perlu Action (Pending)</span>
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            </div>
            <div class="text-2xl font-bold text-amber-900 mt-1">5</div>
            <span class="text-[11px] text-amber-700">3 Izin/Sakit, 2 Lembur</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Disetujui Bulan Ini</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">28</div>
            <span class="text-[11px] text-emerald-600 font-medium">Otomatis Masuk Log/Payroll</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-rose-600 uppercase tracking-wider">Ditolak</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">2</div>
            <span class="text-[11px] text-rose-600 font-medium">Form/Bukti Tidak Valid</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Jam Lembur ACC</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">128.5 Jam</div>
            <span class="text-[11px] text-indigo-600 font-medium">Siap Dihitung di Payroll</span>
        </div>
    </div>

    <!-- 3. BAR FILTER PENGAJUAN -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Status Approval</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="pending">Menunggu Persetujuan (Pending)</option>
                    <option value="approved">Disetujui (Approved)</option>
                    <option value="rejected">Ditolak (Rejected)</option>
                    <option value="">Semua Status</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Kategori Pengajuan</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Semua Kategori</option>
                    <option value="sakit">Sakit</option>
                    <option value="izin">Izin / Cuti</option>
                    <option value="dinas">Dinas Luar</option>
                    <option value="lembur">Lembur</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Rentang Tanggal</label>
                <input type="date" value="2026-08-10" class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                <div class="relative">
                    <input type="text" placeholder="Nama / NIK..." class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- 4. TABEL APPROVAL PENGAJUAN -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-600">
                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th scope="col" class="px-6 py-3.5">Pemohon</th>
                        <th scope="col" class="px-6 py-3.5">Kategori</th>
                        <th scope="col" class="px-6 py-3.5">Tanggal / Durasi</th>
                        <th scope="col" class="px-6 py-3.5">Alasan / Detail</th>
                        <th scope="col" class="px-6 py-3.5">Lampiran Bukti</th>
                        <th scope="col" class="px-6 py-3.5">Status</th>
                        <th scope="col" class="px-6 py-3.5 text-center">Aksi (Approval)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    
                    <!-- Row 1: Sakit (Pending) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">SA</div>
                                <div>
                                    <div class="font-semibold text-sm">Siti Aminah</div>
                                    <div class="text-xs text-slate-400">Accountant</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i> Sakit
                            </span>
                        </td>
                        <td class="px-6 py-4 text-xs whitespace-nowrap">
                            <div class="font-medium text-slate-800">10 Agt 2026</div>
                            <div class="text-slate-400">1 Hari Kerja</div>
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                            Demam tinggi dan flu, disarankan istirahat oleh dokter.
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button onclick="openModalPreview('Surat Dokter - Siti Aminah', 'Surat_Dokter_Siti.jpg')" class="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <i data-lucide="paperclip" class="w-3.5 h-3.5"></i> Surat_Dokter.jpg
                            </button>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                <i data-lucide="clock" class="w-3 h-3"></i> Pending
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center gap-2">
                                <button class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                                    <i data-lucide="check" class="w-3.5 h-3.5"></i> Setujui
                                </button>
                                <button class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1">
                                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Tolak
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Row 2: Lembur (Pending) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                <div>
                                    <div class="font-semibold text-sm">Budi Santoso</div>
                                    <div class="text-xs text-slate-400">Software Engineer</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                <i data-lucide="timer" class="w-3.5 h-3.5"></i> Lembur
                            </span>
                        </td>
                        <td class="px-6 py-4 text-xs whitespace-nowrap">
                            <div class="font-medium text-slate-800">10 Agt 2026</div>
                            <div class="text-indigo-600 font-semibold">17:00 - 20:30 (3.5 Jam)</div>
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                            Deploy update sistem modul absensi & integrasi API fingerprint.
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-xs text-slate-400 italic">Tanpa Lampiran</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                <i data-lucide="clock" class="w-3 h-3"></i> Pending
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center gap-2">
                                <button class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1">
                                    <i data-lucide="check" class="w-3.5 h-3.5"></i> Setujui
                                </button>
                                <button class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1">
                                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Tolak
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Row 3: Dinas Luar (Approved) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">DP</div>
                                <div>
                                    <div class="font-semibold text-sm">Deni Pratama</div>
                                    <div class="text-xs text-slate-400">Staff IT</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                <i data-lucide="briefcase" class="w-3.5 h-3.5"></i> Dinas Luar
                            </span>
                        </td>
                        <td class="px-6 py-4 text-xs whitespace-nowrap">
                            <div class="font-medium text-slate-800">10 Agt 2026</div>
                            <div class="text-slate-400">Maintenance Cabang</div>
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                            Perbaikan server jaringan dan setting mesin absensi di cabang Barat.
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button onclick="openModalPreview('Foto Lokasi - Deni Pratama', 'Foto_Lokasi.jpg')" class="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <i data-lucide="image" class="w-3.5 h-3.5"></i> Foto_Lokasi.jpg
                            </button>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <i data-lucide="check-circle-2" class="w-3 h-3"></i> Disetujui
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <span class="text-xs text-slate-400 italic">Approved oleh Admin</span>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>

</div>

<!-- MODAL PREVIEW LAMPIRAN FORM USER -->
<div id="modalPreview" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 id="previewTitle" class="font-bold text-sm">Preview Lampiran</h3>
            <button onclick="closeModalPreview()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div class="p-6 flex flex-col items-center justify-center bg-slate-100 min-h-[250px]">
            <div class="w-full h-48 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                <i data-lucide="image" class="w-12 h-12 mb-2"></i>
                <span id="previewFilename" class="text-xs font-mono font-medium text-slate-600">File_Lampiran.jpg</span>
                <span class="text-[10px] text-slate-400 mt-1">(Tampilan Gambar/Dokumen Bukti User)</span>
            </div>
        </div>
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button onclick="closeModalPreview()" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition">Tutup</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function openModalPreview(title, filename) {
        document.getElementById('previewTitle').innerText = title;
        document.getElementById('previewFilename').innerText = filename;
        document.getElementById('modalPreview').classList.remove('hidden');
    }
    
    function closeModalPreview() {
        document.getElementById('modalPreview').classList.add('hidden');
    }
</script>
@endpush