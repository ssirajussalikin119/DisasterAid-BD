<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Aggregated district-level disaster situation summary.
     *
     * The project has no districts table: district is a string column on
     * incidents.district, so the dimension of this view is the set of distinct
     * incident districts. Every other metric is aggregated in its own CTE and
     * joined with LEFT JOIN so a district with no activity still appears with
     * zero counts, and one-to-many joins can never inflate the counts.
     */
    private const VIEW_SQL = <<<'SQL'
        WITH district_totals AS (
            SELECT TRIM(i.district) AS district_name
            FROM incidents i
            WHERE TRIM(i.district) <> ''
            GROUP BY TRIM(i.district)
        ),
        incident_stats AS (
            SELECT
                TRIM(i.district) AS district_name,
                SUM(CASE WHEN LOWER(i.status) = 'active' THEN 1 ELSE 0 END) AS active_incidents,
                SUM(
                    CASE
                        WHEN LOWER(i.severity) = 'critical' AND LOWER(i.status) IN ('active', 'monitoring')
                        THEN 1
                        ELSE 0
                    END
                ) AS critical_incidents
            FROM incidents i
            WHERE TRIM(i.district) <> ''
            GROUP BY TRIM(i.district)
        ),
        report_stats AS (
            SELECT
                TRIM(i.district) AS district_name,
                COUNT(DISTINCT r.id) AS verified_reports
            FROM reports r
            INNER JOIN incidents i ON i.id = r.incident_id
            WHERE LOWER(r.status) = 'verified'
            GROUP BY TRIM(i.district)
        ),
        relief_stats AS (
            SELECT
                TRIM(i.district) AS district_name,
                COUNT(DISTINCT rr.id) AS pending_relief_requests
            FROM relief_requests rr
            INNER JOIN incidents i ON i.id = rr.incident_id
            WHERE LOWER(rr.status) = 'pending'
            GROUP BY TRIM(i.district)
        ),
        volunteer_stats AS (
            SELECT
                d.district_name AS district_name,
                COUNT(DISTINCT v.id) AS active_volunteers
            FROM district_totals d
            INNER JOIN volunteers v
                ON LOWER(TRIM(COALESCE(v.current_location, ''))) LIKE LOWER(d.district_name) || '%'
            INNER JOIN users u ON u.id = v.user_id
            WHERE LOWER(u.role) = 'volunteer'
              AND LOWER(u.role_status) = 'active'
              AND LOWER(v.availability) <> 'unavailable'
            GROUP BY d.district_name
        ),
        assignment_stats AS (
            SELECT
                TRIM(i.district) AS district_name,
                COUNT(DISTINCT a.id) AS active_assignments
            FROM assignments a
            INNER JOIN incidents i ON i.id = a.incident_id
            WHERE LOWER(a.status) IN ('pending', 'accepted', 'in_progress')
            GROUP BY TRIM(i.district)
        )
        SELECT
            ROW_NUMBER() OVER (ORDER BY d.district_name) AS district_id,
            d.district_name,
            COALESCE(ins.active_incidents, 0) AS active_incidents,
            COALESCE(ins.critical_incidents, 0) AS critical_incidents,
            COALESCE(rps.verified_reports, 0) AS verified_reports,
            COALESCE(rls.pending_relief_requests, 0) AS pending_relief_requests,
            COALESCE(vls.active_volunteers, 0) AS active_volunteers,
            COALESCE(ass.active_assignments, 0) AS active_assignments
        FROM district_totals d
        LEFT JOIN incident_stats ins ON ins.district_name = d.district_name
        LEFT JOIN report_stats rps ON rps.district_name = d.district_name
        LEFT JOIN relief_stats rls ON rls.district_name = d.district_name
        LEFT JOIN volunteer_stats vls ON vls.district_name = d.district_name
        LEFT JOIN assignment_stats ass ON ass.district_name = d.district_name
        SQL;

    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE OR REPLACE VIEW district_disaster_summary AS ' . self::VIEW_SQL);

            return;
        }

        // SQLite (used by the test suite) does not support CREATE OR REPLACE VIEW.
        DB::statement('DROP VIEW IF EXISTS district_disaster_summary');
        DB::statement('CREATE VIEW district_disaster_summary AS ' . self::VIEW_SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS district_disaster_summary');
    }
};
