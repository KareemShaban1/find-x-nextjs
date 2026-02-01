<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'description',
        'price',
        'image_url',
        'product_category',
        'sort_order',
        'is_available',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sort_order' => 'integer',
        'is_available' => 'boolean',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
