SELECT item_name AS resource_name FROM relief_items
UNION
SELECT relief_type AS resource_name FROM relief_distributions;
