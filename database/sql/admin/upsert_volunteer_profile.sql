INSERT INTO volunteers (user_id, skills, availability, created_at, updated_at)
VALUES (?, ?::json, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO UPDATE SET
    skills = EXCLUDED.skills,
    availability = EXCLUDED.availability,
    updated_at = CURRENT_TIMESTAMP;
