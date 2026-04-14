<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();

        if (!$plainToken) {
            return response()->json([
                'message' => 'Authentication token is missing',
            ], 401);
        }

        $user = User::where('api_token', hash('sha256', $plainToken))->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid authentication token',
            ], 401);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
