<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Restaurants',
            'Automotive',
            'Beauty & Spa',
            'Home Services',
            'Fitness',
            'Shopping',
            'Entertainment',
            'Health & Medical',
            'Education',
            'Real Estate',
            'Legal Services',
            'Financial Services',
            'Travel & Tourism',
            'Food & Dining',
            'Nightlife',
            'Sports & Recreation',
            'Pet Services',
            'Home Improvement',
            'Technology',
            'Arts & Crafts',
        ];

        foreach ($categories as $categoryName) {
            Category::updateOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );
        }
    }
}
