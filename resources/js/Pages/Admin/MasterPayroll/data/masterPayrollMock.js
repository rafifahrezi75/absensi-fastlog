export const INITIAL_GOLONGAN = [
    { id: 1, kode: 'GOL-01', nama: 'Manager', gajiPokok: 10000000, tarifLembur: 100000, status: 'aktif', keterangan: 'Level Manajerial' },
    { id: 2, kode: 'GOL-02', nama: 'Supervisor', gajiPokok: 7500000, tarifLembur: 75000, status: 'aktif', keterangan: 'Level Supervisor' },
    { id: 3, kode: 'GOL-03', nama: 'Staff', gajiPokok: 5000000, tarifLembur: 50000, status: 'aktif', keterangan: 'Karyawan Reguler' },
    { id: 4, kode: 'GOL-04', nama: 'Intern', gajiPokok: 3000000, tarifLembur: 25000, status: 'nonaktif', keterangan: 'Magang' },
];

export const INITIAL_KOMPONEN = [
    { id: 1, nama: 'Tunjangan Makan', tipe: 'tambahan', metode: 'nominal', nilai: 300000, basis: null, batasDasar: null, kenaPajak: false, status: 'aktif' },
    { id: 2, nama: 'Uang Transport', tipe: 'tambahan', metode: 'nominal', nilai: 250000, basis: null, batasDasar: null, kenaPajak: false, status: 'aktif' },
    { id: 3, nama: 'BPJS Kesehatan', tipe: 'potongan', metode: 'persen', nilai: 1, basis: null, batasDasar: 12000000, kenaPajak: false, status: 'aktif' },
    { id: 4, nama: 'BPJS JHT', tipe: 'potongan', metode: 'persen', nilai: 2, basis: null, batasDasar: null, kenaPajak: false, status: 'aktif' },
    { id: 5, nama: 'BPJS JP', tipe: 'potongan', metode: 'persen', nilai: 1, basis: null, batasDasar: 10000000, kenaPajak: false, status: 'aktif' }, // verifikasi batas upah JP terbaru
    { id: 6, nama: 'Denda Keterlambatan', tipe: 'potongan', metode: 'per_satuan', nilai: 25000, basis: 'kejadian_telat', batasDasar: null, kenaPajak: false, status: 'aktif' },
    { id: 7, nama: 'Potongan Alpha', tipe: 'potongan', metode: 'harian', nilai: 0, basis: 'hari_alpha', batasDasar: null, kenaPajak: false, status: 'aktif' },
];

export const isGolonganDipakai = (id) => {
    // TODO: implementasi pengecekan ke tabel karyawan
    return false; 
};

export const isKomponenDipakai = (id) => {
    // TODO: implementasi pengecekan ke tabel riwayat payroll
    return false;
};
