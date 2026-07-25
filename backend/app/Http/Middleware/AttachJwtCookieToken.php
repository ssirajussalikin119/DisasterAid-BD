<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AttachJwtCookieToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $cookieName = config('auth-jwt.cookie_name', 'disasteraid_token');
        $token = $request->cookie($cookieName);

        if ($token && ! $request->bearerToken()) {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        return $next($request);
    }
}
