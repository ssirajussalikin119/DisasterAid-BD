<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@disasteraidbd.local')],
            [
                'name' => env('ADMIN_NAME', 'System Admin'),
                'phone' => env('ADMIN_PHONE', '+8801000000000'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'ChangeMe123!')),
                'role' => Role::Admin->value,
                'role_status' => 'active',
            ]
        );
    }
}
