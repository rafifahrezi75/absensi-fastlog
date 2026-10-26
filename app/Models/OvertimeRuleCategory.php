<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OvertimeRuleCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'departemen_list',
        'jabatan_keywords',
        'daily_start',
        'daily_rate',
        'weekend_start',
        'weekend_rate',
        'holiday_rate',
        'is_default',
        'is_locked',
    ];

    protected $casts = [
        'departemen_list' => 'array',
        'jabatan_keywords' => 'array',
        'daily_rate' => 'float',
        'weekend_rate' => 'float',
        'holiday_rate' => 'float',
        'is_default' => 'boolean',
        'is_locked' => 'boolean',
    ];
}
