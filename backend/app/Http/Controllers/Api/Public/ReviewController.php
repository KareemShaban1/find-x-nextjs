<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit a review for a business (authenticated customer/user).
     */
    public function store(Request $request, Business $business)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|max:2000',
        ]);

        $user = $request->user();

        // Optional: allow only customers to review, or any authenticated user
        $existing = Review::where('business_id', $business->id)->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this business.'], 422);
        }

        $review = $business->reviews()->create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_avatar' => null,
            'rating' => $request->rating,
            'content' => $request->content,
            'helpful' => 0,
        ]);

        // Update business rating/review count (optional - could be done via observer)
        $business->update([
            'review_count' => $business->reviews()->count(),
            'rating' => (float) $business->reviews()->avg('rating'),
        ]);

        return response()->json([
            'id' => $review->id,
            'author' => $review->user_name,
            'rating' => $review->rating,
            'content' => $review->content,
            'date' => $review->created_at->diffForHumans(),
        ], 201);
    }
}
