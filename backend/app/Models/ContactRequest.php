<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactRequest extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'email',
        'phone',
        'subject',
        'message',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
