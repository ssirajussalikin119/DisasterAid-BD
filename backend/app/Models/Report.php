<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'latitude',
        'longitude',
        'status',
        'severity',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
