-- ============================================================
-- Wander East — Oracle DDL Script
-- Run this script to create all tables
-- ============================================================

-- Drop existing tables (in reverse dependency order)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE review_photos CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE reviews CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE user_favorites CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE user_visits CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE user_achievements CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE user_badges CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE achievements CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE badges CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE place_tags CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE place_gallery CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE places CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE cities CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- Drop views
BEGIN EXECUTE IMMEDIATE 'DROP VIEW v_user_stats'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW v_place_details'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW v_leaderboard'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW v_admin_stats'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    avatar_url VARCHAR2(500),
    user_level NUMBER DEFAULT 1,
    xp NUMBER DEFAULT 0,
    role VARCHAR2(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_banned NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. CITIES TABLE
-- ============================================================
CREATE TABLE cities (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    slug VARCHAR2(100) NOT NULL UNIQUE,
    image_url VARCHAR2(500),
    description CLOB,
    place_count NUMBER DEFAULT 0
);

CREATE INDEX idx_cities_slug ON cities(slug);

-- ============================================================
-- 3. PLACES TABLE
-- ============================================================
CREATE TABLE places (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(200) NOT NULL,
    slug VARCHAR2(200) NOT NULL UNIQUE,
    description CLOB,
    long_description CLOB,
    category VARCHAR2(20) CHECK (category IN ('wisata', 'kuliner')),
    city_id NUMBER REFERENCES cities(id),
    image_url VARCHAR2(500),
    rating NUMBER(3,1) DEFAULT 0,
    review_count NUMBER DEFAULT 0,
    address VARCHAR2(500),
    latitude NUMBER(10,7),
    longitude NUMBER(10,7),
    operational_hours VARCHAR2(100),
    price_range VARCHAR2(100),
    estimated_duration VARCHAR2(100),
    difficulty VARCHAR2(50),
    is_must_visit NUMBER(1) DEFAULT 0,
    google_place_id VARCHAR2(255),
    status VARCHAR2(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_city_id ON places(city_id);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_google_id ON places(google_place_id);

-- ============================================================
-- 4. PLACE_GALLERY TABLE
-- ============================================================
CREATE TABLE place_gallery (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR2(500) NOT NULL,
    sort_order NUMBER DEFAULT 0
);

CREATE INDEX idx_gallery_place_id ON place_gallery(place_id);

-- ============================================================
-- 5. PLACE_TAGS TABLE
-- ============================================================
CREATE TABLE place_tags (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    tag_name VARCHAR2(50) NOT NULL
);

CREATE INDEX idx_tags_place_id ON place_tags(place_id);

-- ============================================================
-- 6. REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    rating NUMBER(1) CHECK (rating BETWEEN 1 AND 5),
    review_comment CLOB,
    status VARCHAR2(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ============================================================
-- 7. REVIEW_PHOTOS TABLE
-- ============================================================
CREATE TABLE review_photos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id NUMBER REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR2(500) NOT NULL
);

CREATE INDEX idx_review_photos_review_id ON review_photos(review_id);

-- ============================================================
-- 8. BADGES TABLE
-- ============================================================
CREATE TABLE badges (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    icon VARCHAR2(10)
);

-- ============================================================
-- 9. USER_BADGES TABLE
-- ============================================================
CREATE TABLE user_badges (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    badge_id NUMBER REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- 10. ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE achievements (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    icon VARCHAR2(10),
    requirement NUMBER NOT NULL,
    type VARCHAR2(30) CHECK (type IN ('visits', 'reviews', 'photos', 'cities')),
    category VARCHAR2(20) DEFAULT 'Tourism' CHECK (category IN ('Tourism', 'Culinary'))
);

-- ============================================================
-- 11. USER_ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE user_achievements (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id NUMBER REFERENCES achievements(id) ON DELETE CASCADE,
    current_progress NUMBER DEFAULT 0,
    is_unlocked NUMBER(1) DEFAULT 0,
    unlocked_at TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================
-- 12. USER_VISITS TABLE (Check-ins)
-- ============================================================
CREATE TABLE user_visits (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_visits_place_id ON user_visits(place_id);

-- ============================================================
-- 13. USER_FAVORITES TABLE
-- ============================================================
CREATE TABLE user_favorites (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, place_id)
);

COMMIT;
