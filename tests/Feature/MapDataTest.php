<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MapDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_map_data_accepts_report_level_statuses(): void
    {
        foreach (['active', 'pending', 'verified', 'resolved', 'monitoring'] as $status) {
            $this->getJson("/api/map-data?status={$status}")
                ->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonStructure(['data' => ['districts', 'markers']]);
        }
    }

    public function test_map_data_rejects_unknown_status(): void
    {
        $this->getJson('/api/map-data?status=bogus')->assertStatus(422);
    }
}
