SELECT
    rr.id AS request_id,
    rr.status AS request_status,
    rr.urgency,
    u.id AS user_id,
    u.name AS requester_name,
    u.email AS requester_email
FROM relief_requests rr
INNER JOIN users u ON rr.user_id = u.id
ORDER BY rr.created_at DESC;
