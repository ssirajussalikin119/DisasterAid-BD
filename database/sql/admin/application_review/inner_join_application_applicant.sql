SELECT
    ra.id AS application_id,
    u.id AS applicant_id,
    u.name AS applicant_name,
    u.phone AS applicant_phone,
    u.email AS applicant_email,
    ra.requested_role,
    ra.status AS application_status,
    ra.application_payload,
    ra.created_at AS submitted_at
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
WHERE (?::text IS NULL OR u.name ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
  AND (?::text IS NULL OR ra.requested_role = ?)
  AND (?::text IS NULL OR ra.status = ?)
ORDER BY ra.created_at DESC;
