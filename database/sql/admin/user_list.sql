SELECT
    u.id, u.name, u.email, u.phone, u.role,
    u.role_status AS status, u.phone_verified_at, u.email_verified_at,
    u.created_at, u.updated_at,
    COUNT(DISTINCT r.id) AS report_count,
    COUNT(DISTINCT ra.id) AS application_count,
    COUNT(DISTINCT a.id) AS assignment_count
FROM users u
LEFT JOIN reports r ON r.user_id = u.id
LEFT JOIN role_applications ra ON ra.user_id = u.id
LEFT JOIN volunteers v ON v.user_id = u.id
LEFT JOIN assignments a ON a.volunteer_id = v.id
WHERE (?::text IS NULL OR u.name ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
  AND (?::text IS NULL OR u.role = ?)
  AND (?::text IS NULL OR u.role_status = ?)
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT ? OFFSET ?;
