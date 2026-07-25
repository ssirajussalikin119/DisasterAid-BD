<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AuthService
{
    public const COOKIE_NAME = 'disasteraid_token';

    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'role' => Role::Citizen->value,
            'role_status' => 'active',
        ]);

        $token = auth('api')->login($user);

        return $this->buildPayload($user, $token);
    }

    public function login(array $data): array
    {
        $credentials = [
            'email' => $data['email'],
            'password' => $data['password'],
        ];

        $token = auth('api')->attempt($credentials);

        if (! $token) {
            throw new UnauthorizedHttpException('', 'Invalid email or password.');
        }

        $user = auth('api')->user();

        if (! $user instanceof User) {
            throw new UnauthorizedHttpException('', 'Invalid email or password.');
        }

        return $this->buildPayload($user, $token);
    }

    public function logout(): void
    {
        auth('api')->logout();
    }

    public function currentUser(): User
    {
        $user = auth('api')->user();

        if (! $user instanceof User) {
            throw new UnauthorizedHttpException('', 'Authentication required.');
        }

        return $user;
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        $user->save();

        return $user->fresh();
    }

    public function cookie(string $token): \Symfony\Component\HttpFoundation\Cookie
    {
        $ttl = (int) config('auth-jwt.ttl', 60);
        $secure = (bool) config('auth-jwt.secure', true);
        $sameSite = (string) config('auth-jwt.same_site', 'lax');
        $domain = config('auth-jwt.domain');

        return cookie(
            self::COOKIE_NAME,
            $token,
            $ttl,
            '/',
            $domain,
            $secure,
            true,
            false,
            $sameSite
        );
    }

    public function forgetCookie(): \Symfony\Component\HttpFoundation\Cookie
    {
        $secure = (bool) config('auth-jwt.secure', true);
        $sameSite = (string) config('auth-jwt.same_site', 'lax');
        $domain = config('auth-jwt.domain');

        return cookie(
            self::COOKIE_NAME,
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

    private function buildPayload(User $user, string $token): array
    {
        $ttlMinutes = (int) config('auth-jwt.ttl', 60);
        $expiresAt = CarbonImmutable::now()->addMinutes($ttlMinutes)->toIso8601String();

        return [
            'user' => $user->fresh(),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_at' => $expiresAt,
            'dashboard_route' => Role::dashboardRoute($user->roleEnum()),
        ];
    }
}
