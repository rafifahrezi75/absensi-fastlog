<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LateRuleCategory;
use App\Models\LateRuleTier;
use Carbon\Carbon;

class LateCalculationService
{
    private ?array $cachedCategories = null;

    public function getAllCategories()
    {
        if ($this->cachedCategories === null) {
            $this->cachedCategories = LateRuleCategory::with('tiers')->get()->all();
        }
        return $this->cachedCategories;
    }

    public function determineCategory(Employee $employee): LateRuleCategory
    {
        $categories = $this->getAllCategories();

        if ($employee->late_category_id) {
            foreach ($categories as $cat) {
                if ($cat->id === (int)$employee->late_category_id) {
                    return $cat;
                }
            }
        }

        $tipeStaf = strtolower(trim((string)$employee->tipe_staf));
        if ($tipeStaf === 'kantor') {
            foreach ($categories as $cat) {
                if (strtoupper($cat->kode) === 'KANTOR' || $cat->is_default) {
                    return $cat;
                }
            }
        } elseif ($tipeStaf === 'lapangan') {
            foreach ($categories as $cat) {
                if (strtoupper($cat->kode) === 'LAPANGAN') {
                    return $cat;
                }
            }
        }

        $dept = strtolower(trim((string)$employee->dept));
        $jabatan = strtolower(trim((string)$employee->jabatan));

        foreach ($categories as $cat) {
            $deptList = array_map(fn($d) => strtolower(trim($d)), $cat->departemen_list ?: []);
            if (!empty($dept) && in_array($dept, $deptList)) {
                return $cat;
            }
        }

        foreach ($categories as $cat) {
            $keywords = array_map(fn($k) => strtolower(trim($k)), $cat->jabatan_keywords ?: []);
            foreach ($keywords as $kw) {
                if ($kw !== '' && (str_contains($jabatan, $kw) || str_contains($dept, $kw))) {
                    return $cat;
                }
            }
        }

        foreach ($categories as $cat) {
            if ($cat->is_default) {
                return $cat;
            }
        }

        return $categories[0] ?? new LateRuleCategory();
    }

