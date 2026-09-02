SELECT
    ra.user_id,
    u.name AS user_name,
    u.phone,
    u.email,
    ra.id AS application_id,
    ra.reviewed_at AS approval_date
FROM role_applications ra
INNER JOIN users u ON u.id = ra.user_id
WHERE ra.requested_role = 'volunteer' AND ra.status = 'approved'
INTERSECT
SELECT
    v.user_id,
    u.name AS user_name,
    u.phone,
    u.email,
    ra.id AS application_id,
    ra.reviewed_at AS approval_date
FROM volunteers v
INNER JOIN users u ON u.id = v.user_id
INNER JOIN role_applications ra ON ra.user_id = v.user_id
WHERE ra.requested_role = 'volunteer' AND ra.status = 'approved'
ORDER BY user_name;
