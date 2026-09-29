<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    public function getStatistics(): array
    {
        $totalUsers = (int) DB::selectOne("SELECT COUNT(*) as count FROM users")->count;
        $activeUsers = (int) DB::selectOne("SELECT COUNT(*) as count FROM users WHERE role_status = 'active'")->count;
        $pendingReports = (int) DB::selectOne("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'")->count;
        
        $pendingApplications = DB::select("
            SELECT requested_role, COUNT(*) as count 
            FROM role_applications 
            WHERE status = 'pending' 
            GROUP BY requested_role
        ");

        $pendingVolunteerApps = 0;
        $pendingNgoApps = 0;
        foreach ($pendingApplications as $app) {
            if ($app->requested_role === 'volunteer') {
                $pendingVolunteerApps = (int) $app->count;
            } elseif ($app->requested_role === 'ngo') {
                $pendingNgoApps = (int) $app->count;
            }
        }

        $activeIncidents = (int) DB::selectOne("SELECT COUNT(*) as count FROM incidents WHERE status = 'active'")->count;
        $openReliefRequests = (int) DB::selectOne("SELECT COUNT(*) as count FROM reports WHERE status = 'open'")->count; // Fallback mapping
        
        $activeVolunteers = (int) DB::selectOne("
            SELECT COUNT(u.id) as count 
            FROM users u
            WHERE u.role = 'volunteer' AND u.role_status = 'active'
        ")->count;
        
        return [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'pendingReports' => $pendingReports,
            'pendingVolunteerApplications' => $pendingVolunteerApps,
            'pendingNgoApplications' => $pendingNgoApps,
            'activeIncidents' => $activeIncidents,
            'openReliefRequests' => $openReliefRequests,
            'activeVolunteers' => $activeVolunteers,
        ];
    }
}
