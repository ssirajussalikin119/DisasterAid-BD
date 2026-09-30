SELECT u.name FROM users u JOIN relief_requests rr ON u.id = rr.user_id
INTERSECT
SELECT recipient FROM relief_distributions;
