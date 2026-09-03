-- Demonstrates LEFT JOIN + COUNT + GROUP BY
-- Shows every relief center and its number of distributions, including centers with zero distributions
SELECT c.name as center_name, COUNT(d.id) as total_distributions
FROM relief_centers c
LEFT JOIN relief_distributions d ON c.id = d.relief_center_id
GROUP BY c.id, c.name
ORDER BY total_distributions DESC;
