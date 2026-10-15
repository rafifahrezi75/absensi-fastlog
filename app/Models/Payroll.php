<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'periode',
        'gaji_pokok',
        'tunjangan',
        'lembur',
        'bonus',
        'potongan_terlambat',
        'potongan_alpa',
        'potongan_lainnya',
        'total_potongan',
        'thp',
        'hadir_hari',
        'terlambat_menit',
        'alpa_hari',
        'lembur_menit',
        'status',
        'dibayar_pada',
        'catatan',
    ];

    protected $casts = [
        'gaji_pokok' => 'float',
        'tunjangan' => 'float',
        'lembur' => 'float',
        'bonus' => 'float',
        'potongan_terlambat' => 'float',
        'potongan_alpa' => 'float',
        'potongan_lainnya' => 'float',
        'total_potongan' => 'float',
        'thp' => 'float',
        'hadir_hari' => 'integer',
        'terlambat_menit' => 'integer',
        'alpa_hari' => 'integer',
        'lembur_menit' => 'integer',
        'dibayar_pada' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
