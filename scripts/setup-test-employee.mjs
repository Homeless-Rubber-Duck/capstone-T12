import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured');
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('Test employee setup cannot run in production');
}

const db = new DatabaseSync(process.env.DATABASE_URL);

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employee_session (
      token_hash TEXT PRIMARY KEY,
      staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
      expires_at TEXT NOT NULL
    )
  `);

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync('password123', salt, 64).toString('hex');
  const passwordHash = `${salt}:${hash}`;

  db.exec('BEGIN');

  const existingLogin = db.prepare(
    'SELECT staff_id FROM staff_authentication WHERE username = ?'
  ).get('username');

  let staffId;

  if (existingLogin) {
    staffId = Number(existingLogin.staff_id);
  } else {
    const existing = db.prepare(
      'SELECT staff_id FROM staff WHERE email = ?'
    ).get('test-employee@heritage.local');

    if (existing) {
      staffId = Number(existing.staff_id);
    } else {
      const result = db.prepare(
        'INSERT INTO staff (email, full_name, role) VALUES (?, ?, ?)'
      ).run('test-employee@heritage.local', 'Heritage Test Employee', 'employee');

      staffId = Number(result.lastInsertRowid);
    }
  }

  if (!existingLogin) {
    db.prepare(
      'INSERT INTO staff_authentication (staff_id, username, password_hash) VALUES (?, ?, ?)'
    ).run(staffId, 'username', passwordHash);
  } else {
    db.prepare(
      'UPDATE staff_authentication SET password_hash = ? WHERE username = ?'
    ).run(passwordHash, 'username');
  }

  db.exec('COMMIT');
  console.log('PASS: Test employee is ready');
} catch (error) {
  if (db.isTransaction) db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}
