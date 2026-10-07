<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\AttendanceLog;
use App\Models\SystemSetting;
use App\Models\Permission;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $periode = $request->query('periode', date('Y-m'));
        
        // Mengambil pengaturan sistem
        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $lateFinePerMinute = (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = (float)($settingsData['absent_deduction'] ?? 50000);
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);
        
        // "log absensi 7 hari kebelakang"
        $startDate = Carbon::today()->subDays(7);
        $endDate = Carbon::today();

        $employees = Employee::all();
        $payrollData = [];

        foreach ($employees as $employee) {
            $logs = AttendanceLog::where('employee_id', $employee->id)
                ->whereDate('scan_at', '>=', $startDate)
                ->whereDate('scan_at', '<=', $endDate)
                ->orderBy('scan_at', 'asc')
                ->get();

            $groupedByDate = [];
            foreach ($logs as $log) {
                $date = Carbon::parse($log->scan_at)->format('Y-m-d');
                if (!isset($groupedByDate[$date])) {
                    $groupedByDate[$date] = [];
                }
                $groupedByDate[$date][] = Carbon::parse($log->scan_at);
            }
            
            // Ambil dispensasi
            $dispensations = Permission::where('employee_id', $employee->id)
                ->where('category', 'dispensasi_payroll')
                ->where('status', 'disetujui')
                ->whereDate('tanggal_mulai', '>=', $startDate)
                ->whereDate('tanggal_mulai', '<=', $endDate)
                ->pluck('tanggal_mulai')
                ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            $hadir = count($groupedByDate);
            $totalLateMinutes = 0;

            foreach ($groupedByDate as $date => $scans) {
                $firstScan = $scans[0]; // Jam masuk
                $isSat = Carbon::parse($date)->isSaturday();
                
                $schedIn = $isSat ? $satIn : $normalIn;
                $tol = $isSat ? $satTol : $normalTol;
                
                $scheduleIn = Carbon::parse($date . ' ' . $schedIn . ':00');
                $lateThreshold = $scheduleIn->copy()->addMinutes($tol);

                if ($firstScan->gt($lateThreshold)) {
                    $minutesLate = (int) round($scheduleIn->diffInMinutes($firstScan));
                    // Cek dispensasi
                    if (!in_array($date, $dispensations)) {
                        $totalLateMinutes += $minutesLate;
                    }
                }
            }

            // Hitung alpa (Asumsi 7 hari kerja, potong yang hadir)
            $totalHariKerja = 7;
            $alpaCount = 0;
            
            // Loop 7 hari terakhir buat ngecek alpa
            for ($i = 0; $i < $totalHariKerja; $i++) {
                $checkDate = $startDate->copy()->addDays($i)->format('Y-m-d');
                if (!isset($groupedByDate[$checkDate])) { // Ga masuk
                    if (!in_array($checkDate, $dispensations)) {
                        $alpaCount++;
                    }
                }
            }
            
            $alpa = $alpaCount;

            $gajiPokok = 3000000;
            
            // Denda terlambat per menit + potongan mangkir per hari
            $potongan = ($totalLateMinutes * $lateFinePerMinute) + ($alpa * $absentDeduction);
            
            $bonus = 0; // Sementara 0 sesuai instruksi awal

            $deptLabels = [
                'it' => 'IT & Tech',
                'hrd' => 'HRD & General Affair',
                'finance' => 'Finance & Accounting',
                'marketing' => 'Marketing',
            ];
            
            $deptLabel = $deptLabels[$employee->dept] ?? $employee->dept;

            $payrollData[] = [
                'id' => $employee->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'dept' => $employee->dept,
                'deptLabel' => $deptLabel ?: 'Umum',
                'jabatan' => $employee->jabatan ?: 'Staff',
                'gapok' => $gajiPokok,
                'bonus' => $bonus,
                'potongan' => $potongan,
                'status' => 'pending',
                'periode' => $periode,
                'hadir' => $hadir,
                'terlambat' => $totalLateMinutes, // Diubah jadi total menit telat untuk info
                'alpa' => $alpa
            ];
        }

        return response()->json($payrollData);
    }

    public function details(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $employee = Employee::find($employeeId);
        
        if (!$employee) return response()->json(['error' => 'Not found'], 404);

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);
        $lateFinePerMinute = (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = (float)($settingsData['absent_deduction'] ?? 50000);
        
        $startDate = Carbon::today()->subDays(7);
        $endDate = Carbon::today();

        $logs = AttendanceLog::where('employee_id', $employee->id)
            ->whereDate('scan_at', '>=', $startDate)
            ->whereDate('scan_at', '<=', $endDate)
            ->orderBy('scan_at', 'asc')
            ->get();

        $groupedByDate = [];
        foreach ($logs as $log) {
            $date = Carbon::parse($log->scan_at)->format('Y-m-d');
            if (!isset($groupedByDate[$date])) {
                $groupedByDate[$date] = [];
            }
            $groupedByDate[$date][] = Carbon::parse($log->scan_at);
        }

        $dispensations = Permission::where('employee_id', $employee->id)
            ->where('category', 'dispensasi_payroll')
            ->where('status', 'disetujui')
            ->whereDate('tanggal_mulai', '>=', $startDate)
            ->whereDate('tanggal_mulai', '<=', $endDate)
            ->pluck('tanggal_mulai')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $details = [];

        for ($i = 0; $i < 7; $i++) {
            $checkDate = $startDate->copy()->addDays($i)->format('Y-m-d');
            $isDispensed = in_array($checkDate, $dispensations);
            
            if (isset($groupedByDate[$checkDate])) {
                $firstScan = $groupedByDate[$checkDate][0];
                $isSat = Carbon::parse($checkDate)->isSaturday();
                
                $schedIn = $isSat ? $satIn : $normalIn;
                $tol = $isSat ? $satTol : $normalTol;
                
                $scheduleIn = Carbon::parse($checkDate . ' ' . $schedIn . ':00');
                $lateThreshold = $scheduleIn->copy()->addMinutes($tol);
                
                if ($firstScan->gt($lateThreshold)) {
                    $minutesLate = (int) round($scheduleIn->diffInMinutes($firstScan));
                    $details[] = [
                        'date' => $checkDate,
                        'type' => 'Terlambat',
                        'minutes' => $minutesLate,
                        'deduction' => $minutesLate * $lateFinePerMinute,
                        'is_dispensed' => $isDispensed
                    ];
                }
            } else {
                $details[] = [
                    'date' => $checkDate,
                    'type' => 'Alpa / Tidak Hadir',
                    'minutes' => 0,
                    'deduction' => $absentDeduction,
                    'is_dispensed' => $isDispensed
                ];
            }
        }

        return response()->json(array_reverse($details));
    }

    public function dispense(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required',
            'date' => 'required|date',
            'is_dispensed' => 'required|boolean'
        ]);

        if ($validated['is_dispensed']) {
            Permission::firstOrCreate([
                'employee_id' => $validated['employee_id'],
                'category' => 'dispensasi_payroll',
                'tanggal_mulai' => $validated['date'],
                'tanggal_selesai' => $validated['date'],
            ], [
                'status' => 'disetujui',
                'keterangan' => 'Dispensasi manual via payroll'
            ]);
        } else {
            Permission::where('employee_id', $validated['employee_id'])
                ->where('category', 'dispensasi_payroll')
                ->where('tanggal_mulai', $validated['date'])
                ->delete();
        }

        return response()->json(['success' => true]);
    }
}
