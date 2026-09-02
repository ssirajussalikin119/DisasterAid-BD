SELECT
    ra.id AS application_id,
    ra.user_id,
    u.name AS applicant_name,
    u.phone AS applicant_phone,
    u.email AS applicant_email,
    ra.requested_role,
    ra.status AS application_status,
    ra.application_payload,
    ra.review_notes,
    ra.reviewed_by,
    rv.name AS reviewer_name,
    ra.reviewed_at,
    ra.created_at AS submitted_at,
    ra.updated_at
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
LEFT JOIN users rv ON rv.id = ra.reviewed_by
WHERE ra.id = ?;
