-- Demonstrates SUM() + GROUP BY
-- Shows the total distributed quantity per relief center
SELECT c.name as center_name, COALESCE(SUM(d.quantity), 0) as total_quantity
FROM relief_distributions d
INNER JOIN relief_centers c ON d.relief_center_id = c.id
GROUP BY c.id, c.name
ORDER BY total_quantity DESC;
