<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\BusinessHour;
use App\Models\BusinessPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BusinessController extends Controller
{
    public function show()
    {
        $business = auth()->user()->business;

        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        return response()->json($business->load(['category', 'tags', 'amenities', 'photos', 'hours']));
    }

    public function update(Request $request)
    {
        $business = auth()->user()->business;

        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'subcategory' => 'nullable|string|max:255',
            'business_type' => 'sometimes|string|in:restaurant,retail,service,other',
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

        $business->update($validated);

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

        return response()->json($business->load(['category', 'tags', 'amenities', 'photos', 'hours']));
    }

    /**
     * Upload a photo (gallery / menu image) for the business. Shown on the business detail page.
     */
    public function uploadPhoto(Request $request)
    {
        $business = auth()->user()->business;
        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
            'is_primary' => 'boolean',
        ]);

        $path = $request->file('image')->store('businesses', 'public');
        $url = asset('storage/' . $path);

        if ($request->boolean('is_primary')) {
            $business->photos()->update(['is_primary' => false]);
        }

        $photo = $business->photos()->create([
            'url' => $url,
            'is_primary' => $request->boolean('is_primary', false),
        ]);

        return response()->json($photo, 201);
    }

    /**
     * Delete a business photo.
     */
    public function deletePhoto(BusinessPhoto $photo)
    {
        $business = auth()->user()->business;
        if (!$business || $photo->business_id !== $business->id) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        $storagePath = str_contains($photo->url, 'storage/')
            ? substr($photo->url, strpos($photo->url, 'storage/') + 8)
            : null;
        if ($storagePath && Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
        }
        $photo->delete();

        return response()->json(['message' => 'Photo deleted successfully']);
    }

    /**
     * Set a photo as primary (shown first on business detail page).
     */
    public function setPhotoPrimary(BusinessPhoto $photo)
    {
        $business = auth()->user()->business;
        if (!$business || $photo->business_id !== $business->id) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        $business->photos()->update(['is_primary' => false]);
        $photo->update(['is_primary' => true]);

        return response()->json($photo->fresh());
    }
}
