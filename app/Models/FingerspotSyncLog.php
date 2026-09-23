<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FingerspotSyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'cloud_id',
        'action',
        'start_date',
        'end_date',
        'records_received',
        'records_inserted',
        'status',
        'response_message',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