    public function calculateMonth(
        Employee $employee,
        array $groupedByDate,
        array $dispensations,
        string $normalIn,
        int $normalTol,
        string $satIn,
        int $satTol
    ): array {
        if ($employee->is_exempt) {
            $dailyDetails = [];
            foreach ($groupedByDate as $dateStr => $scans) {
                $dailyDetails[$dateStr] = [
                    'minutes_late' => 0,
                    'deduction' => 0,
                    'tier' => null,
                    'is_exempt' => true,
                    'status_text' => 'Bebas Denda (Karyawan Khusus)',
                ];
            }

            return [
                'is_exempt' => true,
                'category' => null,
                'total_late_minutes' => 0,
                'total_deduction' => 0,
                'tier1_count' => 0,
                'tier1_tolerated_count' => 0,
                'tier1_penalized_count' => 0,
                'tier2_count' => 0,
                'tier3_count' => 0,
                'tier4_count' => 0,
                'daily_details' => $dailyDetails,
            ];
        }

        $category = $this->determineCategory($employee);
        $toleransiBulanan = (int)($category->toleransi_bulanan ?? 3);
        $tiers = $category->tiers ?? collect();

        ksort($groupedByDate);

        $tier1Count = 0;
        $tier1ToleratedCount = 0;
        $tier1PenalizedCount = 0;
        $tier2Count = 0;
        $tier3Count = 0;
        $tier4Count = 0;
        $totalLateMinutes = 0;
        $totalDeduction = 0;
        $dailyDetails = [];

        foreach ($groupedByDate as $dateStr => $scans) {
            if (empty($scans)) {
                continue;
            }

            $firstScan = $scans[0];
            $isSat = Carbon::parse($dateStr)->isSaturday();
            $schedInStr = $isSat ? $satIn : $normalIn;
            $scheduleIn = Carbon::parse($dateStr . ' ' . $schedInStr . ':00');

            if ($firstScan->lte($scheduleIn)) {
                $dailyDetails[$dateStr] = [
                    'minutes_late' => 0,
                    'deduction' => 0,
                    'tier' => null,
                    'category_name' => $category->nama,
                    'category_code' => $category->kode,
                    'tier_order' => null,
                    'tier_name' => null,
                    'ada_toleransi' => false,
                    'toleransi_ke' => null,
                    'toleransi_max' => $toleransiBulanan,
                    'quota_text' => null,
                    'is_exempt' => false,
                    'status_text' => 'Tepat Waktu',
                ];
                continue;
            }

            $minutesLate = (int) ceil($scheduleIn->diffInSeconds($firstScan) / 60);
            if ($minutesLate < 1) {
                $dailyDetails[$dateStr] = [
                    'minutes_late' => 0,
                    'deduction' => 0,
                    'tier' => null,
                    'category_name' => $category->nama,
                    'category_code' => $category->kode,
                    'tier_order' => null,
                    'tier_name' => null,
                    'ada_toleransi' => false,
                    'toleransi_ke' => null,
                    'toleransi_max' => $toleransiBulanan,
                    'quota_text' => null,
                    'is_exempt' => false,
                    'status_text' => 'Tepat Waktu',
                ];
                continue;
            }

            $matchedTier = null;
            foreach ($tiers as $t) {
                $min = (int)$t->min_menit;
                $max = $t->max_menit !== null ? (int)$t->max_menit : PHP_INT_MAX;
                if ($minutesLate >= $min && $minutesLate <= $max) {
                    $matchedTier = $t;
                    break;
                }
            }

            $isDispensed = in_array($dateStr, $dispensations);

            if ($isDispensed) {
                $dailyDetails[$dateStr] = [
                    'minutes_late' => $minutesLate,
                    'deduction' => 0,
                    'tier' => $matchedTier,
                    'category_name' => $category->nama,
                    'category_code' => $category->kode,
                    'tier_order' => $matchedTier ? $matchedTier->tier_order : null,
                    'tier_name' => $matchedTier ? $matchedTier->nama_tier : null,
                    'ada_toleransi' => $matchedTier ? (bool)$matchedTier->ada_toleransi : false,
                    'toleransi_ke' => null,
                    'toleransi_max' => $toleransiBulanan,
                    'quota_text' => 'Dispensasi Disetujui',
                    'is_exempt' => false,
                    'status_text' => 'Dispensasi Disetujui (Rp 0)',
                ];
                continue;
            }

            $deduction = 0;
            $statusText = '';
            $quotaText = '';
            $toleransiKe = null;

            if ($matchedTier && $matchedTier->ada_toleransi) {
                $tier1Count++;
                $toleransiKe = $tier1Count;
                if ($tier1Count <= $toleransiBulanan) {
                    $tier1ToleratedCount++;
                    $deduction = 0;
                    $quotaText = "Jatah toleransi: {$tier1Count}/{$toleransiBulanan} terpakai (Bebas Denda)";
                    $statusText = "Kategori {$matchedTier->tier_order} (Toleransi ke-{$tier1Count} dari {$toleransiBulanan})";
                } else {
                    $tier1PenalizedCount++;
                    $deduction = (float)$matchedTier->nominal_denda;
                    $quotaText = "Jatah toleransi {$toleransiBulanan}/{$toleransiBulanan} habis (Kejadian ke-{$tier1Count}, Denda Rp " . number_format($deduction, 0, ',', '.') . ")";
                    $statusText = "Kategori {$matchedTier->tier_order} kejadian ke-{$tier1Count} (Potongan Rp " . number_format($deduction, 0, ',', '.') . ")";
                }
            } elseif ($matchedTier) {
                if ($matchedTier->tier_order === 2) $tier2Count++;
                elseif ($matchedTier->tier_order === 3) $tier3Count++;
                elseif ($matchedTier->tier_order === 4) $tier4Count++;

                $deduction = (float)$matchedTier->nominal_denda;
                $quotaText = "Tanpa toleransi (Potongan Rp " . number_format($deduction, 0, ',', '.') . ")";
                $statusText = "Kategori {$matchedTier->tier_order} (Potongan Rp " . number_format($deduction, 0, ',', '.') . ")";
            } else {
                $deduction = 30000;
                $quotaText = "Tanpa toleransi (Potongan Rp " . number_format($deduction, 0, ',', '.') . ")";
                $statusText = 'Terlambat (Potongan Rp 30.000)';
            }

            $totalLateMinutes += $minutesLate;
            $totalDeduction += $deduction;

            $dailyDetails[$dateStr] = [
                'minutes_late' => $minutesLate,
                'deduction' => $deduction,
                'tier' => $matchedTier,
                'category_name' => $category->nama,
                'category_code' => $category->kode,
                'tier_order' => $matchedTier ? $matchedTier->tier_order : null,
                'tier_name' => $matchedTier ? $matchedTier->nama_tier : null,
                'ada_toleransi' => $matchedTier ? (bool)$matchedTier->ada_toleransi : false,
                'toleransi_ke' => $toleransiKe,
                'toleransi_terpakai' => $tier1Count,
                'toleransi_max' => $toleransiBulanan,
                'quota_text' => $quotaText,
                'is_exempt' => false,
                'status_text' => $statusText,
            ];
        }

        return [
            'is_exempt' => false,
            'category' => $category,
            'total_late_minutes' => $totalLateMinutes,
            'total_deduction' => $totalDeduction,
            'tier1_count' => $tier1Count,
            'tier1_tolerated_count' => $tier1ToleratedCount,
            'tier1_penalized_count' => $tier1PenalizedCount,
            'tier2_count' => $tier2Count,
            'tier3_count' => $tier3Count,
            'tier4_count' => $tier4Count,
            'daily_details' => $dailyDetails,
        ];
    }
}
