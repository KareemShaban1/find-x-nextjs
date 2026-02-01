<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('dashboard-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('business'),
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,organization_owner,customer',
            'business_id' => 'nullable|exists:businesses,id',
            'business_name' => 'nullable|string|max:255',
            'business_address' => 'nullable|string|max:500',
            'business_phone' => 'nullable|string|max:50',
            'business_type' => 'nullable|string|in:restaurant,retail,service,other',
        ];

        if ($request->input('role') === 'organization_owner' && !$request->filled('business_id')) {
            $rules['business_name'] = 'required|string|max:255';
            $rules['business_address'] = 'required|string|max:500';
        }

        $request->validate($rules);

        $businessId = null;
        if ($request->role === 'organization_owner') {
            $businessId = $request->business_id;
        }
        if ($request->role === 'organization_owner' && !$businessId) {
            $business = Business::create([
                'name' => $request->business_name,
                'slug' => $this->uniqueSlug(Str::slug($request->business_name)),
                'address' => $request->business_address ?? 'To be added',
                'phone' => $request->business_phone,
                'email' => $request->email,
                'category_id' => null,
                'business_type' => $request->input('business_type', 'other'),
            ]);
            $businessId = $business->id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'business_id' => $businessId,
        ]);

        $token = $user->createToken('dashboard-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('business'),
            'token' => $token,
        ], 201);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $counter = 0;
        while (Business::where('slug', $slug)->exists()) {
            $counter++;
            $slug = $base . '-' . $counter;
        }
        return $slug;
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
