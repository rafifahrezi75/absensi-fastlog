<header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
    <div class="flex items-center space-x-4">
        <button @click="sidebarOpen = true" class="lg:hidden text-gray-500 hover:text-gray-700">
            <i data-lucide="menu" class="w-6 h-6"></i>
        </button>

        <div>
            <h2 class="text-lg font-bold text-gray-800">Sistem Absensi Karyawan</h2>
            <p class="text-sm text-gray-400 hidden sm:block">Malang Creative Center</p>
        </div>
    </div>

    <div class="flex items-center gap-3">
        <div class="bg-orange-50 text-brand-orange border border-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold">
            <i data-lucide="user" class="w-3.5 h-3.5"></i>
            <span>Karyawan</span>
        </div>
        <div class="text-sm text-gray-400 font-medium hidden md:block">
            Sen, 10 Agu 2026
        </div>
    </div>
</header>