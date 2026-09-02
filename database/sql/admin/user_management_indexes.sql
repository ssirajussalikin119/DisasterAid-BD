CREATE INDEX IF NOT EXISTS users_role_status_idx ON users (role_status);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_name_lower_idx ON users (LOWER(name));
