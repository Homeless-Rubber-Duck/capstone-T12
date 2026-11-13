import { redirect, type Cookies } from '@sveltejs/kit';
import { getEmployeeSession } from './employeeAuth';

export function requireAdmin(cookies: Cookies) {
  const employee = getEmployeeSession(cookies.get('heritage_employee_session'));
  if (!employee) redirect(303, '/employee/login');
  if (employee.role !== 'admin') redirect(303, '/employee');
  return employee;
}
