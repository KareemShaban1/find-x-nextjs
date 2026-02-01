<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;

class FavoritesController extends Controller
{
    /**
     * List the authenticated user's favorite businesses.
     */
    public function index(Request $request)
    {
        $businesses = $request->user()
            ->favorites()
            ->with(['category', 'photos'])
            ->get()
            ->map(function (Business $business) {
                return [
                    'id' => $business->id,
                    'name' => $business->name,
                    'slug' => $business->slug,
                    'category' => $business->category?->name,
                    'rating' => (float) $business->rating,
                    'review_count' => $business->review_count,
                    'address' => $business->address,
                    'city' => $business->city,
                    'image' => $business->photos->where('is_primary', true)->first()?->url
                        ?? $business->photos->first()?->url
                        ?? null,
                ];
            });

        return response()->json($businesses);
    }

    /**
     * Add a business to favorites.
     */
    public function store(Request $request, Business $business)
    {
        $request->user()->favorites()->syncWithoutDetaching([$business->id]);
        return response()->json(['message' => 'Added to favorites', 'favorited' => true]);
    }

    /**
     * Remove a business from favorites.
     */
    public function destroy(Request $request, Business $business)
    {
        $request->user()->favorites()->detach($business->id);
        return response()->json(['message' => 'Removed from favorites', 'favorited' => false]);
    }
}
