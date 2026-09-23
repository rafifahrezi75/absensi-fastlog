<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'user_id',
        'attendance_id',
        'waktu_tap',
        'durasi_menit',
        'status',
        'catatan_admin',
    ];

    protected $casts = [
        'waktu_tap' => 'datetime',
        'durasi_menit' => 'integer',
    ];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }
}
