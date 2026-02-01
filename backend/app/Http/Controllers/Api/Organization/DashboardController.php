<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Review;
use App\Models\ContactRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $business = $this->getUserBusiness();

        if (!$business) {
            return response()->json([
                'business' => null,
                'total_reviews' => 0,
                'average_rating' => null,
                'total_contact_requests' => 0,
                'recent_reviews' => [],
                'recent_contact_requests' => [],
            ]);
        }

        $stats = [
            'business' => $business->load(['category', 'tags', 'amenities', 'photos']),
            'total_reviews' => $business->reviews()->count(),
            'average_rating' => $business->rating,
            'total_contact_requests' => $business->contactRequests()->count(),
            'recent_reviews' => $business->reviews()->latest()->take(5)->get(),
            'recent_contact_requests' => $business->contactRequests()->latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }

    private function getUserBusiness()
    {
        return auth()->user()->business;
    }
}
