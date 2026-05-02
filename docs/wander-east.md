# 🧭 Wander East — Implementation Plan (Final)

## Keputusan Final

| Aspek | Keputusan |
|-------|-----------|
| **Backend** | Next.js API Routes (`app/api/`) — tanpa Express.js terpisah |
| **Database** | Oracle Database via raw `node-oracledb` (Thin mode) |
| **Data Source** | Google Places API (New) untuk fetch data wisata/kuliner real |
| **ORM** | Tidak pakai ORM — raw SQL queries langsung ke Oracle |
| **Auth** | Cookie-based session (bcrypt + JWT token di cookie) |

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
│                                                              │
│  ┌──────────────────┐       ┌──────────────────────────┐    │
│  │   React Pages     │◄─────►│   API Routes (app/api/)  │    │
│  │   (Client-side)   │ fetch │   (Server-side Node.js)  │    │
│  └──────────────────┘       └──────┬───────────┬───────┘    │
│                                     │           │            │
└─────────────────────────────────────┼───────────┼────────────┘
                                      │           │
                           ┌──────────▼──┐  ┌─────▼──────────────┐
                           │ Oracle DB    │  │ Google Places API   │
                           │ (oracledb)   │  │ (New / v1)          │
                           │              │  │                     │
                           │ • Tables     │  │ • Text Search       │
                           │ • Sequences  │  │ • Place Details     │
                           │ • Triggers   │  │ • Place Photos      │
                           │ • PL/SQL     │  │ • Nearby Search     │
                           │ • Views      │  └─────────────────────┘
                           └──────────────┘
