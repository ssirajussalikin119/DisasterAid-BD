<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminIncidentService
{
    public function getAllIncidents(): array
    {
        // SQL query with JOIN and aggregation for report counts and locations
        return DB::select("
            SELECT 
                i.id, 
                i.title, 
                i.district, 
                i.status, 
                i.severity, 
                i.verified,
                i.created_at,
                i.updated_at,
                u.name as creator_name,
                COUNT(r.id) as report_count
            FROM incidents i
            LEFT JOIN users u ON i.created_by = u.id
            LEFT JOIN reports r ON i.id = r.incident_id
            GROUP BY i.id, i.title, i.district, i.status, i.severity, i.verified, i.created_at, i.updated_at, u.name
            ORDER BY i.created_at DESC
        ");
    }

    public function getIncidentDetails(int $id): ?object
    {
        $incident = DB::selectOne("
            SELECT 
                i.id, 
                i.title, 
                i.district, 
                i.status, 
                i.severity, 
                i.verified,
                i.created_at,
                i.updated_at,
                u.name as creator_name
            FROM incidents i
            LEFT JOIN users u ON i.created_by = u.id
            WHERE i.id = ?
        ", [$id]);

        if (!$incident) {
            throw (new ModelNotFoundException())->setModel('incidents', [$id]);
        }

        $reports = DB::select("
            SELECT 
                r.id, 
                r.title, 
                r.description, 
                r.status, 
                r.latitude as location_lat, 
                r.longitude as location_lng,
                r.created_at,
                u.name as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.incident_id = ?
            ORDER BY r.created_at DESC
        ", [$id]);

        $incident->reports = $reports;

        return $incident;
    }

    public function createIncident(array $data, int $adminId): object
    {
        $incident = \App\Models\Incident::create([
            'title' => $data['title'],
            'district' => $data['district'],
            'status' => $data['status'] ?? 'active',
            'severity' => $data['severity'] ?? 'low',
            'verified' => !empty($data['verified']) ? 'true' : 'false',
            'created_by' => $adminId,
        ]);

        return $this->getIncidentDetails($incident->id);
    }

    public function updateIncident(int $id, array $data): object
    {
        $incident = \App\Models\Incident::find($id);
        if (!$incident) {
            throw (new ModelNotFoundException())->setModel('incidents', [$id]);
        }

        $incident->update([
            'title' => $data['title'],
            'district' => $data['district'],
            'status' => $data['status'],
            'severity' => $data['severity'],
            'verified' => !empty($data['verified']) ? 'true' : 'false',
        ]);

        return $this->getIncidentDetails($id);
    }

    public function updateStatus(int $id, string $status): object
    {
        $exists = DB::table('incidents')->where('id', $id)->exists();
        if (!$exists) {
            throw (new ModelNotFoundException())->setModel('incidents', [$id]);
        }

        DB::table('incidents')->where('id', $id)->update([
            'status' => $status,
            'updated_at' => now(),
        ]);

        return $this->getIncidentDetails($id);
    }

    public function closeIncident(int $id): object
    {
        return $this->updateStatus($id, 'resolved');
    }
}
