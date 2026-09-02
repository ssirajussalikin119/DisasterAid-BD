SELECT COUNT(*) AS total
FROM users u
WHERE (?::text IS NULL OR u.name ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
  AND (?::text IS NULL OR u.role = ?)
  AND (?::text IS NULL OR u.role_status = ?);
