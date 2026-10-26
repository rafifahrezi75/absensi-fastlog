<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LateRuleCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'toleransi_bulanan',
        'departemen_list',
        'jabatan_keywords',
        'is_default',
        'is_locked',
    ];

    protected $casts = [
        'toleransi_bulanan' => 'integer',
        'departemen_list' => 'array',
        'jabatan_keywords' => 'array',
        'is_default' => 'boolean',
        'is_locked' => 'boolean',
    ];

    public function tiers(): HasMany
    {
        return $this->hasMany(LateRuleTier::class, 'late_rule_category_id')->orderBy('tier_order', 'asc');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'late_category_id');
    }
}
