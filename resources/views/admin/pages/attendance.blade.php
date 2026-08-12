@extends('admin.layouts.app')

@section('title', 'Log Absensi - System Absensi Fingerprint')

@section('content')
<div class="space-y-6">

    <!-- 1. HEADER HALAMAN & AKSI UTAMA -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Log Absensi Karyawan</h1>
            <p class="text-sm text-slate-500">Monitor dan kelola riwayat presensi harian dari mesin fingerprint & portal user.</p>
        </div>
        <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Export Excel
            </button>
            <button onclick="openModalKoreksi()" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="plus" class="w-4 h-4"></i> Input Absen Manual
            </button>
        </div>
    </div>

    <!-- 2. WIDGET RINGKASAN REKAP HARI INI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records Log</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">104</div>
            <span class="text-[11px] text-slate-500">Tap Masuk & Pulang</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Hadir Tepat Waktu</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">42</div>
            <span class="text-[11px] text-emerald-600 font-medium">Batas Scan: 08:00 WIB</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Terlambat</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">4</div>
            <span class="text-[11px] text-amber-600 font-medium">Rata-rata 12 Mnt</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Verifikasi Portal</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">6</div>
            <span class="text-[11px] text-blue-600 font-medium">Izin / Sakit / Dinas</span>
        </div>
    </div>

    <!-- 3. BAR FILTER DATA LOG -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            <!-- Filter Tanggal -->
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Tanggal</label>
                <input type="date" value="2026-08-10" class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>

            <!-- Filter Status -->
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Status Kehadiran</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Semua Status</option>
                    <option value="tepat">Hadir Tepat Waktu</option>
                    <option value="telat">Terlambat</option>
                    <option value="sakit">Sakit / Izin</option>
                    <option value="dinas">Dinas Luar</option>
                    <option value="alpa">Alpa / Tanpa Ket</option>
                </select>
            </div>

            <!-- Filter Metode -->
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Metode Presensi</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Semua Metode</option>
                    <option value="fingerprint">Mesin Fingerprint</option>
                    <option value="portal">Portal User (Upload)</option>
                    <option value="manual">Koreksi Manual Admin</option>
                </select>
            </div>

            <!-- Cari Karyawan -->
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                <div class="relative">
                    <input type="text" placeholder="Nama / NIK / ID Finger..." class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
            </div>

        </div>
    </div>

    <!-- 4. TABEL LOG ABSENSI UTAMA -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-600">
                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th scope="col" class="px-6 py-3.5">Karyawan</th>
                        <th scope="col" class="px-6 py-3.5">Tanggal</th>
                        <th scope="col" class="px-6 py-3.5">Jam Masuk</th>
                        <th scope="col" class="px-6 py-3.5">Jam Keluar</th>
                        <th scope="col" class="px-6 py-3.5">Status</th>
                        <th scope="col" class="px-6 py-3.5">Metode</th>
                        <th scope="col" class="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    
                    <!-- Row 1: Tepat Waktu via Fingerprint -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                <div>
                                    <div class="font-semibold text-sm">Budi Santoso</div>
                                    <div class="text-xs text-slate-400">NIK: 20260101 • ID Finger: 101</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            10 Agt 2026
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">07:54:10</span>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">17:02:15</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                                Tepat Waktu
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <i data-lucide="fingerprint" class="w-3.5 h-3.5 text-indigo-600"></i> Mesin Lobi
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="openModalKoreksi('Budi Santoso', '07:54', '17:02')" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Koreksi Data">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 2: Terlambat via Fingerprint -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                <div>
                                    <div class="font-semibold text-sm">Ahmad Rizky</div>
                                    <div class="text-xs text-slate-400">NIK: 20260104 • ID Finger: 104</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            10 Agt 2026
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">08:14:22</span>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="text-slate-400 bg-slate-50 px-2 py-1 rounded">Belum Tap</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                Telat 14 Mnt
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <i data-lucide="fingerprint" class="w-3.5 h-3.5 text-indigo-600"></i> Mesin Lobi
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="openModalKoreksi('Ahmad Rizky', '08:14', '')" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Koreksi Data">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 3: Sakit (Sinkron Portal User) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">SA</div>
                                <div>
                                    <div class="font-semibold text-sm">Siti Aminah</div>
                                    <div class="text-xs text-slate-400">NIK: 20260108 • ID Finger: 108</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            10 Agt 2026
                        </td>
                        <td class="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">-</td>
                        <td class="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">-</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                Sakit (ACC)
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-medium">
                                <i data-lucide="globe" class="w-3.5 h-3.5 text-blue-600"></i> Portal User
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Lihat Lampiran Surat Doctor">
                                <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i>
                            </button>
                        </td>
                    </tr>

                    <!-- Row 4: Dinas Luar (Sinkron Portal User) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">DP</div>
                                <div>
                                    <div class="font-semibold text-sm">Deni Pratama</div>
                                    <div class="text-xs text-slate-400">NIK: 20260112 • ID Finger: 112</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                            10 Agt 2026
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">08:00 (Dinas)</span>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs whitespace-nowrap">
                            <span class="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">17:00 (Dinas)</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200">
                                Dinas Luar (ACC)
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg font-medium">
                                <i data-lucide="globe" class="w-3.5 h-3.5 text-purple-600"></i> Portal User
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button class="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Lihat Foto Lokasi Dinas">
                                <i data-lucide="map-pin" class="w-4 h-4 text-purple-600"></i>
                            </button>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>

        <!-- PAGINASI DATA -->
        <div class="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>Menampilkan 1 - 4 dari 104 data absensi</div>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50" disabled>Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium">1</button>
                <button class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">2</button>
                <button class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">3</button>
                <button class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Next</button>
            </div>
        </div>
    </div>

</div>

<!-- MODAL KOREKSI / INPUT MANUAL ABSENSI -->
<div id="modalKoreksi" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">Koreksi Log Absensi</h3>
            <button onclick="closeModalKoreksi()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div class="p-6 space-y-4 text-xs">
            <div>
                <label class="block font-medium text-slate-700 mb-1">Nama Karyawan</label>
                <input id="modalNama" type="text" class="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium" readonly>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Jam Masuk</label>
                    <input id="modalJamMasuk" type="time" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Jam Keluar</label>
                    <input id="modalJamKeluar" type="time" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block font-medium text-slate-700 mb-1">Alasan Koreksi Admin</label>
                <textarea rows="3" class="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Contoh: Lupa scan keluar / Mesin lobi restart"></textarea>
            </div>
        </div>
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button onclick="closeModalKoreksi()" class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Batal</button>
            <button onclick="closeModalKoreksi()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">Simpan Perubahan</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function openModalKoreksi(nama = '', masuk = '', keluar = '') {
        document.getElementById('modalNama').value = nama || 'Pilih Karyawan...';
        document.getElementById('modalJamMasuk').value = masuk;
        document.getElementById('modalJamKeluar').value = keluar;
        document.getElementById('modalKoreksi').classList.remove('hidden');
    }
    
    function closeModalKoreksi() {
        document.getElementById('modalKoreksi').classList.add('hidden');
    }
</script>
@endpush