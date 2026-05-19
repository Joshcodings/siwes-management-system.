const db = require('better-sqlite3')('siwes.db');

try {
  const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
  console.log('Current schema:', info ? info.sql : 'NOT FOUND');

  // Check if migration is needed
  if (info && info.sql.includes('INSTITUTION_SUPERVISOR')) {
    console.log('Migration needed — running...');
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('BEGIN TRANSACTION');
    db.exec('ALTER TABLE users RENAME TO users_old');
    db.exec(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('STUDENT', 'SCHOOL_SUPERVISOR', 'ADMIN')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`INSERT INTO users SELECT id, email, password, full_name,
      CASE role
        WHEN 'INSTITUTION_SUPERVISOR' THEN 'SCHOOL_SUPERVISOR'
        WHEN 'INDUSTRY_SUPERVISOR' THEN 'SCHOOL_SUPERVISOR'
        ELSE role
      END,
      created_at FROM users_old`);
    db.exec('DROP TABLE users_old');
    db.exec('COMMIT');
    db.exec('PRAGMA foreign_keys = ON');
    console.log('Migration complete!');
  } else if (info && info.sql.includes('SCHOOL_SUPERVISOR')) {
    console.log('DB already has SCHOOL_SUPERVISOR — no migration needed.');
  } else {
    console.log('Unexpected schema state.');
  }

  const roles = db.prepare("SELECT role, COUNT(*) as cnt FROM users GROUP BY role").all();
  console.log('Current user roles:', JSON.stringify(roles));
} catch (e) {
  db.exec('ROLLBACK');
  console.error('Migration failed:', e.message);
}
