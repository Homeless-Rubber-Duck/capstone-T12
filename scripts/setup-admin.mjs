import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const rl = createInterface({ input, output });
const db = new DatabaseSync(process.env.DATABASE_URL);
try {
  const name = (await rl.question('Admin full name: ')).trim();
  const email = (await rl.question('Admin email: ')).trim().toLowerCase();
  const username = (await rl.question('Admin username: ')).trim();
  const password = (await rl.question('Admin password (12+ characters): '));
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[a-zA-Z0-9_.-]{3,100}$/.test(username) || password.length < 12) throw new Error('Invalid admin details');
  const salt = randomBytes(16).toString('hex');
  const hash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  db.exec('BEGIN IMMEDIATE');
  const result = db.prepare('INSERT INTO staff (email, full_name, role) VALUES (?, ?, ?)').run(email,name,'admin');
  db.prepare('INSERT INTO staff_authentication (staff_id, username, password_hash) VALUES (?, ?, ?)').run(Number(result.lastInsertRowid),username,hash);
  db.exec('COMMIT');
  console.log('Admin account created. Log in at /employee/login, then open /employee/admin.');
} catch (error) {
  if (db.isTransaction) db.exec('ROLLBACK');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally { rl.close(); db.close(); }
