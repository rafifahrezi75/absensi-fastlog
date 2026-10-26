<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSalaryComponent;
use App\Models\SalaryComponent;
use App\Models\SalaryGrade;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterPayrollController extends Controller
{
    public function indexGolongan(): JsonResponse
    {
        $grades = SalaryGrade::orderBy('kode', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'kode' => $item->kode,
                'nama' => $item->nama,
                'gajiPokok' => (float)$item->gaji_pokok,
                'tarifLembur' => (float)$item->tarif_lembur,
                'keterangan' => $item->keterangan ?: '',
                'status' => $item->status,
            ];
        });

        return response()->json([
            'golongan' => $grades,
        ]);
    }

    public function storeGolongan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:salary_grades,kode',
            'nama' => 'required|string|max:100',
            'gajiPokok' => 'required|numeric|min:0',
            'tarifLembur' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $grade = SalaryGrade::create([
            'kode' => $validated['kode'],
            'nama' => $validated['nama'],
            'gaji_pokok' => $validated['gajiPokok'],
            'tarif_lembur' => $validated['tarifLembur'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Golongan gaji berhasil ditambahkan.',
            'golongan' => [
                'id' => $grade->id,
                'kode' => $grade->kode,
                'nama' => $grade->nama,
                'gajiPokok' => (float)$grade->gaji_pokok,
                'tarifLembur' => (float)$grade->tarif_lembur,
                'keterangan' => $grade->keterangan ?: '',
                'status' => $grade->status,
            ],
        ], 201);
    }

    public function updateGolongan(Request $request, string $id): JsonResponse
    {
        $grade = SalaryGrade::findOrFail($id);

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', Rule::unique('salary_grades')->ignore($grade->id)],
            'nama' => 'required|string|max:100',
            'gajiPokok' => 'required|numeric|min:0',
            'tarifLembur' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $grade->update([
            'kode' => $validated['kode'],
            'nama' => $validated['nama'],
            'gaji_pokok' => $validated['gajiPokok'],
            'tarif_lembur' => $validated['tarifLembur'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Golongan gaji berhasil diperbarui.',
            'golongan' => [
                'id' => $grade->id,
                'kode' => $grade->kode,
                'nama' => $grade->nama,
                'gajiPokok' => (float)$grade->gaji_pokok,
                'tarifLembur' => (float)$grade->tarif_lembur,
                'keterangan' => $grade->keterangan ?: '',
                'status' => $grade->status,
            ],
        ]);
    }

    public function destroyGolongan(string $id): JsonResponse
    {
        $grade = SalaryGrade::findOrFail($id);
        $grade->delete();

        return response()->json([
            'message' => 'Golongan gaji berhasil dihapus.',
        ]);
    }

    public function indexKomponen(): JsonResponse
    {
        $components = SalaryComponent::orderBy('id', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'tipe' => $item->tipe,
                'metode' => $item->metode,
                'nilai' => (float)$item->nilai,
                'basis' => $item->basis,
                'batasDasar' => $item->batas_dasar !== null ? (float)$item->batas_dasar : null,
                'kenaPajak' => (bool)$item->kena_pajak,
                'status' => $item->status,
            ];
        });

        return response()->json([
            'komponen' => $components,
        ]);
    }

    public function storeKomponen(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'tipe' => ['required', Rule::in(['tambahan', 'potongan'])],
            'metode' => ['required', Rule::in(['nominal', 'persen', 'per_satuan', 'harian'])],
            'nilai' => 'required|numeric|min:0',
            'basis' => 'nullable|string|max:50',
            'batasDasar' => 'nullable|numeric|min:0',
            'kenaPajak' => 'nullable|boolean',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $component = SalaryComponent::create([
            'nama' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'metode' => $validated['metode'],
            'nilai' => $validated['nilai'],
            'basis' => $validated['basis'] ?? null,
            'batas_dasar' => $validated['batasDasar'] ?? null,
            'kena_pajak' => $validated['kenaPajak'] ?? false,
            'status' => $validated['status'],
        ]);

        $lowerName = strtolower($component->nama);
        if (str_contains($lowerName, 'keterlambatan') || str_contains($lowerName, 'telat')) {
            SystemSetting::updateOrCreate(['kunci' => 'late_fine_per_minute'], ['nilai' => (string)$component->nilai]);
        } elseif (str_contains($lowerName, 'alpha') || str_contains($lowerName, 'alpa')) {
            SystemSetting::updateOrCreate(['kunci' => 'absent_deduction'], ['nilai' => (string)$component->nilai]);
        }

        return response()->json([
            'message' => 'Komponen gaji berhasil ditambahkan.',
            'komponen' => [
                'id' => $component->id,
                'nama' => $component->nama,
                'tipe' => $component->tipe,
                'metode' => $component->metode,
                'nilai' => (float)$component->nilai,
                'basis' => $component->basis,
                'batasDasar' => $component->batas_dasar !== null ? (float)$component->batas_dasar : null,
                'kenaPajak' => (bool)$component->kena_pajak,
                'status' => $component->status,
            ],
        ], 201);
    }

    public function updateKomponen(Request $request, string $id): JsonResponse
    {
        $component = SalaryComponent::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'tipe' => ['required', Rule::in(['tambahan', 'potongan'])],
            'metode' => ['required', Rule::in(['nominal', 'persen', 'per_satuan', 'harian'])],
            'nilai' => 'required|numeric|min:0',
            'basis' => 'nullable|string|max:50',
            'batasDasar' => 'nullable|numeric|min:0',
            'kenaPajak' => 'nullable|boolean',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $component->update([
            'nama' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'metode' => $validated['metode'],
            'nilai' => $validated['nilai'],
            'basis' => $validated['basis'] ?? null,
            'batas_dasar' => $validated['batasDasar'] ?? null,
            'kena_pajak' => $validated['kenaPajak'] ?? false,
            'status' => $validated['status'],
        ]);

        $lowerName = strtolower($component->nama);
        if (str_contains($lowerName, 'keterlambatan') || str_contains($lowerName, 'telat')) {
            SystemSetting::updateOrCreate(['kunci' => 'late_fine_per_minute'], ['nilai' => (string)$component->nilai]);
        } elseif (str_contains($lowerName, 'alpha') || str_contains($lowerName, 'alpa')) {
            SystemSetting::updateOrCreate(['kunci' => 'absent_deduction'], ['nilai' => (string)$component->nilai]);
        }

        return response()->json([
            'message' => 'Komponen gaji berhasil diperbarui.',
            'komponen' => [
                'id' => $component->id,
                'nama' => $component->nama,
                'tipe' => $component->tipe,
                'metode' => $component->metode,
                'nilai' => (float)$component->nilai,
                'basis' => $component->basis,
                'batasDasar' => $component->batas_dasar !== null ? (float)$component->batas_dasar : null,
                'kenaPajak' => (bool)$component->kena_pajak,
                'status' => $component->status,
            ],
        ]);
    }

    public function destroyKomponen(string $id): JsonResponse
    {
        $component = SalaryComponent::findOrFail($id);
        $component->delete();

        return response()->json([
            'message' => 'Komponen gaji berhasil dihapus.',
        ]);
    }

    public function indexEmployeeSalaries(): JsonResponse
    {
        $employees = Employee::with(['salaryGrade', 'customSalaryComponents'])
            ->orderByRaw('nama IS NULL, nama ASC')
            ->get();

        $activeMasterComponents = SalaryComponent::where('status', 'aktif')->get();

        $list = [];
        $karyawanDisesuaikanCount = 0;

        foreach ($employees as $emp) {
            $stdGapok = ($emp->salaryGrade && (float)$emp->salaryGrade->gaji_pokok > 0) ? (float)$emp->salaryGrade->gaji_pokok : 5000000;
            $isGapokCustom = ($emp->gaji_pokok_kustom !== null && (float)$emp->gaji_pokok_kustom > 0 && abs((float)$emp->gaji_pokok_kustom - $stdGapok) >= 0.01);
            $effectiveGapok = $isGapokCustom ? (float)$emp->gaji_pokok_kustom : $stdGapok;

            $customOverrides = $emp->customSalaryComponents->keyBy('salary_component_id');
            $pureCustoms = $emp->customSalaryComponents->whereNull('salary_component_id')->where('is_active', true);

            $hasComponentAdjustments = false;
            $totalTambahan = 0;
            $jumlahTambahan = 0;
            $totalPotongan = 0;
            $jumlahPotongan = 0;

            foreach ($activeMasterComponents as $comp) {
                $isLateOrAbsent = str_contains(strtolower($comp->nama), 'keterlambatan') ||
                                  str_contains(strtolower($comp->nama), 'telat') ||
                                  str_contains(strtolower($comp->nama), 'alpha') ||
                                  str_contains(strtolower($comp->nama), 'alpa');
                if ($isLateOrAbsent) continue;

                $ov = $customOverrides->get($comp->id);

                if ($ov) {
                    if (!$ov->is_active) {
                        $hasComponentAdjustments = true;
                        continue;
                    }

                    $ovMetode = $ov->metode ?? $comp->metode;
                    $ovNilai = (float)($ov->nilai ?? $comp->nilai);
                    $isSame = ($ovMetode === $comp->metode) && (abs($ovNilai - (float)$comp->nilai) < 0.01);
                    if (!$isSame) {
                        $hasComponentAdjustments = true;
                    }

                    $metode = $ovMetode;
                    $nilai = $ovNilai;
                } else {
                    $metode = $comp->metode;
                    $nilai = (float)$comp->nilai;
                }

                if ($comp->tipe === 'tambahan') {
                    $jumlahTambahan++;
                    if ($metode === 'persen') {
                        $totalTambahan += round($effectiveGapok * ($nilai / 100));
                    } else {
                        $totalTambahan += $nilai;
                    }
                } elseif ($comp->tipe === 'potongan') {
                    $jumlahPotongan++;
                    if ($metode === 'persen') {
                        $basisVal = $effectiveGapok;
                        if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                            $basisVal = (float)$comp->batas_dasar;
                        }
                        $totalPotongan += round($basisVal * ($nilai / 100));
                    } else {
                        $totalPotongan += $nilai;
                    }
                }
            }

            if ($pureCustoms->isNotEmpty()) {
                $hasComponentAdjustments = true;
                foreach ($pureCustoms as $cc) {
                    $nilai = (float)$cc->nilai;
                    if ($cc->tipe === 'tambahan') {
                        $jumlahTambahan++;
                        if ($cc->metode === 'persen') {
                            $totalTambahan += round($effectiveGapok * ($nilai / 100));
                        } else {
                            $totalTambahan += $nilai;
                        }
                    } elseif ($cc->tipe === 'potongan') {
                        $jumlahPotongan++;
                        if ($cc->metode === 'persen') {
                            $totalPotongan += round($effectiveGapok * ($nilai / 100));
                        } else {
                            $totalPotongan += $nilai;
                        }
                    }
                }
            }

            $isCustomized = ($isGapokCustom || $hasComponentAdjustments);
            if ($isCustomized) {
                $karyawanDisesuaikanCount++;
            }

            $list[] = [
                'id' => $emp->id,
                'nama' => $emp->nama,
                'nik' => $emp->nik,
                'pin' => $emp->pin,
                'dept' => $emp->dept ?: 'Umum',
                'jabatan' => $emp->jabatan ?: 'Staff',
                'tipe_staf' => $emp->tipe_staf ?: 'kantor',
                'golongan' => ($emp->salaryGrade && $emp->salaryGrade->nama) ? $emp->salaryGrade->nama : 'Staff',
                'standard_gapok' => $stdGapok,
                'gaji_pokok' => $effectiveGapok,
                'is_gaji_pokok_custom' => $isGapokCustom,
                'total_tambahan' => $totalTambahan,
                'jumlah_tambahan' => $jumlahTambahan,
                'total_potongan' => $totalPotongan,
                'jumlah_potongan' => $jumlahPotongan,
                'status' => $isCustomized ? 'disesuaikan' : 'standar',
            ];
        }

        return response()->json([
            'employees' => $list,
            'karyawanDisesuaikan' => $karyawanDisesuaikanCount,
        ]);
    }

    public function showEmployeeSalary(string $id): JsonResponse
    {
        $employee = Employee::with(['salaryGrade', 'customSalaryComponents'])->findOrFail($id);

        $stdGapok = ($employee->salaryGrade && (float)$employee->salaryGrade->gaji_pokok > 0) ? (float)$employee->salaryGrade->gaji_pokok : 5000000;
        $isGapokCustom = ($employee->gaji_pokok_kustom !== null && (float)$employee->gaji_pokok_kustom > 0 && abs((float)$employee->gaji_pokok_kustom - $stdGapok) >= 0.01);

        $activeMasterComponents = SalaryComponent::where('status', 'aktif')->get();
        $customOverrides = $employee->customSalaryComponents->keyBy('salary_component_id');
        $pureCustoms = $employee->customSalaryComponents->whereNull('salary_component_id');

        $masterTambahan = [];
        $masterPotongan = [];

        foreach ($activeMasterComponents as $comp) {
            $isLateOrAbsent = str_contains(strtolower($comp->nama), 'keterlambatan') ||
                              str_contains(strtolower($comp->nama), 'telat') ||
                              str_contains(strtolower($comp->nama), 'alpha') ||
                              str_contains(strtolower($comp->nama), 'alpa');
            if ($isLateOrAbsent) continue;

            $ov = $customOverrides->get($comp->id);

            $mode = 'standar';
            $metode = $comp->metode;
            $nilai = (float)$comp->nilai;

            if ($ov) {
                if (!$ov->is_active) {
                    $mode = 'tidak_berlaku';
                } else {
                    $mode = 'kustom';
                    $metode = $ov->metode ?? $comp->metode;
                    $nilai = (float)($ov->nilai ?? $comp->nilai);
                }
            }

            $itemData = [
                'id' => $comp->id,
                'nama' => $comp->nama,
                'tipe' => $comp->tipe,
                'master_metode' => $comp->metode,
                'master_nilai' => (float)$comp->nilai,
                'mode' => $mode,
                'metode' => $metode,
                'nilai' => $nilai,
            ];

            if ($comp->tipe === 'tambahan') {
                $masterTambahan[] = $itemData;
            } else {
                $masterPotongan[] = $itemData;
            }
        }

        $customTambahan = [];
        $customPotongan = [];

        foreach ($pureCustoms as $cc) {
            $cData = [
                'id' => $cc->id,
                'nama' => $cc->nama,
                'tipe' => $cc->tipe,
                'metode' => $cc->metode,
                'nilai' => (float)$cc->nilai,
            ];
            if ($cc->tipe === 'tambahan') {
                $customTambahan[] = $cData;
            } else {
                $customPotongan[] = $cData;
            }
        }

        return response()->json([
            'employee' => [
                'id' => $employee->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'pin' => $employee->pin,
                'dept' => $employee->dept ?: 'Umum',
                'jabatan' => $employee->jabatan ?: 'Staff',
                'tipe_staf' => $employee->tipe_staf ?: 'kantor',
                'golongan' => ($employee->salaryGrade && $employee->salaryGrade->nama) ? $employee->salaryGrade->nama : 'Staff',
                'standard_gapok' => $stdGapok,
                'gaji_pokok_kustom' => $employee->gaji_pokok_kustom !== null ? (float)$employee->gaji_pokok_kustom : null,
                'is_gaji_pokok_custom' => $isGapokCustom,
            ],
            'masterTambahan' => $masterTambahan,
            'masterPotongan' => $masterPotongan,
            'customTambahan' => $customTambahan,
            'customPotongan' => $customPotongan,
        ]);
    }

    public function updateEmployeeSalary(Request $request, string $id): JsonResponse
    {
        $employee = Employee::with('salaryGrade')->findOrFail($id);

        $validated = $request->validate([
            'is_gaji_pokok_custom' => 'required|boolean',
            'gaji_pokok_kustom' => 'nullable|numeric|min:0',
            'overrides' => 'nullable|array',
            'overrides.*.salary_component_id' => 'required|exists:salary_components,id',
            'overrides.*.mode' => ['required', Rule::in(['standar', 'kustom', 'tidak_berlaku'])],
            'overrides.*.metode' => ['nullable', Rule::in(['nominal', 'persen'])],
            'overrides.*.nilai' => 'nullable|numeric|min:0',
            'custom_components' => 'nullable|array',
            'custom_components.*.nama' => 'required|string|max:100',
            'custom_components.*.tipe' => ['required', Rule::in(['tambahan', 'potongan'])],
            'custom_components.*.metode' => ['required', Rule::in(['nominal', 'persen'])],
            'custom_components.*.nilai' => 'required|numeric|min:0',
        ]);

        if (!empty($validated['overrides'])) {
            foreach ($validated['overrides'] as $ov) {
                if ($ov['mode'] === 'kustom' && ($ov['metode'] ?? '') === 'persen' && (float)($ov['nilai'] ?? 0) > 100) {
                    return response()->json(['message' => 'Nilai persentase komponen tidak boleh lebih dari 100%.'], 422);
                }
            }
        }
        if (!empty($validated['custom_components'])) {
            foreach ($validated['custom_components'] as $cc) {
                if (trim($cc['nama'] ?? '') === '') {
                    return response()->json(['message' => 'Nama komponen khusus tidak boleh kosong.'], 422);
                }
                if ($cc['metode'] === 'persen' && (float)$cc['nilai'] > 100) {
                    return response()->json(['message' => 'Nilai persentase komponen khusus tidak boleh lebih dari 100%.'], 422);
                }
            }
        }

        $stdGapok = ($employee->salaryGrade && (float)$employee->salaryGrade->gaji_pokok > 0) ? (float)$employee->salaryGrade->gaji_pokok : 5000000;
        $gapokKustom = ($validated['is_gaji_pokok_custom'] && isset($validated['gaji_pokok_kustom'])) 
            ? (float)$validated['gaji_pokok_kustom'] 
            : null;

        if ($gapokKustom !== null && abs($gapokKustom - $stdGapok) < 0.01) {
            $gapokKustom = null;
        }

        $activeMaster = SalaryComponent::where('status', 'aktif')->get()->keyBy('id');

        $overridesToSave = [];
        $hasAnyNonStandardOverride = false;

        if (!empty($validated['overrides'])) {
            foreach ($validated['overrides'] as $ov) {
                $comp = $activeMaster->get($ov['salary_component_id']);
                if (!$comp) continue;

                if ($ov['mode'] === 'tidak_berlaku') {
                    $hasAnyNonStandardOverride = true;
                    $overridesToSave[] = [
                        'employee_id' => $employee->id,
                        'salary_component_id' => $comp->id,
                        'nama' => null,
                        'tipe' => $comp->tipe,
                        'metode' => $comp->metode,
                        'nilai' => 0,
                        'is_active' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                } elseif ($ov['mode'] === 'kustom') {
                    $metode = $ov['metode'] ?? $comp->metode;
                    $nilai = (float)($ov['nilai'] ?? 0);

                    $isSameAsMaster = ($metode === $comp->metode) && (abs($nilai - (float)$comp->nilai) < 0.01);
                    if (!$isSameAsMaster) {
                        $hasAnyNonStandardOverride = true;
                        $overridesToSave[] = [
                            'employee_id' => $employee->id,
                            'salary_component_id' => $comp->id,
                            'nama' => null,
                            'tipe' => $comp->tipe,
                            'metode' => $metode,
                            'nilai' => $nilai,
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
        }

        $customsToSave = [];
        if (!empty($validated['custom_components'])) {
            foreach ($validated['custom_components'] as $cc) {
                $customsToSave[] = [
                    'employee_id' => $employee->id,
                    'salary_component_id' => null,
                    'nama' => trim($cc['nama']),
                    'tipe' => $cc['tipe'],
                    'metode' => $cc['metode'],
                    'nilai' => (float)$cc['nilai'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if ($gapokKustom === null && !$hasAnyNonStandardOverride && empty($customsToSave)) {
            $employee->update(['gaji_pokok_kustom' => null]);
            EmployeeSalaryComponent::where('employee_id', $employee->id)->delete();
        } else {
            $employee->update(['gaji_pokok_kustom' => $gapokKustom]);
            EmployeeSalaryComponent::where('employee_id', $employee->id)->delete();
            $allRows = array_merge($overridesToSave, $customsToSave);
            if (!empty($allRows)) {
                EmployeeSalaryComponent::insert($allRows);
            }
        }

        try {
            app(\App\Http\Controllers\Admin\PayrollController::class)->calculatePayrollForPeriod(date('Y-m'), false);
        } catch (\Throwable $e) {
            // Ignore error
        }

        return response()->json([
            'message' => 'Pengaturan gaji karyawan berhasil disimpan.',
        ]);
    }

    public function resetEmployeeSalary(string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['gaji_pokok_kustom' => null]);
        EmployeeSalaryComponent::where('employee_id', $employee->id)->delete();

        try {
            app(\App\Http\Controllers\Admin\PayrollController::class)->calculatePayrollForPeriod(date('Y-m'), false);
        } catch (\Throwable $e) {
            // Ignore error
        }

        return response()->json([
            'message' => "Pengaturan gaji karyawan {$employee->nama} berhasil dikembalikan ke standar.",
        ]);
    }
}
