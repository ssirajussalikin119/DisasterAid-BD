UPDATE role_applications
SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
    review_notes = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND status = 'pending'
RETURNING id, user_id, requested_role, status, application_payload,
          reviewed_by, reviewed_at, review_notes, created_at, updated_at;
