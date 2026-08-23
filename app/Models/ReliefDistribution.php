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
    ];

    public function reliefCenter()
    {
        return $this->belongsTo(ReliefCenter::class);
    }
}