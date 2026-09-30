<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Incident;
use App\Models\ReliefRequest;
use App\Models\Report;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminDistrictSummaryTest extends TestCase
{
    use RefreshDatabase;

    private const VIEW_COLUMNS = [
        'district_id',
        'district_name',
        'active_incidents',
        'critical_incidents',
        'verified_reports',
        'pending_relief_requests',
        'active_volunteers',
        'active_assignments',
    ];

    public function test_district_summary_view_exists_and_exposes_expected_columns(): void
    {
        Incident::create([
            'title' => 'Dhaka Waterlogging',
            'district' => 'Dhaka',
            'status' => 'active',
            'severity' => 'medium',
            'verified' => true,
        ]);

        $this->assertTrue($this->viewExists('district_disaster_summary'));

        $row = DB::selectOne('SELECT * FROM district_disaster_summary');
        $this->assertNotNull($row, 'The view must be readable through a plain SELECT.');

        foreach (self::VIEW_COLUMNS as $column) {
            $this->assertObjectHasProperty($column, $row);
        }
    }

    public function test_admin_can_access_district_summary_endpoint(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/district-summary');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'districts' => [
                        '*' => self::VIEW_COLUMNS,
                    ],
                    'count',
                ],
            ]);

        $this->assertSame($response->json('data.count'), count($response->json('data.districts')));
    }

    public function test_unauthenticated_users_cannot_access_district_summary(): void
    {
        $response = $this->getJson('/api/admin/analytics/district-summary');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_non_admin_users_cannot_access_district_summary(): void
    {
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $response = $this->actingAs($citizen, 'api')->getJson('/api/admin/analytics/district-summary');

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_district_aggregation_returns_correct_counts(): void
    {
        $this->createDistrictFixtures();
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/district-summary');
        $response->assertStatus(200);

        $sylhet = $this->districtRow($response->json('data.districts'), 'Sylhet');

        $this->assertSame(1, $sylhet['active_incidents']);
        $this->assertSame(1, $sylhet['critical_incidents']);
        $this->assertSame(3, $sylhet['verified_reports']);
        $this->assertSame(2, $sylhet['pending_relief_requests']);
        $this->assertSame(2, $sylhet['active_volunteers']);
        $this->assertSame(3, $sylhet['active_assignments']);
    }

    public function test_district_without_activity_reports_zero_counts(): void
    {
        $this->createDistrictFixtures();
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/district-summary');
        $response->assertStatus(200);

        $districts = $response->json('data.districts');
        $chattogram = $this->districtRow($districts, 'Chattogram');

        $this->assertGreaterThan(0, $chattogram['district_id']);
        $this->assertSame(0, $chattogram['active_incidents']);
        $this->assertSame(0, $chattogram['critical_incidents']);
        $this->assertSame(0, $chattogram['verified_reports']);
        $this->assertSame(0, $chattogram['pending_relief_requests']);
        $this->assertSame(0, $chattogram['active_volunteers']);
        $this->assertSame(0, $chattogram['active_assignments']);
    }

    public function test_multiple_related_records_do_not_inflate_counts(): void
    {
        $this->createDistrictFixtures();
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/district-summary');
        $response->assertStatus(200);

        $districts = $response->json('data.districts');

        // One row per district, regardless of how many incidents/reports/requests exist.
        $this->assertCount(2, $districts);
        $this->assertCount(count($districts), array_unique(array_column($districts, 'district_name')));

        $sylhet = $this->districtRow($districts, 'Sylhet');

        // A naive join of the two incidents x three verified reports x two relief
        // requests x three assignments would multiply these numbers; the view must
        // aggregate each metric independently.
        $this->assertSame(3, $sylhet['verified_reports']);
        $this->assertSame(2, $sylhet['pending_relief_requests']);
        $this->assertSame(3, $sylhet['active_assignments']);
        $this->assertSame(2, $sylhet['active_volunteers']);
        $this->assertSame(1, $sylhet['active_incidents']);
        $this->assertSame(1, $sylhet['critical_incidents']);
    }

    public function test_existing_admin_dashboard_statistics_endpoint_still_works(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/dashboard/statistics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'totalUsers',
                    'activeUsers',
                    'pendingReports',
                    'pendingVolunteerApplications',
                    'pendingNgoApplications',
                    'activeIncidents',
                    'openReliefRequests',
                    'activeVolunteers',
                ],
            ]);

        $this->assertGreaterThanOrEqual(1, $response->json('data.totalUsers'));
    }

    /**
     * Builds a known dataset so the expected aggregates are unambiguous.
     *
     * Sylhet: 2 incidents (1 active, 1 monitoring/critical), 3 verified reports,
     * 2 pending relief requests, 2 available volunteers in district plus one
     * unavailable one, 3 open assignments plus one completed.
     *
     * Chattogram: a single resolved incident, i.e. a district with no ongoing
     * activity at all.
     */
    private function createDistrictFixtures(): void
    {
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $sylhetActive = Incident::create([
            'title' => 'Sylhet Flood 2026',
            'district' => 'Sylhet',
            'status' => 'active',
            'severity' => 'high',
            'verified' => true,
        ]);
        $sylhetMonitoring = Incident::create([
            'title' => 'Sylhet Landslide',
            'district' => 'Sylhet',
            'status' => 'monitoring',
            'severity' => 'critical',
            'verified' => true,
        ]);

        foreach ([['active', 'verified'], ['active', 'verified'], ['monitoring', 'verified'], ['active', 'pending'], ['monitoring', 'rejected']] as [$incidentStatus, $reportStatus]) {
            $incidentId = $incidentStatus === 'active' ? $sylhetActive->id : $sylhetMonitoring->id;
            Report::create([
                'user_id' => $citizen->id,
                'incident_id' => $incidentId,
                'title' => 'Report ' . $reportStatus . ' ' . uniqid(),
                'description' => 'Fixture report.',
                'location' => 'Sylhet Sadar, Sylhet',
                'status' => $reportStatus,
                'severity' => 'high',
            ]);
        }

        foreach ([['incident_id' => $sylhetActive->id, 'status' => 'pending'], ['incident_id' => $sylhetMonitoring->id, 'status' => 'pending'], ['incident_id' => $sylhetActive->id, 'status' => 'approved']] as $relief) {
            ReliefRequest::create([
                'user_id' => $citizen->id,
                'incident_id' => $relief['incident_id'],
                'status' => $relief['status'],
                'urgency' => 'high',
                'description' => 'Fixture relief request.',
            ]);
        }

        $volunteerOne = $this->createVolunteer('available', 'Sylhet Sadar');
        $volunteerTwo = $this->createVolunteer('busy', 'Sylhet');
        $volunteerThree = $this->createVolunteer('unavailable', 'Sylhet');

        $volunteerElsewhere = $this->createVolunteer('available', 'Dhaka North');

        Assignment::create(['volunteer_id' => $volunteerOne->id, 'incident_id' => $sylhetActive->id, 'assigned_by' => null, 'accepted' => false, 'status' => 'pending']);
        Assignment::create(['volunteer_id' => $volunteerOne->id, 'incident_id' => $sylhetMonitoring->id, 'assigned_by' => null, 'accepted' => true, 'status' => 'accepted']);
        Assignment::create(['volunteer_id' => $volunteerTwo->id, 'incident_id' => $sylhetMonitoring->id, 'assigned_by' => null, 'accepted' => true, 'status' => 'in_progress']);
        Assignment::create(['volunteer_id' => $volunteerThree->id, 'incident_id' => $sylhetActive->id, 'assigned_by' => null, 'accepted' => true, 'status' => 'completed']);

        // Volunteer based in another district: must never leak into Sylhet counts.
        $this->assertSame('Dhaka North', $volunteerElsewhere->current_location);

        Incident::create([
            'title' => 'Chattogram Market Fire',
            'district' => 'Chattogram',
            'status' => 'resolved',
            'severity' => 'medium',
            'verified' => true,
        ]);
    }

    private function createVolunteer(string $availability, string $currentLocation): Volunteer
    {
        $user = User::factory()->create(['role' => 'volunteer', 'role_status' => 'active']);

        return Volunteer::create([
            'user_id' => $user->id,
            'skills' => ['first_aid'],
            'availability' => $availability,
            'current_location' => $currentLocation,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $districts
     * @return array<string, mixed>
     */
    private function districtRow(array $districts, string $name): array
    {
        foreach ($districts as $district) {
            if ($district['district_name'] === $name) {
                return $district;
            }
        }

        $this->fail("District [{$name}] was not returned by the summary endpoint.");
    }

    private function viewExists(string $name): bool
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $row = DB::selectOne(
                'SELECT COUNT(*) AS count FROM information_schema.views WHERE table_schema = current_schema() AND table_name = ?',
                [$name]
            );

            return (int) $row->count > 0;
        }

        if ($driver === 'sqlite') {
            $row = DB::selectOne("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'view' AND name = ?", [$name]);

            return (int) $row->count > 0;
        }

        $this->markTestSkipped("View existence check is not supported on driver [{$driver}].");
    }
}
