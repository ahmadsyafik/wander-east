-- ============================================================
-- Wander East — Schema Alterations v3
-- Notifications System
-- Run AFTER oracle-alter-v2.sql
-- ============================================================

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR2(500) NOT NULL,
    notif_type VARCHAR2(30) DEFAULT 'info' CHECK (notif_type IN ('info', 'achievement', 'badge', 'review', 'level_up', 'checkin')),
    is_read NUMBER(1) DEFAULT 0,
    link VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user_id ON notifications(user_id);
CREATE INDEX idx_notif_is_read ON notifications(is_read);

-- ============================================================
-- TRIGGER: Notification on level up (when XP changes)
-- ============================================================
CREATE OR REPLACE TRIGGER trg_user_level_up
AFTER UPDATE OF xp ON users
FOR EACH ROW
WHEN (NEW.user_level > OLD.user_level)
BEGIN
    INSERT INTO notifications (user_id, message, notif_type, link)
    VALUES (:NEW.id, 'Selamat! Kamu naik ke Level ' || :NEW.user_level || '! 🎉', 'level_up', '/profile');
END;
/

-- ============================================================
-- TRIGGER: Notification when badge is earned
-- ============================================================
CREATE OR REPLACE TRIGGER trg_badge_notification
AFTER INSERT ON user_badges
FOR EACH ROW
DECLARE
    v_badge_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_badge_name FROM badges WHERE id = :NEW.badge_id;
    INSERT INTO notifications (user_id, message, notif_type, link)
    VALUES (:NEW.user_id, 'Badge baru: ' || v_badge_name || ' unlocked! 🏅', 'badge', '/achievements');
END;
/

-- ============================================================
-- TRIGGER: Notification when review is approved
-- ============================================================
CREATE OR REPLACE TRIGGER trg_review_approved_notification
AFTER UPDATE OF status ON reviews
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
DECLARE
    v_place_name VARCHAR2(200);
BEGIN
    SELECT name INTO v_place_name FROM places WHERE id = :NEW.place_id;
    INSERT INTO notifications (user_id, message, notif_type, link)
    VALUES (:NEW.user_id, 'Review kamu di ' || v_place_name || ' telah disetujui! ✅', 'review', '/destination/' || (SELECT slug FROM places WHERE id = :NEW.place_id));
END;
/

-- ============================================================
-- TRIGGER: Notification on check-in
-- ============================================================
CREATE OR REPLACE TRIGGER trg_checkin_notification
AFTER INSERT ON user_visits
FOR EACH ROW
DECLARE
    v_place_name VARCHAR2(200);
BEGIN
    SELECT name INTO v_place_name FROM places WHERE id = :NEW.place_id;
    INSERT INTO notifications (user_id, message, notif_type, link)
    VALUES (:NEW.user_id, 'Check-in berhasil di ' || v_place_name || '! +50 XP 📍', 'checkin', '/profile');
END;
/

COMMIT;
