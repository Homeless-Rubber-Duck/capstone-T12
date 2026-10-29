import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteEmployeeSession } from '$lib/server/employeeAuth';

export const POST: RequestHandler = ({ cookies }) => {
  deleteEmployeeSession(cookies.get('heritage_employee_session'));

  cookies.delete('heritage_employee_session', { path: '/' });

  redirect(303, '/employee/login');
};
