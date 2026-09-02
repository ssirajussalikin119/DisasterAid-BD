SELECT
    r.id AS report_id,
    r.title,
    r.location,
    r.severity,
    r.status,
    r.incident_id,
    i.title AS incident_title,
    i.district AS incident_district,
    i.severity AS incident_severity,
    i.status AS incident_status,
    i.verified AS incident_verified,
    r.created_at AS reported_at
FROM reports r
LEFT JOIN incidents i ON i.id = r.incident_id
WHERE (?::text IS NULL OR r.status = ?)
  AND (?::text IS NULL OR r.severity = ?)
  AND (?::text IS NULL OR r.title ILIKE ? OR r.description ILIKE ? OR r.location ILIKE ?)
ORDER BY r.created_at DESC;
