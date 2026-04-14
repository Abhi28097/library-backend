<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('password');
            $table->string('api_token', 80)->nullable()->unique()->after('remember_token');
            $table->string('phone')->nullable()->after('api_token');
            $table->string('city')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('city');
            $table->string('avatar')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'api_token', 'phone', 'city', 'bio', 'avatar']);
        });
    }
};
