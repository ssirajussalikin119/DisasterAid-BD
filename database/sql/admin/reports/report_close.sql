UPDATE reports
SET status = 'closed', updated_at = NOW()
WHERE id = ?
  AND status IN ('pending', 'verified')
RETURNING
    id AS report_id,
    title,
    status,
    severity,
    location,
    incident_id,
    updated_at;
