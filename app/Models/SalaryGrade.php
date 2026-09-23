<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryGrade extends Model
{
    use HasFactory;

    protected $table = 'salary_grades';

    protected $fillable = [
        'kode',
        'nama',
        'gaji_pokok',
        'tarif_lembur',
        'keterangan',
        'status',
    ];

    protected $casts = [
        'gaji_pokok' => 'float',
        'tarif_lembur' => 'float',
    ];
}
