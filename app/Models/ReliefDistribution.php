<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReliefDistribution extends Model
{
    protected $fillable = [
        'relief_center_id',
        'relief_type',
        'quantity',
        'distribution_date',
        'description',
        'recipient',
        'report_reference',
        'distributed_by',
        'distributed_at',
    ];

    protected $casts = [
        'distribution_date' => 'date',
        'distributed_at' => 'datetime',
    ];

    public function reliefCenter()
    {
        return $this->belongsTo(ReliefCenter::class);
    }
}
