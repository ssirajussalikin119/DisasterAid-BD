<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Incident;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerAssignmentTest extends TestCase
{
    use RefreshDatabase;

    private function makeVolunteer(string $role = 'volunteer'): array
    {
        $user = User::factory()->create(['role' => $role, 'role_status' => 'active']);
        $volunteer = Volunteer::create(['user_id' => $user->id, 'skills' => ['first-aid']]);

        return [$user, $volunteer];
    }

    private function makeIncident(): Incident
    {
        return Incident::create([
            'title' => 'Flood relief operation',
            'district' => 'Sylhet',
            'status' => 'active',
            'severity' => 'high',
        ]);
    }

    public function test_volunteer_sees_only_own_assignments(): void
    {
        [$userA] = $this->makeVolunteer();
        [$userB, $volunteerB] = $this->makeVolunteer();
        $incident = $this->makeIncident();

        $volunteerA = Volunteer::query()->where('user_id', $userA->id)->firstOrFail();
        Assignment::create(['volunteer_id' => $volunteerA->id, 'incident_id' => $incident->id]);
        Assignment::create(['volunteer_id' => $volunteerB->id, 'incident_id' => $incident->id, 'status' => 'accepted']);

        $response = $this->actingAs($userA, 'api')->getJson('/api/volunteer/assignments');

        $response->assertStatus(200)->assertJsonPath('success', true);
        $assignments = $response->json('data.assignments');
        $this->assertCount(1, $assignments);
        $this->assertSame('pending', $assignments[0]['status']);
        $this->assertSame('Flood relief operation', $assignments[0]['incident']['title']);
    }

    public function test_volunteer_can_advance_own_assignment_status(): void
    {
        [$user] = $this->makeVolunteer();
        $volunteer = Volunteer::query()->where('user_id', $user->id)->firstOrFail();
        $assignment = Assignment::create([
            'volunteer_id' => $volunteer->id,
            'incident_id' => $this->makeIncident()->id,
        ]);

        $response = $this->actingAs($user, 'api')->patchJson(
            "/api/volunteer/assignments/{$assignment->id}/status",
            ['status' => 'accepted']
        );

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.assignment.status', 'accepted');

        $this->assertDatabaseHas('assignments', [
            'id' => $assignment->id,
            'status' => 'accepted',
            'accepted' => true,
        ]);
    }

    public function test_volunteer_cannot_update_another_volunteers_assignment(): void
    {
        [$userA] = $this->makeVolunteer();
        [$userB, $volunteerB] = $this->makeVolunteer();
        $assignment = Assignment::create([
            'volunteer_id' => $volunteerB->id,
            'incident_id' => $this->makeIncident()->id,
        ]);

        $this->actingAs($userA, 'api')->patchJson(
            "/api/volunteer/assignments/{$assignment->id}/status",
            ['status' => 'completed']
        )->assertStatus(404);

        $this->assertSame('pending', $assignment->fresh()->status);
    }

    public function test_volunteer_endpoints_reject_guests_citizens_and_bad_status(): void
    {
        [$volunteerUser] = $this->makeVolunteer();
        $citizen = User::factory()->create(['role' => 'citizen', 'role_status' => 'active']);

        $this->getJson('/api/volunteer/assignments')->assertStatus(401);
        $this->patchJson('/api/volunteer/assignments/1/status', ['status' => 'accepted'])->assertStatus(401);

        $this->actingAs($citizen, 'api')->getJson('/api/volunteer/assignments')->assertStatus(403);
        $this->actingAs($citizen, 'api')
            ->patchJson('/api/volunteer/assignments/1/status', ['status' => 'accepted'])
            ->assertStatus(403);

        $this->actingAs($volunteerUser, 'api')
            ->patchJson('/api/volunteer/assignments/1/status', ['status' => 'teleported'])
            ->assertStatus(422);
    }

    public function test_volunteer_without_profile_sees_empty_list(): void
    {
        $user = User::factory()->create(['role' => 'volunteer', 'role_status' => 'active']);

        $this->actingAs($user, 'api')->getJson('/api/volunteer/assignments')
            ->assertStatus(200)
            ->assertJsonPath('data.assignments', []);
    }
}
