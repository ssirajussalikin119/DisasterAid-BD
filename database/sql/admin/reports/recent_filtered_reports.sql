SELECT
    r.id AS report_id,
    r.title,
    r.location,
    r.severity,
    r.status,
    u.name AS reporter_name,
    u.phone AS reporter_phone,
    i.title AS incident_title,
    r.created_at AS reported_at
FROM reports r
INNER JOIN users u ON u.id = r.user_id
LEFT JOIN incidents i ON i.id = r.incident_id
WHERE (?::text IS NULL OR r.status = ?)
  AND (?::text IS NULL OR r.severity = ?)
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?;
