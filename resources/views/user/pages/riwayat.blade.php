<div class="space-y-5"
     x-data="{
         search: '',
         selectedStatus: 'Semua Status',
         currentPage: 1,
         perPage: 5,
         absensi: [
             { tgl: 'Sen, 10 Agu 2026', masuk: '—', pulang: '—', jam: '—', status: 'Hadir', badge: 'bg-emerald-50 text-emerald-600', ket: '—' },
             { tgl: 'Min, 09 Agu 2026', masuk: '08:05', pulang: '17:02', jam: '8.95j', status: 'Hadir', badge: 'bg-emerald-50 text-emerald-600', ket: '—' },
             { tgl: 'Sab, 08 Agu 2026', masuk: '08:12', pulang: '17:10', jam: '8.97j', status: 'Hadir', badge: 'bg-emerald-50 text-emerald-600', ket: '—' },
             { tgl: 'Jum, 07 Agu 2026', masuk: '09:15', pulang: '17:05', jam: '7.83j', status: 'Terlambat', badge: 'bg-amber-50 text-amber-600', ket: '—' },
             { tgl: 'Kam, 06 Agu 2026', masuk: '—', pulang: '—', jam: '—', status: 'Izin', badge: 'bg-blue-50 text-blue-600', ket: 'Urusan keluarga' },
             { tgl: 'Sen, 03 Agu 2026', masuk: '08:00', pulang: '17:00', jam: '9j', status: 'Hadir', badge: 'bg-emerald-50 text-emerald-600', ket: '—' },
             { tgl: 'Min, 02 Agu 2026', masuk: '08:03', pulang: '17:05', jam: '9.03j', status: 'Hadir', badge: 'bg-emerald-50 text-emerald-600', ket: '—' },
             { tgl: 'Sab, 01 Agu 2026', masuk: '—', pulang: '—', jam: '—', status: 'Sakit', badge: 'bg-violet-50 text-violet-600', ket: 'Demam' }
         ],

         // Filter data berdasarkan kata kunci pencarian dan status
         get filteredAbsensi() {
             return this.absensi.filter(item => {
                 const matchSearch = item.tgl.toLowerCase().includes(this.search.toLowerCase()) ||
                                     item.ket.toLowerCase().includes(this.search.toLowerCase());
                 const matchStatus = this.selectedStatus === 'Semua Status' || item.status === this.selectedStatus;
                 return matchSearch && matchStatus;
             });
         },

         // Hitung total halaman
         get totalPages() {
             return Math.ceil(this.filteredAbsensi.length / this.perPage) || 1;
         },

         // Potong data sesuai halaman aktif
         get paginatedAbsensi() {
             const start = (this.currentPage - 1) * this.perPage;
             return this.filteredAbsensi.slice(start, start + this.perPage);
         },

         // Hitung angka awal & akhir keterangan data yang tampil
         get startItem() {
             if (this.filteredAbsensi.length === 0) return 0;
             return (this.currentPage - 1) * this.perPage + 1;
         },
         get endItem() {
             const end = this.currentPage * this.perPage;
             return end > this.filteredAbsensi.length ? this.filteredAbsensi.length : end;
         },

         setPage(page) {
             if (page >= 1 && page <= this.totalPages) {
                 this.currentPage = page;
             }
         }
     }">

    <!-- Header Section -->
    <div class="flex items-center gap-3">
        <button @click="goHome()" class="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition shrink-0">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
        <div>
            <h3 class="text-base font-bold text-gray-800">Riwayat Absensi</h3>
            <p class="text-xs text-gray-400">Rekap kehadiran dan pengajuan Anda</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Search & Filter Controls -->
        <div class="p-4 md:p-5 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
            <div class="relative flex-1">
                <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input type="text"
                       x-model="search"
                       @input="currentPage = 1"
                       placeholder="Cari tanggal..."
                       class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition">
            </div>
            <select x-model="selectedStatus"
                    @change="currentPage = 1"
                    class="border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition">
                <option value="Semua Status">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Alpha">Alpha</option>
            </select>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-gray-50/60 text-[11px] uppercase text-gray-400 font-semibold tracking-wide">
                        <th class="px-5 py-3">Tanggal</th>
                        <th class="px-5 py-3">Jam Masuk</th>
                        <th class="px-5 py-3">Jam Pulang</th>
                        <th class="px-5 py-3">Jam Kerja</th>
                        <th class="px-5 py-3">Status</th>
                        <th class="px-5 py-3">Keterangan</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <!-- Loop Data Hasil Filter + Pagination -->
                    <template x-for="(item, index) in paginatedAbsensi" :key="index">
                        <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition">
                            <td class="px-5 py-3.5 font-medium text-gray-700" x-text="item.tgl"></td>
                            <td class="px-5 py-3.5 text-gray-500" x-text="item.masuk"></td>
                            <td class="px-5 py-3.5 text-gray-500" x-text="item.pulang"></td>
                            <td class="px-5 py-3.5 text-gray-500" x-text="item.jam"></td>
                            <td class="px-5 py-3.5">
                                <span :class="item.badge" class="font-semibold px-2.5 py-1 rounded-full text-xs" x-text="item.status"></span>
                            </td>
                            <td class="px-5 py-3.5 text-gray-400" x-text="item.ket"></td>
                        </tr>
                    </template>

                    <!-- Tampilan Jika Data Tidak Ditemukan -->
                    <tr x-show="filteredAbsensi.length === 0">
                        <td colspan="6" class="px-5 py-8 text-center text-gray-400 text-sm">
                            Tidak ada data absensi yang sesuai.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Dynamic Pagination Footer -->
        <div class="flex items-center justify-between px-5 py-4 text-xs text-gray-400">
            <span>
                Menampilkan <span x-text="startItem"></span>–<span x-text="endItem"></span> dari <span x-text="filteredAbsensi.length"></span> data
            </span>
            <div class="flex items-center gap-1">
                <!-- Tombol Previous -->
                <button @click="setPage(currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
                </button>

                <!-- Loop Angka Halaman -->
                <template x-for="p in totalPages" :key="p">
                    <button @click="setPage(p)"
                            :class="currentPage === p ? 'bg-brand-dark text-white font-semibold' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'"
                            class="w-7 h-7 rounded-lg flex items-center justify-center transition"
                            x-text="p">
                    </button>
                </template>

                <!-- Tombol Next -->
                <button @click="setPage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>

    </div>
</div>