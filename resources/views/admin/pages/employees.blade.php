@extends('admin.layouts.app')

@section('title', 'Data Karyawan - System Absensi')

@section('content')
<div class="space-y-6">

    <!-- 1. HEADER HALAMAN -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Data Karyawan</h1>
            <p class="text-sm text-slate-500">Kelola informasi pegawai dan pemetaan ID mesin fingerprint (Jam Kerja: 08:00 - 16:30 WIB).</p>
        </div>
        <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Export Data
            </button>
            <button onclick="openModalKaryawan()" class="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah Karyawan
            </button>
        </div>
    </div>

    <!-- 2. WIDGET RINGKASAN DATA PEGAWAI -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">48</div>
            <span class="text-[11px] text-slate-500">Pegawai Terdaftar</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Terhubung Fingerprint</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">46</div>
            <span class="text-[11px] text-emerald-600 font-medium">ID Mesin Sync</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Belum Sync Finger</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">2</div>
            <span class="text-[11px] text-amber-600 font-medium">Perlu Enroll Finger</span>
        </div>
    </div>

    <!-- 3. BAR FILTER DATA -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <label class="block text-xs font-medium text-slate-600 mb-1">Status Fingerprint</label>
                <select class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    <option value="">Semua Status</option>
                    <option value="synced">Terhubung ID Finger</option>
                    <option value="unregistered">Belum Didaftarkan</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                <div class="relative">
                    <input type="text" placeholder="Nama / NIK / ID Mesin..." class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- 4. TABEL KARYAWAN -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-600">
                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th scope="col" class="px-6 py-3.5">Karyawan</th>
                        <th scope="col" class="px-6 py-3.5">ID Finger</th>
                        <th scope="col" class="px-6 py-3.5">Departemen</th>
                        <th scope="col" class="px-6 py-3.5">Jabatan</th>
                        <th scope="col" class="px-6 py-3.5">Status Finger</th>
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
                                    <div class="text-xs text-slate-400">NIK: 20260101</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                            <span class="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">101</span>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                            IT & Tech
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            Software Engineer
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <i data-lucide="check-circle-2" class="w-3 h-3"></i> Sync Mesin
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="openModalKaryawan('Budi Santoso', '20260101', '101', 'IT & Tech', 'Software Engineer')" class="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition" title="Edit Data">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </button>
                                <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Row 2 -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                <div>
                                    <div class="font-semibold text-sm">Ahmad Rizky</div>
                                    <div class="text-xs text-slate-400">NIK: 20260104</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                            <span class="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">104</span>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                            Marketing
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            Digital Marketer
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <i data-lucide="check-circle-2" class="w-3 h-3"></i> Sync Mesin
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="openModalKaryawan('Ahmad Rizky', '20260104', '104', 'Marketing', 'Digital Marketer')" class="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition" title="Edit Data">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </button>
                                <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Row 3 (Belum Sync) -->
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">NL</div>
                                <div>
                                    <div class="font-semibold text-sm">Nadia Larasati</div>
                                    <div class="text-xs text-slate-400">NIK: 20260120</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                            <span class="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-sans font-medium">Belum Set</span>
                        </td>
                        <td class="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                            HRD & GA
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            HR Specialist
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                <i data-lucide="alert-circle" class="w-3 h-3"></i> Belum Enroll
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="openModalKaryawan('Nadia Larasati', '20260120', '', 'HRD & GA', 'HR Specialist')" class="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition" title="Edit / Set ID Finger">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </button>
                                <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>

</div>

<!-- MODAL TAMBAH / EDIT KARYAWAN -->
<div id="modalKaryawan" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 id="modalTitle" class="font-bold text-sm">Form Data Karyawan</h3>
            <button onclick="closeModalKaryawan()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input id="inputNama" type="text" placeholder="Contoh: Budi Santoso" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                </div>
                <div>
                    <label class="block font-medium text-slate-700 mb-1">NIK Karyawan</label>
                    <input id="inputNik" type="text" placeholder="Contoh: 20260101" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block font-medium text-slate-700 mb-1">ID Mesin Fingerprint</label>
                <input id="inputIdFinger" type="number" placeholder="Contoh: 101" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-brand-orange focus:outline-none">
                <span class="text-[10px] text-slate-400">Harus sesuai dengan ID di Mesin</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Departemen</label>
                    <input id="inputDept" type="text" placeholder="Contoh: IT & Tech" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                </div>
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Jabatan</label>
                    <input id="inputJabatan" type="text" placeholder="Contoh: Software Engineer" class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                </div>
            </div>
        </div>
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button onclick="closeModalKaryawan()" class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Batal</button>
            <button onclick="closeModalKaryawan()" class="px-4 py-2 bg-brand-orange text-white rounded-lg text-xs font-semibold hover:bg-brand-orange transition">Simpan Data</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function openModalKaryawan(nama = '', nik = '', idFinger = '', dept = '', jabatan = '') {
        document.getElementById('inputNama').value = nama;
        document.getElementById('inputNik').value = nik;
        document.getElementById('inputIdFinger').value = idFinger;
        document.getElementById('inputDept').value = dept;
        document.getElementById('inputJabatan').value = jabatan;
        
        document.getElementById('modalTitle').innerText = nama ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru';
        document.getElementById('modalKaryawan').classList.remove('hidden');
    }
    
    function closeModalKaryawan() {
        document.getElementById('modalKaryawan').classList.add('hidden');
    }
</script>
@endpush