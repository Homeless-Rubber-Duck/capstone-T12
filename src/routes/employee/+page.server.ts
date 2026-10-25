import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EmployeeOrder } from '$lib/server/employeeOrders';

type EmployeePageData = {
  orders: EmployeeOrder[];
  statuses: { id: number; name: string }[];
};

export const load: PageServerLoad = async (): Promise<EmployeePageData> => {
  // Keep employee orders protected until Ethan's
  // authentication and staff sessions are available.
  redirect(303, '/employee/login');
};
