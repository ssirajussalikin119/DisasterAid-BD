<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReliefItem extends Model
{
    protected $fillable = [
        'relief_request_id',
        'item_name',
        'quantity',
        'status',
    ];

    public function request() {
        return $this->belongsTo(ReliefRequest::class, 'relief_request_id');
    }
}
