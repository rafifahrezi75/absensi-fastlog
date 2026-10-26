<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\OvertimeLog;
use App\Models\Payroll;
use App\Models\Permission;
use App\Models\SalaryComponent;
use App\Models\SystemSetting;
use App\Services\LateCalculationService;
use App\Services\OvertimeCalculationService;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $periode = $request->query('periode');
        if (!$periode || !preg_match('/^\d{4}-\d{2}$/', $periode)) {
            $periode = date('Y-m');
        }

        $payrollData = $this->calculatePayrollForPeriod($periode);

        return response()->json($payrollData);
    }

    public function recalculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $periode = $validated['periode'];
        $payrollData = $this->calculatePayrollForPeriod($periode, true);

        return response()->json([
            'message' => 'Payroll berhasil dikalkulasi ulang.',
            'data' => $payrollData,
        ]);
    }

    public function markPaid(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $employeeId = $validated['employee_id'];
        $periode = $validated['periode'];

        $payroll = Payroll::where('employee_id', $employeeId)
            ->where('periode', $periode)
            ->first();

        if (!$payroll) {
            $this->calculatePayrollForPeriod($periode);
            $payroll = Payroll::where('employee_id', $employeeId)
                ->where('periode', $periode)
                ->firstOrFail();
        }

        $payroll->update([
            'status' => 'paid',
            'dibayar_pada' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Gaji karyawan berhasil ditandai sebagai dibayar.',
            'payroll' => $payroll,
        ]);
    }

    public function details(Request $request): JsonResponse
    {
        $employeeId = $request->query('employee_id');
        $periode = $request->query('periode', date('Y-m'));

        $employee = Employee::with('salaryGrade')->find($employeeId);
        if (!$employee) {
            return response()->json(['error' => 'Karyawan tidak ditemukan.'], 404);
        }

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();
        $lateFineComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'keterlambatan') || str_contains(strtolower($c->nama), 'telat');
        });
        $absentComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'alpha') || str_contains(strtolower($c->nama), 'alpa');
        });

        $lateFinePerMinute = ($lateFineComp && (float)$lateFineComp->nilai > 0) ? (float)$lateFineComp->nilai : (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = ($absentComp && (float)$absentComp->nilai > 0) ? (float)$absentComp->nilai : (float)($settingsData['absent_deduction'] ?? 50000);

        $monthDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $startDate = $monthDate->copy()->startOfMonth();
        $endDate = $monthDate->copy()->endOfMonth();
        $today = Carbon::today();
        $checkLimit = $today->lt($endDate) ? $today : $endDate;

        $logs = AttendanceLog::where('employee_id', $employee->id)
            ->whereDate('scan_at', '>=', $startDate)
            ->whereDate('scan_at', '<=', $endDate)
            ->orderBy('scan_at', 'asc')
            ->get();

        $groupedByDate = [];
        foreach ($logs as $log) {
            $d = Carbon::parse($log->scan_at)->format('Y-m-d');
            if (!isset($groupedByDate[$d])) {
                $groupedByDate[$d] = [];
            }
            $groupedByDate[$d][] = Carbon::parse($log->scan_at);
        }

        $holidays = Holiday::whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->pluck('keterangan', 'tanggal')
            ->toArray();

        $dispensations = Permission::where('employee_id', $employee->id)
            ->where('category', 'dispensasi_payroll')
            ->whereIn('status', ['disetujui', 'approved'])
            ->whereDate('tanggal_mulai', '>=', $startDate)
            ->whereDate('tanggal_mulai', '<=', $endDate)
            ->pluck('tanggal_mulai')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $lateService = app(LateCalculationService::class);
        $lateResult = $lateService->calculateMonth(
            $employee,
            $groupedByDate,
            $dispensations,
            $normalIn,
            $normalTol,
            $satIn,
            $satTol
        );

        $details = [];
        $curr = $checkLimit->copy();

        while ($curr->gte($startDate)) {
            $dateStr = $curr->format('Y-m-d');
            $isSunday = $curr->isSunday();
            $isSaturday = $curr->isSaturday();
            $isHoliday = isset($holidays[$dateStr]);
            $isDispensed = in_array($dateStr, $dispensations);

            if ($isSunday) {
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Hari Libur Akhir Pekan',
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => 0,
                    'is_dispensed' => false,
                    'is_holiday' => true,
                ];
            } elseif ($isHoliday) {
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Libur Nasional: ' . $holidays[$dateStr],
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => 0,
                    'is_dispensed' => false,
                    'is_holiday' => true,
                ];
            } elseif (isset($groupedByDate[$dateStr])) {
                $firstScan = $groupedByDate[$dateStr][0];
                $dayLate = $lateResult['daily_details'][$dateStr] ?? null;

                if ($employee->is_exempt) {
                    $details[] = [
                        'date' => $dateStr,
                        'day_name' => $curr->translatedFormat('l'),
                        'type' => 'Bebas Denda (Khusus)',
                        'first_scan' => $firstScan->format('H:i:s'),
                        'minutes' => 0,
                        'deduction' => 0,
                        'is_dispensed' => false,
                        'is_holiday' => false,
                        'status_text' => 'Bebas Denda & Lembur',
                    ];
                } elseif ($dayLate && $dayLate['minutes_late'] > 0) {
                    $details[] = [
                        'date' => $dateStr,
                        'day_name' => $curr->translatedFormat('l'),
                        'type' => 'Terlambat (' . $dayLate['status_text'] . ')',
                        'first_scan' => $firstScan->format('H:i:s'),
                        'minutes' => $dayLate['minutes_late'],
                        'deduction' => $dayLate['deduction'],
                        'is_dispensed' => $isDispensed,
                        'is_holiday' => false,
                        'status_text' => $dayLate['status_text'],
                    ];
                } else {
                    $details[] = [
                        'date' => $dateStr,
                        'day_name' => $curr->translatedFormat('l'),
                        'type' => 'Tepat Waktu',
                        'first_scan' => $firstScan->format('H:i:s'),
                        'minutes' => 0,
                        'deduction' => 0,
                        'is_dispensed' => false,
                        'is_holiday' => false,
                        'status_text' => 'Tepat Waktu',
                    ];
                }
            } else {
                if ($absentComp && $absentComp->metode === 'harian') {
                    $dailyRate = round(($employee->salaryGrade ? (float)$employee->salaryGrade->gaji_pokok : 3000000) / 22);
                } else {
                    $dailyRate = $absentDeduction;
                }
                $deduction = $isDispensed ? 0 : $dailyRate;
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Alpa / Tidak Hadir',
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => $deduction,
                    'is_dispensed' => $isDispensed,
                    'is_holiday' => false,
                ];
            }

            $curr->subDay();
        }

        return response()->json($details);
    }

    public function dispense(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'is_dispensed' => 'required|boolean',
        ]);

        if ($validated['is_dispensed']) {
            Permission::firstOrCreate([
                'employee_id' => $validated['employee_id'],
                'category' => 'dispensasi_payroll',
                'tanggal_mulai' => $validated['date'],
                'tanggal_selesai' => $validated['date'],
            ], [
                'status' => 'disetujui',
                'keterangan' => 'Dispensasi manual via payroll',
            ]);
        } else {
            Permission::where('employee_id', $validated['employee_id'])
                ->where('category', 'dispensasi_payroll')
                ->where('tanggal_mulai', $validated['date'])
                ->delete();
        }

        $period = Carbon::parse($validated['date'])->format('Y-m');
        $this->calculatePayrollForPeriod($period, false);

        return response()->json(['success' => true]);
    }

    public function userSlip(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::with('salaryGrade')
            ->where('user_id', $user->id)
            ->first();

        if (!$employee && $user->email) {
            $employee = Employee::with('salaryGrade')
                ->where('nama', $user->name)
                ->first();
        }

        if (!$employee) {
            return response()->json(['payrolls' => []]);
        }

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();

        $payrolls = Payroll::where('employee_id', $employee->id)
            ->orderBy('periode', 'desc')
            ->get()
            ->map(function ($p) use ($employee, $activeComponents) {
                $savedCatatan = $p->catatan ? json_decode($p->catatan, true) : null;
                $bpjsDetails = $savedCatatan['bpjs_details'] ?? [];
                if (empty($bpjsDetails)) {
                    foreach ($activeComponents->where('tipe', 'potongan')->where('metode', 'persen') as $comp) {
                        $basisVal = (float)$p->gaji_pokok;
                        if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                            $basisVal = (float)$comp->batas_dasar;
                        }
                        $bpjsDetails[] = [
                            'nama' => $comp->nama,
                            'persen' => (float)$comp->nilai,
                            'nominal' => round($basisVal * ((float)$comp->nilai / 100)),
                        ];
                    }
                }
                $tunjanganDetails = $savedCatatan['tunjangan_details'] ?? [];
                if (empty($tunjanganDetails)) {
                    $tunjanganDetails = $activeComponents->where('tipe', 'tambahan')->where('metode', 'nominal')->map(fn($c) => [
                        'nama' => $c->nama,
                        'nominal' => (float)$c->nilai,
                    ])->values()->all();
                }

                return [
                    'id' => $p->id,
                    'employee_id' => $employee->id,
                    'nama' => $employee->nama,
                    'pin' => $employee->pin,
                    'idFinger' => $employee->pin,
                    'nik' => $employee->nik,
                    'dept' => $employee->dept,
                    'jabatan' => $employee->jabatan ?: 'Staff',
                    'golongan' => $employee->salaryGrade?->nama ?: 'Standard',
                    'periode' => $p->periode,
                    'gapok' => (float)$p->gaji_pokok,
                    'tunjangan' => (float)$p->tunjangan,
                    'lembur' => (float)$p->lembur,
                    'bonus' => (float)$p->bonus,
                    'potongan_terlambat' => (float)$p->potongan_terlambat,
                    'potongan_alpa' => (float)$p->potongan_alpa,
                    'potongan_lainnya' => (float)$p->potongan_lainnya,
                    'potongan' => (float)$p->total_potongan,
                    'thp' => (float)$p->thp,
                    'hadir' => $p->hadir_hari,
                    'terlambat' => $p->terlambat_menit,
                    'alpa' => $p->alpa_hari,
                    'lembur_menit' => $p->lembur_menit,
                    'status' => $p->status,
                    'dibayar_pada' => $p->dibayar_pada?->format('Y-m-d H:i:s'),
                    'bpjs_details' => $bpjsDetails,
                    'tunjangan_details' => $tunjanganDetails,
                ];
            });

        return response()->json(['payrolls' => $payrolls]);
    }

    private function prepareSlipViewData(Payroll $payroll): array
    {
        $payroll->loadMissing('employee.salaryGrade');
        $employee = $payroll->employee;

        $deptLabels = [
            'PRODUKSI' => 'Produksi',
            'GUDANG' => 'Gudang',
            'HRD' => 'HRD & GA',
            'IT' => 'IT & Sistem',
            'MARKETING' => 'Marketing',
            'FINANCE' => 'Finance & Accounting',
            'OPERASIONAL' => 'Operasional',
        ];

        $monthNames = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
            '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
            '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember'
        ];
        $parts = explode('-', $payroll->periode);
        $periodeLabel = isset($parts[1], $monthNames[$parts[1]]) ? ($monthNames[$parts[1]] . ' ' . $parts[0]) : $payroll->periode;

        $catatan = $payroll->catatan ? json_decode($payroll->catatan, true) : [];
        $bpjsDetails = $catatan['bpjs_details'] ?? [];
        $tunjanganDetails = $catatan['tunjangan_details'] ?? [];

        if (empty($bpjsDetails) || empty($tunjanganDetails)) {
            $activeComponents = SalaryComponent::where('status', 'aktif')->get();
            if (empty($bpjsDetails)) {
                foreach ($activeComponents->where('tipe', 'potongan')->where('metode', 'persen') as $comp) {
                    $basisVal = (float)$payroll->gaji_pokok;
                    if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                        $basisVal = (float)$comp->batas_dasar;
                    }
                    $bpjsDetails[] = [
                        'nama' => $comp->nama,
                        'persen' => (float)$comp->nilai,
                        'nominal' => round($basisVal * ((float)$comp->nilai / 100)),
                    ];
                }
            }
            if (empty($tunjanganDetails)) {
                $tunjanganDetails = $activeComponents->where('tipe', 'tambahan')->where('metode', 'nominal')->map(fn($c) => [
                    'nama' => $c->nama,
                    'nominal' => (float)$c->nilai,
                ])->values()->all();
            }
        }

        return [
            'payroll' => $payroll,
            'employee' => $employee,
            'periodeLabel' => $periodeLabel,
            'deptLabel' => $deptLabels[$employee->dept] ?? ($employee->dept ?: 'Umum'),
            'bpjsDetails' => $bpjsDetails,
            'tunjanganDetails' => $tunjanganDetails,
        ];
    }

    private function generatePdf(Payroll $payroll)
    {
        $data = $this->prepareSlipViewData($payroll);
        return Pdf::loadView('pdf.slip-gaji', $data)->setPaper('a4', 'portrait');
    }

    public function adminSlipDetail($id): JsonResponse
    {
        $payroll = Payroll::with('employee.salaryGrade')->findOrFail($id);
        $data = $this->prepareSlipViewData($payroll);
        return response()->json([
            'payroll' => $payroll,
            'employee' => $data['employee'],
            'periodeLabel' => $data['periodeLabel'],
            'deptLabel' => $data['deptLabel'],
            'bpjsDetails' => $data['bpjsDetails'],
            'tunjanganDetails' => $data['tunjanganDetails'],
        ]);
    }

    public function adminPdfStream($id)
    {
        $payroll = Payroll::with('employee')->findOrFail($id);
        $pdf = $this->generatePdf($payroll);
        $cleanName = preg_replace('/[^A-Za-z0-9_-]/', '_', $payroll->employee->nama ?: 'Karyawan');
        $filename = 'Slip_Gaji_' . $cleanName . '_' . $payroll->periode . '.pdf';
        return $pdf->stream($filename);
    }

    public function adminPdfDownload($id)
    {
        $payroll = Payroll::with('employee')->findOrFail($id);
        $pdf = $this->generatePdf($payroll);
        $cleanName = preg_replace('/[^A-Za-z0-9_-]/', '_', $payroll->employee->nama ?: 'Karyawan');
        $filename = 'Slip_Gaji_' . $cleanName . '_' . $payroll->periode . '.pdf';
        return $pdf->download($filename);
    }

    public function userSlipDetail(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $payroll = Payroll::with('employee.salaryGrade')->findOrFail($id);
        if ($payroll->employee->user_id !== $user->id && $payroll->employee->nama !== $user->name) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $this->prepareSlipViewData($payroll);
        return response()->json([
            'payroll' => $payroll,
            'employee' => $data['employee'],
            'periodeLabel' => $data['periodeLabel'],
            'deptLabel' => $data['deptLabel'],
            'bpjsDetails' => $data['bpjsDetails'],
            'tunjanganDetails' => $data['tunjanganDetails'],
        ]);
    }

    public function userPdfStream(Request $request, $id)
    {
        $user = $request->user();
        $payroll = Payroll::with('employee')->findOrFail($id);
        if ($payroll->employee->user_id !== $user->id && $payroll->employee->nama !== $user->name) {
            abort(403, 'Unauthorized');
        }

        $pdf = $this->generatePdf($payroll);
        $cleanName = preg_replace('/[^A-Za-z0-9_-]/', '_', $payroll->employee->nama ?: 'Karyawan');
        $filename = 'Slip_Gaji_' . $cleanName . '_' . $payroll->periode . '.pdf';
        return $pdf->stream($filename);
    }

    public function userPdfDownload(Request $request, $id)
    {
        $user = $request->user();
        $payroll = Payroll::with('employee')->findOrFail($id);
        if ($payroll->employee->user_id !== $user->id && $payroll->employee->nama !== $user->name) {
            abort(403, 'Unauthorized');
        }

        $pdf = $this->generatePdf($payroll);
        $cleanName = preg_replace('/[^A-Za-z0-9_-]/', '_', $payroll->employee->nama ?: 'Karyawan');
        $filename = 'Slip_Gaji_' . $cleanName . '_' . $payroll->periode . '.pdf';
        return $pdf->download($filename);
    }

    public function calculatePayrollForPeriod(string $periode, bool $forceRecalculate = false): array
    {
        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();
        $lateFineComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'keterlambatan') || str_contains(strtolower($c->nama), 'telat');
        });
        $absentComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'alpha') || str_contains(strtolower($c->nama), 'alpa');
        });

        $lateFinePerMinute = ($lateFineComp && (float)$lateFineComp->nilai > 0) ? (float)$lateFineComp->nilai : (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = ($absentComp && (float)$absentComp->nilai > 0) ? (float)$absentComp->nilai : (float)($settingsData['absent_deduction'] ?? 50000);

        $monthDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $startDate = $monthDate->copy()->startOfMonth();
        $endDate = $monthDate->copy()->endOfMonth();
        $today = Carbon::today();
        $limitDate = $today->lt($endDate) ? $today : $endDate;

        $holidays = Holiday::whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->pluck('tanggal')
            ->toArray();

        $employees = Employee::with(['salaryGrade', 'customSalaryComponents', 'lateCategory'])
            ->orderByRaw('nama IS NULL, nama ASC')
            ->get();

        $deptLabels = [
            'it' => 'IT & Tech',
            'hrd' => 'HRD & General Affair',
            'finance' => 'Finance & Accounting',
            'marketing' => 'Marketing',
        ];

        $resultList = [];

        foreach ($employees as $employee) {
            $existingPayroll = Payroll::where('employee_id', $employee->id)
                ->where('periode', $periode)
                ->first();

            if ($existingPayroll && $existingPayroll->status === 'paid' && !$forceRecalculate) {
                $deptLabel = $deptLabels[$employee->dept] ?? $employee->dept;
                $savedCatatan = $existingPayroll->catatan ? json_decode($existingPayroll->catatan, true) : null;
                $bpjsDetails = $savedCatatan['bpjs_details'] ?? [];
                $tunjanganDetails = $savedCatatan['tunjangan_details'] ?? [];

                $resultList[] = [
                    'id' => $employee->id,
                    'payroll_id' => $existingPayroll->id,
                    'nama' => $employee->nama,
                    'nik' => $employee->nik,
                    'dept' => $employee->dept,
                    'deptLabel' => $deptLabel ?: 'Umum',
                    'jabatan' => $employee->jabatan ?: 'Staff',
                    'golongan' => $employee->salaryGrade?->nama ?: 'Staff',
                    'gapok' => (float)$existingPayroll->gaji_pokok,
                    'tunjangan' => (float)$existingPayroll->tunjangan,
                    'lembur' => (float)$existingPayroll->lembur,
                    'bonus' => (float)$existingPayroll->bonus,
                    'potongan_terlambat' => (float)$existingPayroll->potongan_terlambat,
                    'potongan_alpa' => (float)$existingPayroll->potongan_alpa,
                    'potongan_lainnya' => (float)$existingPayroll->potongan_lainnya,
                    'potongan' => (float)$existingPayroll->total_potongan,
                    'thp' => (float)$existingPayroll->thp,
                    'status' => $existingPayroll->status,
                    'periode' => $periode,
                    'hadir' => $existingPayroll->hadir_hari,
                    'terlambat' => $existingPayroll->terlambat_menit,
                    'alpa' => $existingPayroll->alpa_hari,
                    'lembur_menit' => $existingPayroll->lembur_menit,
                    'dibayar_pada' => $existingPayroll->dibayar_pada?->format('Y-m-d H:i:s'),
                    'bpjs_details' => $bpjsDetails,
                    'tunjangan_details' => $tunjanganDetails,
                ];
                continue;
            }

            // Gaji Pokok (Kustom vs Standar Golongan)
            $gajiPokok = $employee->gaji_pokok_kustom !== null 
                ? (float)$employee->gaji_pokok_kustom 
                : ($employee->salaryGrade ? (float)$employee->salaryGrade->gaji_pokok : 3000000);

            $tarifLembur = $employee->salaryGrade ? (float)$employee->salaryGrade->tarif_lembur : 50000;

            // Resolve komponen gaji untuk karyawan ini
            $customOverrides = $employee->customSalaryComponents->keyBy('salary_component_id');
            $pureCustoms = $employee->customSalaryComponents->whereNull('salary_component_id')->where('is_active', true);

            $allowancesBreakdown = [];
            $allowancesFixed = 0;
            $potonganBPJSBreakdown = [];
            $potonganLainnya = 0;

            foreach ($activeComponents as $comp) {
                // Keterlambatan dan alpa adalah komponen global
                $isLateOrAbsent = str_contains(strtolower($comp->nama), 'keterlambatan') || 
                                  str_contains(strtolower($comp->nama), 'telat') ||
                                  str_contains(strtolower($comp->nama), 'alpha') ||
                                  str_contains(strtolower($comp->nama), 'alpa');
                if ($isLateOrAbsent) {
                    continue;
                }

                $ov = $customOverrides->get($comp->id);
                if ($ov && !$ov->is_active) {
                    // Tidak berlaku
                    continue;
                }

                $metode = ($ov && $ov->metode) ? $ov->metode : $comp->metode;
                $nilai = ($ov && $ov->nilai !== null) ? (float)$ov->nilai : (float)$comp->nilai;

                if ($comp->tipe === 'tambahan') {
                    if ($metode === 'persen') {
                        $nom = round($gajiPokok * ($nilai / 100));
                        $allowancesBreakdown[] = [
                            'nama' => $comp->nama,
                            'persen' => $nilai,
                            'nominal' => $nom,
                        ];
                        $allowancesFixed += $nom;
                    } else {
                        $allowancesBreakdown[] = [
                            'nama' => $comp->nama,
                            'nominal' => $nilai,
                        ];
                        $allowancesFixed += $nilai;
                    }
                } elseif ($comp->tipe === 'potongan') {
                    if ($metode === 'persen') {
                        $basisVal = $gajiPokok;
                        if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                            $basisVal = (float)$comp->batas_dasar;
                        }
                        $nom = round($basisVal * ($nilai / 100));
                        $potonganBPJSBreakdown[] = [
                            'nama' => $comp->nama,
                            'persen' => $nilai,
                            'nominal' => $nom,
                        ];
                        $potonganLainnya += $nom;
                    } else {
                        $potonganBPJSBreakdown[] = [
                            'nama' => $comp->nama,
                            'persen' => null,
                            'nominal' => $nilai,
                        ];
                        $potonganLainnya += $nilai;
                    }
                }
            }

            // Komponen khusus karyawan
            foreach ($pureCustoms as $cc) {
                $nilai = (float)$cc->nilai;
                if ($cc->tipe === 'tambahan') {
                    if ($cc->metode === 'persen') {
                        $nom = round($gajiPokok * ($nilai / 100));
                        $allowancesBreakdown[] = [
                            'nama' => $cc->nama,
                            'persen' => $nilai,
                            'nominal' => $nom,
                        ];
                        $allowancesFixed += $nom;
                    } else {
                        $allowancesBreakdown[] = [
                            'nama' => $cc->nama,
                            'nominal' => $nilai,
                        ];
                        $allowancesFixed += $nilai;
                    }
                } elseif ($cc->tipe === 'potongan') {
                    if ($cc->metode === 'persen') {
                        $nom = round($gajiPokok * ($nilai / 100));
                        $potonganBPJSBreakdown[] = [
                            'nama' => $cc->nama,
                            'persen' => $nilai,
                            'nominal' => $nom,
                        ];
                        $potonganLainnya += $nom;
                    } else {
                        $potonganBPJSBreakdown[] = [
                            'nama' => $cc->nama,
                            'persen' => null,
                            'nominal' => $nilai,
                        ];
                        $potonganLainnya += $nilai;
                    }
                }
            }

            $logs = AttendanceLog::where('employee_id', $employee->id)
                ->whereDate('scan_at', '>=', $startDate)
                ->whereDate('scan_at', '<=', $endDate)
                ->orderBy('scan_at', 'asc')
                ->get();

            $groupedByDate = [];
            foreach ($logs as $log) {
                $d = Carbon::parse($log->scan_at)->format('Y-m-d');
                if (!isset($groupedByDate[$d])) {
                    $groupedByDate[$d] = [];
                }
                $groupedByDate[$d][] = Carbon::parse($log->scan_at);
            }

            $dispensations = Permission::where('employee_id', $employee->id)
                ->where('category', 'dispensasi_payroll')
                ->whereIn('status', ['disetujui', 'approved'])
                ->whereDate('tanggal_mulai', '>=', $startDate)
                ->whereDate('tanggal_mulai', '<=', $endDate)
                ->pluck('tanggal_mulai')
                ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            $hadirCount = count($groupedByDate);

            $lateService = app(LateCalculationService::class);
            $lateResult = $lateService->calculateMonth(
                $employee,
                $groupedByDate,
                $dispensations,
                $normalIn,
                $normalTol,
                $satIn,
                $satTol
            );

            $totalLateMinutes = $lateResult['total_late_minutes'];
            $potonganTerlambat = $lateResult['total_deduction'];

            $alpaCount = 0;
            $curr = $startDate->copy();
            while ($curr->lte($limitDate)) {
                $dateStr = $curr->format('Y-m-d');
                $isSunday = $curr->isSunday();
                $isHoliday = in_array($dateStr, $holidays);

                if (!$isSunday && !$isHoliday) {
                    if (!isset($groupedByDate[$dateStr])) {
                        if (!in_array($dateStr, $dispensations)) {
                            $alpaCount++;
                        }
                    }
                }
                $curr->addDay();
            }

            if ($employee->is_exempt) {
                $overtimeDays = 0;
                $lemburPay = 0;
                $potonganTerlambat = 0;
                $overtimeResult = [
                    'is_exempt' => true,
                    'total_days' => 0,
                    'total_pay' => 0,
                    'daily_days' => 0,
                    'weekend_days' => 0,
                    'holiday_days' => 0,
                    'details' => [],
                ];
            } else {
                $overtimeService = app(OvertimeCalculationService::class);
                $overtimeResult = $overtimeService->calculateMonthOvertime($employee, $startDate, $endDate);
                $lemburPay = $overtimeResult['total_pay'];
                $overtimeDays = $overtimeResult['total_days'];
            }

            if ($absentComp && $absentComp->metode === 'harian') {
                $potonganAlpa = round(($gajiPokok / 22) * $alpaCount);
            } else {
                $potonganAlpa = $alpaCount * $absentDeduction;
            }

            $totalPotongan = $potonganTerlambat + $potonganAlpa + $potonganLainnya;
            $totalBonus = $allowancesFixed + $lemburPay;
            $thp = max(0, $gajiPokok + $totalBonus - $totalPotongan);

            $currentStatus = $existingPayroll ? $existingPayroll->status : 'draft';
            $paidAt = $existingPayroll ? $existingPayroll->dibayar_pada : null;

            $catatanJson = json_encode([
                'bpjs_details' => $potonganBPJSBreakdown,
                'tunjangan_details' => $allowancesBreakdown,
                'late_details' => [
                    'is_exempt' => (bool)$employee->is_exempt,
                    'category_name' => $lateResult['category']?->nama ?? ($employee->is_exempt ? 'Bebas Denda & Lembur' : 'Umum'),
                    'tier1_count' => $lateResult['tier1_count'] ?? 0,
                    'tier1_tolerated' => $lateResult['tier1_tolerated_count'] ?? 0,
                    'tier1_penalized' => $lateResult['tier1_penalized_count'] ?? 0,
                    'tier2_count' => $lateResult['tier2_count'] ?? 0,
                    'tier3_count' => $lateResult['tier3_count'] ?? 0,
                    'tier4_count' => $lateResult['tier4_count'] ?? 0,
                    'total_deduction' => $potonganTerlambat,
                ],
                'overtime_details' => $overtimeResult,
            ]);

            $savedPayroll = Payroll::updateOrCreate([
                'employee_id' => $employee->id,
                'periode' => $periode,
            ], [
                'gaji_pokok' => $gajiPokok,
                'tunjangan' => $allowancesFixed,
                'lembur' => $lemburPay,
                'bonus' => $totalBonus,
                'potongan_terlambat' => $potonganTerlambat,
                'potongan_alpa' => $potonganAlpa,
                'potongan_lainnya' => $potonganLainnya,
                'total_potongan' => $totalPotongan,
                'thp' => $thp,
                'hadir_hari' => $hadirCount,
                'terlambat_menit' => $totalLateMinutes,
                'alpa_hari' => $alpaCount,
                'lembur_menit' => $overtimeDays,
                'status' => $currentStatus,
                'dibayar_pada' => $paidAt,
                'catatan' => $catatanJson,
            ]);

            $deptLabel = $deptLabels[$employee->dept] ?? $employee->dept;

            $resultList[] = [
                'id' => $employee->id,
                'payroll_id' => $savedPayroll->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'dept' => $employee->dept,
                'deptLabel' => $deptLabel ?: 'Umum',
                'jabatan' => $employee->jabatan ?: 'Staff',
                'golongan' => $employee->salaryGrade?->nama ?: 'Staff',
                'gapok' => $gajiPokok,
                'tunjangan' => (float)$allowancesFixed,
                'lembur' => (float)$lemburPay,
                'bonus' => (float)$totalBonus,
                'potongan_terlambat' => (float)$potonganTerlambat,
                'potongan_alpa' => (float)$potonganAlpa,
                'potongan_lainnya' => (float)$potonganLainnya,
                'potongan' => (float)$totalPotongan,
                'thp' => (float)$thp,
                'status' => $savedPayroll->status,
                'periode' => $periode,
                'hadir' => $hadirCount,
                'terlambat' => $totalLateMinutes,
                'alpa' => $alpaCount,
                'lembur_menit' => $overtimeDays,
                'lembur_hari' => $overtimeDays,
                'lembur_details' => $overtimeResult['details'] ?? [],
                'dibayar_pada' => $savedPayroll->dibayar_pada?->format('Y-m-d H:i:s'),
                'bpjs_details' => $potonganBPJSBreakdown,
                'tunjangan_details' => $allowancesBreakdown,
                'is_exempt' => (bool)$employee->is_exempt,
                'late_category' => $lateResult['category']?->nama ?? ($employee->is_exempt ? 'Bebas Denda & Lembur' : 'Umum'),
            ];
        }

        return $resultList;
    }
}
