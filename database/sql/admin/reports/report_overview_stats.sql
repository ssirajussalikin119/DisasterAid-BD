SELECT
    COUNT(*) AS total_reports,
    COUNT(*) FILTER (WHERE r.status = 'pending') AS pending_reports,
    COUNT(*) FILTER (WHERE r.status = 'verified') AS verified_reports,
    COUNT(*) FILTER (WHERE r.status = 'rejected') AS rejected_reports,
    COUNT(*) FILTER (WHERE r.status = 'closed') AS closed_reports,
    COUNT(*) FILTER (WHERE r.severity = 'low') AS low_severity,
    COUNT(*) FILTER (WHERE r.severity = 'medium') AS medium_severity,
    COUNT(*) FILTER (WHERE r.severity = 'high') AS high_severity,
    COUNT(*) FILTER (WHERE r.severity = 'critical') AS critical_severity
FROM reports r;
