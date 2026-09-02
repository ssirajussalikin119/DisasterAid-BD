SELECT
    ra.id AS application_id,
    u.name AS applicant_name,
    u.phone AS applicant_phone,
    u.email AS applicant_email,
    ra.requested_role AS application_type,
    ra.status AS application_status,
    ra.application_payload,
    ra.created_at AS submitted_at,
    rv.name AS reviewer_name,
    ra.reviewed_at,
    ra.review_notes
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
LEFT JOIN users rv ON rv.id = ra.reviewed_by
WHERE (?::text IS NULL OR ra.status = ?)
  AND (?::text IS NULL OR ra.requested_role = ?)
ORDER BY ra.created_at DESC
LIMIT ? OFFSET ?;
