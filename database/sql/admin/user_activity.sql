SELECT 'report' AS activity_type, r.id AS activity_id, r.title AS label, r.status, r.created_at
FROM reports r WHERE r.user_id = ?
UNION ALL
SELECT 'role_application', ra.id, ra.requested_role, ra.status, ra.created_at
FROM role_applications ra WHERE ra.user_id = ?
UNION ALL
SELECT 'assignment', a.id, i.title, a.status, a.created_at
FROM assignments a
INNER JOIN volunteers v ON v.id = a.volunteer_id
INNER JOIN incidents i ON i.id = a.incident_id
WHERE v.user_id = ?
ORDER BY created_at DESC;
