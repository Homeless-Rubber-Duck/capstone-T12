import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEmployeeSession } from '../../lib/server/employeeAuth';
import { loadEmployeeQueue } from '../../lib/server/employeeQueue';

export const load: PageServerLoad = ({ cookies }) => {
  const employee = getEmployeeSession(
    cookies.get('heritage_employee_session')
  );

  if (!employee) {
    redirect(303, '/employee/login');
  }

  return {
    employee,
    ...loadEmployeeQueue()
  };
};

import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { changeEmployeeOrderStatus } from '../../lib/server/employeeOrderActions';

export const actions: Actions = {
  updateStatus: async ({ request, cookies }) => {
    const employee = getEmployeeSession(
      cookies.get('heritage_employee_session')
    );

    if (!employee) {
      redirect(303, '/employee/login');
    }

    const form = await request.formData();
    const orderId = Number(form.get('orderId'));
    const statusId = Number(form.get('statusId'));

    const result = changeEmployeeOrderStatus(
      orderId,
      statusId,
      employee.id
    );

    if (result === 'invalid') {
      return fail(400, { error: 'Invalid order or status.' });
    }

    if (result === 'unchanged') {
      return { message: 'Order already has that status.' };
    }

    return { message: 'Order status updated successfully.' };
  }
};
