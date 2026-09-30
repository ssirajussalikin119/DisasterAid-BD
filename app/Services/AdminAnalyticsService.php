<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AdminAnalyticsService
{
    /**
     * Disaster type classification derived from the incident title.
     *
     * The project has no disaster type/category column on any table, so the
     * only real source of type information is the free-text incident title.
     * Every category the Analytics page shows is computed from actual titles
     * at query time; categories that match no incident are never returned.
     */
    private const TYPE_CLASSIFICATION_SQL = "CASE
            WHEN LOWER(i.title) LIKE '%flood%' OR LOWER(i.title) LIKE '%waterlogging%' OR LOWER(i.title) LIKE '%inundat%' OR LOWER(i.title) LIKE '%bonna%' THEN 'Flood / Waterlogging'
            WHEN LOWER(i.title) LIKE '%cyclone%' OR LOWER(i.title) LIKE '%storm%' OR LOWER(i.title) LIKE '%typhoon%' THEN 'Cyclone / Storm'
            WHEN LOWER(i.title) LIKE '%landslide%' THEN 'Landslide'
            WHEN LOWER(i.title) LIKE '%earthquake%' OR LOWER(i.title) LIKE '%quake%' THEN 'Earthquake'
            WHEN LOWER(i.title) LIKE '%fire%' OR LOWER(i.title) LIKE '%blaze%' THEN 'Fire'
            WHEN LOWER(i.title) LIKE '%heatwave%' OR LOWER(i.title) LIKE '%heat wave%' OR LOWER(i.title) LIKE '%extreme heat%' THEN 'Heatwave'
            WHEN LOWER(i.title) LIKE '%disease%' OR LOWER(i.title) LIKE '%outbreak%' OR LOWER(i.title) LIKE '%epidemic%' THEN 'Disease Outbreak'
            WHEN LOWER(i.title) LIKE '%erosion%' THEN 'River Erosion'
            WHEN LOWER(i.title) LIKE '%accident%' THEN 'Road Accident'
            ELSE 'Other'
        END";

    /**
     * District-level disaster situation summary, read from the
     * district_disaster_summary database VIEW (created by migration
     * 2026_09_30_060000_create_district_disaster_summary_view).
     *
     * All aggregation logic lives in the VIEW, so this stays a plain read.
     *
     * @return array<int, array<string, int|string>>
     */
    public function getDistrictSummary(): array
    {
        $rows = DB::select('SELECT * FROM district_disaster_summary ORDER BY district_name');

        return array_map(static fn (object $row): array => [
            'district_id' => (int) $row->district_id,
            'district_name' => (string) $row->district_name,
            'active_incidents' => (int) $row->active_incidents,
            'critical_incidents' => (int) $row->critical_incidents,
            'verified_reports' => (int) $row->verified_reports,
            'pending_relief_requests' => (int) $row->pending_relief_requests,
            'active_volunteers' => (int) $row->active_volunteers,
            'active_assignments' => (int) $row->active_assignments,
        ], $rows);
    }

    /**
     * Full analytics overview for the Admin Analytics page.
     *
     * Every number is aggregated from the live database at request time.
     * Each metric is queried on its own (no multi-table joins), so one-to-many
     * relationships can never inflate the counts.
     *
     * @return array<string, mixed>
     */
    public function getOverview(): array
    {
        return [
            'kpis' => $this->getKpis(),
            'severity_distribution' => $this->getSeverityDistribution(),
            'type_distribution' => $this->getTypeDistribution(),
            'relief_status_distribution' => $this->getReliefStatusDistribution(),
            'volunteer_activity' => $this->getVolunteerActivity(),
        ];
    }

    /**
     * Headline metrics, each definition documented in README.
     *
     * @return array<string, int>
     */
    private function getKpis(): array
    {
        return [
            'active_incidents' => $this->count("SELECT COUNT(*) AS count FROM incidents WHERE status = 'active'"),
            'critical_incidents' => $this->count("SELECT COUNT(*) AS count FROM incidents WHERE severity = 'critical' AND status IN ('active', 'monitoring')"),
            'verified_reports' => $this->count("SELECT COUNT(*) AS count FROM reports WHERE status = 'verified'"),
            'pending_relief_requests' => $this->count("SELECT COUNT(*) AS count FROM relief_requests WHERE status = 'pending'"),
            'active_volunteers' => $this->count("SELECT COUNT(*) AS count FROM users WHERE role = 'volunteer' AND role_status = 'active'"),
            'active_assignments' => $this->count("SELECT COUNT(*) AS count FROM assignments WHERE status IN ('pending', 'accepted', 'in_progress')"),
            'resolved_incidents' => $this->count("SELECT COUNT(*) AS count FROM incidents WHERE status = 'resolved'"),
        ];
    }

    /**
     * Real severity values present in the incidents table only.
     *
     * @return array<int, array<string, int|string>>
     */
    private function getSeverityDistribution(): array
    {
        return $this->labelledCounts(
            'SELECT severity AS label, COUNT(*) AS value
             FROM incidents
             WHERE severity IS NOT NULL AND severity <> \'\'
             GROUP BY severity
             ORDER BY value DESC, severity ASC'
        );
    }

    /**
     * Disaster types derived from real incident titles (see
     * self::TYPE_CLASSIFICATION_SQL). Only categories that actually occur
     * are returned.
     *
     * @return array<int, array<string, int|string>>
     */
    private function getTypeDistribution(): array
    {
        return $this->labelledCounts(
            'SELECT ' . self::TYPE_CLASSIFICATION_SQL . ' AS label, COUNT(*) AS value
             FROM incidents i
             WHERE i.title IS NOT NULL
             GROUP BY 1
             ORDER BY value DESC, label ASC'
        );
    }

    /**
     * Real relief request status values present in the relief_requests table.
     *
     * @return array<int, array<string, int|string>>
     */
    private function getReliefStatusDistribution(): array
    {
        return $this->labelledCounts(
            'SELECT status AS label, COUNT(*) AS value
             FROM relief_requests
             WHERE status IS NOT NULL AND status <> \'\'
             GROUP BY status
             ORDER BY value DESC, status ASC'
        );
    }

    /**
     * Volunteer and assignment activity, plus the coverage numbers that
     * explain why the district VIEW total is lower than the platform total
     * (volunteers without a district location, or marked unavailable, are
     * counted globally but not attributed to any district row).
     *
     * @return array<string, int>
     */
    private function getVolunteerActivity(): array
    {
        $activeVolunteers = $this->count("SELECT COUNT(*) AS count FROM users WHERE role = 'volunteer' AND role_status = 'active'");
        $locatedVolunteers = $this->count("
            SELECT COUNT(*) AS count
            FROM volunteers v
            INNER JOIN users u ON u.id = v.user_id
            WHERE u.role = 'volunteer'
              AND u.role_status = 'active'
              AND TRIM(COALESCE(v.current_location, '')) <> ''
        ");
        $viewVolunteers = $this->count('SELECT COALESCE(SUM(active_volunteers), 0) AS count FROM district_disaster_summary');

        return [
            'active_volunteers' => $activeVolunteers,
            'located_volunteers' => $locatedVolunteers,
            'unlocated_volunteers' => max(0, $activeVolunteers - $locatedVolunteers),
            'district_view_volunteers' => $viewVolunteers,
            'assigned_volunteers' => $this->count('SELECT COUNT(DISTINCT volunteer_id) AS count FROM assignments'),
            'pending_assignments' => $this->count("SELECT COUNT(*) AS count FROM assignments WHERE status = 'pending'"),
            'completed_assignments' => $this->count("SELECT COUNT(*) AS count FROM assignments WHERE status = 'completed'"),
        ];
    }

    /**
     * @return array<int, array<string, int|string>>
     */
    private function labelledCounts(string $sql): array
    {
        return array_map(static fn (object $row): array => [
            'label' => (string) $row->label,
            'value' => (int) $row->value,
        ], DB::select($sql));
    }

    private function count(string $sql): int
    {
        return (int) DB::selectOne($sql)->count;
    }
}
