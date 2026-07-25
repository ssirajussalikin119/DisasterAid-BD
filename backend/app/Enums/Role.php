<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case Citizen = 'citizen';
    case Volunteer = 'volunteer';
    case Doctor = 'doctor';
    case NGO = 'ngo';
    case Admin = 'admin';

    public static function fromOrNull(?string $value): ?self
    {
        return self::tryFrom((string) $value);
    }

    public static function dashboardRoute(self $role): string
    {
        return match ($role) {
            self::Citizen => '/account',
            self::Volunteer => '/volunteer-dashboard',
            self::Doctor => '/doctor-dashboard',
            self::NGO => '/ngo-dashboard',
            self::Admin => '/admin/dashboard',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Citizen => 'Citizen',
            self::Volunteer => 'Volunteer',
            self::Doctor => 'Doctor',
            self::NGO => 'NGO',
            self::Admin => 'Admin',
        };
    }
}
