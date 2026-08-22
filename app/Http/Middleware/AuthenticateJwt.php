<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        if (! auth('api')->check()) {
            return $this->errorResponse('Authentication required.', [], 401)->cookie($this->forgetCookie());
        }

        return $next($request);
    }

    private function forgetCookie(): \Symfony\Component\HttpFoundation\Cookie
    {
        $cookieName = config('auth-jwt.cookie_name', 'disasteraid_token');
        $secure = (bool) config('auth-jwt.secure', true);
        $sameSite = (string) config('auth-jwt.same_site', 'lax');
        $domain = config('auth-jwt.domain');

        return cookie(
            $cookieName,
            '',
            -1,
            '/',
            $domain,
            $secure,
            true,
            false,
            $sameSite
        );
    }
}
