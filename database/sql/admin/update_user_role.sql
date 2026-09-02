UPDATE users
SET role = ?, role_status = 'active', updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
