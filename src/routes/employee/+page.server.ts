import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { orderFlags } from '../../lib/employeeOrderFlags';
import { client } from '../../lib/server/db';
import { getEmployeeSession } from '../../lib/server/employeeAuth';
import { changeEmployeeOrderStatus } from '../../lib/server/employeeOrderActions';
import { loadEmployeeQueue } from '../../lib/server/employeeQueue';

export const load: PageServerLoad = ({ cookies, depends }) => {
  const employee = getEmployeeSession(
    cookies.get('heritage_employee_session')
  );

  if (!employee) {
    redirect(303, '/employee/login');
  }

  depends('app:employee-orders');

  return {
    employee,
    ...loadEmployeeQueue()
  };
};

export const actions: Actions = {
    updateFlag: async ({ request, cookies }) => {
      const employee = getEmployeeSession(
        cookies.get('heritage_employee_session')
      );

      if (!employee) {
        redirect(303, '/employee/login');
      }

      const form = await request.formData();
      const orderId = Number(form.get('orderId'));
      const flag = form.get('flag');

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return fail(400, { error: 'Invalid order ID.' });
      }

      if (flag !== '' && !orderFlags.some((option) => option.value === flag)) {
        return fail(400, { error: 'Invalid order flag.' });
      }

      const result = client.prepare(`
        UPDATE customer_order
        SET flag = ?
        WHERE order_id = ?
      `).run(flag === '' ? null : String(flag), orderId);

      if (result.changes === 0) {
        return fail(400, { error: 'Order could not be found.' });
      }

      return { message: flag === '' ? 'Flag cleared.' : 'Flag updated.' };
    },
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
