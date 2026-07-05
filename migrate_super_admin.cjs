const db = require('better-sqlite3')('siwes.db');

try {
  const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
  console.log('Current schema:', info ? info.sql : 'NOT FOUND');

  if (info && !info.sql.includes('SUPER_ADMIN')) {
    console.log('Migration needed — adding SUPER_ADMIN role...');
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('BEGIN TRANSACTION');
    db.exec('ALTER TABLE users RENAME TO users_old');
    db.exec(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('STUDENT', 'SCHOOL_SUPERVISOR', 'ADMIN', 'SUPER_ADMIN')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`INSERT INTO users SELECT * FROM users_old`);
    db.exec('DROP TABLE users_old');
    db.exec('COMMIT');
    db.exec('PRAGMA foreign_keys = ON');
    console.log('Migration complete!');
  } else {
    console.log('DB already supports SUPER_ADMIN — no schema migration needed.');
  }

  // Update existing ADMIN to SUPER_ADMIN
  const result = db.prepare("UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN'").run();
  console.log(`Upgraded ${result.changes} existing ADMIN(s) to SUPER_ADMIN.`);

  const roles = db.prepare("SELECT role, COUNT(*) as cnt FROM users GROUP BY role").all();
  console.log('Current user roles:', JSON.stringify(roles));
} catch (e) {
  if (db.inTransaction) {
    db.exec('ROLLBACK');
  }
  console.error('Migration failed:', e.message);
}
