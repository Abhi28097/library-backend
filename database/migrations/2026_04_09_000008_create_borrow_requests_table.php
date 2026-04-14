<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrow_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('book_id')->index();
            $table->string('status')->default('pending')->index();
            $table->unsignedTinyInteger('due_days')->default(7);
            $table->text('note')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'book_id', 'status'], 'borrow_requests_user_book_status_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_requests');
    }
};
