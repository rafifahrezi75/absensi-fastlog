<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AppPermission extends Model
{
    use HasFactory;

    protected $table = 'app_permissions';

    protected $fillable = [
        'name',
        'label',
        'group_name',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'app_permission_role', 'app_permission_id', 'role_id')->withTimestamps();
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'app_permission_user', 'app_permission_id', 'user_id')->withTimestamps();
    }
}

