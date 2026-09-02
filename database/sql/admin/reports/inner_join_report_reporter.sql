SELECT
    r.id AS report_id,
    r.title,
    r.location,
    r.severity,
    r.status,
    u.id AS reporter_id,
    u.name AS reporter_name,
    u.phone AS reporter_phone,
    u.email AS reporter_email,
    r.created_at AS reported_at
FROM reports r
INNER JOIN users u ON u.id = r.user_id
WHERE (?::text IS NULL OR r.status = ?)
  AND (?::text IS NULL OR r.severity = ?)
  AND (?::text IS NULL OR r.title ILIKE ? OR u.name ILIKE ? OR r.location ILIKE ?)
ORDER BY r.created_at DESC;
