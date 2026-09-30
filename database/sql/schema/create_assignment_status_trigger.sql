CREATE OR REPLACE FUNCTION trigger_update_volunteer_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- If an assignment status changes to completed or cancelled, 
    -- the volunteer becomes available again
    IF NEW.status IN ('completed', 'cancelled') THEN
        UPDATE volunteers 
        SET availability = 'available',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.volunteer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assignment_status_update ON assignments;

CREATE TRIGGER trigger_assignment_status_update
AFTER UPDATE OF status ON assignments
FOR EACH ROW
EXECUTE FUNCTION trigger_update_volunteer_availability();
