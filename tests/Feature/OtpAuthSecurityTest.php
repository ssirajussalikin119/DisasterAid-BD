<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Otp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OtpAuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_otp_returns_expiry_window_and_stores_hashed_code(): void
    {
        $response = $this->postJson('/api/auth/send-otp', ['phone' => '+8801711110001']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.expires_in', 300);

        $otp = Otp::query()->where('phone', '+8801711110001')->latest('id')->first();
        $this->assertNotNull($otp);
        $this->assertStringStartsWith('$2y$', $otp->code_hash);
        $this->assertFalse($otp->expires_at->isPast());
        $this->assertNull($otp->consumed_at);
    }

    public function test_resend_within_cooldown_is_rejected(): void
    {
        $this->postJson('/api/auth/send-otp', ['phone' => '+8801711110002'])->assertStatus(200);

        $this->postJson('/api/auth/send-otp', ['phone' => '+8801711110002'])
            ->assertStatus(422)
            ->assertJsonPath('errors.phone.0', 'Please wait 60 seconds before requesting another OTP.');
    }

    public function test_expired_otp_is_rejected_and_not_consumed(): void
    {
        $otp = $this->seedOtp('+8801711110003', '123456', now()->subMinutes(10));

        $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110003', 'code' => '123456'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Invalid, expired, or exhausted OTP.');

        $this->assertNull($otp->fresh()->consumed_at);
    }

    public function test_wrong_code_increments_attempts_and_locks_out_after_five(): void
    {
        $otp = $this->seedOtp('+8801711110004', '123456');

        foreach (range(1, 5) as $expectedAttempts) {
            $response = $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110004', 'code' => '000000']);

            $response->assertStatus(422)
                ->assertJsonPath('attempts', $expectedAttempts);
        }

        $this->assertSame(5, $otp->fresh()->attempts);

        // Locked: even the correct code must now be rejected.
        $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110004', 'code' => '123456'])
            ->assertStatus(422);

        $this->assertNull($otp->fresh()->consumed_at);
    }

    public function test_new_otp_invalidates_previous_unconsumed_otp(): void
    {
        $stale = $this->seedOtp('+8801711110005', '111111');

        $this->postJson('/api/auth/send-otp', ['phone' => '+8801711110005'])->assertStatus(200);

        $this->assertNull(Otp::query()->find($stale->id));

        $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110005', 'code' => '111111'])
            ->assertStatus(422);

        $this->assertGuest();
    }

    public function test_otp_can_only_be_used_once(): void
    {
        $this->seedOtp('+8801711110006', '654321');

        $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110006', 'code' => '654321'])
            ->assertStatus(200);

        $this->postJson('/api/auth/verify-otp', ['phone' => '+8801711110006', 'code' => '654321'])
            ->assertStatus(422);
    }

    public function test_verify_otp_returns_usable_bearer_token(): void
    {
        $token = $this->loginViaOtp('+8801711110007', '445566');

        $me = $this->withBearer($token)->getJson('/api/me');

        $me->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.phone', '+8801711110007');
    }

    public function test_me_and_admin_gates_reject_unauthenticated_or_forbidden_calls(): void
    {
        $this->getJson('/api/me')->assertStatus(401);

        $this->getJson('/api/admin/users')->assertStatus(401);

        $this->withHeaders(['Authorization' => 'Bearer not.a.valid.token'])
            ->getJson('/api/me')
            ->assertStatus(401);

        $citizenToken = $this->loginViaOtp('+8801711110008', '778899');

        $this->withBearer($citizenToken)->getJson('/api/admin/users')->assertStatus(403);

        $this->withBearer($citizenToken)->getJson('/api/me')->assertStatus(200);
    }

    public function test_refresh_rotates_token_and_invalidates_the_previous_one(): void
    {
        $oldToken = $this->loginViaOtp('+8801711110009', '101010');

        $refresh = $this->withBearer($oldToken)->postJson('/api/auth/refresh');

        $refresh->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'bearer');

        $newToken = $refresh->json('data.token');
        $this->assertIsString($newToken);
        $this->assertNotSame($oldToken, $newToken);

        $this->withBearer($newToken)->getJson('/api/me')->assertStatus(200);
        $this->withBearer($oldToken)->getJson('/api/me')->assertStatus(401);
    }

    public function test_refresh_accepts_expired_access_token(): void
    {
        $user = \App\Models\User::query()->firstOrCreate(
            ['phone' => '+8801711110010'],
            [
                'name' => 'Citizen 0010',
                'email' => null,
                'password' => null,
                'role' => 'citizen',
                'role_status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        $expiredToken = $this->craftToken($user->id, now()->timestamp - 120, now()->timestamp - 60);

        // The expired access token is rejected by protected routes...
        $this->withBearer($expiredToken)->getJson('/api/me')->assertStatus(401);

        // ...but the refresh endpoint issues a new session for it.
        $refresh = $this->withBearer($expiredToken)->postJson('/api/auth/refresh');

        $refresh->assertStatus(200)
            ->assertJsonPath('success', true);

        $newToken = $refresh->json('data.token');
        $this->assertNotSame($expiredToken, $newToken);

        // Refreshing again with the follow-up token still works.
        $this->withBearer($newToken)->postJson('/api/auth/refresh')->assertStatus(200);
    }

    public function test_refresh_rejects_token_beyond_refresh_window(): void
    {
        $user = \App\Models\User::query()->firstOrCreate(
            ['phone' => '+8801711110011'],
            [
                'name' => 'Citizen 0011',
                'email' => null,
                'password' => null,
                'role' => 'citizen',
                'role_status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        $staleIssuedAt = now()->timestamp - (15 * 86400);
        $staleToken = $this->craftToken($user->id, $staleIssuedAt, $staleIssuedAt + 3600);

        $this->withBearer($staleToken)->postJson('/api/auth/refresh')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_refresh_rejects_logged_out_token(): void
    {
        $token = $this->loginViaOtp('+8801711110012', '202020');

        $this->withBearer($token)->postJson('/api/logout')->assertStatus(200);

        $this->withBearer($token)->postJson('/api/auth/refresh')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_refresh_requires_a_token(): void
    {
        $this->postJson('/api/auth/refresh')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_alternate_phone_formats_are_normalized_to_one_identity(): void
    {
        $this->postJson('/api/auth/send-otp', ['phone' => '01712345678'])
            ->assertStatus(200);

        $this->assertDatabaseHas('otps', ['phone' => '+8801712345678']);

        $this->seedOtp('+8801712345678', '112233');

        $this->postJson('/api/auth/verify-otp', ['phone' => '008801712345678', 'code' => '112233'])
            ->assertStatus(200)
            ->assertJsonPath('data.user.phone', '+8801712345678');

        $this->assertDatabaseHas('users', ['phone' => '+8801712345678']);
    }

    private function seedOtp(string $phone, string $code, ?\DateTimeInterface $expiresAt = null): Otp
    {
        return Otp::create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'expires_at' => $expiresAt ?? now()->addMinutes(5),
        ]);
    }

    private function loginViaOtp(string $phone, string $code): string
    {
        $this->seedOtp($phone, $code);

        $response = $this->postJson('/api/auth/verify-otp', ['phone' => $phone, 'code' => $code]);

        $response->assertStatus(200);

        return (string) $response->json('data.token');
    }

    private function withBearer(string $token): static
    {
        // The JWT token cache and guard user cache persist across requests
        // inside one test process (unlike a fresh PHP process per request in
        // production). Reset them so each request decodes exactly the token
        // it presents.
        $this->app['auth']->forgetGuards();
        foreach (['tymon.jwt', 'tymon.jwt.auth', 'tymon.jwt.manager', 'tymon.jwt.payload.factory'] as $abstract) {
            $this->app->forgetInstance($abstract);
        }

        return $this->withHeaders(['Authorization' => "Bearer {$token}"]);
    }

    /**
     * Sign a token directly so tests can control iat/exp (creating an already
     * expired token through the library is rejected at creation time).
     */
    private function craftToken(int $userId, int $issuedAt, int $expiresAt): string
    {
        $encode = static fn (array $claims): string => rtrim(
            strtr(base64_encode(json_encode($claims, JSON_THROW_ON_ERROR)), '+/', '-_'),
            '='
        );

        $header = $encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = $encode([
            'iss' => (string) config('jwt.issuer', 'DisasterAid'),
            'sub' => $userId,
            'jti' => (string) \Illuminate\Support\Str::uuid(),
            'iat' => $issuedAt,
            'nbf' => $issuedAt,
            'exp' => $expiresAt,
        ]);

        $unsigned = "{$header}.{$payload}";
        $signature = rtrim(
            strtr(base64_encode(hash_hmac('sha256', $unsigned, (string) config('jwt.secret'), true)), '+/', '-_'),
            '='
        );

        return "{$unsigned}.{$signature}";
    }
}
