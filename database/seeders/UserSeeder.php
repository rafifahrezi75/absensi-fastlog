<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\SalaryGrade;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $staffGrade = SalaryGrade::where('kode', 'GOL-03')->first() ?? SalaryGrade::first();
        $spvGrade = SalaryGrade::where('kode', 'GOL-02')->first() ?? $staffGrade;
        $mgrGrade = SalaryGrade::where('kode', 'GOL-01')->first() ?? $spvGrade;

        $accounts = [
            [
                'email' => 'bizdev@fastlogem.co.id',
                'name' => 'Rafi Pratama (BizDev)',
                'role' => 'admin',
                'nik' => 'FL-IT-001',
                'dept' => 'Business Development',
                'jabatan' => 'Business Development & IT Specialist',
                'grade_id' => $spvGrade?->id,
                'is_exempt' => true,
            ],
            [
                'email' => 'admin@fastlogem.co.id',
                'name' => 'Admin Utama',
                'role' => 'admin',
                'nik' => 'FL-ADM-001',
                'dept' => 'IT & Sistem',
                'jabatan' => 'System Administrator',
                'grade_id' => $spvGrade?->id,
                'is_exempt' => true,
            ],
            [
                'email' => 'dirut@fastlogem.co.id',
                'name' => 'Hendro Prasetyo',
                'role' => 'admin',
                'nik' => 'FL-DIR-001',
                'dept' => 'Direksi',
                'jabatan' => 'Direktur Utama',
                'grade_id' => $mgrGrade?->id,
                'is_exempt' => true,
            ],
            [
                'email' => 'dir.finance@fastlogem.co.id',
                'name' => 'Dewi Sartika',
                'role' => 'admin',
                'nik' => 'FL-DIR-002',
                'dept' => 'Finance & Accounting',
                'jabatan' => 'Direktur Finance & Accounting',
                'grade_id' => $mgrGrade?->id,
                'is_exempt' => true,
            ],
            [
                'email' => 'dir.ops@fastlogem.co.id',
                'name' => 'Surya Wijaya',
                'role' => 'admin',
                'nik' => 'FL-DIR-003',
                'dept' => 'Operasional',
                'jabatan' => 'Direktur Operasional & Marketing',
                'grade_id' => $mgrGrade?->id,
                'is_exempt' => true,
            ],
            [
                'email' => 'gm@fastlogem.co.id',
                'name' => 'Fajar Nugroho',
                'role' => 'admin',
                'nik' => 'FL-MGT-001',
                'dept' => 'Operasional',
                'jabatan' => 'General Manager',
                'grade_id' => $mgrGrade?->id,
                'is_exempt' => false,
            ],
            [
                'email' => 'spv.finance@fastlogem.co.id',
                'name' => 'Rina Anggraini',
                'role' => 'admin',
                'nik' => 'FL-SPV-001',
                'dept' => 'Finance & Accounting',
                'jabatan' => 'Supervisor Finance & Accounting',
                'grade_id' => $spvGrade?->id,
                'is_exempt' => false,
            ],
            [
                'email' => 'spv.ops@fastlogem.co.id',
                'name' => 'Agus Setiawan',
                'role' => 'admin',
                'nik' => 'FL-SPV-002',
                'dept' => 'Operasional',
                'jabatan' => 'Supervisor Operasional, CS & GA',
                'grade_id' => $spvGrade?->id,
                'is_exempt' => false,
            ],
            [
                'email' => 'user@fastlogem.co.id',
                'name' => 'Budi Santoso',
                'role' => 'user',
                'nik' => 'FL-STF-001',
                'dept' => 'Operasional',
                'jabatan' => 'Staf Operasional',
                'grade_id' => $staffGrade?->id,
                'is_exempt' => false,
            ],
            [
                'email' => 'staf.finance@fastlogem.co.id',
                'name' => 'Nadia Putri',
                'role' => 'user',
                'nik' => 'FL-STF-002',
                'dept' => 'Finance & Accounting',
                'jabatan' => 'Staf Finance',
                'grade_id' => $staffGrade?->id,
                'is_exempt' => false,
            ],
        ];

        foreach ($accounts as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => Hash::make('password'),
                    'role' => $acc['role'],
                ]
            );

            Employee::updateOrCreate(
                ['nama' => $acc['name']],
                [
                    'user_id' => $user->id,
                    'nik' => $acc['nik'],
                    'dept' => $acc['dept'],
                    'jabatan' => $acc['jabatan'],
                    'salary_grade_id' => $acc['grade_id'],
                    'is_exempt' => $acc['is_exempt'],
                    'status' => 'aktif',
                ]
            );
        }

        $aliefEmployee = Employee::where('nama', 'alief')->first();
        if ($aliefEmployee) {
            $aliefUser = User::updateOrCreate(
                ['email' => 'alief@fastlogem.co.id'],
                [
                    'name' => 'alief',
                    'password' => Hash::make('password'),
                    'role' => 'user',
                ]
            );
            $aliefEmployee->update([
                'user_id' => $aliefUser->id,
                'salary_grade_id' => $aliefEmployee->salary_grade_id ?: $staffGrade?->id,
            ]);
        }
    }
}
