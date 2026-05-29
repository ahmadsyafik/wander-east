-- ============================================================
-- Wander East — Seed Data Script
-- Run AFTER oracle-ddl.sql, oracle-plsql.sql, oracle-views.sql
-- ============================================================

-- Disable SQL*Plus substitution variables (& interpretation)
SET DEFINE OFF

-- ============================================================
-- SEED CITIES
-- ============================================================
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Surabaya', 'surabaya',
    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
    'Kota Pahlawan dengan kuliner legendaris dan wisata sejarah'
);
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Malang', 'malang',
    'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=800&q=80',
    'Kota sejuk dengan pemandangan alam dan kuliner khas'
);
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Banyuwangi', 'banyuwangi',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80',
    'The Sunrise of Java dengan keindahan alam eksotis'
);
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Batu', 'batu',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
    'Kota wisata dengan berbagai wahana dan agrowisata'
);
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Jember', 'jember',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'Kota karnaval dengan pantai dan pegunungan indah'
);
INSERT INTO cities (name, slug, image_url, description) VALUES (
    'Probolinggo', 'probolinggo',
    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
    'Gerbang menuju Gunung Bromo yang megah'
);

-- ============================================================
-- SEED ADMIN USER (password: admin123)
-- bcrypt hash for 'admin123'
-- ============================================================
INSERT INTO users (name, email, password_hash, avatar_url, user_level, xp, role) VALUES (
    'Admin Wander',
    'admin@wandereast.com',
    '$2b$12$BTogcS1KdI0SeNwiNBFZSegjagme1zuhX8u23kmJbozCNvrcu0NpS',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    99, 99999, 'admin'
);

-- ============================================================
-- SEED DEMO USER (password: password123)
-- bcrypt hash for 'password123'
-- ============================================================
INSERT INTO users (name, email, password_hash, avatar_url, user_level, xp, role) VALUES (
    'Budi Explorer',
    'user@example.com',
    '$2b$12$uhZo4pQ76fNZyeYKpw8mi.AWNxOzH4qwZSfx7y4q/mfxbH9ruG9fi',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    12, 2450, 'user'
);

-- ============================================================
-- SEED BADGES (using text labels instead of emojis for Oracle VARCHAR2 compatibility)
-- ============================================================
INSERT INTO badges (name, description, icon) VALUES ('Surabaya Foodie', 'Visited 10 culinary spots in Surabaya', 'FOOD');
INSERT INTO badges (name, description, icon) VALUES ('Mountain King', 'Conquered 5 mountains in East Java', 'MTN');
INSERT INTO badges (name, description, icon) VALUES ('Night Owl', 'Visited 3 night destinations', 'NIGHT');
INSERT INTO badges (name, description, icon) VALUES ('Beach Lover', 'Explored 10 beaches', 'BEACH');
INSERT INTO badges (name, description, icon) VALUES ('Explorer', 'Visited all 6 major cities', 'EXPLORE');
INSERT INTO badges (name, description, icon) VALUES ('Mist Weaver', 'Visited 5 waterfalls', 'WATER');
INSERT INTO badges (name, description, icon) VALUES ('Cascade Seeker', 'Found 3 hidden waterfalls', 'CASCADE');

-- ============================================================
-- SEED ACHIEVEMENTS
-- ============================================================
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('First Steps', 'Visit your first destination', 'STEPS', 1, 'visits', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Explorer', 'Visit 10 destinations', 'MAP', 10, 'visits', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Adventurer', 'Visit 25 destinations', 'SUMMIT', 25, 'visits', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Reviewer', 'Write 5 reviews', 'WRITE', 5, 'reviews', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Critic', 'Write 20 reviews', 'CRITIC', 20, 'reviews', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('City Hopper', 'Visit places in 3 different cities', 'BUS', 3, 'cities', 'Tourism');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('East Java Master', 'Visit places in all 6 cities', 'TROPHY', 6, 'cities', 'Tourism');

-- Culinary Achievements
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Foodie Beginner', 'Visit 2 culinary spots', 'FOOD', 2, 'visits', 'Culinary');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Culinary Expert', 'Write 5 reviews for culinary spots', 'TASTE', 5, 'reviews', 'Culinary');
INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Surabaya Foodie', 'Visit 5 culinary spots in Surabaya', 'NOODLE', 5, 'visits', 'Culinary');

COMMIT;
