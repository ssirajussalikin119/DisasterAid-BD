SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    v.id AS volunteer_id,
    v.availability
FROM users u
INNER JOIN volunteers v ON u.id = v.user_id
WHERE u.role = 'volunteer' AND u.role_status = 'active'

EXCEPT

SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    v.id AS volunteer_id,
    v.availability
FROM users u
INNER JOIN volunteers v ON u.id = v.user_id
INNER JOIN assignments a ON v.id = a.volunteer_id
WHERE a.status IN ('pending', 'accepted', 'in_progress')

ORDER BY name;
