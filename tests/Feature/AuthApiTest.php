<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthApiTest extends TestCase
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

    public function test_user_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Assignment User',
            'email' => 'assignment-user@example.com',
            'password' => 'Secret123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'user')
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'assignment-user@example.com',
            'role' => 'user',
        ]);
    }

    public function test_admin_registration_is_blocked_without_the_correct_access_code(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Blocked Admin',
            'email' => 'blocked-admin@example.com',
            'password' => 'Secret123',
            'role' => 'admin',
            'admin_code' => 'wrong-code',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('message', 'Invalid admin access code');
    }

    public function test_login_rejects_access_to_the_wrong_panel(): void
    {
        User::create([
            'name' => 'Normal User',
            'email' => 'normal-user@example.com',
            'password' => Hash::make('Secret123'),
            'role' => 'user',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'normal-user@example.com',
            'password' => 'Secret123',
            'role' => 'admin',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('message', 'This account does not have access to the selected panel');
    }

    public function test_protected_route_requires_a_token(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Authentication token is missing');
    }

    public function test_logout_clears_the_users_api_token(): void
    {
        $plainToken = 'plain-assignment-token';

        $user = User::create([
            'name' => 'Logged User',
            'email' => 'logged-user@example.com',
            'password' => Hash::make('Secret123'),
            'role' => 'user',
            'api_token' => hash('sha256', $plainToken),
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $plainToken)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully');

        $this->assertNull($user->fresh()->api_token);
    }
}
