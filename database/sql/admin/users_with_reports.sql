SELECT u.id, u.name, u.email, u.phone, COUNT(r.id) AS report_count
FROM users u
INNER JOIN reports r ON r.user_id = u.id
GROUP BY u.id, u.name, u.email, u.phone
ORDER BY report_count DESC, u.name ASC;
