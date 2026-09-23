<?php

namespace Database\Seeders;

use App\Models\Employee;
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

        Employee::updateOrCreate(
            ['nama' => 'Budi Santoso'],
            [
                'user_id' => $user->id,
                'nik' => 'FL-2026-001',
                'dept' => 'Operasional',
                'jabatan' => 'Staff Logistik',
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
            $aliefEmployee->update(['user_id' => $aliefUser->id]);
        }
    }
}
