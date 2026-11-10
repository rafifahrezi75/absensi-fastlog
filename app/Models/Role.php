<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label',
        'description',
        'is_system',
        'is_active',
        'show_in_matrix',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'show_in_matrix' => 'boolean',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(AppPermission::class, 'app_permission_role', 'role_id', 'app_permission_id')->withTimestamps();
    }
}
