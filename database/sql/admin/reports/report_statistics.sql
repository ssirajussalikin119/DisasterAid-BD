SELECT
    r.status AS report_status,
    r.severity AS report_severity,
    COUNT(*) AS count
FROM reports r
GROUP BY r.status, r.severity
ORDER BY r.status, r.severity;
