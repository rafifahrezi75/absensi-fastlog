<?php

namespace Database\Seeders;

use App\Http\Controllers\Admin\PayrollController;
use App\Models\Employee;
use App\Models\SalaryGrade;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Http\Request;

class EmployeeSalarySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        SalaryGrade::where('kode', 'GOL-04')->update(['status' => 'aktif']);

        $grades = SalaryGrade::where('status', 'aktif')->orderBy('id', 'asc')->get()->keyBy('kode');
        if ($grades->isEmpty()) {
            return;
        }

        $managerGrade = $grades->get('GOL-01') ?: $grades->first();
        $supervisorGrade = $grades->get('GOL-02') ?: $grades->first();
        $staffGrade = $grades->get('GOL-03') ?: $grades->first();
        $internGrade = $grades->get('GOL-04') ?: $staffGrade;

        $employees = Employee::orderBy('id', 'asc')->get();
        if ($employees->isNotEmpty()) {
            $pool = [];
            $totalEmps = $employees->count();

            $numManagers = max(1, (int)round($totalEmps * 0.12));
            $numSupervisors = max(1, (int)round($totalEmps * 0.20));
            $numInterns = max(1, (int)round($totalEmps * 0.16));
            $numStaff = max(1, $totalEmps - ($numManagers + $numSupervisors + $numInterns));

            for ($i = 0; $i < $numManagers; $i++) {
                $pool[] = ['grade' => $managerGrade, 'title' => 'Manager'];
            }
            for ($i = 0; $i < $numSupervisors; $i++) {
                $pool[] = ['grade' => $supervisorGrade, 'title' => 'Supervisor'];
            }
            for ($i = 0; $i < $numStaff; $i++) {
                $pool[] = ['grade' => $staffGrade, 'title' => 'Staff'];
            }
            for ($i = 0; $i < $numInterns; $i++) {
                $pool[] = ['grade' => $internGrade, 'title' => 'Intern'];
            }

            shuffle($pool);

            foreach ($employees as $index => $emp) {
                $assigned = $pool[$index] ?? ['grade' => $staffGrade, 'title' => 'Staff'];
                $grade = $assigned['grade'] ?? $staffGrade;
                $rolePrefix = $assigned['title'] ?? 'Staff';

                $deptName = $emp->dept ?: 'Operasional';
                $jabatan = $rolePrefix . ' ' . $deptName;

                $emp->update([
                    'salary_grade_id' => $grade->id,
                    'jabatan' => $jabatan,
                ]);
            }
        }

        Employee::whereNull('salary_grade_id')
            ->orWhere('salary_grade_id', 0)
            ->update(['salary_grade_id' => $staffGrade->id]);

        Employee::where('gaji_pokok_kustom', '<=', 0)
            ->update(['gaji_pokok_kustom' => null]);

        $payrollController = new PayrollController();
        $periods = array_values(array_unique([
            '2026-09',
            '2026-10',
            Carbon::now()->format('Y-m'),
            Carbon::now()->subMonth()->format('Y-m'),
        ]));

        foreach ($periods as $periode) {
            $request = new Request(['periode' => $periode]);
            $payrollController->recalculate($request);
        }
    }
}
