<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function indexUsers()
    {
        $users = User::query()
            ->orderBy('id')
            ->get()
            ->map(fn (User $user) => $this->formatUser($user));

        return response()->json($users);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => ['nullable', Rule::in(['user', 'admin'])],
            'admin_code' => 'nullable|string',
        ]);

        $role = $validated['role'] ?? 'user';

        if ($role === 'admin' && ($validated['admin_code'] ?? null) !== env('ADMIN_ACCESS_CODE', 'admin@123')) {
            return response()->json([
                'message' => 'Invalid admin access code',
            ], 403);
        }

        $plainToken = Str::random(60);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'api_token' => hash('sha256', $plainToken),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $plainToken,
            'user' => $this->formatUser($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => ['nullable', Rule::in(['user', 'admin'])],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!empty($validated['role']) && $user->role !== $validated['role']) {
            return response()->json([
                'message' => 'This account does not have access to the selected panel',
            ], 403);
        }

        $plainToken = Str::random(60);
        $user->forceFill([
            'api_token' => hash('sha256', $plainToken),
        ])->save();

        return response()->json([
            'message' => 'Login successful',
            'token' => $plainToken,
            'user' => $this->formatUser($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:120',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:2048',
            'avatar_file' => 'nullable|image|max:4096',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar_file')) {
            $avatarFile = $request->file('avatar_file');
            $avatarName = time() . '_' . $avatarFile->getClientOriginalName();
            $avatarFile->move(public_path('uploads/avatars'), $avatarName);
            $validated['avatar'] = url('uploads/avatars/' . $avatarName);
        }

        unset($validated['avatar_file']);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->forceFill([
            'api_token' => null,
        ])->save();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => ['required', Rule::in(['user', 'admin'])],
        ]);

        $user = User::findOrFail($id);
        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    public function destroyUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ((int) $request->user()->id === (int) $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own admin account while logged in',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile' => [
                'phone' => $user->phone,
                'city' => $user->city,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
            ],
        ];
    }
}
