SELECT
    rr.id AS request_id,
    rr.description,
    rr.status,
    i.id AS incident_id,
    i.title AS incident_title,
    i.district
FROM relief_requests rr
LEFT JOIN incidents i ON rr.incident_id = i.id
ORDER BY rr.created_at DESC;
