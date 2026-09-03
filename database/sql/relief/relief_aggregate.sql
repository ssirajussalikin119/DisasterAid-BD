-- Demonstrates aggregate functions COUNT() and SUM()
-- Calculates the total number of distributions and the overall quantity distributed
SELECT COUNT(*) as total_distributions, COALESCE(SUM(quantity), 0) as total_quantity
FROM relief_distributions;
