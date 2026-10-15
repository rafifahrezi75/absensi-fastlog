<?php

namespace Database\Seeders;

use App\Http\Controllers\Admin\PayrollController;
use App\Models\Employee;
use App\Models\SalaryGrade;
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
        if ($employees->isEmpty()) {
            return;
        }

        $pool = [];
        $totalEmps = $employees->count();

        $numManagers = max(1, (int)round($totalEmps * 0.12));
        $numSupervisors = max(2, (int)round($totalEmps * 0.20));
        $numInterns = max(2, (int)round($totalEmps * 0.16));
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
            $grade = $assigned['grade'];
            $rolePrefix = $assigned['title'];

            $deptName = $emp->dept ?: 'Operasional';
            $jabatan = $rolePrefix . ' ' . $deptName;

            $emp->update([
                'salary_grade_id' => $grade->id,
                'jabatan' => $jabatan,
            ]);
        }

        $payrollController = new PayrollController();
        foreach (['2026-09', '2026-10'] as $periode) {
            $request = new Request(['periode' => $periode]);
            $payrollController->recalculate($request);
        }
    }
}
