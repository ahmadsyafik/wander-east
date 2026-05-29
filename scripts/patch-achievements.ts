import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log('Connected to Oracle Database');

    // 1. Add category column
    try {
      await connection.execute(`ALTER TABLE achievements ADD category VARCHAR2(20) DEFAULT 'Tourism' CHECK (category IN ('Tourism', 'Culinary'))`);
      console.log('Added category column');
    } catch (e: any) {
      if (!e.message.includes('ORA-01430')) { // Ignore if column already exists
        throw e;
      }
      console.log('Column category already exists');
    }

    // 2. Insert Culinary achievements (if not exist)
    const sqls = [
      `BEGIN
         INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Foodie Beginner', 'Visit 2 culinary spots', 'FOOD', 2, 'visits', 'Culinary');
         INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Culinary Expert', 'Write 5 reviews for culinary spots', 'TASTE', 5, 'reviews', 'Culinary');
         INSERT INTO achievements (name, description, icon, requirement, type, category) VALUES ('Surabaya Foodie', 'Visit 5 culinary spots in Surabaya', 'NOODLE', 5, 'visits', 'Culinary');
       EXCEPTION
         WHEN DUP_VAL_ON_INDEX THEN NULL;
       END;`
    ];

    for (const sql of sqls) {
      await connection.execute(sql);
    }
    await connection.commit();
    console.log('Inserted Culinary achievements');

    // 3. Update PLSQL
    const plsql = `
CREATE OR REPLACE PROCEDURE sp_update_achievement_progress(
    p_user_id NUMBER,
    p_achievement_type VARCHAR2
) AS
BEGIN
    -- Update or insert user_achievements for matching achievements
    MERGE INTO user_achievements ua
    USING (
        SELECT a.id AS achievement_id, a.requirement,
               (CASE 
                  WHEN a.type = 'visits' THEN
                    (SELECT COUNT(*) FROM user_visits uv 
                     JOIN places p ON uv.place_id = p.id 
                     WHERE uv.user_id = p_user_id 
                       AND ( (a.category = 'Culinary' AND p.category = 'kuliner') OR 
                             (a.category = 'Tourism' AND p.category = 'wisata') ) )
                  WHEN a.type = 'reviews' THEN
                    (SELECT COUNT(*) FROM reviews r 
                     JOIN places p ON r.place_id = p.id 
                     WHERE r.user_id = p_user_id 
                       AND ( (a.category = 'Culinary' AND p.category = 'kuliner') OR 
                             (a.category = 'Tourism' AND p.category = 'wisata') ) )
                  WHEN a.type = 'cities' THEN
                    (SELECT COUNT(DISTINCT p.city_id) FROM user_visits uv 
                     JOIN places p ON uv.place_id = p.id 
                     WHERE uv.user_id = p_user_id
                       AND ( (a.category = 'Culinary' AND p.category = 'kuliner') OR 
                             (a.category = 'Tourism' AND p.category = 'wisata') ) )
                  ELSE 0
                END) AS calculated_progress
        FROM achievements a
        WHERE a.type = p_achievement_type
    ) a
    ON (ua.user_id = p_user_id AND ua.achievement_id = a.achievement_id)
    WHEN MATCHED THEN
        UPDATE SET
            current_progress = a.calculated_progress,
            is_unlocked = CASE WHEN a.calculated_progress >= a.requirement THEN 1 ELSE 0 END,
            unlocked_at = CASE
                WHEN a.calculated_progress >= a.requirement AND ua.is_unlocked = 0 THEN CURRENT_TIMESTAMP
                ELSE ua.unlocked_at
            END
    WHEN NOT MATCHED THEN
        INSERT (user_id, achievement_id, current_progress, is_unlocked, unlocked_at)
        VALUES (
            p_user_id, a.achievement_id, a.calculated_progress,
            CASE WHEN a.calculated_progress >= a.requirement THEN 1 ELSE 0 END,
            CASE WHEN a.calculated_progress >= a.requirement THEN CURRENT_TIMESTAMP ELSE NULL END
        );
END;
    `;
    await connection.execute(plsql);
    console.log('Updated PL/SQL procedure');

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

run();
