<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Public\OfferController as PublicOfferController;
use App\Models\Business;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with(['category', 'tags', 'photos']);

        $userLat = $request->has('latitude') ? (float) $request->latitude : ($request->has('lat') ? (float) $request->lat : null);
        $userLng = $request->has('longitude') ? (float) $request->longitude : ($request->has('lng') ? (float) $request->lng : null);
        $radiusKm = $request->has('radius_km') ? (float) $request->radius_km : null;
        $hasUserLocation = $userLat !== null && $userLng !== null;

        if ($hasUserLocation) {
            // Haversine formula: distance in km (6371 = Earth radius in km)
            $latRad = deg2rad($userLat);
            $lngRad = deg2rad($userLng);
            $distanceSql = "(
                6371 * acos( LEAST(1.0, GREATEST(-1.0,
                    cos({$latRad}) * cos(radians(latitude)) * cos(radians(longitude) - {$lngRad})
                    + sin({$latRad}) * sin(radians(latitude))
                )))
            )";
            $query->selectRaw("businesses.*, {$distanceSql} as distance_km");
        }

        // Only filter by is_open if explicitly requested
        if ($request->has('is_open') && $request->is_open == 'true') {
            $query->where('is_open', true);
        }

        // Search (business name, description, category, tags)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('category', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('tags', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Location: search in business address, city, state (so "Cairo" finds businesses in Cairo)
        if ($request->filled('location')) {
            $location = trim($request->location);
            $locationLike = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $location) . '%';
            $query->where(function($q) use ($locationLike) {
                $q->where('address', 'like', $locationLike)
                  ->orWhere('city', 'like', $locationLike)
                  ->orWhere('state', 'like', $locationLike);
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        // Rating filter
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Price range filter
        if ($request->has('price_range')) {
            $priceRange = is_array($request->price_range)
                ? $request->price_range
                : explode(',', $request->price_range);
            $query->whereBetween('price_range', [
                $priceRange[0] ?? 1,
                $priceRange[1] ?? 4
            ]);
        }

        // Featured filter
        if ($request->has('featured')) {
            $query->where('featured', $request->featured == 'true');
        }

        // Open now filter
        if ($request->has('is_open')) {
            $query->where('is_open', true);
        }

        // Max radius filter (only when user location is provided and NOT searching by location text).
        // When location text is sent we filter by address/city/state instead, so skip radius to avoid excluding valid results.
        if ($hasUserLocation && $radiusKm !== null && $radiusKm > 0 && !$request->filled('location')) {
            $query->having('distance_km', '<=', $radiusKm);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'relevance');
        switch ($sortBy) {
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'reviews':
                $query->orderBy('review_count', 'desc');
                break;
            case 'distance':
                if ($hasUserLocation) {
                    $query->orderBy('distance_km', 'asc');
                } else {
                    $query->orderBy('name', 'asc');
                }
                break;
            default:
                if ($hasUserLocation) {
                    $query->orderBy('distance_km', 'asc');
                } else {
                    $query->orderBy('featured', 'desc')->orderBy('rating', 'desc');
                }
        }

        $perPage = $request->get('per_page', 20);
        $businesses = $query->paginate($perPage);

        // Transform data for frontend
        $businesses->getCollection()->transform(function($business) use ($hasUserLocation) {
            $item = [
                'id' => $business->id,
                'name' => $business->name,
                'category' => $business->category?->name ?? 'Uncategorized',
                'subcategory' => $business->subcategory,
                'rating' => (float) $business->rating,
                'reviews' => $business->review_count,
                'priceRange' => $business->price_range,
                'address' => $business->address,
                'city' => $business->city,
                'state' => $business->state,
                'postal_code' => $business->postal_code,
                'lat' => (float) $business->latitude,
                'lng' => (float) $business->longitude,
                'isOpen' => $business->is_open,
                'featured' => $business->featured,
                'image' => $business->photos->where('is_primary', true)->first()?->url
                    ?? $business->photos->first()?->url
                    ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                'tags' => $business->tags->pluck('name')->toArray(),
                'phone' => $business->phone,
                'email' => $business->email,
                'website' => $business->website,
                'description' => $business->description,
            ];
            if ($hasUserLocation && isset($business->distance_km)) {
                $km = round((float) $business->distance_km, 1);
                $miles = round($km * 0.621371, 1);
                $item['distance'] = $km;
                $item['distanceText'] = $miles < 0.1 ? (round($miles * 5280) . ' ft') : ($miles . ' mi');
            }
            return $item;
        });

        return response()->json($businesses);
    }

    public function show($id)
    {
        $business = Business::with([
            'category',
            'tags',
            'amenities',
            'photos',
            'hours',
            'reviews' => function ($query) {
                $query->with('photos')->latest()->limit(20);
            },
            'offers' => function ($query) {
                $query->where('status', 'approved')
                    ->where('start_date', '<=', now()->toDateString())
                    ->where('end_date', '>=', now()->toDateString())
                    ->orderBy('end_date', 'asc');
            },
            'products' => function ($query) {
                $query->where('is_available', true)->orderBy('sort_order')->orderBy('name');
            },
        ])->findOrFail($id);

        return response()->json([
            'id' => $business->id,
            'name' => $business->name,
            'category' => $business->category?->name ?? 'Uncategorized',
            'subcategory' => $business->subcategory,
            'business_type' => $business->business_type ?? 'other',
            'rating' => (float) $business->rating,
            'totalReviews' => $business->review_count,
            'priceRange' => '$' . str_repeat('$', $business->price_range - 1),
            'description' => $business->description,
            'address' => $business->address,
            'city' => $business->city,
            'state' => $business->state,
            'postal_code' => $business->postal_code,
            'phone' => $business->phone,
            'email' => $business->email,
            'website' => $business->website,
            'lat' => (float) $business->latitude,
            'lng' => (float) $business->longitude,
            'isOpen' => $business->is_open,
            'featured' => $business->featured,
            'image' => $business->photos->where('is_primary', true)->first()?->url 
                ?? $business->photos->first()?->url 
                ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
            'images' => $business->photos->sortByDesc('is_primary')->values()->pluck('url')->toArray(),
            'hours' => $business->hours->map(function($hour) {
                $days = [1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday', 7 => 'Sunday'];
                return [
                    'day' => $days[$hour->day_of_week] ?? '',
                    'open' => $hour->open_time ? date('H:i', strtotime($hour->open_time)) : null,
                    'close' => $hour->close_time ? date('H:i', strtotime($hour->close_time)) : null,
                    'isClosed' => $hour->is_closed,
                ];
            })->toArray(),
            'amenities' => $business->amenities->pluck('name')->toArray(),
            'reviews' => $business->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'author' => $review->user_name,
                    'avatar' => $review->user_avatar,
                    'rating' => $review->rating,
                    'date' => $review->created_at->diffForHumans(),
                    'content' => $review->content,
                    'helpful' => $review->helpful,
                    'images' => $review->photos->pluck('url')->toArray(),
                ];
            })->toArray(),
            'offers' => $business->offers->map(fn ($offer) => PublicOfferController::formatOffer($offer, false))->values()->toArray(),
            'products' => $business->products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'price' => (float) $p->price,
                'imageUrl' => $p->image_url,
                'productCategory' => $p->product_category,
            ])->values()->toArray(),
        ]);
    }
}
