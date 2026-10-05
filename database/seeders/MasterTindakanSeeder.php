<?php

namespace Database\Seeders;

use App\Models\MasterTindakan;
use Illuminate\Database\Seeder;

class MasterTindakanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Sangat Awal (>15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Apresiasi Kedisiplinan', 'kategori' => 'Sangat Awal (>15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Tambah Poin Reward', 'kategori' => 'Sangat Awal (>15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Catatan Positif HR', 'kategori' => 'Sangat Awal (>15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Tepat Waktu (0-15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Apresiasi Kedisiplinan', 'kategori' => 'Tepat Waktu (0-15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Tambah Poin Reward', 'kategori' => 'Tepat Waktu (0-15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Catatan Positif HR', 'kategori' => 'Tepat Waktu (0-15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Rekomendasi Bonus', 'kategori' => 'Tepat Waktu (0-15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Shift Pagi', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Verifikasi Jadwal Shift', 'kategori' => 'Shift Pagi', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Penyesuaian Jam Kerja', 'kategori' => 'Shift Pagi', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Apresiasi Shift Penuh', 'kategori' => 'Shift Pagi', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Shift Middle', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Verifikasi Jadwal Shift', 'kategori' => 'Shift Middle', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Penyesuaian Jam Kerja', 'kategori' => 'Shift Middle', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Apresiasi Shift Penuh', 'kategori' => 'Shift Middle', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Toleransi (<15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Teguran Otomatis System', 'kategori' => 'Toleransi (<15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Peringatan Lisan', 'kategori' => 'Toleransi (<15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pemutihan System', 'kategori' => 'Toleransi (<15 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Sedang (15 - 30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Uang Makan 50%', 'kategori' => 'Sedang (15 - 30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Form Alasan Keterlambatan', 'kategori' => 'Sedang (15 - 30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Surat Teguran 1', 'kategori' => 'Sedang (15 - 30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Peringatan Tertulis', 'kategori' => 'Sedang (15 - 30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Berat (>30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Gaji/Transport 100%', 'kategori' => 'Berat (>30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pemanggilan HRD', 'kategori' => 'Berat (>30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'SP 1 (Surat Peringatan)', 'kategori' => 'Berat (>30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Skorsing 1 Hari', 'kategori' => 'Berat (>30 Mnt)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Dinas Luar / Field', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Approved via Portal', 'kategori' => 'Dinas Luar / Field', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pending Verification', 'kategori' => 'Dinas Luar / Field', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Rejected', 'kategori' => 'Dinas Luar / Field', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Reimbursement Operasional', 'kategori' => 'Dinas Luar / Field', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Sakit (Surat Dokter)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Approved (Surat Dokter)', 'kategori' => 'Sakit (Surat Dokter)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Verifikasi Faskes / Dokter', 'kategori' => 'Sakit (Surat Dokter)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Izin Pemulihan Lanjutan', 'kategori' => 'Sakit (Surat Dokter)', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Rejected (Tanpa Surat)', 'kategori' => 'Sakit (Surat Dokter)', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Izin Alasan Penting', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Approved Admin', 'kategori' => 'Izin Alasan Penting', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Jatah Cuti', 'kategori' => 'Izin Alasan Penting', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Izin Khusus Perusahaan', 'kategori' => 'Izin Alasan Penting', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Gaji Proporsional', 'kategori' => 'Izin Alasan Penting', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Cuti Tahunan', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Jatah Cuti', 'kategori' => 'Cuti Tahunan', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Approved Direksi', 'kategori' => 'Cuti Tahunan', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Reschedule Cuti', 'kategori' => 'Cuti Tahunan', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Mangkir 1 Hari', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Gaji Harian', 'kategori' => 'Mangkir 1 Hari', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Surat Panggilan Klarifikasi', 'kategori' => 'Mangkir 1 Hari', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'SP 1 (Surat Peringatan)', 'kategori' => 'Mangkir 1 Hari', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Mangkir >2 Hari Berturut', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'SP 2 (Surat Peringatan)', 'kategori' => 'Mangkir >2 Hari Berturut', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'SP 3 (Peringatan Terakhir)', 'kategori' => 'Mangkir >2 Hari Berturut', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pemanggilan Keluarga', 'kategori' => 'Mangkir >2 Hari Berturut', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Potong Gaji & Tunjangan', 'kategori' => 'Mangkir >2 Hari Berturut', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Lupa Tap Kehadiran', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Konfirmasi via WA/HRD', 'kategori' => 'Lupa Tap Kehadiran', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Koreksi Jam Manual', 'kategori' => 'Lupa Tap Kehadiran', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Teguran Lupa Tap', 'kategori' => 'Lupa Tap Kehadiran', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pemutihan Presensi', 'kategori' => 'Lupa Tap Kehadiran', 'jumlah_kasus' => 0, 'status' => 'aktif'],

            ['nama' => 'Tidak Ada Tindakan', 'kategori' => 'Lupa Tap Out/In', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Konfirmasi via WA/HRD', 'kategori' => 'Lupa Tap Out/In', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Koreksi Jam Manual', 'kategori' => 'Lupa Tap Out/In', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Teguran Lupa Tap', 'kategori' => 'Lupa Tap Out/In', 'jumlah_kasus' => 0, 'status' => 'aktif'],
            ['nama' => 'Pemutihan Presensi', 'kategori' => 'Lupa Tap Out/In', 'jumlah_kasus' => 0, 'status' => 'aktif'],
        ];

        foreach ($data as $item) {
            MasterTindakan::updateOrCreate(
                [
                    'nama' => $item['nama'],
                    'kategori' => $item['kategori'],
                ],
                [
                    'jumlah_kasus' => $item['jumlah_kasus'],
                    'status' => $item['status'],
                ]
            );
        }
    }
}
