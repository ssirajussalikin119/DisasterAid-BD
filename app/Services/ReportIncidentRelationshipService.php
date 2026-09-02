<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ReportIncidentRelationshipService
{
    /**
     * Report + reporter information using raw SQL INNER JOIN.
     */
    public function getReportsWithReporters(array $filters = []): array
    {
        $sql = "
            SELECT 
                r.id AS report_id,
                r.title AS report_title,
                r.description AS report_description,
                r.location AS report_location,
                r.latitude AS report_latitude,
                r.longitude AS report_longitude,
                r.status AS report_status,
                r.severity AS report_severity,
                r.incident_id AS report_incident_id,
                r.created_at AS report_created_at,
                u.id AS user_id,
                u.name AS reporter_name,
                u.email AS reporter_email,
                u.phone AS reporter_phone,
                u.role AS reporter_role
            FROM reports r
            INNER JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        ";

        $results = DB::select($sql);

        return $this->formatResults($results, 'inner_join');
    }

    /**
     * Reports with optional incident information using raw SQL LEFT JOIN.
     */
    public function getReportsWithIncidents(array $filters = []): array
    {
        $sql = "
            SELECT 
                r.id AS report_id,
                r.title AS report_title,
                r.description AS report_description,
                r.location AS report_location,
                r.latitude AS report_latitude,
                r.longitude AS report_longitude,
                r.status AS report_status,
                r.severity AS report_severity,
                r.created_at AS report_created_at,
                u.id AS user_id,
                u.name AS reporter_name,
                u.email AS reporter_email,
                u.phone AS reporter_phone,
                i.id AS incident_id,
                i.title AS incident_title,
                i.district AS incident_district,
                i.status AS incident_status,
                i.severity AS incident_severity,
                i.verified AS incident_verified
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN incidents i ON r.incident_id = i.id
            ORDER BY r.created_at DESC
        ";

        $results = DB::select($sql);

        return $this->formatResults($results, 'left_join');
    }

    /**
     * Incident + report relationship using raw SQL RIGHT JOIN.
     */
    public function getIncidentWiseReports(array $filters = []): array
    {
        $sql = "
            SELECT 
                i.id AS incident_id,
                i.title AS incident_title,
                i.district AS incident_district,
                i.status AS incident_status,
                i.severity AS incident_severity,
                i.verified AS incident_verified,
                i.created_at AS incident_created_at,
                r.id AS report_id,
                r.title AS report_title,
                r.description AS report_description,
                r.location AS report_location,
                r.status AS report_status,
                r.severity AS report_severity,
                r.created_at AS report_created_at,
                u.id AS user_id,
                u.name AS reporter_name,
                u.email AS reporter_email,
                u.phone AS reporter_phone
            FROM reports r
            RIGHT JOIN incidents i ON r.incident_id = i.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY i.id DESC, r.id DESC
        ";

        $results = DB::select($sql);

        return $this->formatResults($results, 'right_join');
    }

    /**
     * Complete incident/report relationship using raw SQL FULL OUTER JOIN.
     */
    public function getCompleteRelationships(array $filters = []): array
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL / MariaDB emulation for FULL OUTER JOIN
            $sql = "
                SELECT 
                    r.id AS report_id,
                    r.title AS report_title,
                    r.description AS report_description,
                    r.location AS report_location,
                    r.latitude AS report_latitude,
                    r.longitude AS report_longitude,
                    r.status AS report_status,
                    r.severity AS report_severity,
                    r.created_at AS report_created_at,
                    u.id AS user_id,
                    u.name AS reporter_name,
                    u.email AS reporter_email,
                    u.phone AS reporter_phone,
                    i.id AS incident_id,
                    i.title AS incident_title,
                    i.district AS incident_district,
                    i.status AS incident_status,
                    i.severity AS incident_severity,
                    i.verified AS incident_verified,
                    i.created_at AS incident_created_at
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN incidents i ON r.incident_id = i.id

                UNION ALL

                SELECT 
                    NULL AS report_id,
                    NULL AS report_title,
                    NULL AS report_description,
                    NULL AS report_location,
                    NULL AS report_latitude,
                    NULL AS report_longitude,
                    NULL AS report_status,
                    NULL AS report_severity,
                    NULL AS report_created_at,
                    NULL AS user_id,
                    NULL AS reporter_name,
                    NULL AS reporter_email,
                    NULL AS reporter_phone,
                    i.id AS incident_id,
                    i.title AS incident_title,
                    i.district AS incident_district,
                    i.status AS incident_status,
                    i.severity AS incident_severity,
                    i.verified AS incident_verified,
                    i.created_at AS incident_created_at
                FROM incidents i
                LEFT JOIN reports r ON r.incident_id = i.id
                WHERE r.id IS NULL
            ";
        } else {
            // PostgreSQL  3.39+ native FULL OUTER JOIN
            $sql = "
                SELECT 
                    r.id AS report_id,
                    r.title AS report_title,
                    r.description AS report_description,
                    r.location AS report_location,
                    r.latitude AS report_latitude,
                    r.longitude AS report_longitude,
                    r.status AS report_status,
                    r.severity AS report_severity,
                    r.created_at AS report_created_at,
                    u.id AS user_id,
                    u.name AS reporter_name,
                    u.email AS reporter_email,
                    u.phone AS reporter_phone,
                    i.id AS incident_id,
                    i.title AS incident_title,
                    i.district AS incident_district,
                    i.status AS incident_status,
                    i.severity AS incident_severity,
                    i.verified AS incident_verified,
                    i.created_at AS incident_created_at
                FROM reports r
                FULL OUTER JOIN incidents i ON r.incident_id = i.id
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY COALESCE(r.id, 0) DESC, COALESCE(i.id, 0) DESC
            ";
        }

        $results = DB::select($sql);

        return $this->formatResults($results, 'full_outer_join');
    }

    /**
     * Get summary metrics for the report and incident relationships.
     */
    public function getSummaryMetrics(): array
    {
        $totalReports = DB::selectOne("SELECT COUNT(*) AS total FROM reports")->total ?? 0;
        $linkedReports = DB::selectOne("SELECT COUNT(*) AS total FROM reports WHERE incident_id IS NOT NULL")->total ?? 0;
        $unlinkedReports = DB::selectOne("SELECT COUNT(*) AS total FROM reports WHERE incident_id IS NULL")->total ?? 0;
        $totalIncidents = DB::selectOne("SELECT COUNT(*) AS total FROM incidents")->total ?? 0;
        $incidentsWithReports = DB::selectOne("SELECT COUNT(DISTINCT incident_id) AS total FROM reports WHERE incident_id IS NOT NULL")->total ?? 0;
        $incidentsWithoutReports = max(0, (int) $totalIncidents - (int) $incidentsWithReports);

        return [
            'total_reports' => (int) $totalReports,
            'linked_reports' => (int) $linkedReports,
            'unlinked_reports' => (int) $unlinkedReports,
            'total_incidents' => (int) $totalIncidents,
            'incidents_with_reports' => (int) $incidentsWithReports,
            'incidents_without_reports' => (int) $incidentsWithoutReports,
        ];
    }

    /**
     * Format database rows into structured, rich DTO objects.
     */
    private function formatResults(array $rows, string $joinType): array
    {
        return array_map(function ($row) use ($joinType): array {
            $rowObj = (object) $row;

            $hasReport = !empty($rowObj->report_id);
            $hasIncident = !empty($rowObj->incident_id);
            $hasReporter = !empty($rowObj->user_id);

            return [
                'join_type' => $joinType,
                'report' => $hasReport ? [
                    'id' => (int) $rowObj->report_id,
                    'title' => $rowObj->report_title ?? null,
                    'description' => $rowObj->report_description ?? null,
                    'location' => $rowObj->report_location ?? null,
                    'latitude' => isset($rowObj->report_latitude) ? (float) $rowObj->report_latitude : null,
                    'longitude' => isset($rowObj->report_longitude) ? (float) $rowObj->report_longitude : null,
                    'status' => $rowObj->report_status ?? 'pending',
                    'severity' => $rowObj->report_severity ?? 'medium',
                    'created_at' => $rowObj->report_created_at ?? null,
                ] : null,
                'reporter' => $hasReporter ? [
                    'id' => (int) $rowObj->user_id,
                    'name' => $rowObj->reporter_name ?? 'Unknown Reporter',
                    'email' => $rowObj->reporter_email ?? null,
                    'phone' => $rowObj->reporter_phone ?? null,
                    'role' => $rowObj->reporter_role ?? 'citizen',
                ] : null,
                'incident' => $hasIncident ? [
                    'id' => (int) $rowObj->incident_id,
                    'title' => $rowObj->incident_title ?? null,
                    'district' => $rowObj->incident_district ?? null,
                    'status' => $rowObj->incident_status ?? 'active',
                    'severity' => $rowObj->incident_severity ?? 'medium',
                    'verified' => isset($rowObj->incident_verified) ? (bool) $rowObj->incident_verified : false,
                    'created_at' => $rowObj->incident_created_at ?? null,
                ] : null,
                'relationship_state' => match (true) {
                    $hasReport && $hasIncident => 'linked',
                    $hasReport && !$hasIncident => 'report_only',
                    !$hasReport && $hasIncident => 'incident_only',
                    default => 'orphan',
                },
            ];
        }, $rows);
    }
}
