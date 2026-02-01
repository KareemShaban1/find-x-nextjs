<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create super admin (update or create)
        User::updateOrCreate(
            ['email' => 'admin@findx.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
            ]
        );

        // Seed categories
        $this->call(CategorySeeder::class);

        // Seed tags
        $this->call(TagSeeder::class);

        // Seed amenities
        $this->call(AmenitySeeder::class);

        // Seed businesses
        $this->call(BusinessSeeder::class);

        // Seed reviews
        $this->call(ReviewSeeder::class);
    }
}
