SELECT
    rd.id AS distribution_id,
    rd.relief_type,
    rd.quantity,
    rc.id AS center_id,
    rc.name AS center_name
FROM relief_distributions rd
RIGHT JOIN relief_centers rc ON rd.relief_center_id = rc.id
ORDER BY rc.name ASC;
