
import Database from 'better-sqlite3';

const db = new Database('siwes.db');

const USER_ID = 23; // Zoro
// Based on the 111km mismatch from the previous test site (5.5, 3.37), 
// we assume the user is around 6.45, 3.39 (Lagos area).
const TARGET_LAT = 6.45;
const TARGET_LON = 3.39;

try {
  // 1. Create the new company
  const companyResult = db.prepare(`
    INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Live Workplace HQ", 
    "hq@live-test.com", 
    "Technology", 
    JSON.stringify(["Software Development", "GPS Systems"]), 
    "Current User Location Street, Lagos", 
    TARGET_LAT, 
    TARGET_LON, 
    200 // 200m radius
  );

  const newCompanyId = companyResult.lastInsertRowid;

  // 2. Assign Zoro to this company and match his geofence
  db.prepare(`
    UPDATE student_profiles 
    SET assigned_company_id = ?, 
        internship_latitude = ?, 
        internship_longitude = ?
    WHERE user_id = ?
  `).run(newCompanyId, TARGET_LAT, TARGET_LON, USER_ID);

  console.log(`✅ Success!`);
  console.log(`Company "Live Workplace HQ" created (ID: ${newCompanyId}) at ${TARGET_LAT}, ${TARGET_LON}`);
  console.log(`User ID ${USER_ID} (Zoro) assigned and geofence synchronized.`);

} catch (error) {
  console.error("❌ Failed to setup live company:", error.message);
}