```

---

## 📦 Tech Stack Detail

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | UI/SSR *(sudah ada)* |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Design system *(sudah ada)* |
| **Backend** | Next.js API Routes | REST API endpoints |
| **Database** | Oracle DB + `oracledb` npm | Data persistence |
| **External API** | Google Places API (New) | Real-world place data |
| **Auth** | `bcryptjs` + `jose` (JWT) | Password hashing + token |
| **Maps** | Leaflet + CARTO tiles | Interactive map *(sudah ada)* |

---

## 📁 File Structure — New/Modified

```
wander-east/
├── .env.local                          # [NEW] Environment variables
├── next.config.mjs                     # [MODIFY] Add serverExternalPackages
│
├── lib/
│   ├── db.ts                           # [NEW] Oracle connection pool (singleton)
│   ├── google-places.ts                # [NEW] Google Places API client
│   ├── auth.ts                         # [NEW] JWT + bcrypt utilities
│   ├── data.ts                         # [KEEP] Fallback data
│   ├── types.ts                        # [MODIFY] Add DB-related types
│   └── utils.ts                        # [KEEP] Existing utilities
│
├── scripts/
│   ├── oracle-ddl.sql                  # [NEW] CREATE TABLE, SEQUENCE, etc.
│   ├── oracle-plsql.sql               # [NEW] PROCEDURE, FUNCTION, TRIGGER
│   ├── oracle-views.sql               # [NEW] CREATE VIEW
│   ├── oracle-seed.sql                 # [NEW] INSERT seed data
│   └── seed-from-google.ts            # [NEW] Fetch Google Places → INSERT to Oracle
│
├── app/api/
│   ├── auth/
│   │   ├── login/route.ts              # [NEW] POST — login
│   │   ├── register/route.ts           # [NEW] POST — register
│   │   ├── logout/route.ts             # [NEW] POST — logout
│   │   └── me/route.ts                 # [NEW] GET — current user
│   ├── places/
│   │   ├── route.ts                    # [NEW] GET — list places (filter/search)
│   │   ├── [id]/
│   │   │   ├── route.ts                # [NEW] GET/PUT/DELETE — single place
│   │   │   └── reviews/route.ts        # [NEW] GET/POST — reviews for place
│   │   └── search/route.ts             # [NEW] GET — search via Google Places API
│   ├── cities/
│   │   └── route.ts                    # [NEW] GET — list cities
│   ├── users/
│   │   ├── route.ts                    # [NEW] GET — list users (admin)
│   │   └── [id]/route.ts              # [NEW] GET/PUT/DELETE — manage user
│   ├── reviews/
│   │   ├── route.ts                    # [NEW] GET — all reviews (admin)
│   │   └── [id]/route.ts              # [NEW] PUT/DELETE — moderate review
│   ├── leaderboard/
│   │   └── route.ts                    # [NEW] GET — leaderboard
│   ├── gamification/
│   │   ├── checkin/route.ts            # [NEW] POST — check-in to place
│   │   └── achievements/route.ts       # [NEW] GET — user achievements
│   └── admin/
│       └── stats/route.ts              # [NEW] GET — dashboard stats
│
├── app/
│   ├── page.tsx                        # [MODIFY] Fetch from API
│   ├── explore/page.tsx                # [MODIFY] Fetch from API
│   ├── destination/[slug]/page.tsx     # [MODIFY] Fetch from API
│   ├── map/page.tsx                    # [MODIFY] Fetch from API
│   ├── profile/page.tsx                # [MODIFY] Fetch from API
│   ├── login/page.tsx                  # [MODIFY] Real auth
│   ├── register/page.tsx               # [MODIFY] Real auth
│   ├── leaderboard/page.tsx            # [MODIFY] Fetch from API
│   └── admin/
│       ├── page.tsx                    # [MODIFY] Real stats from DB
│       ├── places/page.tsx             # [MODIFY] Real CRUD
│       ├── users/page.tsx              # [MODIFY] Real user management
│       └── reviews/page.tsx            # [MODIFY] Real review moderation
```

---

## 🗄️ Oracle Database Schema

### Tables

```sql
-- 1. USERS
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    avatar_url VARCHAR2(500),
    level NUMBER DEFAULT 1,
    xp NUMBER DEFAULT 0,
    role VARCHAR2(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_banned NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CITIES
CREATE TABLE cities (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    slug VARCHAR2(100) NOT NULL UNIQUE,
    image_url VARCHAR2(500),
    description CLOB,
    place_count NUMBER DEFAULT 0
);

-- 3. PLACES
CREATE TABLE places (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(200) NOT NULL,
    slug VARCHAR2(200) NOT NULL UNIQUE,
    description CLOB,
    long_description CLOB,
    category VARCHAR2(20) CHECK (category IN ('wisata', 'kuliner')),
    city_id NUMBER REFERENCES cities(id),
    image_url VARCHAR2(500),
    rating NUMBER(2,1) DEFAULT 0,
    review_count NUMBER DEFAULT 0,
    address VARCHAR2(500),
    latitude NUMBER(10,7),
    longitude NUMBER(10,7),
    operational_hours VARCHAR2(100),
    price_range VARCHAR2(100),
    estimated_duration VARCHAR2(100),
    difficulty VARCHAR2(50),
    is_must_visit NUMBER(1) DEFAULT 0,
    google_place_id VARCHAR2(255),        -- Link to Google Places
    status VARCHAR2(20) DEFAULT 'active' CHECK (status IN ('active','pending','rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PLACE_GALLERY
CREATE TABLE place_gallery (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR2(500) NOT NULL,
    sort_order NUMBER DEFAULT 0
);

-- 5. PLACE_TAGS
CREATE TABLE place_tags (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    tag_name VARCHAR2(50) NOT NULL
);

-- 6. REVIEWS
CREATE TABLE reviews (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    rating NUMBER(1) CHECK (rating BETWEEN 1 AND 5),
    comment CLOB,
    status VARCHAR2(20) DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. REVIEW_PHOTOS
CREATE TABLE review_photos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id NUMBER REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR2(500) NOT NULL
);

-- 8. BADGES
CREATE TABLE badges (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    icon VARCHAR2(10)
);

-- 9. USER_BADGES
CREATE TABLE user_badges (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    badge_id NUMBER REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- 10. ACHIEVEMENTS
CREATE TABLE achievements (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    icon VARCHAR2(10),
    requirement NUMBER NOT NULL,
    type VARCHAR2(30) CHECK (type IN ('visits','reviews','photos','cities'))
);

-- 11. USER_ACHIEVEMENTS
CREATE TABLE user_achievements (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id NUMBER REFERENCES achievements(id) ON DELETE CASCADE,
    current_progress NUMBER DEFAULT 0,
    is_unlocked NUMBER(1) DEFAULT 0,
    unlocked_at TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- 12. USER_VISITS (Check-ins)
CREATE TABLE user_visits (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. USER_FAVORITES
CREATE TABLE user_favorites (
    user_id NUMBER REFERENCES users(id) ON DELETE CASCADE,
    place_id NUMBER REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, place_id)
);
```

### Triggers

```sql
-- Auto-update place rating when review is inserted/deleted
CREATE OR REPLACE TRIGGER trg_update_place_rating
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE places SET
            rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE place_id = :NEW.place_id AND status = 'approved'),
            review_count = (SELECT COUNT(*) FROM reviews WHERE place_id = :NEW.place_id AND status = 'approved'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :NEW.place_id;
    ELSIF DELETING THEN
        UPDATE places SET
            rating = NVL((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE place_id = :OLD.place_id AND status = 'approved'), 0),
            review_count = (SELECT COUNT(*) FROM reviews WHERE place_id = :OLD.place_id AND status = 'approved'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :OLD.place_id;
    END IF;
END;
/

-- Auto-update city place_count when place is inserted/deleted
CREATE OR REPLACE TRIGGER trg_update_city_place_count
AFTER INSERT OR DELETE ON places
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE cities SET place_count = place_count + 1 WHERE id = :NEW.city_id;
    ELSIF DELETING THEN
        UPDATE cities SET place_count = place_count - 1 WHERE id = :OLD.city_id;
    END IF;
END;
/

-- Auto-add XP when user checks in
CREATE OR REPLACE TRIGGER trg_add_xp_on_visit
AFTER INSERT ON user_visits
FOR EACH ROW
BEGIN
    UPDATE users SET
        xp = xp + 50,
        level = FLOOR((xp + 50) / 500) + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = :NEW.user_id;
END;
/

-- Auto-add XP when user writes review
CREATE OR REPLACE TRIGGER trg_add_xp_on_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE users SET
        xp = xp + 100,
        level = FLOOR((xp + 100) / 500) + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = :NEW.user_id;
END;
/

-- Auto-set updated_at on user update
CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/
```

### PL/SQL Procedures & Functions

```sql
-- Award badge to user
CREATE OR REPLACE PROCEDURE sp_award_badge(
    p_user_id NUMBER,
    p_badge_id NUMBER
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id;

    IF v_count = 0 THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, p_badge_id);
        UPDATE users SET xp = xp + 200, updated_at = CURRENT_TIMESTAMP WHERE id = p_user_id;
    END IF;
END;
/

-- Moderate review (approve/reject)
CREATE OR REPLACE PROCEDURE sp_moderate_review(
    p_review_id NUMBER,
    p_action VARCHAR2  -- 'approved' or 'rejected'
) AS
BEGIN
    UPDATE reviews SET status = p_action WHERE id = p_review_id;
    -- Recalculate rating if approved
    IF p_action = 'approved' THEN
        UPDATE places SET
            rating = (SELECT ROUND(AVG(rating), 1) FROM reviews
                      WHERE place_id = (SELECT place_id FROM reviews WHERE id = p_review_id)
                      AND status = 'approved'),
            review_count = (SELECT COUNT(*) FROM reviews
                           WHERE place_id = (SELECT place_id FROM reviews WHERE id = p_review_id)
                           AND status = 'approved')
        WHERE id = (SELECT place_id FROM reviews WHERE id = p_review_id);
    END IF;
END;
/

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
    SELECT ROUND(AVG(rating), 1) INTO v_rating
    FROM reviews WHERE place_id = p_place_id AND status = 'approved';
    RETURN NVL(v_rating, 0);
END;
/
```

### Views

```sql
-- User stats view
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
    u.id, u.name, u.email, u.avatar_url, u.level, u.xp, u.role, u.is_banned, u.created_at,
    (SELECT COUNT(*) FROM user_visits WHERE user_id = u.id) AS places_visited,
    (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_written,
    (SELECT COUNT(*) FROM review_photos rp JOIN reviews r ON rp.review_id = r.id WHERE r.user_id = u.id) AS photos_shared,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badge_count
FROM users u;

-- Place details view
CREATE OR REPLACE VIEW v_place_details AS
SELECT
    p.*, c.name AS city_name, c.slug AS city_slug
FROM places p
JOIN cities c ON p.city_id = c.id;

-- Leaderboard view
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
    u.id, u.name, u.avatar_url, u.level, u.xp,
    (SELECT COUNT(*) FROM user_visits WHERE user_id = u.id) AS places_visited,
    (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_written,
    ROW_NUMBER() OVER (ORDER BY u.xp DESC) AS rank
FROM users u
WHERE u.role = 'user' AND u.is_banned = 0;

-- Admin dashboard stats view
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM places WHERE status = 'active') AS total_places,
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    (SELECT COUNT(*) FROM user_visits) AS total_checkins,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30' DAY) AS new_users_30d,
    (SELECT COUNT(*) FROM reviews WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30' DAY) AS new_reviews_30d
FROM DUAL;
```

---

## 🌐 Google Places API Integration

### Strategy

Google Places API digunakan untuk **2 tujuan**:

1. **Seed Data (one-time script)** — Fetch tempat wisata & kuliner Jawa Timur ke Oracle DB
2. **Live Search (opsional)** — User bisa cari tempat baru yang belum ada di database

### Endpoints yang Dipakai

| Endpoint | Kegunaan | Billing |
|----------|---------|---------|
| **Text Search** (`searchText`) | Cari "wisata Malang", "kuliner Surabaya" | ~$32/1000 req |
| **Place Details** (`getPlace`) | Ambil detail lengkap dari place_id | ~$17/1000 req |
| **Place Photos** (`getPhotoMedia`) | Ambil foto tempat | ~$7/1000 req |

### Seed Script Flow

```
1. Untuk setiap kota di Jawa Timur (Surabaya, Malang, Batu, dll):
   a. Text Search: "wisata populer di {kota}"
   b. Text Search: "kuliner terkenal di {kota}"
   c. Untuk setiap result:
      - Get Place Details (foto, rating, alamat, jam buka, dll)
      - INSERT ke Oracle database
      - Simpan google_place_id untuk referensi
2. Total estimasi: ~100-200 API calls (masih dalam free trial $200 credit)
```

### API Key Security

> [!CAUTION]
> API key disimpan di `.env.local` dan **JANGAN pernah di-commit ke Git**. 
> File `.env.local` sudah otomatis di-ignore oleh Next.js.

---

## 🔐 Authentication Flow

```
Register:
  1. User submit form → POST /api/auth/register
  2. Server hash password (bcrypt) → INSERT ke Oracle
  3. Server buat JWT token → Set cookie httpOnly
  4. Redirect ke /explore

Login:
  1. User submit form → POST /api/auth/login
  2. Server query Oracle → compare bcrypt hash
  3. Server buat JWT token → Set cookie httpOnly
  4. Redirect ke /explore (atau /admin jika role=admin)

Protected Routes:
  1. API Route baca cookie → verify JWT
  2. Jika valid → lanjut
  3. Jika invalid → 401 Unauthorized
```

---

## 📋 Implementation Phases

### Phase 1: Foundation Setup
- [ ] Install dependencies (`oracledb`, `bcryptjs`, `jose`)
- [ ] Create `.env.local` with Oracle credentials + Google API key
- [ ] Update `next.config.mjs` (serverExternalPackages)
- [ ] Create `lib/db.ts` (Oracle connection pool singleton)
- [ ] Create `lib/google-places.ts` (Google Places API client)
- [ ] Create `lib/auth.ts` (JWT + bcrypt utilities)

### Phase 2: Oracle Schema
- [ ] Write DDL script (`scripts/oracle-ddl.sql`)
- [ ] Write triggers (`scripts/oracle-plsql.sql`)
- [ ] Write views (`scripts/oracle-views.sql`)
- [ ] Execute scripts on Oracle DB

### Phase 3: Seed Data
- [ ] Create seed script (`scripts/seed-from-google.ts`)
- [ ] Fetch wisata data from Google Places API → Oracle
- [ ] Fetch kuliner data from Google Places API → Oracle
- [ ] Seed badges, achievements, default admin user
- [ ] Verify data in Oracle

### Phase 4: API Routes — Auth
- [ ] POST `/api/auth/register` — Register new user
- [ ] POST `/api/auth/login` — Login user  
- [ ] POST `/api/auth/logout` — Logout user
- [ ] GET `/api/auth/me` — Get current user

### Phase 5: API Routes — Core Data
- [ ] GET `/api/cities` — List all cities
- [ ] GET `/api/places` — List places (filter: city, category, search)
- [ ] GET `/api/places/[id]` — Place detail
- [ ] GET `/api/places/[id]/reviews` — Reviews for a place
- [ ] POST `/api/places/[id]/reviews` — Write review
- [ ] GET `/api/places/search` — Search via Google Places API

### Phase 6: API Routes — Gamification
- [ ] POST `/api/gamification/checkin` — Check-in to place
- [ ] GET `/api/gamification/achievements` — User achievements
- [ ] GET `/api/leaderboard` — Leaderboard

### Phase 7: API Routes — Admin
- [ ] GET `/api/admin/stats` — Dashboard statistics
- [ ] GET/POST `/api/places` — CRUD places (admin)
- [ ] PUT/DELETE `/api/places/[id]` — Edit/delete places
- [ ] GET `/api/users` — List all users
- [ ] PUT `/api/users/[id]` — Ban/promote user
- [ ] GET `/api/reviews` — All reviews (admin)
- [ ] PUT `/api/reviews/[id]` — Moderate review

### Phase 8: Frontend Integration
- [ ] Replace static imports with API fetch calls
- [ ] Implement real login/register flow
- [ ] Implement real admin CRUD operations
- [ ] Implement check-in & review write flow
- [ ] Implement real leaderboard

### Phase 9: Polish
- [ ] Error handling & loading states
- [ ] Testing all flows end-to-end
- [ ] Documentation (ERD, DDL scripts, etc.)

---

## ❓ Open Questions (Perlu Jawaban Sebelum Mulai)

> [!IMPORTANT]
> **1. Oracle Database Environment**
> Apakah kamu sudah punya Oracle Database yang bisa dipakai? Opsi:
> - **Oracle Cloud Free Tier** (Autonomous DB) — gratis, cloud-based
> - **Oracle XE (Express Edition)** — gratis, install di lokal
> - **Docker** (`container-registry.oracle.com/database/express`)
> 
> Saya perlu **connection string** untuk bisa setup `lib/db.ts`.

> [!IMPORTANT]
> **2. Google Cloud Console**
> Apakah API key yang diberikan sudah **mengaktifkan Places API (New)**?
> Pastikan di Google Cloud Console → APIs & Services → Library → cari "Places API (New)" → Enable.

> [!WARNING]
> **3. Mulai dari phase mana?**
> Apakah kamu sudah siap dengan Oracle DB (sudah terinstall), atau kita perlu setup dari nol?
