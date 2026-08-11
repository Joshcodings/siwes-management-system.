import Database from 'better-sqlite3';
import pg from 'pg';

console.log('--- LOCAL SQLite USERS ---');
try {
  const localDb = new Database('siwes.db');
  const localUsers = localDb.prepare('SELECT id, email, full_name, role FROM users').all();
  console.log(JSON.stringify(localUsers, null, 2));
} catch (e: any) {
  console.error('Error reading local users:', e.message);
}

console.log('\n--- REMOTE POSTGRES USERS ---');
const pgUrl = 'postgresql://neondb_owner:npg_XS4LNVxji2bF@ep-summer-fog-aqn7blof.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';
try {
  const pool = new pg.Pool({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  const res = await pool.query('SELECT id, email, full_name, role FROM users');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
} catch (e: any) {
  console.error('Error reading remote users:', e.message);
}
