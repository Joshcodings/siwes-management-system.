import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';

export interface DatabaseAdapter {
  isPostgres: boolean;
  get(sql: string, ...params: any[]): Promise<any>;
  all(sql: string, ...params: any[]): Promise<any[]>;
  run(sql: string, ...params: any[]): Promise<{ lastInsertRowid: number | string | bigint | null; changes: number }>;
  exec(sql: string): Promise<void>;
  transaction(fn: () => Promise<void> | void): Promise<void>;
}

// Check if PostgreSQL is available
const usePostgres = !!process.env.DATABASE_URL;

let db: DatabaseAdapter;

function convertSql(sql: string, params: any[]) {
  // Convert standard SQLite placeholders (?) to Postgres placeholders ($1, $2, ...)
  let index = 1;
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);

  // Replace datetime('now') and database time checks
  pgSql = pgSql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
  pgSql = pgSql.replace(/datetime\('now', '\+1 hour'\)/gi, "CURRENT_TIMESTAMP + INTERVAL '1 hour'");

  // Postgres-specific lastInsertRowid handling:
  // If the query is an INSERT, we append "RETURNING id" so db.run() can retrieve the created ID!
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
    pgSql += ' RETURNING id';
  }

  return { pgSql, pgParams: params };
}

function convertTableInitSql(sql: string) {
  let pgSql = sql;
  // SQLite to Postgres datatype conversions for table creation
  pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  pgSql = pgSql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  pgSql = pgSql.replace(/DATETIME/gi, 'TIMESTAMP');
  return pgSql;
}

if (usePostgres) {
  console.log("Database: Connecting to PostgreSQL...");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('supabase') 
      ? { rejectUnauthorized: false } 
      : false
  });

  db = {
    isPostgres: true,
    async get(sql: string, ...params: any[]) {
      const { pgSql, pgParams } = convertSql(sql, params);
      const res = await pool.query(pgSql, pgParams);
      return res.rows[0] || null;
    },
    async all(sql: string, ...params: any[]) {
      const { pgSql, pgParams } = convertSql(sql, params);
      const res = await pool.query(pgSql, pgParams);
      return res.rows;
    },
    async run(sql: string, ...params: any[]) {
      const { pgSql, pgParams } = convertSql(sql, params);
      const res = await pool.query(pgSql, pgParams);
      return {
        lastInsertRowid: res.rows[0]?.id || null,
        changes: res.rowCount || 0
      };
    },
    async exec(sql: string) {
      const pgSql = convertTableInitSql(sql);
      await pool.query(pgSql);
    },
    async transaction(fn: () => Promise<void> | void) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await fn();
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
  };
} else {
  console.log("Database: Connecting to local SQLite...");
  const sqliteDb = new Database('siwes.db');
  
  // Enable foreign keys and WAL mode for better concurrency
  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.pragma('journal_mode = WAL');

  let sqliteTxLock = Promise.resolve();

  db = {
    isPostgres: false,
    async get(sql: string, ...params: any[]) {
      return sqliteDb.prepare(sql).get(...params);
    },
    async all(sql: string, ...params: any[]) {
      return sqliteDb.prepare(sql).all(...params);
    },
    async run(sql: string, ...params: any[]) {
      const res = sqliteDb.prepare(sql).run(...params);
      return {
        lastInsertRowid: res.lastInsertRowid,
        changes: res.changes
      };
    },
    async exec(sql: string) {
      sqliteDb.exec(sql);
    },
    async transaction(fn: () => Promise<void> | void) {
      let release: () => void;
      const acquire = new Promise<void>(resolve => { release = resolve; });
      const previous = sqliteTxLock;
      sqliteTxLock = sqliteTxLock.then(() => acquire);
      
      await previous;
      try {
        sqliteDb.exec('BEGIN');
        await fn();
        sqliteDb.exec('COMMIT');
      } catch (e) {
        sqliteDb.exec('ROLLBACK');
        throw e;
      } finally {
        release!();
      }
    }
  };
}

export async function initDb() {
  // Users and Roles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('STUDENT', 'SCHOOL_SUPERVISOR', 'ADMIN')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Companies
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      industry_type TEXT NOT NULL,
      required_skills TEXT, -- JSON array
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      allowed_radius INTEGER DEFAULT 200,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Student Profiles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      mat_number TEXT,
      course TEXT NOT NULL,
      department TEXT NOT NULL,
      skills TEXT,
      location_preference TEXT,
      latitude REAL,
      longitude REAL,
      cgpa REAL,
      cv_url TEXT,
      assigned_company_id INTEGER,
      school_supervisor_id INTEGER,
      internship_start_date TEXT,
      internship_end_date TEXT,
      total_weeks INTEGER DEFAULT 24,
      internship_latitude REAL,
      internship_longitude REAL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assigned_company_id) REFERENCES companies(id),
      FOREIGN KEY (school_supervisor_id) REFERENCES users(id)
    )
  `);

  // Placements / Applications
  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'ACCEPTED_BY_COMPANY', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
      acceptance_letter_url TEXT,
      score REAL,
      score_breakdown TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Logbook Entries
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logbook_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      activity_description TEXT NOT NULL,
      attachment_url TEXT,
      latitude REAL,
      longitude REAL,
      verification_status TEXT CHECK(verification_status IN ('VERIFIED', 'FLAGGED', 'PENDING')) DEFAULT 'PENDING',
      distance_from_company REAL,
      supervisor_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Assessments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      school_grade REAL,
      final_remarks TEXT,
      completed_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Memos / Broadcasts
  await db.exec(`
    CREATE TABLE IF NOT EXISTS memos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_group TEXT CHECK(recipient_group IN ('ALL', 'STUDENTS', 'SUPERVISORS')) NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `);

  // Notifications
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Password Reset Tokens
  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Location Change Requests
  await db.exec(`
    CREATE TABLE IF NOT EXISTS location_change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Safe schema upgrades (SQLite only, Postgres handles it in creation)
  if (!db.isPostgres) {
    try { await db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_start_date TEXT`); } catch {}
    try { await db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_end_date TEXT`); } catch {}
    try { await db.exec(`ALTER TABLE student_profiles ADD COLUMN total_weeks INTEGER DEFAULT 24`); } catch {}
    try { await db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_latitude REAL`); } catch {}
    try { await db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_longitude REAL`); } catch {}
  }
}

export default db;
