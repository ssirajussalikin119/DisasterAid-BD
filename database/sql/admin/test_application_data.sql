-- Test data for Issue #24: Admin Volunteer & NGO Application Review
-- These records are clearly identifiable as test data
-- Do NOT delete or modify existing production data

-- Insert test users (citizens who will apply)
INSERT INTO users (name, email, phone, password, role, role_status, created_at, updated_at)
VALUES
    ('Test Citizen A', 'test.citizen.a@example.com', '+8801700000001', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Test Citizen B', 'test.citizen.b@example.com', '+8801700000002', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Test Citizen C', 'test.citizen.c@example.com', '+8801700000003', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Test Citizen D', 'test.citizen.d@example.com', '+8801700000004', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Test Citizen E', 'test.citizen.e@example.com', '+8801700000005', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Test Citizen F', 'test.citizen.f@example.com', '+8801700000006', NULL, 'citizen', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (phone) DO NOTHING;

-- Insert test volunteer applications (various statuses)
INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'volunteer', 'pending', '{"district": "Dhaka", "skills": ["first aid", "rescue"], "motivation": "Want to help disaster victims", "availability": "available"}'::json, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM users u WHERE u.phone = '+8801700000001'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'volunteer' AND ra.status = 'pending');

INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'volunteer', 'pending', '{"district": "Chittagong", "skills": ["medical", "logistics"], "motivation": "Experienced in emergency response", "availability": "available"}'::json, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM users u WHERE u.phone = '+8801700000002'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'volunteer' AND ra.status = 'pending');

INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'volunteer', 'approved', '{"district": "Sylhet", "skills": ["search and rescue"], "motivation": "Ready to serve", "availability": "available"}'::json, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '7 days'
FROM users u WHERE u.phone = '+8801700000003'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'volunteer' AND ra.status = 'approved');

-- Insert test NGO applications (various statuses)
INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'ngo', 'pending', '{"organization_name": "Test Relief Org", "registration_number": "NGO-12345", "contact_person": "Test Citizen D", "contact_phone": "+8801700000004", "address": "Dhaka, Bangladesh", "mission": "Provide disaster relief"}'::json, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM users u WHERE u.phone = '+8801700000004'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'ngo' AND ra.status = 'pending');

INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'ngo', 'pending', '{"organization_name": "Test Aid Foundation", "registration_number": "NGO-67890", "contact_person": "Test Citizen E", "contact_phone": "+8801700000005", "address": "Chittagong, Bangladesh", "mission": "Medical relief during disasters"}'::json, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM users u WHERE u.phone = '+8801700000005'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'ngo' AND ra.status = 'pending');

INSERT INTO role_applications (user_id, requested_role, status, application_payload, created_at, updated_at)
SELECT u.id, 'ngo', 'rejected', '{"organization_name": "Test Incomplete Org", "registration_number": "NGO-11111", "contact_person": "Test Citizen F", "contact_phone": "+8801700000006", "address": "Rajshahi, Bangladesh", "mission": "Water relief"}'::json, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '6 days'
FROM users u WHERE u.phone = '+8801700000006'
AND NOT EXISTS (SELECT 1 FROM role_applications ra WHERE ra.user_id = u.id AND ra.requested_role = 'ngo' AND ra.status = 'rejected');
