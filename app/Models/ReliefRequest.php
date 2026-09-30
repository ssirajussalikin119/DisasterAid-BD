<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReliefRequest extends Model
{
    protected $fillable = [
        'user_id',
        'incident_id',
        'status',
        'urgency',
        'description',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function incident() {
        return $this->belongsTo(Incident::class);
    }

    public function items() {
        return $this->hasMany(ReliefItem::class);
    }
}
