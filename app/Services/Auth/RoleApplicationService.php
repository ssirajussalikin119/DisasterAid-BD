<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\RoleApplication;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class RoleApplicationService
{
    public function apply(User $user, Role $requestedRole, array $payload): RoleApplication
    {
        if ($user->role !== Role::Citizen->value) {
            throw ValidationException::withMessages([
                'role' => ['Only citizens can submit a role application.'],
            ]);
        }

        $existing = RoleApplication::query()
            ->where('user_id', $user->id)
            ->where('requested_role', $requestedRole->value)
            ->where('status', RoleApplication::STATUS_PENDING)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'role' => ['You already have a pending application for this role.'],
            ]);
        }

        return RoleApplication::create([
            'user_id' => $user->id,
            'requested_role' => $requestedRole->value,
            'status' => RoleApplication::STATUS_PENDING,
            'application_payload' => $payload,
        ]);
    }

    public function review(RoleApplication $application, string $decision, ?string $notes, User $reviewer): RoleApplication
    {
        if ($application->status !== RoleApplication::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'application' => ['This application has already been reviewed.'],
            ]);
        }

        $application->status = $decision;
        $application->review_notes = $notes;
        $application->reviewed_by = $reviewer->id;
        $application->reviewed_at = CarbonImmutable::now();
        $application->save();

        if ($decision === RoleApplication::STATUS_APPROVED) {
            $application->user()->update([
                'role' => $application->requested_role,
                'role_status' => 'active',
            ]);
        }

        return $application->refresh();
    }

    public function payloadForVolunteer(array $input): array
    {
        return Arr::only($input, ['district', 'skills', 'motivation', 'availability']);
    }

    public function payloadForNgo(array $input): array
    {
        return Arr::only($input, ['organization_name', 'registration_number', 'contact_person', 'contact_phone', 'address', 'mission']);
    }
}
