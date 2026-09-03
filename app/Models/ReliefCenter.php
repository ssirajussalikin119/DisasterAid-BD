<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReliefCenter extends Model
{
    protected $fillable = [
        'name',
        'address',
        'capacity',
        'contact_number',
        'status',
        'latitude',
        'longitude',
        'available_resources',
    ];

    public function distributions()
    {
        return $this->hasMany(ReliefDistribution::class);
    }
}
