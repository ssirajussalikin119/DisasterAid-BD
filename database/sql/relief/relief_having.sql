-- Demonstrates GROUP BY + HAVING
-- Shows only relief centers whose total distributed quantity is strictly greater than 100
SELECT c.name as center_name, COALESCE(SUM(d.quantity), 0) as total_quantity
FROM relief_distributions d
INNER JOIN relief_centers c ON d.relief_center_id = c.id
GROUP BY c.id, c.name
HAVING SUM(d.quantity) > 100
ORDER BY total_quantity DESC;
