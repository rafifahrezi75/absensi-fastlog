<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperationalSchedule extends Model
{
    use HasFactory;

    protected $table = 'operational_schedules';

    protected $fillable = [
        'tanggal_mulai_berlaku',
        'normal_check_in',
        'normal_check_out',
        'normal_tolerance',
        'saturday_check_in',
        'saturday_check_out',
        'saturday_tolerance',
    ];

    protected $casts = [
        'tanggal_mulai_berlaku' => 'date:Y-m-d',
        'normal_tolerance' => 'integer',
        'saturday_tolerance' => 'integer',
    ];

    private static ?array $cachedSchedules = null;

    public static function clearCache(): void
    {
        self::$cachedSchedules = null;
    }

    public static function getAllAsc(): array
    {
        if (self::$cachedSchedules === null) {
            self::$cachedSchedules = self::orderBy('tanggal_mulai_berlaku', 'asc')->get()->all();
        }
        return self::$cachedSchedules;
    }

    public static function forDate(string $date): array
    {
        $d = substr($date, 0, 10);
        $schedules = self::getAllAsc();
        $matched = null;

        foreach ($schedules as $s) {
            $tgl = is_string($s->tanggal_mulai_berlaku)
                ? substr($s->tanggal_mulai_berlaku, 0, 10)
                : $s->tanggal_mulai_berlaku->format('Y-m-d');

            if ($tgl <= $d) {
                $matched = $s;
            } else {
                break;
            }
        }

        if ($matched) {
            return [
                'normal_check_in' => $matched->normal_check_in ?: '08:00',
                'normal_check_out' => $matched->normal_check_out ?: '17:00',
                'normal_tolerance' => (int)($matched->normal_tolerance ?? 0),
                'saturday_check_in' => $matched->saturday_check_in ?: '08:00',
                'saturday_check_out' => $matched->saturday_check_out ?: '12:00',
                'saturday_tolerance' => (int)($matched->saturday_tolerance ?? 0),
            ];
        }

        return [
            'normal_check_in' => '08:00',
            'normal_check_out' => '17:00',
            'normal_tolerance' => 0,
            'saturday_check_in' => '08:00',
            'saturday_check_out' => '12:00',
            'saturday_tolerance' => 0,
        ];
    }
}

