<div class="space-y-5">

    <!-- Greeting Banner -->
    <div class="bg-brand-dark rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-2xl"></div>
        <div class="relative">
            <p class="text-white/60 text-xs mb-1">Selamat Siang,</p>
            <h2 class="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                Budi Santoso <span>👋</span>
            </h2>
            <p class="text-white/50 text-xs mt-1">Desainer Grafis · Kreatif</p>
        </div>
        <div class="relative text-left md:text-right">
            <p class="text-brand-orange text-2xl md:text-3xl font-bold tracking-wide font-mono">14.04.31</p>
            <p class="text-white/50 text-xs mt-1">Senin, 10 Agustus 2026</p>
        </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-xs text-gray-500 mb-0.5">Hadir</p>
                <p class="text-lg font-bold text-emerald-600">18 <span class="text-xs font-medium text-gray-400">hari</span></p>
            </div>
            <div class="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-xs text-gray-500 mb-0.5">Izin</p>
                <p class="text-lg font-bold text-blue-600">1 <span class="text-xs font-medium text-gray-400">hari</span></p>
            </div>
            <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <i data-lucide="file-text" class="w-4 h-4"></i>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-xs text-gray-500 mb-0.5">Sakit</p>
                <p class="text-lg font-bold text-violet-600">1 <span class="text-xs font-medium text-gray-400">hari</span></p>
            </div>
            <div class="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-xs text-gray-500 mb-0.5">Alpha</p>
                <p class="text-lg font-bold text-rose-600">0 <span class="text-xs font-medium text-gray-400">hari</span></p>
            </div>
            <div class="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <i data-lucide="x-circle" class="w-4 h-4"></i>
            </div>
        </div>
    </div>

    <!-- Tombol Aksi -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button @click="openForm('Izin')" class="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Ajukan Izin</span>
        </button>

        <button @click="openForm('Sakit')" class="flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
            <i data-lucide="thermometer" class="w-4 h-4"></i>
            <span>Ajukan Sakit</span>
        </button>

        <button @click="openForm('Dinas')" class="flex items-center justify-center gap-2.5 py-3.5 bg-orange-50 border-2 border-transparent text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl font-semibold text-xs transition shadow-sm">
            <i data-lucide="briefcase" class="w-4 h-4"></i>
            <span>Dinas Luar</span>
        </button>
    </div>

    <!-- Riwayat Terbaru -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div class="flex items-center gap-2.5 mb-5">
            <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                <i data-lucide="clock" class="w-4 h-4"></i>
            </div>
            <h3 class="text-sm font-bold text-gray-800">Riwayat Terbaru</h3>
        </div>

        @php
            $riwayat = [
                ['tanggal' => 'Senin, 10 Agu 2026', 'ket' => 'Tidak hadir · Acara Keluarga', 'status' => 'Izin', 'dot' => 'bg-blue-500', 'badge' => 'bg-blue-50 text-blue-600'],
                ['tanggal' => 'Minggu, 9 Agu 2026', 'ket' => 'Masuk: 08:05 · Pulang: 17:02', 'status' => 'Hadir', 'dot' => 'bg-emerald-500', 'badge' => 'bg-emerald-50 text-emerald-600', 'jam' => '8.95j'],
                ['tanggal' => 'Jumat, 7 Agu 2026', 'ket' => 'Masuk: 09:15 · Pulang: 17:05', 'status' => 'Terlambat', 'dot' => 'bg-amber-500', 'badge' => 'bg-amber-50 text-amber-600', 'jam' => '7.83j'],
                ['tanggal' => 'Rabu, 5 Agu 2026', 'ket' => 'Tidak hadir · Demam Berdarah', 'status' => 'Sakit', 'dot' => 'bg-rose-500', 'badge' => 'bg-rose-50 text-rose-600'],
            ];
        @endphp

        <div class="space-y-0.5">
            @foreach ($riwayat as $item)
                <div class="flex items-center justify-between py-3 {{ !$loop->last ? 'border-b border-gray-50' : '' }}">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full {{ $item['dot'] }} shrink-0"></div>
                        <div>
                            <h4 class="font-semibold text-gray-700 text-xs">{{ $item['tanggal'] }}</h4>
                            <p class="text-[11px] text-gray-400 mt-0.5">{{ $item['ket'] }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5">
                        @if(isset($item['jam']))
                            <span class="text-[11px] text-gray-400 font-medium hidden sm:block">{{ $item['jam'] }}</span>
                        @endif
                        <span class="{{ $item['badge'] }} font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            {{ $item['status'] }}
                        </span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

</div>