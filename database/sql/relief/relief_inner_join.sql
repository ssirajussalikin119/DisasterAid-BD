-- Demonstrates INNER JOIN
-- Shows each relief distribution together with its relief center name
SELECT d.id, d.relief_type, d.quantity, d.distribution_date, c.name as center_name
FROM relief_distributions d
INNER JOIN relief_centers c ON d.relief_center_id = c.id
ORDER BY d.distribution_date DESC;
