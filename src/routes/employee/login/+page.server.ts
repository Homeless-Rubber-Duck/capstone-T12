import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  authenticateEmployee,
  createEmployeeSession,
  getEmployeeSession
} from '$lib/server/employeeAuth';

const COOKIE_NAME = 'heritage_employee_session';

export const load: PageServerLoad = ({ cookies }) => {
  const employee = getEmployeeSession(cookies.get(COOKIE_NAME));

  if (employee) {
    redirect(303, '/employee');
  }

  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const username = String(form.get('username') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!username || !password) {
      return fail(400, { error: 'Please enter your username and password.' });
    }

    const employee = authenticateEmployee(username, password);

    if (!employee) {
      return fail(401, { error: 'Invalid username or password.' });
    }

    const token = createEmployeeSession(employee.id);

    cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    redirect(303, '/employee');
  }
};
