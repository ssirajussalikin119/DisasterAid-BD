SELECT
    ra.requested_role AS application_type,
    ra.status AS application_status,
    COUNT(*) AS count
FROM role_applications ra
GROUP BY ra.requested_role, ra.status
ORDER BY ra.requested_role, ra.status;
