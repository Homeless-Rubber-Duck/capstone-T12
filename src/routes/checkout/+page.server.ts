import { fail, redirect } from '@sveltejs/kit';
import { placeOrder, buildPickupTime, type CartLine } from '../../lib/server/orderHandler';

export const actions = {
	// Runs when the customer clicks "Place order"
	default: async ({ request }) => {
		const form = await request.formData();

		let lines: CartLine[] = [];
		try {
			lines = JSON.parse(String(form.get('cart') ?? '[]')).map((l: CartLine) => ({
				menuItemId: Number(l.menuItemId),
				quantity: Number(l.quantity),
				notes: typeof l.notes === 'string' ? l.notes : ''
			}));
		} catch {
			return fail(400, { errors: ['Your order could not be read. Please try again.'] });
		}

		const result = placeOrder({
			fullName: String(form.get('fullName') ?? ''),
			email: String(form.get('email') ?? ''),
			phone: String(form.get('phone') ?? ''),
			// "Pickup today" = today's date + chosen time; "Another day" = chosen date and time
			pickupTime: buildPickupTime(
				String(form.get('pickupOption') ?? 'today'),
				String(form.get('pickupTodayTime') ?? ''),
				String(form.get('pickupDateTime') ?? '')
			),
			lines
		});

		if ('errors' in result) return fail(400, { errors: result.errors });

		// Send the customer to their confirmation page
		redirect(303, `/order/${result.orderId}`);
	}
};
