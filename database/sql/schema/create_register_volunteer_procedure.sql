CREATE OR REPLACE PROCEDURE register_volunteer_proc(
    p_user_id BIGINT,
    p_skills JSON,
    p_availability VARCHAR,
    p_current_location VARCHAR,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_rating DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO volunteers (
        user_id, 
        skills, 
        availability, 
        current_location, 
        latitude, 
        longitude, 
        rating, 
        created_at, 
        updated_at
    )
    VALUES (
        p_user_id,
        p_skills,
        p_availability,
        p_current_location,
        p_latitude,
        p_longitude,
        p_rating,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
        skills = EXCLUDED.skills,
        availability = EXCLUDED.availability,
        current_location = EXCLUDED.current_location,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        rating = EXCLUDED.rating,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;
