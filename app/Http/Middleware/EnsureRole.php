<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth('api')->user();

        if (! $user) {
            return $this->errorResponse('Authentication required.', [], 401);
        }

        if ($user->role === 'admin') {
            return $next($request);
        }

        if (! in_array($user->role, $roles, true)) {
            return $this->errorResponse('Forbidden.', [], 403);
        }

        return $next($request);
    }
}
