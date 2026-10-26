<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'nama',
        'pin',
        'cloud_id',
        'trans_id',
        'privilege',
        'finger',
        'face',
        'password',
        'rfid',
        'vein',
        'template',
        'raw_data',
        'dept',
        'jabatan',
        'salary_grade_id',
        'late_category_id',
        'is_exempt',
        'status',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'is_exempt' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function salaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class, 'salary_grade_id');
    }

    public function lateCategory(): BelongsTo
    {
        return $this->belongsTo(LateRuleCategory::class, 'late_category_id');
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }
}
