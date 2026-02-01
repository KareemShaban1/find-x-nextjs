<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use Illuminate\Http\Request;

class AmenityController extends Controller
{
    /**
     * List all amenities (read-only). Used by organization owners when editing their business
     * and by the main site. Creating amenities is admin-only.
     */
    public function index(Request $request)
    {
        $query = Amenity::query()->orderBy('name');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->get());
    }
}
