SELECT
    ri.item_name AS requested_item,
    ri.quantity AS requested_quantity,
    rd.relief_type AS distributed_item,
    rd.quantity AS distributed_quantity
FROM relief_items ri
FULL OUTER JOIN relief_distributions rd ON ri.item_name = rd.relief_type
ORDER BY ri.item_name ASC;
