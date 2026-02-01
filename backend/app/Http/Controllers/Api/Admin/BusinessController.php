<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessPhoto;
use App\Models\BusinessHour;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with(['category', 'categories', 'tags', 'photos', 'owner']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->featured);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'subcategory' => 'nullable|string|max:255',
            'price_range' => 'required|integer|between:1,4',
            'address' => 'required|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'featured' => 'boolean',
            'tag_ids' => 'array',
            'amenity_ids' => 'array',
            'hours' => 'nullable|array',
            'hours.*.day_of_week' => 'required|integer|between:1,7',
            'hours.*.open_time' => 'nullable|date_format:H:i',
            'hours.*.close_time' => 'nullable|date_format:H:i',
            'hours.*.is_closed' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Use category_id if provided (for backward compatibility), otherwise use first category_ids
        if (!isset($validated['category_id']) && isset($validated['category_ids']) && count($validated['category_ids']) > 0) {
            $validated['category_id'] = $validated['category_ids'][0];
        }

        $business = Business::create($validated);

        // Sync multiple categories
        if ($request->has('category_ids')) {
            $business->categories()->sync($request->category_ids);
        } elseif ($request->has('category_id')) {
            $business->categories()->sync([$request->category_id]);
        }

        if ($request->has('tag_ids')) {
            $business->tags()->sync($request->tag_ids);
        }

        if ($request->has('amenity_ids')) {
            $business->amenities()->sync($request->amenity_ids);
        }

        // Handle business hours
        if ($request->has('hours')) {
            $business->hours()->delete();
            foreach ($request->hours as $hour) {
                $business->hours()->create($hour);
            }
        }

        return response()->json($business->load(['category', 'categories', 'tags', 'amenities', 'photos', 'hours']), 201);
    }

    public function show(Business $business)
    {
        return response()->json($business->load(['category', 'categories', 'tags', 'amenities', 'photos', 'hours', 'reviews', 'owner']));
    }

    public function update(Request $request, Business $business)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'subcategory' => 'nullable|string|max:255',
            'price_range' => 'sometimes|integer|between:1,4',
            'address' => 'sometimes|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'featured' => 'boolean',
            'is_open' => 'boolean',
            'tag_ids' => 'array',
            'amenity_ids' => 'array',
            'hours' => 'nullable|array',
            'hours.*.day_of_week' => 'required|integer|between:1,7',
            'hours.*.open_time' => 'nullable|date_format:H:i',
            'hours.*.close_time' => 'nullable|date_format:H:i',
            'hours.*.is_closed' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Use category_id if provided (for backward compatibility), otherwise use first category_ids
        if (!isset($validated['category_id']) && isset($validated['category_ids']) && count($validated['category_ids']) > 0) {
            $validated['category_id'] = $validated['category_ids'][0];
        }

        $business->update($validated);

        // Sync multiple categories
        if ($request->has('category_ids')) {
            $business->categories()->sync($request->category_ids);
        } elseif ($request->has('category_id')) {
            $business->categories()->sync([$request->category_id]);
        }

        if ($request->has('tag_ids')) {
            $business->tags()->sync($request->tag_ids);
        }

        if ($request->has('amenity_ids')) {
            $business->amenities()->sync($request->amenity_ids);
        }

        // Handle business hours
        if ($request->has('hours')) {
            $business->hours()->delete();
            foreach ($request->hours as $hour) {
                $business->hours()->create($hour);
            }
        }

        return response()->json($business->load(['category', 'categories', 'tags', 'amenities', 'photos', 'hours']));
    }

    public function uploadPhoto(Request $request, Business $business)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
            'is_primary' => 'boolean',
        ]);

        $path = $request->file('image')->store('businesses', 'public');
        $url = asset('storage/' . $path);

        // If this is primary, unset other primary photos
        if ($request->boolean('is_primary')) {
            $business->photos()->update(['is_primary' => false]);
        }

        $photo = $business->photos()->create([
            'url' => $url,
            'is_primary' => $request->boolean('is_primary', false),
        ]);

        return response()->json($photo, 201);
    }

    public function deletePhoto(Business $business, BusinessPhoto $photo)
    {
        if ($photo->business_id !== $business->id) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        Storage::disk('public')->delete(str_replace('/storage/', '', $photo->url));
        $photo->delete();

        return response()->json(['message' => 'Photo deleted successfully']);
    }

    public function destroy(Business $business)
    {
        $business->delete();
        return response()->json(['message' => 'Business deleted successfully']);
    }
}
