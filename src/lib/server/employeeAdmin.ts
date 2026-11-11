import { client } from './db';
import { hashPassword } from './employeeAuth';

type Account = { id: number; fullName: string; email: string; username: string; role: string };

export function listEmployeeAccounts(): Account[] {
  return client.prepare(`SELECT s.staff_id AS id, s.full_name AS fullName, s.email,
    a.username, s.role FROM staff s JOIN staff_authentication a ON a.staff_id = s.staff_id
    ORDER BY s.full_name`).all() as Account[];
}

export function createEmployeeAccount(input: { fullName: string; email: string; username: string; password: string }): void {
  const { fullName, email, username, password } = input;
  if (!fullName.trim() || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 ||
      !/^[a-zA-Z0-9_.-]{3,100}$/.test(username) || password.length < 12 || password.length > 256) {
    throw new Error('Enter a name, valid email, username (3+ characters), and password (12+ characters).');
  }
  try {
    client.exec('BEGIN IMMEDIATE');
    const result = client.prepare('INSERT INTO staff (email, full_name, role) VALUES (?, ?, ?)')
      .run(email.trim().toLowerCase(), fullName.trim(), 'employee');
    client.prepare('INSERT INTO staff_authentication (staff_id, username, password_hash) VALUES (?, ?, ?)')
      .run(Number(result.lastInsertRowid), username.trim(), hashPassword(password));
    client.exec('COMMIT');
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    if (String(error).includes('UNIQUE constraint')) throw new Error('Email or username already exists.');
    throw error;
  }
}

export function deleteEmployeeAccount(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid account.');
  try {
    client.exec('BEGIN IMMEDIATE');
    const account = client.prepare('SELECT role FROM staff WHERE staff_id = ?').get(id) as {role:string}|undefined;
    if (!account || account.role !== 'employee') throw new Error('Only regular employee accounts can be deleted.');
    // Preserve order-status audit references: do not erase historical staff records used in audit logs.
    const history = client.prepare('SELECT 1 FROM order_status_history WHERE changed_by_staff_id = ? LIMIT 1').get(id);
    if (history) throw new Error('This employee has order history and cannot be deleted without losing audit integrity.');
    client.prepare('DELETE FROM employee_session WHERE staff_id = ?').run(id);
    client.prepare('DELETE FROM staff_authentication WHERE staff_id = ?').run(id);
    client.prepare('DELETE FROM staff WHERE staff_id = ?').run(id);
    client.exec('COMMIT');
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    throw error;
  }
}


/** Update a regular employee's profile and/or reset their password. */
export function updateEmployeeAccount(input: { id: number; fullName: string; email: string; username: string; password?: string }): void {
  const { id, fullName, email, username, password = '' } = input;
  if (!Number.isSafeInteger(id) || id <= 0 || !fullName.trim() || fullName.trim().length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 255 ||
      !/^[a-zA-Z0-9_.-]{3,100}$/.test(username.trim()) || (password !== '' && (password.length < 12 || password.length > 256))) {
    throw new Error('Enter a valid name, email, username and optional new password (12+ characters).');
  }
  try {
    client.exec('BEGIN IMMEDIATE');
    const account = client.prepare('SELECT role FROM staff WHERE staff_id = ?').get(id) as { role: string } | undefined;
    if (!account || account.role !== 'employee') throw new Error('Only regular employee accounts can be edited.');
    client.prepare('UPDATE staff SET full_name = ?, email = ? WHERE staff_id = ?')
      .run(fullName.trim(), email.trim().toLowerCase(), id);
    client.prepare('UPDATE staff_authentication SET username = ? WHERE staff_id = ?')
      .run(username.trim(), id);
    if (password !== '') {
      client.prepare('UPDATE staff_authentication SET password_hash = ? WHERE staff_id = ?')
        .run(hashPassword(password), id);
      // A password reset revokes all existing sessions immediately.
      client.prepare('DELETE FROM employee_session WHERE staff_id = ?').run(id);
    }
    client.exec('COMMIT');
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    if (String(error).includes('UNIQUE constraint')) throw new Error('Email or username already exists.');
    throw error;
  }
}
