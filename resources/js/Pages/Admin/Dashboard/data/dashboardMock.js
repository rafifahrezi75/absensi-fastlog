export const dashboardMockRecentLogs = [
    {
        initials: 'BS',
        nama: 'Budi Santoso',
        jabatan: 'Software Engineer',
        inTime: '07:54:10',
        status: 'Tepat Waktu',
        statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        method: 'Fingerprint'
    },
    {
        initials: 'AR',
        nama: 'Ahmad Rizky',
        jabatan: 'Digital Marketing',
        inTime: '08:14:22',
        status: 'Telat 14 Mnt',
        statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
        method: 'Fingerprint'
    },
    {
        initials: 'SA',
        nama: 'Siti Aminah',
        jabatan: 'Accountant',
        inTime: '-',
        status: 'Sakit (Approved)',
        statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
        method: 'Portal User'
    }
];

export const dashboardMockAbsentEmployees = [
    {
        initials: 'DL',
        nama: 'Dewi Lestari',
        dept: 'UI/UX Designer',
        bg: 'bg-indigo-100 text-indigo-700'
    },
    {
        initials: 'RH',
        nama: 'Rudi Hermawan',
        dept: 'DevOps Engineer',
        bg: 'bg-purple-100 text-purple-700'
    }
];

export const dashboardMockStats = {
    totalKaryawan: 52,
    enrolledFingerprint: 48,
    hadirHariIni: 42,
    kehadiranPercentage: '80.7%',
    terlambat: 4,
    izinDinas: 6,
    overtimeHours: '128.5 Jam',
    overtimeEmployees: 14
};

// ==================== MASTER TINDAKAN HR (dipakai fitur "Kelola Tindakan HR" di Dashboard) ====================

// PENTING: daftar ini HARUS mencakup semua sub-kategori level-2 di semua cabang
// (Tepat Waktu, Terlambat, Izin/Sakit/Dinas, Alpa) — kalau ada kategori yang tidak
// didaftarkan di sini, chart level-3 untuk kategori itu akan tampil kosong.
export const KATEGORI_TINDAKAN = [
    // Cabang: Tepat Waktu
    'Sangat Awal (>15 Mnt)',
    'Tepat Waktu (0-15 Mnt)',
    'Shift Pagi',
    'Shift Middle',
    // Cabang: Terlambat
    'Toleransi (<15 Mnt)',
    'Sedang (15 - 30 Mnt)',
    'Berat (>30 Mnt)',
    // Cabang: Izin / Sakit / Dinas
    'Dinas Luar / Field',
    'Sakit (Surat Dokter)',
    'Izin Alasan Penting',
    'Cuti Tahunan',
    // Cabang: Tanpa Ket. (Alpa)
    'Mangkir 1 Hari',
    'Mangkir >2 Hari Berturut',
    'Lupa Tap Out/In',
];

export const INITIAL_TINDAKAN = [
    // Tepat Waktu
    { id: 1, nama: 'Apresiasi Kedisiplinan', kategori: 'Sangat Awal (>15 Mnt)', jumlahKasus: 6, status: 'aktif' },
    { id: 2, nama: 'Tidak Ada Tindakan', kategori: 'Tepat Waktu (0-15 Mnt)', jumlahKasus: 20, status: 'aktif' },
    { id: 3, nama: 'Verifikasi Jadwal Shift', kategori: 'Shift Pagi', jumlahKasus: 3, status: 'aktif' },
    { id: 4, nama: 'Verifikasi Jadwal Shift', kategori: 'Shift Middle', jumlahKasus: 1, status: 'aktif' },
    // Terlambat
    { id: 5, nama: 'Teguran Otomatis System', kategori: 'Toleransi (<15 Mnt)', jumlahKasus: 15, status: 'aktif' },
    { id: 6, nama: 'Peringatan Lisan', kategori: 'Toleransi (<15 Mnt)', jumlahKasus: 5, status: 'aktif' },
    { id: 7, nama: 'Pemutihan System', kategori: 'Toleransi (<15 Mnt)', jumlahKasus: 2, status: 'aktif' },
    { id: 8, nama: 'Potong Uang Makan 50%', kategori: 'Sedang (15 - 30 Mnt)', jumlahKasus: 8, status: 'aktif' },
    { id: 9, nama: 'Form Alasan Keterlambatan', kategori: 'Sedang (15 - 30 Mnt)', jumlahKasus: 4, status: 'aktif' },
    { id: 10, nama: 'Surat Teguran 1', kategori: 'Sedang (15 - 30 Mnt)', jumlahKasus: 1, status: 'aktif' },
    { id: 11, nama: 'Potong Gaji/Transport 100%', kategori: 'Berat (>30 Mnt)', jumlahKasus: 3, status: 'aktif' },
    { id: 12, nama: 'Pemanggilan HRD', kategori: 'Berat (>30 Mnt)', jumlahKasus: 2, status: 'aktif' },
    { id: 13, nama: 'SP 1 (Surat Peringatan)', kategori: 'Berat (>30 Mnt)', jumlahKasus: 1, status: 'aktif' },
    // Izin / Sakit / Dinas
    { id: 14, nama: 'Approved via Portal', kategori: 'Dinas Luar / Field', jumlahKasus: 5, status: 'aktif' },
    { id: 15, nama: 'Pending Verification', kategori: 'Dinas Luar / Field', jumlahKasus: 1, status: 'aktif' },
    { id: 16, nama: 'Rejected', kategori: 'Dinas Luar / Field', jumlahKasus: 0, status: 'aktif' },
    { id: 17, nama: 'Approved (Surat Dokter)', kategori: 'Sakit (Surat Dokter)', jumlahKasus: 0, status: 'aktif' },
    { id: 18, nama: 'Approved Admin', kategori: 'Izin Alasan Penting', jumlahKasus: 0, status: 'aktif' },
    { id: 19, nama: 'Potong Jatah Cuti', kategori: 'Cuti Tahunan', jumlahKasus: 0, status: 'aktif' },
    // Alpa
    { id: 20, nama: 'Potong Gaji Harian', kategori: 'Mangkir 1 Hari', jumlahKasus: 0, status: 'aktif' },
    { id: 21, nama: 'SP 2 (Surat Peringatan)', kategori: 'Mangkir >2 Hari Berturut', jumlahKasus: 0, status: 'aktif' },
    { id: 22, nama: 'Konfirmasi via WA/HRD', kategori: 'Lupa Tap Out/In', jumlahKasus: 0, status: 'aktif' },
];