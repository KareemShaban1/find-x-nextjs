<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $businesses = Business::all();
        $userNames = ['Sarah M.', 'Michael R.', 'Emily C.', 'David L.', 'Jessica K.', 'Robert T.', 'Amanda S.', 'James W.', 'Lisa P.', 'Chris H.'];
        $avatars = [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        ];

        $reviewTemplates = [
            'Absolutely incredible experience! The service was outstanding and the quality exceeded my expectations. Will definitely be coming back!',
            'Great place with excellent staff. The atmosphere is wonderful and I had a fantastic time. Highly recommend!',
            'Good overall experience. The service was prompt and professional. Would visit again.',
            'Amazing! Everything was perfect from start to finish. The attention to detail was impressive.',
            'Very satisfied with my visit. The staff was friendly and helpful. Great value for money.',
            'Outstanding service and quality. One of the best experiences I\'ve had. Highly recommended!',
            'Nice place with good service. The atmosphere is pleasant and the staff is attentive.',
            'Excellent experience overall. The quality is top-notch and the service is professional.',
            'Really enjoyed my time here. The staff was knowledgeable and the service was excellent.',
            'Good place with decent service. Could use some improvements but overall satisfied.',
        ];

        foreach ($businesses as $business) {
            $reviewCount = rand(10, 50);
            $ratings = [];
            
            // Generate realistic rating distribution
            for ($i = 0; $i < $reviewCount; $i++) {
                $rand = rand(1, 100);
                if ($rand <= 60) {
                    $ratings[] = 5; // 60% 5-star
                } elseif ($rand <= 80) {
                    $ratings[] = 4; // 20% 4-star
                } elseif ($rand <= 90) {
                    $ratings[] = 3; // 10% 3-star
                } elseif ($rand <= 95) {
                    $ratings[] = 2; // 5% 2-star
                } else {
                    $ratings[] = 1; // 5% 1-star
                }
            }

            foreach ($ratings as $rating) {
                Review::create([
                    'business_id' => $business->id,
                    'user_name' => $userNames[array_rand($userNames)],
                    'user_avatar' => $avatars[array_rand($avatars)],
                    'rating' => $rating,
                    'content' => $reviewTemplates[array_rand($reviewTemplates)],
                    'helpful' => rand(0, 50),
                ]);
            }

            // Update business rating and review count
            $avgRating = array_sum($ratings) / count($ratings);
            $business->update([
                'rating' => round($avgRating, 1),
                'review_count' => $reviewCount,
            ]);
        }
    }
}
