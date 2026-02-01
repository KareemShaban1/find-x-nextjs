<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\User;
use App\Models\Review;
use App\Models\ContactRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_businesses' => Business::count(),
            'total_categories' => Category::count(),
            'total_users' => User::count(),
            'total_reviews' => Review::count(),
            'total_contact_requests' => ContactRequest::count(),
            'featured_businesses' => Business::where('featured', true)->count(),
            'recent_businesses' => Business::latest()->take(5)->get(),
            'recent_users' => User::latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }
}
