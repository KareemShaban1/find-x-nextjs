<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            'Outdoor Seating',
            'Free WiFi',
            'Private Dining',
            'Full Bar',
            'Wheelchair Accessible',
            'Valet Parking',
            'Reservations',
            'Takeout',
            'Delivery',
            'Drive Through',
            'Pet Friendly',
            'Live Music',
            'Happy Hour',
            'Outdoor Patio',
            'Parking Available',
            'Air Conditioning',
            'Heating',
            'Credit Cards Accepted',
            'Cash Only',
            'Family Friendly',
            'Romantic',
            'Business Casual',
            'Formal Attire',
            'Good for Groups',
            'Good for Kids',
            'Good for Dates',
            'Trendy',
            'Casual',
            'Upscale',
            'Budget Friendly',
        ];

        foreach ($amenities as $amenityName) {
            Amenity::updateOrCreate(
                ['name' => $amenityName]
            );
        }
    }
}
