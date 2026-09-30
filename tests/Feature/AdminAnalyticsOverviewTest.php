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

class AdminAnalyticsOverviewTest extends TestCase
{
    use RefreshDatabase;

    private const KPI_KEYS = [
        'active_incidents',
        'critical_incidents',
        'verified_reports',
        'pending_relief_requests',
        'active_volunteers',
        'active_assignments',
        'resolved_incidents',
    ];

    private const VOLUNTEER_ACTIVITY_KEYS = [
        'active_volunteers',
        'located_volunteers',
        'unlocated_volunteers',
        'district_view_volunteers',
        'assigned_volunteers',
        'pending_assignments',
        'completed_assignments',
    ];

    public function test_admin_can_access_overview_endpoint(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'kpis' => self::KPI_KEYS,
                    'severity_distribution' => ['*' => ['label', 'value']],
                    'type_distribution' => ['*' => ['label', 'value']],
                    'relief_status_distribution' => ['*' => ['label', 'value']],
                    'volunteer_activity' => self::VOLUNTEER_ACTIVITY_KEYS,
                ],
            ]);
    }

    public function test_unauthenticated_users_cannot_access_overview(): void
    {
        $response = $this->getJson('/api/admin/analytics/overview');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_non_admin_users_cannot_access_overview(): void
    {
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $response = $this->actingAs($citizen, 'api')->getJson('/api/admin/analytics/overview');

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_kpis_match_independently_computed_counts(): void
    {
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $sylhetIncident = Incident::create(['title' => 'Sylhet Flood 2026', 'district' => 'Sylhet', 'status' => 'active', 'severity' => 'high', 'verified' => true]);
        $coxIncident = Incident::create(['title' => "Cox's Bazar Cyclone Response", 'district' => "Cox's Bazar", 'status' => 'monitoring', 'severity' => 'critical', 'verified' => true]);
        Incident::create(['title' => 'Dhaka Heat Relief', 'district' => 'Dhaka', 'status' => 'resolved', 'severity' => 'medium', 'verified' => true]);

        // One verified report is linked to an incident, one is not: the global
        // KPI counts both, because it is a platform-wide metric.
        Report::create(['user_id' => $citizen->id, 'incident_id' => $sylhetIncident->id, 'title' => 'Verified linked report', 'description' => 'Fixture.', 'location' => 'Sylhet', 'status' => 'verified', 'severity' => 'high']);
        Report::create(['user_id' => $citizen->id, 'incident_id' => null, 'title' => 'Verified unlinked report', 'description' => 'Fixture.', 'location' => 'Dhaka', 'status' => 'verified', 'severity' => 'medium']);
        Report::create(['user_id' => $citizen->id, 'incident_id' => $sylhetIncident->id, 'title' => 'Pending report', 'description' => 'Fixture.', 'location' => 'Sylhet', 'status' => 'pending', 'severity' => 'high']);

        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $sylhetIncident->id, 'status' => 'pending', 'urgency' => 'high', 'description' => 'Fixture relief.']);
        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $coxIncident->id, 'status' => 'pending', 'urgency' => 'low', 'description' => 'Fixture relief.']);
        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $coxIncident->id, 'status' => 'approved', 'urgency' => 'medium', 'description' => 'Fixture relief.']);

        $volunteerOne = $this->createVolunteer('available', 'Sylhet Sadar');
        $volunteerTwo = $this->createVolunteer('unavailable', 'Dhaka North');
        $this->createVolunteer('available', '');

        Assignment::create(['volunteer_id' => $volunteerOne->id, 'incident_id' => $sylhetIncident->id, 'assigned_by' => null, 'accepted' => false, 'status' => 'pending']);
        Assignment::create(['volunteer_id' => $volunteerTwo->id, 'incident_id' => $coxIncident->id, 'assigned_by' => null, 'accepted' => true, 'status' => 'accepted']);
        Assignment::create(['volunteer_id' => $volunteerTwo->id, 'incident_id' => $sylhetIncident->id, 'assigned_by' => null, 'accepted' => true, 'status' => 'completed']);

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);
        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $response->assertStatus(200);

        // Expected values computed independently from the base tables so a
        // join-inflated query would fail this assertion.
        $expected = [
            'active_incidents' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM incidents WHERE status = 'active'")->count,
            'critical_incidents' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM incidents WHERE severity = 'critical' AND status IN ('active', 'monitoring')")->count,
            'verified_reports' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM reports WHERE status = 'verified'")->count,
            'pending_relief_requests' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM relief_requests WHERE status = 'pending'")->count,
            'active_volunteers' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM users WHERE role = 'volunteer' AND role_status = 'active'")->count,
            'active_assignments' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM assignments WHERE status IN ('pending', 'accepted', 'in_progress')")->count,
            'resolved_incidents' => (int) DB::selectOne("SELECT COUNT(*) AS count FROM incidents WHERE status = 'resolved'")->count,
        ];

        $this->assertSame($expected, $response->json('data.kpis'));

        // Spot-check the unambiguous values as well.
        $this->assertSame(1, $response->json('data.kpis.active_incidents'));
        $this->assertSame(1, $response->json('data.kpis.critical_incidents'));
        $this->assertSame(2, $response->json('data.kpis.verified_reports'));
        $this->assertSame(2, $response->json('data.kpis.pending_relief_requests'));
        $this->assertSame(3, $response->json('data.kpis.active_volunteers'));
        $this->assertSame(2, $response->json('data.kpis.active_assignments'));
        $this->assertSame(1, $response->json('data.kpis.resolved_incidents'));
    }

    public function test_severity_distribution_contains_only_values_that_exist(): void
    {
        Incident::create(['title' => 'Medium incident', 'district' => 'Dhaka', 'status' => 'active', 'severity' => 'medium', 'verified' => true]);
        Incident::create(['title' => 'High incident', 'district' => 'Dhaka', 'status' => 'active', 'severity' => 'high', 'verified' => true]);

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);
        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $response->assertStatus(200);

        $distribution = collect($response->json('data.severity_distribution'))->pluck('value', 'label')->all();

        $this->assertSame(['high' => 1, 'medium' => 1], $distribution);
        $this->assertArrayNotHasKey('low', $distribution, 'Categories without real data must not be invented.');
        $this->assertArrayNotHasKey('critical', $distribution);
    }

    public function test_type_distribution_is_derived_from_real_incident_titles(): void
    {
        Incident::create(['title' => 'Dhaka Flood Emergency', 'district' => 'Dhaka', 'status' => 'active', 'severity' => 'high', 'verified' => true]);
        Incident::create(['title' => 'Cyclone Remal Hits Coast', 'district' => "Cox's Bazar", 'status' => 'active', 'severity' => 'critical', 'verified' => true]);
        Incident::create(['title' => 'Warehouse Fire', 'district' => 'Chattogram', 'status' => 'resolved', 'severity' => 'medium', 'verified' => true]);

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);
        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $response->assertStatus(200);

        $distribution = collect($response->json('data.type_distribution'))->pluck('value', 'label')->all();

        $this->assertSame([
            'Cyclone / Storm' => 1,
            'Fire' => 1,
            'Flood / Waterlogging' => 1,
        ], $distribution);
    }

    public function test_relief_status_distribution_reflects_only_real_rows(): void
    {
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);
        $incident = Incident::create(['title' => 'Relief needed', 'district' => 'Sylhet', 'status' => 'active', 'severity' => 'high', 'verified' => true]);

        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $incident->id, 'status' => 'pending', 'urgency' => 'high', 'description' => 'Fixture relief.']);
        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $incident->id, 'status' => 'pending', 'urgency' => 'low', 'description' => 'Fixture relief.']);
        ReliefRequest::create(['user_id' => $citizen->id, 'incident_id' => $incident->id, 'status' => 'approved', 'urgency' => 'medium', 'description' => 'Fixture relief.']);

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);
        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $response->assertStatus(200);

        $distribution = collect($response->json('data.relief_status_distribution'))->pluck('value', 'label')->all();

        $this->assertSame(['pending' => 2, 'approved' => 1], $distribution);
    }

    public function test_empty_relief_table_returns_empty_distribution(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');

        $response->assertStatus(200);
        $this->assertSame([], $response->json('data.relief_status_distribution'));
    }

    public function test_volunteer_activity_is_consistent_with_dashboard_metric(): void
    {
        $this->createVolunteer('available', 'Sylhet Sadar');
        $this->createVolunteer('unavailable', 'Dhaka North');
        $this->createVolunteer('available', '');

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $overview = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $overview->assertStatus(200);

        $dashboard = $this->actingAs($admin, 'api')->getJson('/api/admin/dashboard/statistics');
        $dashboard->assertStatus(200);

        $activity = $overview->json('data.volunteer_activity');

        // The overview must report the exact same platform-wide volunteer
        // total as the existing Admin Dashboard statistic.
        $this->assertSame($dashboard->json('data.activeVolunteers'), $activity['active_volunteers']);
        $this->assertSame($overview->json('data.kpis.active_volunteers'), $activity['active_volunteers']);
        $this->assertSame(3, $activity['active_volunteers']);

        // Coverage numbers must add up: located + unlocated = active.
        $this->assertSame(2, $activity['located_volunteers']);
        $this->assertSame(1, $activity['unlocated_volunteers']);
        $this->assertSame(
            $activity['active_volunteers'],
            $activity['located_volunteers'] + $activity['unlocated_volunteers']
        );

        // The district VIEW can never count more volunteers than exist.
        $this->assertLessThanOrEqual($activity['located_volunteers'], $activity['district_view_volunteers']);
    }

    public function test_overview_and_district_summary_agree_on_view_totals(): void
    {
        $incident = Incident::create(['title' => 'Sylhet Flood 2026', 'district' => 'Sylhet', 'status' => 'active', 'severity' => 'high', 'verified' => true]);
        $volunteer = $this->createVolunteer('available', 'Sylhet Sadar');
        Assignment::create(['volunteer_id' => $volunteer->id, 'incident_id' => $incident->id, 'assigned_by' => null, 'accepted' => false, 'status' => 'pending']);

        $admin = User::factory()->create(['role' => 'admin', 'role_status' => 'active']);

        $overview = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/overview');
        $districts = $this->actingAs($admin, 'api')->getJson('/api/admin/analytics/district-summary');
        $overview->assertStatus(200);
        $districts->assertStatus(200);

        $viewVolunteers = array_sum(array_column($districts->json('data.districts'), 'active_volunteers'));
        $viewAssignments = array_sum(array_column($districts->json('data.districts'), 'active_assignments'));

        $this->assertSame($viewVolunteers, $overview->json('data.volunteer_activity.district_view_volunteers'));
        $this->assertSame($viewAssignments, $overview->json('data.kpis.active_assignments'));
        $this->assertSame(1, $viewVolunteers);
        $this->assertSame(1, $viewAssignments);
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
}
