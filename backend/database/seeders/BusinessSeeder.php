<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Amenity;
use App\Models\BusinessHour;
use App\Models\BusinessPhoto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $tags = Tag::all();
        $amenities = Amenity::all();

        // San Francisco coordinates for realistic locations
        $sfLocations = [
            ['lat' => 37.7849, 'lng' => -122.4094, 'address' => '123 Main Street, Downtown, San Francisco, CA 94102'],
            ['lat' => 37.7699, 'lng' => -122.4294, 'address' => '456 Oak Avenue, Mission District, San Francisco, CA 94110'],
            ['lat' => 37.7799, 'lng' => -122.4144, 'address' => '789 Wellness Blvd, SoMa, San Francisco, CA 94103'],
            ['lat' => 37.7649, 'lng' => -122.4394, 'address' => '321 Tech Lane, Financial District, San Francisco, CA 94105'],
            ['lat' => 37.7749, 'lng' => -122.4194, 'address' => '555 Fitness Way, Castro, San Francisco, CA 94114'],
            ['lat' => 37.7879, 'lng' => -122.4094, 'address' => '888 Market Street, Union Square, San Francisco, CA 94102'],
            ['lat' => 37.7599, 'lng' => -122.4144, 'address' => '234 Mission Street, Mission Bay, San Francisco, CA 94158'],
            ['lat' => 37.7949, 'lng' => -122.4094, 'address' => '567 Broadway, North Beach, San Francisco, CA 94133'],
            ['lat' => 37.7549, 'lng' => -122.4094, 'address' => '890 Valencia Street, Mission, San Francisco, CA 94110'],
            ['lat' => 37.8049, 'lng' => -122.4094, 'address' => '111 Fillmore Street, Pacific Heights, San Francisco, CA 94117'],
        ];

        $businesses = [
            ['name' => 'The Garden Kitchen', 'category' => 'Restaurants', 'subcategory' => 'Italian • Fine Dining', 'price_range' => 3, 'rating' => 4.8, 'reviews' => 324, 'featured' => true],
            ['name' => 'Elite Auto Repairs', 'category' => 'Automotive', 'subcategory' => 'Car Repair • Tire Service', 'price_range' => 3, 'rating' => 4.9, 'reviews' => 156, 'featured' => false],
            ['name' => 'Serenity Spa & Wellness', 'category' => 'Beauty & Spa', 'subcategory' => 'Massage • Facial', 'price_range' => 2, 'rating' => 4.7, 'reviews' => 289, 'featured' => true],
            ['name' => 'Tech Fix Pro', 'category' => 'Home Services', 'subcategory' => 'Phone Repair • Computer', 'price_range' => 1, 'rating' => 4.6, 'reviews' => 198, 'featured' => false],
            ['name' => 'FitLife Gym', 'category' => 'Fitness', 'subcategory' => '24/7 • Personal Training', 'price_range' => 2, 'rating' => 4.5, 'reviews' => 412, 'featured' => true],
            ['name' => 'Boutique Fashion House', 'category' => 'Shopping', 'subcategory' => 'Fashion • Jewelry', 'price_range' => 4, 'rating' => 4.4, 'reviews' => 167, 'featured' => false],
            ['name' => 'Cinema Palace', 'category' => 'Entertainment', 'subcategory' => 'Movies • Theater', 'price_range' => 2, 'rating' => 4.3, 'reviews' => 523, 'featured' => true],
            ['name' => 'HealthCare Plus', 'category' => 'Health & Medical', 'subcategory' => 'Doctor • Pharmacy', 'price_range' => 2, 'rating' => 4.9, 'reviews' => 445, 'featured' => false],
            ['name' => 'Academy Learning Center', 'category' => 'Education', 'subcategory' => 'School • Tutoring', 'price_range' => 2, 'rating' => 4.6, 'reviews' => 234, 'featured' => false],
            ['name' => 'Prime Real Estate', 'category' => 'Real Estate', 'subcategory' => 'Real Estate Agent • Property Management', 'price_range' => 3, 'rating' => 4.7, 'reviews' => 189, 'featured' => true],
            ['name' => 'Legal Experts Group', 'category' => 'Legal Services', 'subcategory' => 'Lawyer • Attorney', 'price_range' => 4, 'rating' => 4.8, 'reviews' => 156, 'featured' => false],
            ['name' => 'Trust Financial Services', 'category' => 'Financial Services', 'subcategory' => 'Bank • Insurance', 'price_range' => 3, 'rating' => 4.5, 'reviews' => 278, 'featured' => false],
            ['name' => 'Travel Dreams Agency', 'category' => 'Travel & Tourism', 'subcategory' => 'Travel Agency • Tour Guide', 'price_range' => 2, 'rating' => 4.4, 'reviews' => 312, 'featured' => false],
            ['name' => 'Sushi Master', 'category' => 'Food & Dining', 'subcategory' => 'Japanese • Sushi', 'price_range' => 3, 'rating' => 4.9, 'reviews' => 567, 'featured' => true],
            ['name' => 'The Jazz Club', 'category' => 'Nightlife', 'subcategory' => 'Bar • Live Music', 'price_range' => 2, 'rating' => 4.6, 'reviews' => 423, 'featured' => true],
            ['name' => 'Sports Complex', 'category' => 'Sports & Recreation', 'subcategory' => 'Gym • Swimming', 'price_range' => 2, 'rating' => 4.5, 'reviews' => 389, 'featured' => false],
            ['name' => 'Paw Care Clinic', 'category' => 'Pet Services', 'subcategory' => 'Veterinary • Pet Grooming', 'price_range' => 2, 'rating' => 4.7, 'reviews' => 245, 'featured' => false],
            ['name' => 'Home Renovation Pro', 'category' => 'Home Improvement', 'subcategory' => 'Plumbing • Electrical', 'price_range' => 3, 'rating' => 4.6, 'reviews' => 198, 'featured' => false],
            ['name' => 'Digital Solutions Inc', 'category' => 'Technology', 'subcategory' => 'Software • Web Design', 'price_range' => 3, 'rating' => 4.8, 'reviews' => 234, 'featured' => true],
            ['name' => 'Artisan Gallery', 'category' => 'Arts & Crafts', 'subcategory' => 'Art Gallery • Craft Store', 'price_range' => 2, 'rating' => 4.4, 'reviews' => 167, 'featured' => false],
        ];

        $imageUrls = [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
        ];

        foreach ($businesses as $index => $businessData) {
            $category = $categories->where('name', $businessData['category'])->first() ?? $categories->random();
            $location = $sfLocations[$index % count($sfLocations)];

            $slug = Str::slug($businessData['name'] . ' ' . $index);
            $business = Business::updateOrCreate(
                ['slug' => $slug],
                [
                'name' => $businessData['name'],
                'slug' => $slug,
                'category_id' => $category->id,
                'subcategory' => $businessData['subcategory'],
                'rating' => $businessData['rating'],
                'review_count' => $businessData['reviews'],
                'price_range' => $businessData['price_range'],
                'address' => $location['address'],
                'city' => 'San Francisco',
                'state' => 'CA',
                'postal_code' => '94102',
                'latitude' => $location['lat'],
                'longitude' => $location['lng'],
                'is_open' => rand(0, 10) > 2, // 80% chance of being open
                'featured' => $businessData['featured'],
                'phone' => '(555) ' . rand(100, 999) . '-' . rand(1000, 9999),
                'email' => Str::slug($businessData['name']) . '@example.com',
                'website' => 'https://' . Str::slug($businessData['name']) . '.com',
                'description' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' . $businessData['name'] . ' offers exceptional service and quality.',
            ]);

            // Attach random tags
            $businessTags = $tags->random(rand(2, 5));
            $business->tags()->attach($businessTags->pluck('id'));

            // Attach random amenities
            $businessAmenities = $amenities->random(rand(3, 8));
            $business->amenities()->attach($businessAmenities->pluck('id'));

            // Create business hours
            $days = [1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday', 7 => 'Sunday'];
            foreach ($days as $dayNum => $dayName) {
                $isClosed = ($dayNum == 7 && rand(0, 10) > 7); // 30% chance Sunday is closed
                BusinessHour::create([
                    'business_id' => $business->id,
                    'day_of_week' => $dayNum,
                    'open_time' => $isClosed ? null : (rand(6, 9) . ':00'),
                    'close_time' => $isClosed ? null : (rand(20, 23) . ':00'),
                    'is_closed' => $isClosed,
                ]);
            }

            // Create business photos
            $photoCount = rand(3, 6);
            for ($i = 0; $i < $photoCount; $i++) {
                BusinessPhoto::create([
                    'business_id' => $business->id,
                    'url' => $imageUrls[array_rand($imageUrls)],
                    'is_primary' => $i === 0,
                ]);
            }
        }
    }
}
