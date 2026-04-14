<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->string('role')->default('user');
            $table->string('api_token', 64)->nullable();
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });
    }

    public function test_regular_user_cannot_access_admin_book_creation_route(): void
    {
        $plainToken = 'plain-user-token';

        User::create([
            'name' => 'Catalog User',
            'email' => 'catalog-user@example.com',
            'password' => Hash::make('Secret123'),
            'role' => 'user',
            'api_token' => hash('sha256', $plainToken),
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $plainToken)
            ->postJson('/api/books', [
                'title' => 'Blocked Book',
                'author' => 'Blocked Author',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Admin access is required');
    }
}
