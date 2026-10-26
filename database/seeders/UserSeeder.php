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
        $user = User::updateOrCreate(
            ['email' => 'user@fastlogem.co.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        $staffGrade = SalaryGrade::where('kode', 'GOL-03')->first() ?? SalaryGrade::first();

        Employee::updateOrCreate(
            ['nama' => 'Budi Santoso'],
            [
                'user_id' => $user->id,
                'nik' => 'FL-2026-001',
                'dept' => 'Operasional',
                'jabatan' => 'Staff Logistik',
                'salary_grade_id' => $staffGrade?->id,
                'status' => 'active',
            ]
        );

        $aliefUser = User::updateOrCreate(
            ['email' => 'alief@fastlogem.co.id'],
            [
                'name' => 'alief',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        $aliefEmployee = Employee::where('nama', 'alief')->first();
        if ($aliefEmployee) {
            $aliefEmployee->update([
                'user_id' => $aliefUser->id,
                'salary_grade_id' => $aliefEmployee->salary_grade_id ?: $staffGrade?->id,
            ]);
        }
    }
}
