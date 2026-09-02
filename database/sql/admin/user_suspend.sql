UPDATE users
SET role_status = 'inactive', updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND role_status = 'active'
RETURNING id, name, email, phone, role, role_status AS status,
          phone_verified_at, email_verified_at, created_at, updated_at;
