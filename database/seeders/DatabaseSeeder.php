<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\BulkBooksSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@library.com'],
            [
                'name' => 'Library Admin',
                'password' => Hash::make('Admin@12345'),
                'role' => 'admin',
                'phone' => '9999999999',
                'city' => 'Admin City',
                'bio' => 'Primary administrator account for the library system.',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@library.com'],
            [
                'name' => 'Library User',
                'password' => Hash::make('User@12345'),
                'role' => 'user',
                'phone' => '8888888888',
                'city' => 'Reader City',
                'bio' => 'Default reader account for testing the library system.',
            ]
        );

        if (\App\Models\Book::query()->count() === 0) {
            $this->call(BulkBooksSeeder::class);
        }
    }
}
