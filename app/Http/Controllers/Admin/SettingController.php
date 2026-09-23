<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settingsData = SystemSetting::all();
        $settings = [];
        foreach ($settingsData as $setting) {
            $settings[$setting->kunci] = $setting->nilai;
        }

        $defaultSettings = [
            'normal_check_in' => '08:00',
            'normal_check_out' => '17:00',
            'normal_tolerance' => '15',
            'saturday_check_in' => '08:00',
            'saturday_check_out' => '12:00',
            'saturday_tolerance' => '15',
            'late_fine_per_minute' => '1000',
            'absent_deduction' => '50000',
        ];

        $settings = array_merge($defaultSettings, $settings);
        $holidays = Holiday::orderBy('tanggal', 'desc')->get();

        return response()->json([
            'settings' => $settings,
            'holidays' => $holidays,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'normal_check_in' => 'nullable|string',
            'normal_check_out' => 'nullable|string',
            'normal_tolerance' => 'nullable|integer',
            'saturday_check_in' => 'nullable|string',
            'saturday_check_out' => 'nullable|string',
            'saturday_tolerance' => 'nullable|integer',
            'late_fine_per_minute' => 'nullable|numeric',
            'absent_deduction' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            foreach ($data as $key => $value) {
                if ($value !== null) {
                    SystemSetting::updateOrCreate(
                        ['kunci' => $key],
                        ['nilai' => (string)$value]
                    );
                }
            }
            DB::commit();
            return response()->json(['message' => 'Pengaturan berhasil diperbarui.']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan pengaturan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function addHoliday(Request $request): JsonResponse
    {
        $date = $request->input('tanggal') ?? $request->input('date');
        $desc = $request->input('keterangan') ?? $request->input('description');
        $isNational = $request->boolean('libur_nasional', false) || $request->boolean('is_national', false);

        if (!$date || !$desc) {
            return response()->json(['message' => 'Tanggal dan keterangan hari libur wajib diisi.'], 422);
        }

        $exists = Holiday::where('tanggal', $date)->exists();
        if ($exists) {
            return response()->json(['message' => 'Tanggal hari libur ini sudah terdaftar.'], 422);
        }

        $holiday = Holiday::create([
            'tanggal' => $date,
            'keterangan' => $desc,
            'libur_nasional' => $isNational,
        ]);

        return response()->json(['message' => 'Hari libur berhasil ditambahkan.', 'holiday' => $holiday], 201);
    }

    public function deleteHoliday(string $id): JsonResponse
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->delete();

        return response()->json(['message' => 'Hari libur berhasil dihapus.']);
    }
}
