<?php

declare(strict_types=1);

namespace App\Http\Resources\Auth;

use App\Enums\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'requested_role' => $this->requested_role,
            'requested_role_label' => Role::from($this->requested_role)->label(),
            'status' => $this->status,
            'application_payload' => $this->application_payload,
            'review_notes' => $this->review_notes,
            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
