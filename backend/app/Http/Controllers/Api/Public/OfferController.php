<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    /**
     * List approved offers for the home page.
     * Optionally filter by date: ?active_only=1 returns only offers where today is between start_date and end_date (uses app timezone).
     */
    public function index(Request $request)
    {
        $limit = min((int) $request->get('limit', 12), 50);
        $query = Offer::approved()
            ->with('business:id,name,slug,city,address')
            ->orderBy('end_date', 'asc')
            ->orderBy('start_date', 'desc');

        if ($request->boolean('active_only')) {
            $query->active();
        }

        $offers = $query->limit($limit)->get();

        $data = $offers->map(fn (Offer $offer) => $this->formatOffer($offer, true));
        return response()->json($data);
    }

    public static function formatOffer(Offer $offer, bool $includeBusiness = false): array
    {
        $item = [
            'id' => $offer->id,
            'title' => $offer->title,
            'description' => $offer->description,
            'discountType' => $offer->discount_type,
            'discountValue' => (float) $offer->discount_value,
            'startDate' => $offer->start_date->format('Y-m-d'),
            'endDate' => $offer->end_date->format('Y-m-d'),
            'imageUrl' => $offer->image_url,
            'terms' => $offer->terms,
        ];
        if ($includeBusiness && $offer->relationLoaded('business') && $offer->business) {
            $item['business'] = [
                'id' => $offer->business->id,
                'name' => $offer->business->name,
                'slug' => $offer->business->slug,
                'city' => $offer->business->city,
                'address' => $offer->business->address,
            ];
        }
        return $item;
    }
}
