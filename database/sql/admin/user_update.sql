UPDATE users
SET name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING id, name, email, phone, role, role_status AS status,
          phone_verified_at, email_verified_at, created_at, updated_at;
