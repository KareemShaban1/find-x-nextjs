<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    /**
     * List all offers (with optional status filter).
     */
    public function index(Request $request)
    {
        $query = Offer::with('business:id,name,slug');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        $offers = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($offers);
    }

    /**
     * Approve or reject an offer.
     */
    public function update(Request $request, Offer $offer)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $offer->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $offer->admin_notes,
        ]);

        return response()->json($offer->fresh()->load('business:id,name,slug'));
    }
}
