-- ============================================================
-- Wander East — Views Script
-- Run AFTER oracle-ddl.sql and oracle-plsql.sql
-- ============================================================

-- ============================================================
-- 1. User Stats View
-- Combines user data with aggregated stats
-- ============================================================
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
    u.id,
    u.name,
    u.email,
    u.avatar_url,
    u.user_level,
    u.xp,
    u.role,
    u.is_banned,
    u.created_at,
    (SELECT COUNT(*) FROM user_visits WHERE user_id = u.id) AS places_visited,
    (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_written,
    (SELECT COUNT(*) FROM review_photos rp
     JOIN reviews r ON rp.review_id = r.id
     WHERE r.user_id = u.id) AS photos_shared,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badge_count
FROM users u;

-- ============================================================
-- 2. Place Details View
-- Combines place data with city name
-- ============================================================
CREATE OR REPLACE VIEW v_place_details AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.long_description,
    p.category,
    p.city_id,
    c.name AS city_name,
    c.slug AS city_slug,
    p.image_url,
    p.rating,
    p.review_count,
    p.address,
    p.latitude,
    p.longitude,
    p.operational_hours,
    p.price_range,
    p.estimated_duration,
    p.difficulty,
    p.is_must_visit,
    p.google_place_id,
    p.status,
    p.created_at,
    p.updated_at
FROM places p
JOIN cities c ON p.city_id = c.id;

-- ============================================================
-- 3. Leaderboard View
-- Ranks users by XP (excluding admin and banned users)
-- ============================================================
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
    u.id,
    u.name,
    u.avatar_url,
    u.user_level,
    u.xp,
    (SELECT COUNT(*) FROM user_visits WHERE user_id = u.id) AS places_visited,
    (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_written,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badge_count,
    ROW_NUMBER() OVER (ORDER BY u.xp DESC) AS rank_position
FROM users u
WHERE u.role = 'user' AND u.is_banned = 0;

-- ============================================================
-- 4. Admin Dashboard Stats View
-- Aggregate statistics for admin dashboard
-- ============================================================
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
    (SELECT COUNT(*) FROM places WHERE status = 'active') AS total_places,
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    (SELECT COUNT(*) FROM user_visits) AS total_checkins,
    (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30' DAY) AS new_users_30d,
    (SELECT COUNT(*) FROM reviews WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30' DAY) AS new_reviews_30d,
    (SELECT COUNT(*) FROM places WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30' DAY) AS new_places_30d
FROM DUAL;

COMMIT;
