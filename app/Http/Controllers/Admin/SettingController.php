<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index()
    {
        // Get all settings as key-value pairs
        $settingsData = SystemSetting::all();
        $settings = [];
        foreach ($settingsData as $setting) {
            $settings[$setting->key] = $setting->value;
        }

        // Default values if not set
        $defaultSettings = [
            'normal_check_in' => '08:00',
            'normal_check_out' => '17:00',
            'normal_tolerance' => '15', // minutes
            'saturday_check_in' => '08:00',
            'saturday_check_out' => '12:00',
            'saturday_tolerance' => '15',
            'late_fine_per_minute' => '1000', // Rp
            'absent_deduction' => '50000', // Rp
        ];

        // Merge defaults with DB values
        $settings = array_merge($defaultSettings, $settings);

        // Get upcoming and recent holidays
        $holidays = Holiday::orderBy('date', 'desc')->get();

        return response()->json([
            'settings' => $settings,
            'holidays' => $holidays,
        ]);
    }

    public function update(Request $request)
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
                        ['key' => $key],
                        ['value' => $value]
                    );
                }
            }
            DB::commit();
            return response()->json(['message' => 'Pengaturan berhasil diperbarui.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan pengaturan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function addHoliday(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'description' => 'required|string|max:255',
            'is_national' => 'boolean',
        ]);

        $holiday = Holiday::create([
            'date' => $data['date'],
            'description' => $data['description'],
            'is_national' => $request->boolean('is_national', false),
        ]);

        return response()->json(['message' => 'Hari libur berhasil ditambahkan.', 'holiday' => $holiday], 201);
    }

    public function deleteHoliday($id)
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->delete();

        return response()->json(['message' => 'Hari libur berhasil dihapus.']);
    }
}
