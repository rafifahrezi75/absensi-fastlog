<!-- Overlay Mobile -->
<div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>

<aside class="fixed inset-y-0 left-0 z-50 w-72 bg-brand-dark flex flex-col transition-transform duration-300 lg:static lg:translate-x-0"
       :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">

    <!-- Logo -->
    <div class="h-20 flex items-center px-6 border-b border-white/10">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white shrink-0">
                <i data-lucide="building-2" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
                <h1 class="text-white font-bold text-base leading-tight truncate">MCC Absensi</h1>
                <p class="text-xs text-white/50">Malang Creative Center</p>
            </div>
        </div>
    </div>

    <!-- Profile Card -->
    <div class="p-5">
        <div class="bg-brand-card rounded-2xl p-4 flex items-center space-x-3 border border-white/10">
            <div class="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                B
            </div>
            <div class="min-w-0">
                <h3 class="text-white font-semibold text-sm truncate">Budi Santoso</h3>
                <p class="text-xs text-white/50 truncate">Desainer Grafis</p>
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 space-y-1.5">
        <button @click="goHome(); sidebarOpen = false"
                class="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition text-sm font-medium"
                :class="currentView === 'dashboard' ? 'bg-brand-orange text-white font-semibold shadow-lg shadow-orange-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'">
            <i data-lucide="layout-grid" class="w-[18px] h-[18px]"></i>
            <span>Dashboard</span>
        </button>

        <button @click="openRiwayat(); sidebarOpen = false"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition text-sm font-medium">
            <i data-lucide="clock" class="w-[18px] h-[18px]"></i>
            <span>Riwayat Pengajuan</span>
        </button>
    </nav>

    <!-- Logout -->
    <div class="p-5 border-t border-white/10">
        <button class="w-full flex items-center space-x-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-xl transition text-sm font-medium">
            <i data-lucide="log-out" class="w-[18px] h-[18px]"></i>
            <span>Keluar</span>
        </button>
    </div>
</aside>