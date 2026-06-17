import Database from 'better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'loan-tracker.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  mkdirSync(DATA_DIR, { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
      full_name TEXT NOT NULL,
      client_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      total_amount REAL NOT NULL,
      amount_paid REAL DEFAULT 0 NOT NULL,
      monthly_payment REAL NOT NULL,
      start_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Overdue', 'Completed')) NOT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      paid INTEGER DEFAULT 0 NOT NULL,
      recorded_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
    );
  `)

  // Seed admin user on first run
  const adminExists = db.prepare("SELECT 1 FROM profiles WHERE role = 'admin' LIMIT 1").get()
  if (!adminExists) {
    db.prepare(
      'INSERT INTO profiles (id, role, full_name, email, password_hash) VALUES (?, ?, ?, ?, ?)'
    ).run(randomUUID(), 'admin', 'Admin User', 'admin@loantracker.local', bcrypt.hashSync('admin1234', 10))
  }
}
