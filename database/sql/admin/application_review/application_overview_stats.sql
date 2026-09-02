SELECT
    (SELECT COUNT(*) FROM role_applications) AS total_applications,
    (SELECT COUNT(*) FROM role_applications WHERE status = 'pending') AS pending_applications,
    (SELECT COUNT(*) FROM role_applications WHERE status = 'approved') AS approved_applications,
    (SELECT COUNT(*) FROM role_applications WHERE status = 'rejected') AS rejected_applications,
    (SELECT COUNT(*) FROM role_applications WHERE requested_role = 'volunteer') AS volunteer_applications,
    (SELECT COUNT(*) FROM role_applications WHERE requested_role = 'ngo') AS ngo_applications,
    (SELECT COUNT(*) FROM role_applications WHERE requested_role = 'volunteer' AND status = 'pending') AS volunteer_pending,
    (SELECT COUNT(*) FROM role_applications WHERE requested_role = 'ngo' AND status = 'pending') AS ngo_pending;
