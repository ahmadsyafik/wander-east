-- ============================================================
-- Wander East — ALTER TABLE Script v2
-- Run on existing database to add new columns
-- ============================================================

-- Places: add video & social media columns
ALTER TABLE places ADD video_url VARCHAR2(500);
ALTER TABLE places ADD instagram_url VARCHAR2(500);
ALTER TABLE places ADD tiktok_url VARCHAR2(500);
ALTER TABLE places ADD facebook_url VARCHAR2(500);
ALTER TABLE places ADD website_url VARCHAR2(500);

-- Cities: add center coordinates
ALTER TABLE cities ADD latitude NUMBER(10,7);
ALTER TABLE cities ADD longitude NUMBER(10,7);

-- Update city center coordinates (accurate from Google Maps)
UPDATE cities SET latitude=-7.2575, longitude=112.7521 WHERE slug='surabaya';
UPDATE cities SET latitude=-7.9666, longitude=112.6326 WHERE slug='malang';
UPDATE cities SET latitude=-8.2191, longitude=114.3691 WHERE slug='banyuwangi';
UPDATE cities SET latitude=-7.8672, longitude=112.5239 WHERE slug='batu';
UPDATE cities SET latitude=-8.1845, longitude=113.6681 WHERE slug='jember';
UPDATE cities SET latitude=-7.7543, longitude=113.2159 WHERE slug='probolinggo';

COMMIT;

-- ============================================================
-- Re-create v_place_details view with new columns
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
    p.video_url,
    p.instagram_url,
    p.tiktok_url,
    p.facebook_url,
    p.website_url,
    p.status,
    p.created_at,
    p.updated_at
FROM places p
JOIN cities c ON p.city_id = c.id;

COMMIT;
