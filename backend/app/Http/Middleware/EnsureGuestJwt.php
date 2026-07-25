<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuestJwt
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        if (auth('api')->check()) {
            return $this->errorResponse('Already authenticated.', [], 403);
        }

        return $next($request);
    }
}
