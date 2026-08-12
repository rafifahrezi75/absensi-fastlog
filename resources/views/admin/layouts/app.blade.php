<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Absensi Fingerprint')</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    @stack('styles')
    <style>
        /* Transisi halus saat sidebar bergeser */
        .sidebar-transition {
            transition: transform 0.3s ease-in-out, margin-left 0.3s ease-in-out;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden">

    <div class="flex min-h-screen relative">
        
        <!-- Overlay untuk Layar HP / Mobile -->
        <div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-slate-900/50 z-20 hidden lg:hidden backdrop-blur-sm transition-opacity"></div>

        <!-- ================= SIDEBAR ================= -->
        <aside id="sidebar" class="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 fixed lg:static z-30 sidebar-transition -translate-x-full lg:translate-x-0 flex-shrink-0">
            
            <!-- Logo & Tombol Close Mobile -->
            <div class="h-16 flex items-center justify-between px-6 bg-slate-950 font-bold text-white text-lg border-b border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="bg-indigo-600 p-2 rounded-lg">
                        <i data-lucide="fingerprint" class="w-5 h-5 text-white"></i>
                    </div>
                    <span class="logo-text">AbsensiPro</span>
                </div>
                <!-- Tombol tutup khusus mobile -->
                <button onclick="toggleSidebar()" class="lg:hidden text-slate-400 hover:text-white">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Navigasi Menu -->
            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Utama</div>
                
                <!-- 1. Dashboard -->
                <a href="{{ route('dashboard') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('dashboard') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                    <span>Dashboard</span>
                </a>

                <!-- 2. Log Absensi -->
                <a href="{{ route('attendance.index') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('attendance.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="clock" class="w-4 h-4"></i>
                    <span>Log Absensi</span>
                </a>

                <!-- 3. Izin & Lembur -->
                <a href="{{ route('permissions.index') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('permissions.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="file-check-2" class="w-4 h-4"></i>
                    <span>Izin & Lembur</span>
                </a>

                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mt-5 mb-2">Kepegawaian & Gaji</div>

                <!-- 4. Data Karyawan -->
                <a href="{{ route('employees.index') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('employees.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="users" class="w-4 h-4"></i>
                    <span>Data Karyawan</span>
                </a>

                <!-- 5. Penggajian (Payroll) -->
                <a href="{{ route('payroll.index') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('payroll.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="wallet" class="w-4 h-4"></i>
                    <span>Penggajian (Payroll)</span>
                </a>

                <!-- 6. Laporan Presensi -->
                <a href="{{ route('reports.index') }}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('reports.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="file-bar-chart" class="w-4 h-4"></i>
                    <span>Laporan Presensi</span>
                </a>

                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mt-5 mb-2">Sistem & Device</div>

                <!-- 7. Mesin Fingerprint -->
                <a href="#" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('devices.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="cpu" class="w-4 h-4"></i>
                    <span>Mesin Fingerprint</span>
                </a>

                <!-- 8. Pengaturan System -->
                <a href="#" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {{ request()->routeIs('settings.*') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }}">
                    <i data-lucide="settings" class="w-4 h-4"></i>
                    <span>Pengaturan System</span>
                </a>
            </nav>

            <!-- Profil Admin / Logout -->
            <div class="p-4 border-t border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                        AD
                    </div>
                    <div class="truncate">
                        <div class="text-sm font-medium text-white truncate">Admin Utama</div>
                        <div class="text-xs text-slate-500 truncate">admin@absensi.com</div>
                    </div>
                </div>
                <button title="Logout" class="text-slate-400 hover:text-rose-400 p-1 transition flex-shrink-0">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
            </div>
        </aside>
        <!-- ================= CONTENT WRAPPER ================= -->
        <div class="flex-1 flex flex-col min-w-0">
            
            <!-- Header / Navbar -->
            <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
                
                <!-- Left Header: Button Toggle Sidebar & Status -->
                <div class="flex items-center gap-3">
                    <!-- TOMBOL TOGGLE SIDEBAR (Sembunyikan/Tampilkan Sidebar) -->
                    <button onclick="toggleSidebar()" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition border border-slate-200" title="Geser Sidebar">
                        <i data-lucide="panel-left" class="w-5 h-5"></i>
                    </button>

                    <span class="hidden sm:inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Mesin Fingerprint Online
                    </span>
                </div>

                <!-- Right Header Tools -->
                <div class="flex items-center gap-4">
                    <button class="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
                        <i data-lucide="bell" class="w-5 h-5"></i>
                        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                    </button>
                    <div class="h-6 w-px bg-slate-200"></div>
                    <div class="text-xs text-slate-500 font-medium">
                        {{ \Carbon\Carbon::now()->isoFormat('D MMMM Y') }}
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="flex-1 p-4 sm:p-6">
                @yield('content')
            </main>

        </div>
    </div>

    <!-- Script JavaScript untuk Toggle Geser Sidebar -->
    <script>
        lucide.createIcons();

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const isDesktop = window.innerWidth >= 1024;

            if (isDesktop) {
                // Di layar Laptop/Desktop: Sembunyikan dengan geser margin ke kiri
                if (sidebar.classList.contains('lg:-ml-64')) {
                    sidebar.classList.remove('lg:-ml-64');
                } else {
                    sidebar.classList.add('lg:-ml-64');
                }
            } else {
                // Di layar Mobile/Tablet: Slide dari luar layar (pakai translate)
                if (sidebar.classList.contains('-translate-x-full')) {
                    sidebar.classList.remove('-translate-x-full');
                    overlay.classList.remove('hidden');
                } else {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                }
            }
        }
    </script>
    @stack('scripts')
</body>
</html>