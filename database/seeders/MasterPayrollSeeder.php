<?php

namespace Database\Seeders;

use App\Models\SalaryComponent;
use App\Models\SalaryGrade;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterPayrollSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $grades = [
            [
                'kode' => 'GOL-01',
                'nama' => 'Manager',
                'gaji_pokok' => 10000000,
                'tarif_lembur' => 100000,
                'keterangan' => 'Level Manajerial',
                'status' => 'aktif',
            ],
            [
                'kode' => 'GOL-02',
                'nama' => 'Supervisor',
                'gaji_pokok' => 7500000,
                'tarif_lembur' => 75000,
                'keterangan' => 'Level Supervisor',
                'status' => 'aktif',
            ],
            [
                'kode' => 'GOL-03',
                'nama' => 'Staff',
                'gaji_pokok' => 5000000,
                'tarif_lembur' => 50000,
                'keterangan' => 'Karyawan Reguler',
                'status' => 'aktif',
            ],
            [
                'kode' => 'GOL-04',
                'nama' => 'Intern',
                'gaji_pokok' => 3000000,
                'tarif_lembur' => 25000,
                'keterangan' => 'Magang',
                'status' => 'nonaktif',
            ],
        ];

        foreach ($grades as $grade) {
            SalaryGrade::updateOrCreate(['kode' => $grade['kode']], $grade);
        }

        $components = [
            [
                'nama' => 'Tunjangan Makan',
                'tipe' => 'tambahan',
                'metode' => 'nominal',
                'nilai' => 300000,
                'basis' => null,
                'batas_dasar' => null,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'Uang Transport',
                'tipe' => 'tambahan',
                'metode' => 'nominal',
                'nilai' => 250000,
                'basis' => null,
                'batas_dasar' => null,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'BPJS Kesehatan',
                'tipe' => 'potongan',
                'metode' => 'persen',
                'nilai' => 1,
                'basis' => null,
                'batas_dasar' => 12000000,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'BPJS JHT',
                'tipe' => 'potongan',
                'metode' => 'persen',
                'nilai' => 2,
                'basis' => null,
                'batas_dasar' => null,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'BPJS JP',
                'tipe' => 'potongan',
                'metode' => 'persen',
                'nilai' => 1,
                'basis' => null,
                'batas_dasar' => 10000000,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'Denda Keterlambatan',
                'tipe' => 'potongan',
                'metode' => 'per_satuan',
                'nilai' => 25000,
                'basis' => 'kejadian_telat',
                'batas_dasar' => null,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
            [
                'nama' => 'Potongan Alpha',
                'tipe' => 'potongan',
                'metode' => 'harian',
                'nilai' => 0,
                'basis' => 'hari_alpha',
                'batas_dasar' => null,
                'kena_pajak' => false,
                'status' => 'aktif',
            ],
        ];

        foreach ($components as $component) {
            SalaryComponent::updateOrCreate(['nama' => $component['nama']], $component);
        }
    }
}
