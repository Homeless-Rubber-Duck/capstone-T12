import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getEmployeeSession } from '../../../lib/server/employeeAuth';
import { getEmployeeStatuses } from '../../../lib/server/employeeOrders';
import {
  getManagedOrders,
  getAvailableMenuItems,
  updateManagedOrder,
  cancelManagedOrder
} from '../../../lib/server/employeeOrderEditing';

export const load: PageServerLoad = ({ cookies }) => {
  const employee = getEmployeeSession(
    cookies.get('heritage_employee_session')
  );

  if (!employee) redirect(303, '/employee/login');

  return {
    employee,
    orders: getManagedOrders(),
    statuses: getEmployeeStatuses(),
    menuItems: getAvailableMenuItems()
  };
};

export const actions: Actions = {
  save: async ({ request, cookies }) => {
    const employee = getEmployeeSession(
      cookies.get('heritage_employee_session')
    );

    if (!employee) redirect(303, '/employee/login');

    const form = await request.formData();
    const orderId = Number(form.get('orderId'));
    const newMenuItemId = Number(form.get('newMenuItemId'));
    const newQuantity = Number(form.get('newQuantity'));

    const itemIds = form.getAll('itemId').map(Number);
    const quantities = form.getAll('quantity').map(Number);

    if (itemIds.length !== quantities.length) {
      return fail(400, { error: 'Invalid item information.' });
    }

    const result = updateManagedOrder(
      orderId,
      itemIds.map((itemId, index) => ({
        itemId,
        quantity: quantities[index]
      })),
      newMenuItemId,
      newQuantity
    );

    if (result === 'invalid') {
      return fail(400, { error: 'Invalid order changes.' });
    }

    if (result === 'locked') {
      return fail(400, { error: 'This order can no longer be edited.' });
    }

    return { message: 'Order updated successfully.' };
  },

  cancel: async ({ request, cookies }) => {
    const employee = getEmployeeSession(
      cookies.get('heritage_employee_session')
    );

    if (!employee) redirect(303, '/employee/login');

    const form = await request.formData();
    const orderId = Number(form.get('orderId'));

    const result = cancelManagedOrder(orderId, employee.id);

    if (result === 'invalid') {
      return fail(400, { error: 'Invalid order.' });
    }

    if (result === 'locked') {
      return fail(400, { error: 'This order cannot be canceled.' });
    }

    return { message: 'Order canceled successfully.' };
  }
};
