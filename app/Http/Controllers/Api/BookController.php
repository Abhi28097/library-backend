<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\IssuedBook;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    private function hasReaderAccess($user, Book $book): array
    {
        $hasPurchasedAccess = OrderItem::query()
            ->where('book_id', $book->id)
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('payment_status', 'paid');
            })
            ->exists();

        $hasIssuedAccess = IssuedBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', ['issued', 'returned'])
            ->exists();

        $isAdmin = $user->role === 'admin';

        return [
            'allowed' => $isAdmin || $hasPurchasedAccess || $hasIssuedAccess,
            'access_type' => $isAdmin ? 'admin' : ($hasPurchasedAccess ? 'purchased' : ($hasIssuedAccess ? 'issued' : null)),
        ];
    }

    public function index()
    {
        $books = Book::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->get();

        return response()->json($books);
    }

    public function show($id)
    {
        $book = Book::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->with(['reviews' => function ($query) {
                $query->latest()->with('user:id,name');
            }])
            ->findOrFail($id);

        return response()->json($book);
    }

    public function reader(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $user = $request->user();

        $access = $this->hasReaderAccess($user, $book);

        if (!$access['allowed']) {
            return response()->json([
                'message' => 'Buy or issue this book to unlock the reader',
            ], 403);
        }

        return response()->json([
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'category' => $book->category,
            'preview_content' => $book->preview_content,
            'reader_content' => $book->reader_content ?: $book->description,
            'access_type' => $access['access_type'],
            'ebook_available' => (bool) $book->ebook_file_path,
            'ebook_file_name' => $book->ebook_file_name,
            'ebook_file_type' => $book->ebook_file_type,
        ]);
    }

    public function ebook(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $access = $this->hasReaderAccess($request->user(), $book);

        if (!$access['allowed']) {
            return response()->json([
                'message' => 'Buy or issue this book to unlock the ebook file',
            ], 403);
        }

        if (!$book->ebook_file_path || !Storage::disk('local')->exists($book->ebook_file_path)) {
            return response()->json([
                'message' => 'No ebook file uploaded for this book yet',
            ], 404);
        }

        return Storage::disk('local')->download(
            $book->ebook_file_path,
            $book->ebook_file_name ?: basename($book->ebook_file_path),
            $book->ebook_file_type ? ['Content-Type' => $book->ebook_file_type] : []
        );
    }

    public function store(Request $request)
    {
        $imageName = null;
        $ebookPath = null;
        $ebookOriginalName = null;
        $ebookMimeType = null;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads'), $imageName);
        }

        if ($request->hasFile('ebook_file')) {
            $ebook = $request->file('ebook_file');
            $ebookOriginalName = $ebook->getClientOriginalName();
            $ebookMimeType = $ebook->getMimeType() ?: $ebook->getClientMimeType();
            $ebookPath = $ebook->storeAs('ebooks', time() . '_' . $ebookOriginalName, 'local');
        }

        $book = Book::create([
            'title' => $request->title,
            'author' => $request->author,
            'category' => $request->category,
            'published_year' => $request->published_year,
            'price' => $request->price ?? 0,
            'status' => $request->status,
            'description' => $request->description,
            'preview_content' => $request->preview_content,
            'reader_content' => $request->reader_content,
            'ebook_file_path' => $ebookPath,
            'ebook_file_name' => $ebookOriginalName,
            'ebook_file_type' => $ebookMimeType,
            'image' => $imageName,
        ]);

        return response()->json([
            'message' => 'Book added successfully',
            'book' => $book,
        ]);
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $imageName = $book->image;
        $ebookPath = $book->ebook_file_path;
        $ebookOriginalName = $book->ebook_file_name;
        $ebookMimeType = $book->ebook_file_type;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads'), $imageName);
        }

        if ($request->hasFile('ebook_file')) {
            if ($book->ebook_file_path && Storage::disk('local')->exists($book->ebook_file_path)) {
                Storage::disk('local')->delete($book->ebook_file_path);
            }

            $ebook = $request->file('ebook_file');
            $ebookOriginalName = $ebook->getClientOriginalName();
            $ebookMimeType = $ebook->getMimeType() ?: $ebook->getClientMimeType();
            $ebookPath = $ebook->storeAs('ebooks', time() . '_' . $ebookOriginalName, 'local');
        }

        $book->update([
            'title' => $request->title,
            'author' => $request->author,
            'category' => $request->category,
            'published_year' => $request->published_year,
            'price' => $request->price ?? 0,
            'status' => $request->status,
            'description' => $request->description,
            'preview_content' => $request->preview_content,
            'reader_content' => $request->reader_content,
            'ebook_file_path' => $ebookPath,
            'ebook_file_name' => $ebookOriginalName,
            'ebook_file_type' => $ebookMimeType,
            'image' => $imageName,
        ]);

        return response()->json([
            'message' => 'Book updated successfully',
            'book' => $book,
        ]);
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete();

        return response()->json([
            'message' => 'Book deleted successfully',
        ]);
    }
}
