<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportAreaCodesTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_accepts_valid_area_codes(): void
    {
        $user = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);
        $districtCode = config('geo-areas.districts')[0];
        $upazilaCode = config('geo-areas.upazilas')[0];

        $response = $this->actingAs($user, 'api')->postJson('/api/reports', [
            'title' => 'Flooding near the market',
            'description' => 'Water is rising fast.',
            'location' => 'Motijheel, Dhaka',
            'district_code' => $districtCode,
            'upazila_code' => $upazilaCode,
            'latitude' => 23.7333,
            'longitude' => 90.4175,
            'severity' => 'high',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);

        $this->assertDatabaseHas('reports', [
            'title' => 'Flooding near the market',
            'district_code' => $districtCode,
            'upazila_code' => $upazilaCode,
        ]);
    }

    public function test_report_rejects_unknown_area_codes(): void
    {
        $user = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $this->actingAs($user, 'api')->postJson('/api/reports', [
            'title' => 'Fake area report',
            'description' => 'Should be rejected.',
            'location' => 'Nowhere',
            'district_code' => 'NOT-A-REAL-CODE',
            'severity' => 'low',
        ])->assertStatus(422);

        $this->actingAs($user, 'api')->postJson('/api/reports', [
            'title' => 'Fake upazila report',
            'description' => 'Should be rejected.',
            'location' => 'Nowhere',
            'upazila_code' => 'NOT-A-REAL-CODE',
            'severity' => 'low',
        ])->assertStatus(422);
    }

    public function test_report_codes_are_optional(): void
    {
        $user = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $this->actingAs($user, 'api')->postJson('/api/reports', [
            'title' => 'Report without codes',
            'description' => 'Codes are optional.',
            'location' => 'Somewhere',
            'severity' => 'low',
        ])->assertStatus(201);
    }
}
