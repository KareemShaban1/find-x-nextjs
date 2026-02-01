<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\BusinessController as AdminBusinessController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\TagController as AdminTagController;
use App\Http\Controllers\Api\Admin\AmenityController as AdminAmenityController;
use App\Http\Controllers\Api\Organization\DashboardController as OrgDashboardController;
use App\Http\Controllers\Api\Organization\BusinessController as OrgBusinessController;
use App\Http\Controllers\Api\Organization\ReviewController as OrgReviewController;
use App\Http\Controllers\Api\Organization\ContactRequestController as OrgContactRequestController;
use App\Http\Controllers\Api\Public\BusinessController as PublicBusinessController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\AmenityController as PublicAmenityController;
use App\Http\Controllers\Api\Public\ReviewController as PublicReviewController;
use App\Http\Controllers\Api\Public\OfferController as PublicOfferController;
use App\Http\Controllers\Api\Admin\OfferController as AdminOfferController;
use App\Http\Controllers\Api\Organization\OfferController as OrgOfferController;
use App\Http\Controllers\Api\Organization\ProductController as OrgProductController;
use App\Http\Controllers\Api\FavoritesController;

// Public routes (for frontend)
Route::get('/public/businesses', [PublicBusinessController::class, 'index']);
Route::get('/public/businesses/{id}', [PublicBusinessController::class, 'show']);
Route::get('/public/categories', [PublicCategoryController::class, 'index']);
Route::get('/public/amenities', [PublicAmenityController::class, 'index']);
Route::get('/public/offers', [PublicOfferController::class, 'index']);

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Customer / user: favorites and reviews
    Route::get('/user/favorites', [FavoritesController::class, 'index']);
    Route::post('/user/favorites/{business}', [FavoritesController::class, 'store']);
    Route::delete('/user/favorites/{business}', [FavoritesController::class, 'destroy']);
    Route::post('/businesses/{business}/reviews', [PublicReviewController::class, 'store']);

    // Super Admin routes
    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::apiResource('businesses', AdminBusinessController::class);
        Route::post('/businesses/{business}/photos', [AdminBusinessController::class, 'uploadPhoto']);
        Route::delete('/businesses/{business}/photos/{photo}', [AdminBusinessController::class, 'deletePhoto']);
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('users', AdminUserController::class);
        Route::get('/tags', [AdminTagController::class, 'index']);
        Route::post('/tags', [AdminTagController::class, 'store']);
        Route::get('/amenities', [AdminAmenityController::class, 'index']);
        Route::post('/amenities', [AdminAmenityController::class, 'store']);
        Route::get('/offers', [AdminOfferController::class, 'index']);
        Route::patch('/offers/{offer}', [AdminOfferController::class, 'update']);
    });

    // Organization Owner routes
    Route::middleware('role:organization_owner')->prefix('organization')->name('organization.')->group(function () {
        Route::get('/dashboard', [OrgDashboardController::class, 'index']);
        Route::get('/business', [OrgBusinessController::class, 'show']);
        Route::put('/business', [OrgBusinessController::class, 'update']);
        Route::post('/business/photos', [OrgBusinessController::class, 'uploadPhoto']);
        Route::delete('/business/photos/{photo}', [OrgBusinessController::class, 'deletePhoto']);
        Route::patch('/business/photos/{photo}/primary', [OrgBusinessController::class, 'setPhotoPrimary']);
        Route::get('/reviews', [OrgReviewController::class, 'index']);
        Route::get('/contact-requests', [OrgContactRequestController::class, 'index']);
        Route::get('/offers', [OrgOfferController::class, 'index']);
        Route::post('/offers', [OrgOfferController::class, 'store']);
        Route::put('/offers/{offer}', [OrgOfferController::class, 'update']);
        Route::post('/offers/{offer}', [OrgOfferController::class, 'update']); // POST for multipart file upload
        Route::delete('/offers/{offer}', [OrgOfferController::class, 'destroy']);
        Route::get('/products', [OrgProductController::class, 'index']);
        Route::post('/products', [OrgProductController::class, 'store']);
        Route::put('/products/{product}', [OrgProductController::class, 'update']);
        Route::post('/products/{product}', [OrgProductController::class, 'update']); // POST for multipart
        Route::delete('/products/{product}', [OrgProductController::class, 'destroy']);
    });
});
