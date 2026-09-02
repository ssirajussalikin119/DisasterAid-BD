SELECT
    ra.id AS application_id,
    u.id AS applicant_id,
    u.name AS applicant_name,
    u.phone AS applicant_contact,
    'volunteer' AS application_type,
    ra.status AS application_status,
    ra.application_payload::text AS application_payload,
    ra.created_at AS submitted_at
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
WHERE ra.requested_role = 'volunteer'
  AND (?::text IS NULL OR u.name ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
  AND (?::text IS NULL OR ra.status = ?)
UNION
SELECT
    ra.id AS application_id,
    u.id AS applicant_id,
    u.name AS applicant_name,
    u.phone AS applicant_contact,
    'ngo' AS application_type,
    ra.status AS application_status,
    ra.application_payload::text AS application_payload,
    ra.created_at AS submitted_at
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
WHERE ra.requested_role = 'ngo'
  AND (?::text IS NULL OR u.name ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
  AND (?::text IS NULL OR ra.status = ?)
ORDER BY submitted_at DESC;
