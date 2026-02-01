<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'subcategory',
        'rating',
        'review_count',
        'price_range',
        'address',
        'city',
        'state',
        'postal_code',
        'latitude',
        'longitude',
        'is_open',
        'featured',
        'phone',
        'email',
        'website',
        'description',
        'business_type',
    ];

    /** Business types that control which sections (amenities, gallery, hours) are shown. */
    public const BUSINESS_TYPES = ['restaurant', 'retail', 'service', 'other'];

    protected $casts = [
        'rating' => 'decimal:1',
        'review_count' => 'integer',
        'price_range' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_open' => 'boolean',
        'featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'business_categories');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'business_tags');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'business_amenities');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(BusinessPhoto::class);
    }

    public function hours(): HasMany
    {
        return $this->hasMany(BusinessHour::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function contactRequests(): HasMany
    {
        return $this->hasMany(ContactRequest::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function owner()
    {
        return $this->hasOne(User::class, 'business_id');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'user_favorites')->withTimestamps();
    }
}
