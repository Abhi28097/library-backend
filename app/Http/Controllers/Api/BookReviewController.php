<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookReview;
use Illuminate\Http\Request;

class BookReviewController extends Controller
{
    public function index($bookId)
    {
        Book::findOrFail($bookId);

        $reviews = BookReview::query()
            ->where('book_id', $bookId)
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, $bookId)
    {
        Book::findOrFail($bookId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1500',
        ]);

        $review = BookReview::updateOrCreate(
            [
                'book_id' => $bookId,
                'user_id' => $request->user()->id,
            ],
            [
                'rating' => $validated['rating'],
                'review' => $validated['review'] ?? null,
            ]
        );

        $review->load('user:id,name');

        return response()->json([
            'message' => 'Review saved successfully',
            'review' => $review,
        ]);
    }
}
