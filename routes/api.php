<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookReviewController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/books/{bookId}/reviews', [BookReviewController::class, 'index']);

Route::middleware('api.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/books/{id}/reader', [BookController::class, 'reader']);
    Route::get('/books/{id}/ebook', [BookController::class, 'ebook']);
    Route::post('/books/{bookId}/reviews', [BookReviewController::class, 'store']);
    Route::get('/cart', [StoreController::class, 'cart']);
    Route::post('/cart', [StoreController::class, 'addToCart']);
    Route::put('/cart/{id}', [StoreController::class, 'updateCartItem']);
    Route::delete('/cart/{id}', [StoreController::class, 'removeCartItem']);
    Route::post('/checkout', [StoreController::class, 'checkout']);
    Route::post('/checkout/verify', [StoreController::class, 'verifyCheckout']);
    Route::get('/orders', [StoreController::class, 'orders']);
    Route::get('/my-library', [LibraryController::class, 'myLibrary']);
    Route::post('/wishlist/{bookId}', [LibraryController::class, 'storeWishlist']);
    Route::delete('/wishlist/{bookId}', [LibraryController::class, 'destroyWishlist']);
    Route::post('/borrow-requests/{bookId}', [LibraryController::class, 'storeBorrowRequest']);

    Route::middleware('admin')->group(function () {
        Route::get('/analytics', [LibraryController::class, 'analytics']);
        Route::get('/users', [AuthController::class, 'indexUsers']);
        Route::get('/issued-books', [LibraryController::class, 'indexIssuedBooks']);
        Route::get('/borrow-requests', [LibraryController::class, 'indexBorrowRequests']);
        Route::put('/users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('/users/{id}', [AuthController::class, 'destroyUser']);
        Route::post('/issued-books', [LibraryController::class, 'issueBook']);
        Route::put('/issued-books/{id}/return', [LibraryController::class, 'returnBook']);
        Route::put('/borrow-requests/{id}/approve', [LibraryController::class, 'approveBorrowRequest']);
        Route::put('/borrow-requests/{id}/reject', [LibraryController::class, 'rejectBorrowRequest']);
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);
    });
});
