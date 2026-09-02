<?php

declare(strict_types=1);

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportIncidentRelationshipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_reports_with_reporters_inner_join_returns_correct_data(): void
    {
        $response = $this->getJson('/api/report-relationships/reports-with-reporters');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'mode',
                    'count',
                    'reports' => [
                        '*' => [
                            'join_type',
                            'report' => [
                                'id',
                                'title',
                                'description',
                                'location',
                                'status',
                                'severity',
                            ],
                            'reporter' => [
                                'id',
                                'name',
                                'email',
                                'phone',
                            ],
                        ],
                    ],
                ],
            ]);

        $reports = $response->json('data.reports');
        $this->assertNotEmpty($reports);
        foreach ($reports as $item) {
            $this->assertNotNull($item['report']);
            $this->assertNotNull($item['reporter']);
            $this->assertEquals('inner_join', $item['join_type']);
        }
    }

    public function test_reports_with_incidents_left_join_includes_unlinked_reports(): void
    {
        $response = $this->getJson('/api/report-relationships/reports-with-incidents');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $reports = $response->json('data.reports');
        $this->assertNotEmpty($reports);

        $hasLinked = false;
        $hasUnlinked = false;

        foreach ($reports as $item) {
            $this->assertNotNull($item['report']);
            if (!empty($item['incident'])) {
                $hasLinked = true;
            } else {
                $hasUnlinked = true;
            }
        }

        $this->assertTrue($hasLinked, 'LEFT JOIN should return reports linked to an incident.');
        $this->assertTrue($hasUnlinked, 'LEFT JOIN should also return reports that are not linked to any incident.');
    }

    public function test_incident_wise_reports_right_join_includes_incidents_without_reports(): void
    {
        $response = $this->getJson('/api/report-relationships/incident-wise-reports');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $incidents = $response->json('data.incidents');
        $this->assertNotEmpty($incidents);

        $hasIncidentWithoutReport = false;

        foreach ($incidents as $item) {
            $this->assertNotNull($item['incident']);
            if (empty($item['report'])) {
                $hasIncidentWithoutReport = true;
            }
        }

        $this->assertTrue($hasIncidentWithoutReport, 'RIGHT JOIN should return incidents even if they have no linked reports.');
    }

    public function test_complete_relationship_full_outer_join_returns_all_combinations(): void
    {
        $response = $this->getJson('/api/report-relationships/complete');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $relationships = $response->json('data.relationships');
        $this->assertNotEmpty($relationships);

        $foundReportOnly = false;
        $foundIncidentOnly = false;
        $foundLinked = false;

        foreach ($relationships as $item) {
            if ($item['relationship_state'] === 'linked') {
                $foundLinked = true;
            } elseif ($item['relationship_state'] === 'report_only') {
                $foundReportOnly = true;
            } elseif ($item['relationship_state'] === 'incident_only') {
                $foundIncidentOnly = true;
            }
        }

        $this->assertTrue($foundLinked, 'FULL OUTER JOIN should contain linked report-incident pairs.');
        $this->assertTrue($foundReportOnly, 'FULL OUTER JOIN should contain standalone reports.');
        $this->assertTrue($foundIncidentOnly, 'FULL OUTER JOIN should contain unassigned incidents.');
    }

    public function test_unified_index_and_summary_endpoint(): void
    {
        $summaryResponse = $this->getJson('/api/report-relationships/summary');
        $summaryResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_reports',
                        'linked_reports',
                        'unlinked_reports',
                        'total_incidents',
                        'incidents_with_reports',
                        'incidents_without_reports',
                    ],
                ],
            ]);

        $indexResponse = $this->getJson('/api/report-relationships?mode=full');
        $indexResponse->assertStatus(200)
            ->assertJsonPath('data.mode', 'full')
            ->assertJsonStructure([
                'data' => [
                    'mode',
                    'summary',
                    'relationships',
                ],
            ]);
    }
}
