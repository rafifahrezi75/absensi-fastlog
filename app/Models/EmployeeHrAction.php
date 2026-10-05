<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeHrAction extends Model
{
    use HasFactory;

    protected $table = 'employee_hr_actions';

    protected $fillable = [
        'finger',
        'nama',
        'tanggal',
        'kategori',
        'tindakan',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
