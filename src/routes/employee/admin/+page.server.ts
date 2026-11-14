import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '../../../lib/server/requireAdmin';
import { createEmployeeAccount, deleteEmployeeAccount, listEmployeeAccounts, updateEmployeeAccount } from '../../../lib/server/employeeAdmin';

export const load: PageServerLoad = ({ cookies }) => {
  requireAdmin(cookies);
  return { accounts: listEmployeeAccounts() };
};

export const actions: Actions = {
  create: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const form = await request.formData();
    try {
      createEmployeeAccount({
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        username: String(form.get('username') ?? ''),
        password: String(form.get('password') ?? '')
      });
    } catch (error) {
      return fail(400, { error: error instanceof Error ? error.message : 'Unable to create employee.' });
    }
    return { success: 'Employee account created.' };
  },
  update: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const form = await request.formData();
    try {
      updateEmployeeAccount({
        id: Number(form.get('staffId')),
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        username: String(form.get('username') ?? ''),
        password: String(form.get('password') ?? '')
      });
    } catch (error) {
      return fail(400, { error: error instanceof Error ? error.message : 'Unable to update employee.' });
    }
    return { success: 'Employee account updated.' };
  },
  delete: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const form = await request.formData();
    try {
      deleteEmployeeAccount(Number(form.get('staffId')));
    } catch (error) {
      return fail(400, { error: error instanceof Error ? error.message : 'Unable to delete employee.' });
    }
    return { success: 'Employee account deleted.' };
  }
};
