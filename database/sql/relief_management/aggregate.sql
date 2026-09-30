SELECT
    ri.item_name,
    SUM(ri.quantity) AS total_requested,
    COALESCE(SUM(rd.quantity), 0) AS total_distributed,
    (SUM(ri.quantity) - COALESCE(SUM(rd.quantity), 0)) AS deficit
FROM relief_items ri
LEFT JOIN relief_distributions rd ON ri.item_name = rd.relief_type
GROUP BY ri.item_name
ORDER BY deficit DESC;
