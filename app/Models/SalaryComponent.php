<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryComponent extends Model
{
    use HasFactory;

    protected $table = 'salary_components';

    protected $fillable = [
        'nama',
        'tipe',
        'metode',
        'nilai',
        'basis',
        'batas_dasar',
        'kena_pajak',
        'status',
    ];

    protected $casts = [
        'nilai' => 'float',
        'batas_dasar' => 'float',
        'kena_pajak' => 'boolean',
    ];
}
