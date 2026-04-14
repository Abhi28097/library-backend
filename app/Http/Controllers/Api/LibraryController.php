<?php

namespace App\Http\Controllers\Api;

use App\Mail\LibraryEventMail;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRequest;
use App\Models\IssuedBook;
use App\Models\Order;
use App\Models\User;
use App\Models\UserNotification;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class LibraryController extends Controller
{
    private const FINE_PER_DAY = 10;

    private function notifyUser(int $userId, string $title, string $message, string $type = 'info'): void
    {
        UserNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }

    private function sendEventMail(?string $email, string $subject, string $heading, string $message, array $meta = []): void
    {
        if (!$email) {
            return;
        }

        try {
            Mail::to($email)->send(new LibraryEventMail($subject, $heading, $message, $meta));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    public function analytics()
    {
        $totalUsers = User::query()->where('role', 'user')->count();
        $totalAdmins = User::query()->where('role', 'admin')->count();
        $activeIssuedBooks = IssuedBook::query()->where('status', 'issued')->count();
        $overdueBooks = IssuedBook::query()
            ->where('status', 'issued')
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->count();
        $pendingBorrowRequests = BorrowRequest::query()->where('status', 'pending')->count();
        $wishlistCount = WishlistItem::query()->count();
        $returnedBooks = IssuedBook::query()->where('status', 'returned')->count();
        $outstandingFineTotal = IssuedBook::query()
            ->where('status', 'issued')
            ->whereNotNull('due_at')
            ->get()
            ->sum(function (IssuedBook $item) {
                if (!$item->due_at || now()->lessThanOrEqualTo($item->due_at)) {
                    return 0;
                }

                $overdueDays = (int) ceil($item->due_at->diffInHours(now()) / 24);

                return max($overdueDays, 0) * self::FINE_PER_DAY;
            });

        return response()->json([
            'total_users' => $totalUsers,
            'total_admins' => $totalAdmins,
            'active_issued_books' => $activeIssuedBooks,
            'overdue_books' => $overdueBooks,
            'pending_borrow_requests' => $pendingBorrowRequests,
            'wishlist_count' => $wishlistCount,
            'returned_books' => $returnedBooks,
            'outstanding_fine_total' => $outstandingFineTotal,
            'fine_per_day' => self::FINE_PER_DAY,
        ]);
    }

    private function formatBorrowRequest(BorrowRequest $borrowRequest): array
    {
        $borrowRequest->loadMissing(['user:id,name,email', 'book']);

        return [
            'id' => $borrowRequest->id,
            'user_id' => $borrowRequest->user_id,
            'book_id' => $borrowRequest->book_id,
            'status' => $borrowRequest->status,
            'due_days' => $borrowRequest->due_days,
            'note' => $borrowRequest->note,
            'approved_at' => optional($borrowRequest->approved_at)?->toISOString(),
            'rejected_at' => optional($borrowRequest->rejected_at)?->toISOString(),
            'created_at' => optional($borrowRequest->created_at)?->toISOString(),
            'user' => $borrowRequest->user,
            'book' => $borrowRequest->book,
        ];
    }

    private function formatIssuedBook(IssuedBook $issuedBook): array
    {
        $issuedBook->loadMissing(['user:id,name,email', 'book']);
        $isOverdue = $issuedBook->status === 'issued'
            && $issuedBook->due_at
            && now()->greaterThan($issuedBook->due_at);
        $overdueDays = $isOverdue
            ? max((int) ceil($issuedBook->due_at->diffInHours(now()) / 24), 0)
            : 0;
        $fineAmount = $overdueDays * self::FINE_PER_DAY;

        return [
            'id' => $issuedBook->id,
            'user_id' => $issuedBook->user_id,
            'book_id' => $issuedBook->book_id,
            'issued_at' => optional($issuedBook->issued_at)?->toISOString(),
            'due_at' => optional($issuedBook->due_at)?->toISOString(),
            'returned_at' => optional($issuedBook->returned_at)?->toISOString(),
            'status' => $isOverdue ? 'overdue' : $issuedBook->status,
            'overdue_days' => $overdueDays,
            'fine_amount' => $fineAmount,
            'user' => $issuedBook->user,
            'book' => $issuedBook->book,
        ];
    }

    public function indexIssuedBooks()
    {
        $issuedBooks = IssuedBook::query()
            ->with(['user:id,name,email', 'book'])
            ->latest('issued_at')
            ->get();

        return response()->json($issuedBooks->map(fn (IssuedBook $item) => $this->formatIssuedBook($item)));
    }

    public function myLibrary(Request $request)
    {
        $user = $request->user();

        $wishlist = WishlistItem::query()
            ->where('user_id', $user->id)
            ->with('book')
            ->latest()
            ->get();

        $issuedBooks = IssuedBook::query()
            ->where('user_id', $user->id)
            ->with('book')
            ->latest('issued_at')
            ->get();

        $borrowRequests = BorrowRequest::query()
            ->where('user_id', $user->id)
            ->with('book')
            ->latest()
            ->get();

        $purchasedBooks = Order::query()
            ->where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->with(['items.book'])
            ->latest()
            ->get()
            ->flatMap(fn (Order $order) => $order->items)
            ->filter(fn ($item) => $item->book)
            ->unique('book_id')
            ->values()
            ->map(function ($item) {
                return [
                    'id' => $item->book->id,
                    'book_id' => $item->book->id,
                    'title' => $item->book->title,
                    'author' => $item->book->author,
                    'image' => $item->book->image,
                    'price' => $item->unit_price,
                ];
            });

        $notifications = UserNotification::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->limit(12)
            ->get();

        return response()->json([
            'wishlist' => $wishlist,
            'issued_books' => $issuedBooks->map(fn (IssuedBook $item) => $this->formatIssuedBook($item)),
            'borrow_requests' => $borrowRequests->map(fn (BorrowRequest $item) => $this->formatBorrowRequest($item)),
            'purchased_books' => $purchasedBooks,
            'notifications' => $notifications,
        ]);
    }

    public function indexBorrowRequests()
    {
        $requests = BorrowRequest::query()
            ->with(['user:id,name,email', 'book'])
            ->latest()
            ->get();

        return response()->json($requests->map(fn (BorrowRequest $item) => $this->formatBorrowRequest($item)));
    }

    public function storeBorrowRequest(Request $request, $bookId)
    {
        $book = Book::findOrFail($bookId);
        $user = $request->user();

        $validated = $request->validate([
            'due_days' => 'nullable|integer|min:1|max:60',
            'note' => 'nullable|string|max:1000',
        ]);

        $alreadyIssued = IssuedBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'issued')
            ->exists();

        if ($alreadyIssued) {
            return response()->json([
                'message' => 'This book is already issued to you',
            ], 422);
        }

        $existingRequest = BorrowRequest::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'A pending request already exists for this book',
            ], 422);
        }

        $borrowRequest = BorrowRequest::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => 'pending',
            'due_days' => $validated['due_days'] ?? 7,
            'note' => $validated['note'] ?? null,
        ]);

        $this->notifyUser(
            $user->id,
            'Borrow Request Sent',
            "Your request for {$book->title} has been submitted for review.",
            'info'
        );
        $this->sendEventMail(
            $user->email,
            'Borrow Request Submitted',
            'Your borrow request has been recorded',
            "Your request for {$book->title} has been submitted successfully.",
            [
                'Book' => $book->title,
                'Status' => 'Pending approval',
            ]
        );

        return response()->json([
            'message' => 'Borrow request submitted successfully',
            'borrow_request' => $this->formatBorrowRequest($borrowRequest),
        ]);
    }

    public function approveBorrowRequest($id)
    {
        $borrowRequest = BorrowRequest::with(['user', 'book'])->findOrFail($id);

        if ($borrowRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be approved',
            ], 422);
        }

        $existingIssue = IssuedBook::query()
            ->where('user_id', $borrowRequest->user_id)
            ->where('book_id', $borrowRequest->book_id)
            ->where('status', 'issued')
            ->exists();

        if ($existingIssue) {
            return response()->json([
                'message' => 'This book is already issued to the selected user',
            ], 422);
        }

        $issuedBook = IssuedBook::create([
            'user_id' => $borrowRequest->user_id,
            'book_id' => $borrowRequest->book_id,
            'issued_at' => now(),
            'due_at' => now()->addDays($borrowRequest->due_days ?: 7),
            'status' => 'issued',
        ]);

        if ($borrowRequest->book) {
            $borrowRequest->book->update([
                'status' => 'Issued',
            ]);
        }

        $borrowRequest->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $this->notifyUser(
            $borrowRequest->user_id,
            'Borrow Request Approved',
            "Your request for {$borrowRequest->book?->title} was approved and the book is now issued to you.",
            'success'
        );
        $this->sendEventMail(
            $borrowRequest->user?->email,
            'Borrow Request Approved',
            'Your borrow request was approved',
            "Your request for {$borrowRequest->book?->title} was approved and the book is now available in your issued library.",
            [
                'Book' => $borrowRequest->book?->title,
                'Due Days' => $borrowRequest->due_days,
            ]
        );

        return response()->json([
            'message' => 'Borrow request approved successfully',
            'borrow_request' => $this->formatBorrowRequest($borrowRequest->fresh()),
            'issued_book' => $this->formatIssuedBook($issuedBook),
        ]);
    }

    public function rejectBorrowRequest($id)
    {
        $borrowRequest = BorrowRequest::findOrFail($id);

        if ($borrowRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be rejected',
            ], 422);
        }

        $borrowRequest->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        $this->notifyUser(
            $borrowRequest->user_id,
            'Borrow Request Rejected',
            "Your request for {$borrowRequest->book?->title} was rejected by the admin.",
            'warning'
        );
        $this->sendEventMail(
            $borrowRequest->user?->email,
            'Borrow Request Rejected',
            'Your borrow request was not approved',
            "Your request for {$borrowRequest->book?->title} was rejected by the admin.",
            [
                'Book' => $borrowRequest->book?->title,
                'Status' => 'Rejected',
            ]
        );

        return response()->json([
            'message' => 'Borrow request rejected successfully',
            'borrow_request' => $this->formatBorrowRequest($borrowRequest->fresh()),
        ]);
    }

    public function storeWishlist(Request $request, $bookId)
    {
        Book::findOrFail($bookId);

        $item = WishlistItem::firstOrCreate([
            'user_id' => $request->user()->id,
            'book_id' => $bookId,
        ]);

        return response()->json([
            'message' => 'Book added to wishlist',
            'wishlist_item' => $item,
        ]);
    }

    public function destroyWishlist(Request $request, $bookId)
    {
        WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->delete();

        return response()->json([
            'message' => 'Book removed from wishlist',
        ]);
    }

    public function issueBook(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'book_id' => 'required|integer',
            'due_days' => 'nullable|integer|min:1|max:60',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $book = Book::findOrFail($validated['book_id']);

        $existingIssue = IssuedBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'issued')
            ->first();

        if ($existingIssue) {
            return response()->json([
                'message' => 'This book is already issued to the selected user',
            ], 422);
        }

        $issuedBook = IssuedBook::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'issued_at' => now(),
            'due_at' => now()->addDays($validated['due_days'] ?? 7),
            'status' => 'issued',
        ]);

        $this->notifyUser(
            $user->id,
            'Book Issued',
            "{$book->title} has been issued to your account.",
            'success'
        );
        $this->sendEventMail(
            $user->email,
            'Book Issued To Your Account',
            'A book has been issued to you',
            "{$book->title} is now available under your issued books history.",
            [
                'Book' => $book->title,
                'Due Date' => now()->addDays($validated['due_days'] ?? 7)->toDateString(),
            ]
        );

        $book->update([
            'status' => 'Issued',
        ]);

        return response()->json([
            'message' => 'Book issued successfully',
            'issued_book' => $this->formatIssuedBook($issuedBook),
        ]);
    }

    public function returnBook($id)
    {
        $issuedBook = IssuedBook::with('book')->findOrFail($id);

        $issuedBook->update([
            'returned_at' => now(),
            'status' => 'returned',
        ]);

        $this->notifyUser(
            $issuedBook->user_id,
            'Book Returned',
            "{$issuedBook->book?->title} has been marked as returned.",
            'info'
        );
        $this->sendEventMail(
            $issuedBook->user?->email,
            'Book Return Confirmed',
            'Your issued book was marked as returned',
            "{$issuedBook->book?->title} has been marked as returned in your library account.",
            [
                'Book' => $issuedBook->book?->title,
                'Returned At' => now()->toDateTimeString(),
            ]
        );

        $hasActiveIssue = IssuedBook::query()
            ->where('book_id', $issuedBook->book_id)
            ->where('status', 'issued')
            ->exists();

        if (!$hasActiveIssue && $issuedBook->book) {
            $issuedBook->book->update([
                'status' => 'Available',
            ]);
        }

        return response()->json([
            'message' => 'Book returned successfully',
            'issued_book' => $this->formatIssuedBook($issuedBook->fresh()),
        ]);
    }
}
