<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TLog extends Model
{
    protected $table = 't_log';

    public $timestamps = false;

    protected $fillable = [
        'cloud_id',
        'type',
        'original_data',
        'created_at',
    ];
}
