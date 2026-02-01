<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OfferController extends Controller
{
    /**
     * List offers for the authenticated business.
     */
    public function index()
    {
        $business = auth()->user()->business;
        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }
        $offers = $business->offers()->latest()->get();
        return response()->json($offers);
    }

    /**
     * Store a new offer (status: pending).
     */
    public function store(Request $request)
    {
        $business = auth()->user()->business;
        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|string|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'terms' => 'nullable|string|max:500',
        ]);

        if ($validated['discount_type'] === 'percentage' && ($validated['discount_value'] < 0 || $validated['discount_value'] > 100)) {
            return response()->json(['message' => 'Percentage discount must be between 0 and 100'], 422);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('offers', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }
        unset($validated['image']);

        $validated['business_id'] = $business->id;
        $validated['status'] = Offer::STATUS_PENDING;
        $offer = Offer::create($validated);
        return response()->json($offer, 201);
    }

    /**
     * Update an offer (only if still pending).
     */
    public function update(Request $request, Offer $offer)
    {
        $business = auth()->user()->business;
        if (!$business || $offer->business_id !== $business->id) {
            return response()->json(['message' => 'Offer not found'], 404);
        }
        if ($offer->status !== Offer::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending offers can be edited'], 422);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'sometimes|string|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'terms' => 'nullable|string|max:500',
        ]);

        if (isset($validated['discount_type']) && $validated['discount_type'] === 'percentage'
            && isset($validated['discount_value']) && ($validated['discount_value'] < 0 || $validated['discount_value'] > 100)) {
            return response()->json(['message' => 'Percentage discount must be between 0 and 100'], 422);
        }

        if ($request->hasFile('image')) {
            if ($offer->image_url && str_contains($offer->image_url, 'storage/')) {
                $oldPath = substr($offer->image_url, strpos($offer->image_url, 'storage/') + 8);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('offers', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }
        unset($validated['image']);

        $offer->update($validated);
        return response()->json($offer->fresh());
    }

    /**
     * Delete an offer (only if pending).
     */
    public function destroy(Offer $offer)
    {
        $business = auth()->user()->business;
        if (!$business || $offer->business_id !== $business->id) {
            return response()->json(['message' => 'Offer not found'], 404);
        }
        if ($offer->status !== Offer::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending offers can be deleted'], 422);
        }
        $offer->delete();
        return response()->json(['message' => 'Offer deleted']);
    }
}
