import type { PageServerLoad } from './$types';
import { requireAdmin } from '../../../../lib/server/requireAdmin';
import { getOrderReport, summarizeOrders } from '../../../../lib/server/orderReporting';

export const load: PageServerLoad = ({ cookies }) => {
  requireAdmin(cookies);
  const orders = getOrderReport();
  return { orders, summary: summarizeOrders(orders) };
};
