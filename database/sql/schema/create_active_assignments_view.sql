CREATE OR REPLACE VIEW active_assignments_view AS
SELECT 
    a.id AS assignment_id,
    a.status,
    a.accepted,
    a.created_at AS assigned_at,
    v.id AS volunteer_id,
    v.skills,
    v.availability,
    u.name AS volunteer_name,
    u.phone AS volunteer_phone,
    i.title AS incident_title,
    i.severity AS incident_severity
FROM assignments a
JOIN volunteers v ON a.volunteer_id = v.id
JOIN users u ON v.user_id = u.id
JOIN incidents i ON a.incident_id = i.id
WHERE a.status IN ('in_progress', 'accepted');
