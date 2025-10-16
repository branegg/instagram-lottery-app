import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./lottery.db');

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Initialize database
export async function initDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      instagram_username TEXT NOT NULL,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized');
}

// Add lottery entry
export async function addEntry(name, email, instagramUsername) {
  try {
    const result = await dbRun(
      'INSERT INTO entries (name, email, instagram_username) VALUES (?, ?, ?)',
      [name, email, instagramUsername]
    );
    return { success: true, id: result.lastID };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('This email has already been entered');
    }
    throw error;
  }
}

// Get all entries
export async function getAllEntries() {
  return await dbAll('SELECT * FROM entries ORDER BY created_at DESC');
}

// Get verified entries only
export async function getVerifiedEntries() {
  return await dbAll('SELECT * FROM entries WHERE verified = 1 ORDER BY created_at DESC');
}

// Verify an entry
export async function verifyEntry(id) {
  await dbRun('UPDATE entries SET verified = 1 WHERE id = ?', [id]);
}

// Check if user already entered
export async function checkIfExists(email, instagramUsername) {
  const result = await dbGet(
    'SELECT * FROM entries WHERE email = ? OR instagram_username = ?',
    [email, instagramUsername]
  );
  return result !== undefined;
}

// Get random winner from verified entries
export async function getRandomWinner() {
  const entries = await getVerifiedEntries();
  if (entries.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * entries.length);
  return entries[randomIndex];
}

export { db };
