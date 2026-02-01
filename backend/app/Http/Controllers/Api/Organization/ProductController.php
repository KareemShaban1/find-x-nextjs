<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List products for the authenticated business.
     */
    public function index()
    {
        $business = auth()->user()->business;
        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }
        $products = $business->products()->orderBy('sort_order')->orderBy('name')->get();
        return response()->json($products);
    }

    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $business = auth()->user()->business;
        if (!$business) {
            return response()->json(['message' => 'No business associated with this account'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'product_category' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'is_available' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }
        unset($validated['image']);

        $validated['business_id'] = $business->id;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_available'] = $validated['is_available'] ?? true;
        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    /**
     * Update a product.
     */
    public function update(Request $request, Product $product)
    {
        $business = auth()->user()->business;
        if (!$business || $product->business_id !== $business->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'product_category' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'is_available' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_url && str_contains($product->image_url, 'storage/')) {
                $oldPath = substr($product->image_url, strpos($product->image_url, 'storage/') + 8);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }
        unset($validated['image']);

        $product->update($validated);
        return response()->json($product->fresh());
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product)
    {
        $business = auth()->user()->business;
        if (!$business || $product->business_id !== $business->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        if ($product->image_url && str_contains($product->image_url, 'storage/')) {
            $oldPath = substr($product->image_url, strpos($product->image_url, 'storage/') + 8);
            Storage::disk('public')->delete($oldPath);
        }
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
