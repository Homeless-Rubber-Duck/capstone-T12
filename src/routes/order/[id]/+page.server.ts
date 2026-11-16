import { error } from '@sveltejs/kit';
import { getOrderSummary } from '../../../lib/server/orderHandler';
import { canViewOrder } from '../../../lib/server/orderAccess';

// Loads the saved order for the confirmation page.
// Only the browser that placed the order has its cookie, so only that customer can
// see it. Anyone else (or a missing/wrong cookie) gets "Order not found" (#54).
export const load = async ({ params, cookies }) => {
	const orderId = Number(params.id);
	const key = cookies.get(`order_${orderId}`) ?? null;

	if (!Number.isInteger(orderId) || !canViewOrder(orderId, key)) error(404, 'Order not found');

	const order = getOrderSummary(orderId);
	if (!order) error(404, 'Order not found');
	return { order };
};
