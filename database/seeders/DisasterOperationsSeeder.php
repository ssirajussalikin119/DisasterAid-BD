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

        $citizenUsers = [
            ['name' => 'Tanvir Ahmed', 'phone' => '+8801811223344', 'email' => 'tanvir.citizen@disasteraidbd.local'],
            ['name' => 'Farhana Islam', 'phone' => '+8801911223344', 'email' => 'farhana.citizen@disasteraidbd.local'],
            ['name' => 'Kawsar Mahmud', 'phone' => '+8801611223344', 'email' => 'kawsar.citizen@disasteraidbd.local'],
        ];

        $citizens = collect($citizenUsers)->map(function (array $attributes): User {
            return User::updateOrCreate(
                ['phone' => $attributes['phone']],
                [
                    'name' => $attributes['name'],
                    'email' => $attributes['email'],
                    'password' => Hash::make('Password1!'),
                    'role' => Role::Citizen->value,
                    'role_status' => 'active',
                    'phone_verified_at' => now(),
                ]
            );
        });

        // 1. Reports linked to Incident 0 (Sylhet Flood)
        \App\Models\Report::updateOrCreate(
            ['title' => 'Severe Waterlogging in Kazirbazar'],
            [
                'user_id' => $citizens[0]->id,
                'incident_id' => $incidents[0]->id,
                'description' => 'Water level reached 4 feet. Over 50 families trapped on rooftops needing immediate dry food and clean water.',
                'location' => 'Kazirbazar, Sylhet Sadar',
                'latitude' => 24.8890,
                'longitude' => 91.8650,
                'status' => 'verified',
                'severity' => 'high',
            ]
        );

        \App\Models\Report::updateOrCreate(
            ['title' => 'Embankment Breach at Companyganj'],
            [
                'user_id' => $citizens[1]->id,
                'incident_id' => $incidents[0]->id,
                'description' => 'River embankment washed away during midnight surge. Agricultural fields submerged.',
                'location' => 'Companyganj, Sylhet',
                'latitude' => 25.0452,
                'longitude' => 91.7584,
                'status' => 'in_progress',
                'severity' => 'critical',
            ]
        );

        // 2. Report linked to Incident 1 (Cox\'s Bazar Cyclone)
        \App\Models\Report::updateOrCreate(
            ['title' => 'Fishermen Trapped Near Kutubdia Channel'],
            [
                'user_id' => $citizens[2]->id,
                'incident_id' => $incidents[1]->id,
                'description' => 'Two fishing boats unable to return to shore due to severe cyclone gusts. Emergency coast guard rescue required.',
                'location' => 'Kutubdia, Cox\'s Bazar',
                'latitude' => 21.8167,
                'longitude' => 91.8500,
                'status' => 'verified',
                'severity' => 'critical',
            ]
        );

        // 3. Unlinked / Standalone Reports (incident_id = null)
        \App\Models\Report::updateOrCreate(
            ['title' => 'Flash Flooding in Sunamganj Haor Area'],
            [
                'user_id' => $citizens[0]->id,
                'incident_id' => null,
                'description' => 'Sudden surge from upstream rivers causing flash flood in Tahirpur upazila. Boat transport needed.',
                'location' => 'Tahirpur, Sunamganj',
                'latitude' => 25.1000,
                'longitude' => 91.1700,
                'status' => 'pending',
                'severity' => 'medium',
            ]
        );

        \App\Models\Report::updateOrCreate(
            ['title' => 'River Bank Erosion in Kurigram'],
            [
                'user_id' => $citizens[1]->id,
                'incident_id' => null,
                'description' => 'Dharla river erosion taking down residential houses in Chilmari. 15 homes displaced.',
                'location' => 'Chilmari, Kurigram',
                'latitude' => 25.5500,
                'longitude' => 89.6700,
                'status' => 'pending',
                'severity' => 'high',
            ]
        );
    }
}