<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Italian', 'Fine Dining', 'Fast Food', 'Vegetarian', 'Vegan',
            'Car Repair', 'Tire Service', 'Oil Change', 'Auto Detailing',
            'Massage', 'Facial', 'Hair Salon', 'Nail Salon', 'Spa',
            'Phone Repair', 'Computer', 'Electronics', 'Appliance Repair',
            '24/7', 'Personal Training', 'Yoga', 'Pilates', 'CrossFit',
            'Fashion', 'Jewelry', 'Electronics', 'Home Decor',
            'Movies', 'Theater', 'Music', 'Comedy',
            'Dentist', 'Doctor', 'Pharmacy', 'Hospital',
            'School', 'University', 'Tutoring', 'Language',
            'Real Estate Agent', 'Property Management', 'Mortgage',
            'Lawyer', 'Attorney', 'Legal Advice',
            'Bank', 'Insurance', 'Investment',
            'Hotel', 'Travel Agency', 'Tour Guide',
            'Bar', 'Pub', 'Club', 'Live Music',
            'Gym', 'Swimming', 'Tennis', 'Golf',
            'Pet Grooming', 'Veterinary', 'Pet Store',
            'Plumbing', 'Electrical', 'HVAC', 'Roofing',
            'Software', 'Web Design', 'IT Support',
            'Art Gallery', 'Craft Store', 'Pottery',
        ];

        foreach ($tags as $tagName) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($tagName)],
                ['name' => $tagName]
            );
        }
    }
}
