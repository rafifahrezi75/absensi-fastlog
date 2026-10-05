<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterTindakan extends Model
{
    use HasFactory;

    protected $table = 'master_tindakan';

    protected $fillable = [
        'nama',
        'kategori',
        'jumlah_kasus',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_kasus' => 'integer',
    ];

    protected $appends = [
        'jumlahKasus',
    ];

    public function getJumlahKasusAttribute(): int
    {
        return (int) ($this->attributes['jumlah_kasus'] ?? 0);
    }
}
