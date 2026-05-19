import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('siwes.db');

// Enable foreign keys and WAL mode for better concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initDb() {
  // Users and Roles
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('STUDENT', 'SCHOOL_SUPERVISOR', 'ADMIN')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Student Profiles
  db.exec(`
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
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assigned_company_id) REFERENCES companies(id),
      FOREIGN KEY (school_supervisor_id) REFERENCES users(id)
    )
  `);

  // Companies
  db.exec(`
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

  // Placements / Applications
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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

  // Add new columns to existing tables if they don't exist (safe migration)
  try { db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_start_date TEXT`); } catch {}
  try { db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_end_date TEXT`); } catch {}
  try { db.exec(`ALTER TABLE student_profiles ADD COLUMN total_weeks INTEGER DEFAULT 24`); } catch {}
  try { db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_latitude REAL`); } catch {}
  try { db.exec(`ALTER TABLE student_profiles ADD COLUMN internship_longitude REAL`); } catch {}
  // Location Change Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS location_change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);
}

export default db;
