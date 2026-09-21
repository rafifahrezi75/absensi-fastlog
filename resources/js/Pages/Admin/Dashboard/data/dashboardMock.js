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
