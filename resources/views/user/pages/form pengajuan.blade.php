<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6" x-data="{ locationCaptured: false, locationText: '' }">

    <div class="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <button @click="goHome()" class="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition shrink-0">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
        <div>
            <h3 class="text-base font-bold text-gray-800">
                Pengajuan <span x-text="formType" class="text-brand-orange"></span>
            </h3>
            <p class="text-xs text-gray-400">Lengkapi formulir di bawah ini untuk mengajukan permohonan.</p>
        </div>
    </div>

    <form class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai</label>
                <input type="date" class="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Selesai</label>
                <input type="date" class="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan / Alasan</label>
            <textarea rows="3" placeholder="Tuliskan keterangan detail di sini..." class="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition resize-none"></textarea>
        </div>

        <!-- Upload Foto: untuk Izin & Sakit -->
        <div x-show="formType === 'Izin' || formType === 'Sakit'">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                Upload Foto Bukti <span class="text-gray-400 font-normal">(Surat Dokter / Dokumentasi Pendukung)</span>
            </label>
            <label class="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-orange hover:bg-orange-50/30 transition cursor-pointer">
                <input type="file" accept="image/*" capture="environment" class="hidden">
                <i data-lucide="camera" class="w-6 h-6 mx-auto text-gray-300 mb-2"></i>
                <p class="text-xs text-gray-600 font-medium">Ambil foto atau unggah dari galeri</p>
                <p class="text-[11px] text-gray-400 mt-1">Format JPG, PNG (Maks 2MB)</p>
            </label>
        </div>

       <div x-data="{
    locationCaptured: false,
    locationText: '',
    coords: null,
    photoTaken: false,
    photoDataUrl: '',
    cameraActive: false,
    stream: null,

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            this.$refs.video.srcObject = this.stream;
            this.cameraActive = true;
        } catch (e) {
            alert('Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.');
        }
    },

    capturePhotoAndLocation() {
        // Ambil foto dari video ke canvas
        const video = this.$refs.video;
        const canvas = this.$refs.canvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        this.photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        this.photoTaken = true;

        // Matikan kamera setelah foto diambil
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.cameraActive = false;

        // Ambil lokasi bersamaan
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                this.locationText = 'Lat: ' + pos.coords.latitude.toFixed(5) + ', Long: ' + pos.coords.longitude.toFixed(5);
                this.locationCaptured = true;
            },
            () => { alert('Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.'); }
        );
    },

    retake() {
        this.photoTaken = false;
        this.locationCaptured = false;
        this.startCamera();
    }
}" x-show="formType === 'Dinas'">

    <label class="block text-xs font-semibold text-gray-700 mb-1.5">
        Bukti Kehadiran Dinas Luar <span class="text-gray-400 font-normal">(Foto + Lokasi Real-time)</span>
    </label>

    <!-- STATE 1: Belum ambil apa-apa, tombol mulai -->
    <div x-show="!cameraActive && !photoTaken" class="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
        <div class="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="camera" class="w-6 h-6 text-brand-orange"></i>
        </div>
        <p class="text-sm font-semibold text-gray-700 mb-1">Ambil Foto & Lokasi Sekarang</p>
        <p class="text-xs text-gray-400 mb-4">Kamera dan lokasi Anda akan diambil secara langsung untuk verifikasi</p>
        <button type="button" @click="startCamera()"
            class="inline-flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/25">
            <i data-lucide="camera" class="w-4 h-4"></i>
            Buka Kamera
        </button>
    </div>

    <!-- STATE 2: Kamera aktif, live preview -->
    <div x-show="cameraActive" class="relative rounded-2xl overflow-hidden bg-black">
        <video x-ref="video" autoplay playsinline class="w-full h-72 object-cover"></video>

        <!-- Overlay info lokasi kecil di pojok -->
        <div class="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live · Lokasi akan diambil otomatis
        </div>

        <!-- Tombol shutter -->
        <div class="absolute bottom-4 left-0 right-0 flex justify-center">
            <button type="button" @click="capturePhotoAndLocation()"
                class="w-16 h-16 rounded-full bg-white border-4 border-brand-orange flex items-center justify-center shadow-xl active:scale-95 transition">
                <div class="w-11 h-11 rounded-full bg-brand-orange"></div>
            </button>
        </div>
    </div>

    <!-- Canvas tersembunyi, buat proses capture -->
    <canvas x-ref="canvas" class="hidden"></canvas>

    <!-- STATE 3: Sudah ambil foto + lokasi, tampilkan hasil -->
    <div x-show="photoTaken && locationCaptured" class="rounded-2xl overflow-hidden border border-emerald-100">
        <div class="relative">
            <img :src="photoDataUrl" class="w-full h-56 object-cover">
            <div class="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                Terverifikasi
            </div>
        </div>
        <div class="bg-emerald-50 p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-emerald-700">Lokasi berhasil direkam</p>
                <p class="text-[11px] text-emerald-600 truncate" x-text="locationText"></p>
            </div>
            <button type="button" @click="retake()" class="text-emerald-700 hover:text-emerald-900 text-xs font-semibold shrink-0 px-3 py-1.5 bg-emerald-100 rounded-lg transition">
                Ambil Ulang
            </button>
        </div>
    </div>

</div>

        <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="goHome()" class="px-5 py-2.5 rounded-xl font-semibold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                Batal
            </button>
            <button type="submit" class="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-orange hover:bg-orange-600 transition shadow-lg shadow-orange-500/25">
                Kirim Pengajuan
            </button>
        </div>
    </form>
</div>