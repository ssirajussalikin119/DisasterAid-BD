SELECT id, user_id, requested_role, status, application_payload,
       reviewed_by, reviewed_at, review_notes, created_at, updated_at
FROM role_applications
WHERE id = ?;
