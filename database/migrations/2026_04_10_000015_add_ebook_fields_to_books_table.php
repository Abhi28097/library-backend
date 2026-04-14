<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('ebook_file_path')->nullable();
            $table->string('ebook_file_name')->nullable();
            $table->string('ebook_file_type')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'ebook_file_path',
                'ebook_file_name',
                'ebook_file_type',
            ]);
        });
    }
};
