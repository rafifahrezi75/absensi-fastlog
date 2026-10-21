<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeUserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $employees = Employee::orderBy('id')->get();

        foreach ($employees as $employee) {
            $rawName = trim($employee->nama ?? '');
            $slug = Str::slug($rawName, '.');

            if (empty($slug)) {
                $slug = 'karyawan.' . ($employee->pin ?: $employee->id);
            }

            $email = $slug . '@fastlogem.co.id';

            $user = null;
            if ($employee->user_id) {
                $user = User::find($employee->user_id);
            }

            if (!$user) {
                $user = User::where('email', $email)->first();
            }

            $baseSlug = $slug;
            $counter = 1;
            while (User::where('email', $email)->where('id', '!=', $user?->id)->exists()) {
                $email = $baseSlug . $counter . '@fastlogem.co.id';
                $counter++;
            }

            if ($user) {
                $user->update([
                    'name' => $employee->nama,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'user',
                ]);
            } else {
                $user = User::create([
                    'name' => $employee->nama,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'user',
                ]);
            }

            if ($employee->user_id !== $user->id) {
                $employee->update(['user_id' => $user->id]);
            }
        }
    }
}
