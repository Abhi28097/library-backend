<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'author',
        'category',
        'published_year',
        'price',
        'status',
        'description',
        'preview_content',
        'reader_content',
        'ebook_file_path',
        'ebook_file_name',
        'ebook_file_type',
        'image',
    ];

    public function reviews()
    {
        return $this->hasMany(BookReview::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function issuedBooks()
    {
        return $this->hasMany(IssuedBook::class);
    }

    public function borrowRequests()
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
