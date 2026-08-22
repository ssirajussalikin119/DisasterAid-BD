<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Incident;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DisasterOperationsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();

        $volunteerUsers = [
            ['name' => 'Rahim Uddin', 'phone' => '+8801712345001', 'email' => 'rahim.volunteer@disasteraidbd.local'],
            ['name' => 'Nusrat Jahan', 'phone' => '+8801712345002', 'email' => 'nusrat.volunteer@disasteraidbd.local'],
            ['name' => 'Sajib Hasan', 'phone' => '+8801712345003', 'email' => 'sajib.volunteer@disasteraidbd.local'],
            ['name' => 'Maliha Akter', 'phone' => '+8801712345004', 'email' => 'maliha.volunteer@disasteraidbd.local'],
        ];

        $volunteers = collect($volunteerUsers)->map(function (array $attributes, int $index): Volunteer {
            $user = User::updateOrCreate(
                ['phone' => $attributes['phone']],
                [
                    'name' => $attributes['name'],
                    'email' => $attributes['email'],
                    'password' => Hash::make('Password1!'),
                    'role' => Role::Volunteer->value,
                    'role_status' => 'active',
                    'phone_verified_at' => now(),
                ]
            );

            return Volunteer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'skills' => match ($index) {
                        0 => ['first_aid', 'swimming', 'driving'],
                        1 => ['community_outreach', 'first_aid'],
                        2 => ['rescue', 'driving', 'logistics'],
                        default => ['medical_support', 'counselling'],
                    },
                    'availability' => ['available', 'busy', 'available', 'unavailable'][$index],
                    'current_location' => ['Sylhet Sadar', 'Cox\'s Bazar Sadar', 'Chattogram Sadar', 'Dhaka North'][$index],
                    'latitude' => [24.8949, 21.4272, 22.3569, 23.8103][$index],
                    'longitude' => [91.8687, 92.0058, 91.7832, 90.4125][$index],
                    'rating' => [4.75, 4.50, 4.90, null][$index],
                ]
            );
        });

        $incidents = collect([
            ['title' => 'Sylhet Flood 2026', 'district' => 'Sylhet', 'status' => 'active', 'severity' => 'high', 'verified' => true],
            ['title' => 'Cox\'s Bazar Cyclone Response', 'district' => 'Cox\'s Bazar', 'status' => 'monitoring', 'severity' => 'critical', 'verified' => true],
            ['title' => 'Chattogram Market Fire', 'district' => 'Chattogram', 'status' => 'resolved', 'severity' => 'medium', 'verified' => true],
        ])->map(fn (array $attributes): Incident => Incident::updateOrCreate(
            ['title' => $attributes['title']],
            [...$attributes, 'created_by' => $admin->id]
        ));

        $assignments = [
            [$volunteers[0], $incidents[0], false, 'pending'],
            [$volunteers[1], $incidents[1], true, 'accepted'],
            [$volunteers[2], $incidents[2], true, 'completed'],
        ];

        foreach ($assignments as [$volunteer, $incident, $accepted, $status]) {
            Assignment::updateOrCreate(
                ['volunteer_id' => $volunteer->id, 'incident_id' => $incident->id],
                ['assigned_by' => $admin->id, 'accepted' => $accepted, 'status' => $status]
            );
        }
    }
}