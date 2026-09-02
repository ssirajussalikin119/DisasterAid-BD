SELECT ra.user_id
FROM role_applications ra
WHERE ra.requested_role = 'volunteer' AND ra.status = 'approved'
INTERSECT
SELECT v.user_id
FROM volunteers v;
