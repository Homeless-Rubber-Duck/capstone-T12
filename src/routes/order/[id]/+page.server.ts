import { error } from '@sveltejs/kit';
import { getOrderSummary } from '../../../lib/server/orderHandler';

// Loads the saved order for the confirmation page
export const load = async ({ params }) => {
	const orderId = Number(params.id);
	const order = Number.isInteger(orderId) ? getOrderSummary(orderId) : null;
	if (!order) error(404, 'Order not found');
	return { order };
};
