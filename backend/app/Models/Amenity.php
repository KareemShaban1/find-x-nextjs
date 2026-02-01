<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    protected $fillable = [
        'name',
    ];

    public function businesses(): BelongsToMany
    {
        return $this->belongsToMany(Business::class, 'business_amenities');
    }
}
