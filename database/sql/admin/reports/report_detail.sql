SELECT
    r.id AS report_id,
    r.user_id AS reporter_id,
    u.name AS reporter_name,
    u.phone AS reporter_phone,
    u.email AS reporter_email,
    r.title,
    r.description,
    r.location,
    r.latitude,
    r.longitude,
    r.severity,
    r.status,
    r.incident_id,
    i.title AS incident_title,
    i.district AS incident_district,
    i.severity AS incident_severity,
    i.status AS incident_status,
    r.created_at AS reported_at,
    r.updated_at
FROM reports r
INNER JOIN users u ON u.id = r.user_id
LEFT JOIN incidents i ON i.id = r.incident_id
WHERE r.id = ?;
