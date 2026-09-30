<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE finalize_incident(
                p_incident_id BIGINT,
                p_admin_id BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_incident_status VARCHAR;
                v_uncompleted_assignments_count INTEGER;
            BEGIN
                -- Verify incident exists and lock it
                SELECT status INTO v_incident_status
                FROM incidents
                WHERE id = p_incident_id
                FOR UPDATE;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Incident % does not exist', p_incident_id;
                END IF;

                -- Verify valid state (must not be 'resolved')
                IF v_incident_status = 'resolved' THEN
                    RAISE EXCEPTION 'Incident % is already resolved', p_incident_id;
                END IF;

                -- Check that required response work has been completed
                SELECT COUNT(*) INTO v_uncompleted_assignments_count
                FROM assignments
                WHERE incident_id = p_incident_id
                  AND status IN ('pending', 'accepted', 'in_progress');

                IF v_uncompleted_assignments_count > 0 THEN
                    RAISE EXCEPTION 'Incident % has uncompleted assignments', p_incident_id;
                END IF;

                -- Update status
                UPDATE incidents
                SET status = 'resolved',
                    updated_at = NOW()
                WHERE id = p_incident_id;
            END;
            $$;
        ");
    }

    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS finalize_incident(BIGINT, BIGINT);");
    }
};
