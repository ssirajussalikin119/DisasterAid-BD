SELECT item_name FROM relief_items
EXCEPT
SELECT relief_type FROM relief_distributions;
