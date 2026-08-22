<?php

declare(strict_types=1);

return [
    'cookie_name' => env('JWT_COOKIE_NAME', 'disasteraid_token'),
    'ttl' => (int) env('JWT_TTL', 60),
    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 20160),
    'secure' => (bool) env('JWT_COOKIE_SECURE', env('APP_ENV') === 'production'),
    'same_site' => env('JWT_COOKIE_SAMESITE', 'lax'),
    'domain' => env('JWT_COOKIE_DOMAIN'),
];
