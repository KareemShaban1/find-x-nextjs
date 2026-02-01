<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $business = auth()->user()->business;

        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        $reviews = $business->reviews()
            ->with('photos')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($reviews);
    }
}
