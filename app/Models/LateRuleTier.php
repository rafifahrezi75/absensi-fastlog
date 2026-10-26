<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LateRuleTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'late_rule_category_id',
        'tier_order',
        'nama_tier',
        'min_menit',
        'max_menit',
        'ada_toleransi',
        'nominal_denda',
        'deskripsi',
    ];

    protected $casts = [
        'tier_order' => 'integer',
        'min_menit' => 'integer',
        'max_menit' => 'integer',
        'ada_toleransi' => 'boolean',
        'nominal_denda' => 'float',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(LateRuleCategory::class, 'late_rule_category_id');
    }
}
