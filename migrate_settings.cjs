const db = require('better-sqlite3')('siwes.db');

try {
  console.log('Creating system_settings table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    )
  `);

  const insertOrUpdate = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, description) VALUES (?, ?, ?)');
  
  // Seed default settings
  insertOrUpdate.run('GEOFENCE_RADIUS', '200', 'The allowed radius (in meters) for students to submit logbooks.');
  insertOrUpdate.run('AI_MATCH_THRESHOLD', '70', 'The minimum percentage score required for the AI to recommend a company.');
  insertOrUpdate.run('MAINTENANCE_MODE', 'false', 'If true, students cannot log in.');

  console.log('Migration complete. Seeded default settings.');
} catch (e) {
  console.error('Migration failed:', e.message);
}
