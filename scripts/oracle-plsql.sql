-- ============================================================
-- Wander East — PL/SQL Script (Triggers, Procedures, Functions)
-- Run AFTER oracle-ddl.sql
-- ============================================================

-- ============================================================
-- TRIGGERS
-- ============================================================

-- 1. Auto-update users.updated_at on any update
CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- 2. Auto-update places.updated_at on any update
CREATE OR REPLACE TRIGGER trg_places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- 3. Auto-update place rating & review_count when review is inserted
CREATE OR REPLACE TRIGGER trg_review_after_insert
FOR INSERT ON reviews
COMPOUND TRIGGER
    TYPE t_ids IS TABLE OF NUMBER;
    v_place_ids t_ids := t_ids();
    v_user_ids t_ids := t_ids();

    AFTER EACH ROW IS
    BEGIN
        v_place_ids.EXTEND;
        v_place_ids(v_place_ids.COUNT) := :NEW.place_id;
        v_user_ids.EXTEND;
        v_user_ids(v_user_ids.COUNT) := :NEW.user_id;

        -- Update XP (Safe in row-level)
        UPDATE users
        SET xp = xp + 100,
            user_level = FLOOR((xp + 100) / 500) + 1
        WHERE id = :NEW.user_id;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        FOR i IN 1..v_place_ids.COUNT LOOP
            UPDATE places
            SET (rating, review_count) = (
                SELECT NVL(ROUND(AVG(rating), 1), 0), COUNT(*)
                FROM reviews
                WHERE place_id = v_place_ids(i) AND status = 'approved'
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = v_place_ids(i);
        END LOOP;
    END AFTER STATEMENT;
END;
/

-- 4. Auto-update place rating when review is deleted
CREATE OR REPLACE TRIGGER trg_review_after_delete
FOR DELETE ON reviews
COMPOUND TRIGGER
    TYPE t_ids IS TABLE OF NUMBER;
    v_place_ids t_ids := t_ids();

    AFTER EACH ROW IS
    BEGIN
        v_place_ids.EXTEND;
        v_place_ids(v_place_ids.COUNT) := :OLD.place_id;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        FOR i IN 1..v_place_ids.COUNT LOOP
            UPDATE places
            SET (rating, review_count) = (
                SELECT NVL(ROUND(AVG(rating), 1), 0), COUNT(*)
                FROM reviews
                WHERE place_id = v_place_ids(i) AND status = 'approved'
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = v_place_ids(i);
        END LOOP;
    END AFTER STATEMENT;
END;
/

-- 5. Auto-update city place_count when place is inserted
CREATE OR REPLACE TRIGGER trg_place_after_insert
AFTER INSERT ON places
FOR EACH ROW
BEGIN
    UPDATE cities
    SET place_count = place_count + 1
    WHERE id = :NEW.city_id;
END;
/

-- 6. Auto-update city place_count when place is deleted
CREATE OR REPLACE TRIGGER trg_place_after_delete
AFTER DELETE ON places
FOR EACH ROW
BEGIN
    UPDATE cities
    SET place_count = place_count - 1
    WHERE id = :OLD.city_id;
END;
/

-- 7. Auto-add XP when user checks in (+50 XP)
CREATE OR REPLACE TRIGGER trg_visit_after_insert
AFTER INSERT ON user_visits
FOR EACH ROW
BEGIN
    UPDATE users
    SET xp = xp + 50,
        user_level = FLOOR((xp + 50) / 500) + 1
    WHERE id = :NEW.user_id;
END;
/

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Calculate user level from XP
CREATE OR REPLACE FUNCTION fn_get_user_level(p_xp NUMBER) RETURN NUMBER AS
BEGIN
    RETURN FLOOR(p_xp / 500) + 1;
END;
/

-- Get place average rating
CREATE OR REPLACE FUNCTION fn_get_place_rating(p_place_id NUMBER) RETURN NUMBER AS
    v_rating NUMBER;
BEGIN
    SELECT NVL(ROUND(AVG(rating), 1), 0)
    INTO v_rating
    FROM reviews
    WHERE place_id = p_place_id AND status = 'approved';
    RETURN v_rating;
END;
/

-- ============================================================
-- PROCEDURES
-- ============================================================

-- Award badge to user (if not already awarded)
CREATE OR REPLACE PROCEDURE sp_award_badge(
    p_user_id NUMBER,
    p_badge_id NUMBER
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_badges
    WHERE user_id = p_user_id AND badge_id = p_badge_id;

    IF v_count = 0 THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_user_id, p_badge_id);

        -- Bonus XP for earning a badge (+200 XP)
        UPDATE users
        SET xp = xp + 200,
            user_level = FLOOR((xp + 200) / 500) + 1
        WHERE id = p_user_id;
    END IF;
END;
/

-- Moderate review (approve or reject)
CREATE OR REPLACE PROCEDURE sp_moderate_review(
    p_review_id NUMBER,
    p_action VARCHAR2
) AS
    v_place_id NUMBER;
    v_avg_rating NUMBER;
    v_count NUMBER;
BEGIN
    -- Update review status
    UPDATE reviews SET status = p_action WHERE id = p_review_id;

    -- Get the place_id
    SELECT place_id INTO v_place_id FROM reviews WHERE id = p_review_id;

    -- Recalculate place rating
    SELECT NVL(ROUND(AVG(rating), 1), 0), COUNT(*)
    INTO v_avg_rating, v_count
    FROM reviews
    WHERE place_id = v_place_id AND status = 'approved';

    UPDATE places
    SET rating = v_avg_rating,
        review_count = v_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_place_id;
END;
/

-- Update user achievement progress
CREATE OR REPLACE PROCEDURE sp_update_achievement_progress(
    p_user_id NUMBER,
    p_achievement_type VARCHAR2
) AS
    v_progress NUMBER;
BEGIN
    -- Calculate current progress based on type
    IF p_achievement_type = 'visits' THEN
        SELECT COUNT(*) INTO v_progress
        FROM user_visits WHERE user_id = p_user_id;
    ELSIF p_achievement_type = 'reviews' THEN
        SELECT COUNT(*) INTO v_progress
        FROM reviews WHERE user_id = p_user_id;
    ELSIF p_achievement_type = 'cities' THEN
        SELECT COUNT(DISTINCT p.city_id) INTO v_progress
        FROM user_visits uv
        JOIN places p ON uv.place_id = p.id
        WHERE uv.user_id = p_user_id;
    END IF;

    -- Update or insert user_achievements for matching achievements
    MERGE INTO user_achievements ua
    USING (
        SELECT id AS achievement_id, requirement
        FROM achievements
        WHERE type = p_achievement_type
    ) a
    ON (ua.user_id = p_user_id AND ua.achievement_id = a.achievement_id)
    WHEN MATCHED THEN
        UPDATE SET
            current_progress = v_progress,
            is_unlocked = CASE WHEN v_progress >= a.requirement THEN 1 ELSE 0 END,
            unlocked_at = CASE
                WHEN v_progress >= a.requirement AND ua.is_unlocked = 0 THEN CURRENT_TIMESTAMP
                ELSE ua.unlocked_at
            END
    WHEN NOT MATCHED THEN
        INSERT (user_id, achievement_id, current_progress, is_unlocked, unlocked_at)
        VALUES (
            p_user_id, a.achievement_id, v_progress,
            CASE WHEN v_progress >= a.requirement THEN 1 ELSE 0 END,
            CASE WHEN v_progress >= a.requirement THEN CURRENT_TIMESTAMP ELSE NULL END
        );
END;
/

COMMIT;
