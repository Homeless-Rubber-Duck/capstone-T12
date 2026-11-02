import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { client } from './db';

const SESSION_DAYS = 7;

export type Employee = {
  id: number;
  name: string;
  role: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected || !/^[a-f0-9]{128}$/i.test(expected)) return false;

  const actual = scryptSync(password, salt, 64);
  const saved = Buffer.from(expected, 'hex');
  return timingSafeEqual(actual, saved);
}

function sessionHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createEmployeeSession(staffId: number): string {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

  client.prepare(`
    INSERT INTO employee_session (token_hash, staff_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionHash(token), staffId, expiresAt);

  return token;
}

export function getEmployeeSession(token: string | undefined): Employee | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;

  const employee = client.prepare(`
    SELECT s.staff_id AS id, s.full_name AS name, s.role
    FROM employee_session es
    JOIN staff s ON s.staff_id = es.staff_id
    WHERE es.token_hash = ? AND es.expires_at > ?
  `).get(sessionHash(token), new Date().toISOString());

  return (employee as Employee | undefined) ?? null;
}

export function deleteEmployeeSession(token: string | undefined): void {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;

  client.prepare('DELETE FROM employee_session WHERE token_hash = ?')
    .run(sessionHash(token));
}

export function authenticateEmployee(username: string, password: string): Employee | null {
  const employee = client.prepare(`
    SELECT s.staff_id AS id, s.full_name AS name, s.role,
           a.password_hash AS passwordHash
    FROM staff_authentication a
    JOIN staff s ON s.staff_id = a.staff_id
    WHERE a.username = ?
  `).get(username) as (Employee & { passwordHash: string }) | undefined;

  if (!employee || !verifyPassword(password, employee.passwordHash)) return null;

  return { id: employee.id, name: employee.name, role: employee.role };
}
