UPDATE reports
SET status = 'verified', updated_at = NOW()
WHERE id = ?
  AND status = 'pending'
RETURNING
    id AS report_id,
    title,
    status,
    severity,
    location,
    incident_id,
    updated_at;
