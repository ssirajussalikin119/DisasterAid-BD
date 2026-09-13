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

UNION

SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    CAST(NULL AS BIGINT) AS volunteer_id,
    CAST(NULL AS VARCHAR) AS availability
FROM users u
WHERE u.role = 'ngo' AND u.role_status = 'active'

ORDER BY name;
