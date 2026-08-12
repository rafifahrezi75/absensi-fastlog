<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Pengajuan Karyawan - MCC Absensi</title>

    <!-- Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind + Alpine -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style> [x-cloak] { display: none !important; } </style>
</head>
<body class="bg-[#f8f9fa] font-sans antialiased text-gray-800"
      x-data="{
          sidebarOpen: false,
          currentView: 'dashboard',
          formType: '',
          loading: false,

          openForm(type) {
              this.loading = true;
              setTimeout(() => {
                  this.formType = type;
                  this.currentView = 'form';
                  this.loading = false;
                  this.$nextTick(() => window.createLucideIcons());
              }, 300);
          },
          openRiwayat() {
              this.loading = true;
              setTimeout(() => {
                  this.currentView = 'riwayat';
                  this.loading = false;
                  this.$nextTick(() => window.createLucideIcons());
              }, 300);
          },
          goHome() {
              this.loading = true;
              setTimeout(() => {
                  this.currentView = 'dashboard';
                  this.formType = '';
                  this.loading = false;
                  this.$nextTick(() => window.createLucideIcons());
              }, 300);
          }
      }">

    <!-- Overlay Mobile -->
    <div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>

    <!-- Main Flex Layout Container -->
    <div class="flex h-screen overflow-hidden">

        <!-- 1. Sidebar Component -->
        @include('user.components.sidebar')

        <!-- 2. Main Right Area Wrapper -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

            <!-- Header Component -->
            @include('user.components.header')

            <!-- Dynamic Content Area -->
            <main class="flex-1 overflow-y-auto p-4 md:p-8">

                <!-- Loader -->
                <div x-show="loading" x-cloak class="flex justify-center items-center py-20">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange"></div>
                </div>

                <!-- Page View Wrapper -->
                <div x-show="!loading" class="max-w-5xl mx-auto space-y-6">

                    <!-- Dashboard View -->
                    <template x-if="currentView === 'dashboard'">
                        @include('user.pages.index')
                    </template>

                    <!-- Form View -->
                    <template x-if="currentView === 'form'">
                        @include('user.pages.form pengajuan')
                    </template>

                    <!-- History View -->
                    <template x-if="currentView === 'riwayat'">
                        @include('user.pages.riwayat')
                    </template>

                </div>
            </main>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
        });
        window.createLucideIcons = () => {
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
        }
    </script>
</body>
</html>