import { client } from './db';

// Gets all customer orders from SQLite
export function getOrders() {
    const orders = client.prepare(`
        SELECT * FROM customer_order;
    `).all();

    return orders;
}

// Creates a new customer order
export function createOrder(
    customerId: number,
    statusId: number,
    pickupTime: string
) {
    const result = client.prepare(`
        INSERT INTO customer_order
        (customer_id, status_id, pickup_time)
        VALUES (?, ?, ?);
    `).run(customerId, statusId, pickupTime);

    return result.lastInsertRowid;
}

// Updates the status of a customer order
export function updateOrder(
    orderId: number,
    statusId: number
) {
    const result = client.prepare(`
        UPDATE customer_order
        SET status_id = ?
        WHERE order_id = ?;
    `).run(statusId, orderId);

    return result.changes;
}

// Deletes a customer order
export function deleteOrder(orderId: number) {
    const result = client.prepare(`
        DELETE FROM customer_order
        WHERE order_id = ?
    `).run(orderId);

    return result.changes;
}

// ======================================================================
// Customer ordering flow (menu → checkout → confirmation) — issue #12
// Builds on the order functions above.
// ======================================================================

// ---------- Types ----------

// What the checkout page sends to the server.
export type CartLine = { menuItemId: number; quantity: number; notes?: string };

export type NewOrder = {
	fullName: string;
	email: string;
	phone: string;
	pickupTime: string; // "YYYY-MM-DDTHH:MM" (local time)
	lines: CartLine[];
};

type MenuItemRow = {
	menuItemId: number;
	name: string;
	description: string | null;
	price: number;
	categoryId: number;
};

// Every new order starts with this status.
const FIRST_STATUS = 'Received';
const MAX_QUANTITY = 20;

// ---------- Menu for the ordering page ----------

// Active categories (in display order) with their available items.
export function getMenuForOrdering() {
	const categories = client
		.prepare(
			`SELECT category_id AS categoryId, category_name AS categoryName
			 FROM menu_category
			 WHERE is_active = 1
			 ORDER BY display_order`
		)
		.all() as { categoryId: number; categoryName: string }[];

	const items = client
		.prepare(
			`SELECT menu_item_id AS menuItemId, name, description, price, category_id AS categoryId
			 FROM menu_item
			 WHERE is_available = 1
			 ORDER BY name`
		)
		.all() as MenuItemRow[];

	return categories
		.map((category) => ({
			...category,
			items: items.filter((item) => item.categoryId === category.categoryId)
		}))
		.filter((category) => category.items.length > 0);
}

// One available item (prices always come from the database, not the browser).
function getAvailableItem(menuItemId: number) {
	return client
		.prepare(
			`SELECT menu_item_id AS menuItemId, name, price
			 FROM menu_item
			 WHERE menu_item_id = ? AND is_available = 1`
		)
		.get(menuItemId) as { menuItemId: number; name: string; price: number } | undefined;
}

// ---------- Pickup time ----------

const pad = (n: number) => String(n).padStart(2, '0');

// Today's date on the server, e.g. "2026-10-22"
export function todayDate(now = new Date()) {
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Builds the pickup time from the checkout form.
// "today" = today's date + the time the customer picked.
// "later" = the date and time the customer picked.
export function buildPickupTime(option: string, time: string, dateTime: string) {
	if (option === 'today') return time ? `${todayDate()}T${time}` : '';
	return dateTime;
}

// Heritage Cafe hours (sponsor meeting 10/14/26): Mon–Sat 8:00am–8:00pm, Sun 8:30am–8:00pm.
function isDuringBusinessHours(pickup: Date) {
	const minutes = pickup.getHours() * 60 + pickup.getMinutes();
	const opens = pickup.getDay() === 0 ? 8 * 60 + 30 : 8 * 60;
	return minutes >= opens && minutes <= 20 * 60;
}

// ---------- Validation ----------

// Returns a list of problems (empty list = OK).
export function validateOrder(order: NewOrder): string[] {
	const errors: string[] = [];

	if (!order.fullName?.trim()) errors.push('Please enter your name.');
	if (!/^\S+@\S+\.\S+$/.test(order.email?.trim() ?? '')) errors.push('Please enter a valid email.');
	if ((order.phone ?? '').replace(/\D/g, '').length < 10) errors.push('Please enter a valid phone number.');

	if (!order.lines?.length) errors.push('Your order is empty.');
	for (const line of order.lines ?? []) {
		if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
			errors.push(`Quantity must be between 1 and ${MAX_QUANTITY}.`);
			break;
		}
	}

	const pickup = new Date(order.pickupTime);
	if (!order.pickupTime || Number.isNaN(pickup.getTime())) {
		errors.push('Please choose a pickup time.');
	} else if (pickup.getTime() < Date.now()) {
		errors.push('Pickup time must be later than now.');
	} else if (!isDuringBusinessHours(pickup)) {
		errors.push('Pickup time must be during business hours (Mon–Sat 8:00am–8:00pm, Sun 8:30am–8:00pm).');
	}

	return errors;
}

// ---------- Helpers ----------

// Finds the "Received" status, or adds it if the status list is empty.
// (order_status is a lookup list, not customer data.)
function getFirstStatusId() {
	const found = client
		.prepare(`SELECT status_id AS statusId FROM order_status WHERE status_name = ?`)
		.get(FIRST_STATUS) as { statusId: number } | undefined;
	if (found) return found.statusId;
	const result = client
		.prepare(`INSERT INTO order_status (status_name, description) VALUES (?, ?)`)
		.run(FIRST_STATUS, 'Order submitted by the customer');
	return Number(result.lastInsertRowid);
}

// Finds the customer by email, or creates them.
// Temporary until customer login (BR-02) is built — then this uses the signed-in customer.
function findOrCreateCustomer(order: NewOrder) {
	const email = order.email.trim().toLowerCase();
	const existing = client
		.prepare(`SELECT customer_id AS customerId FROM customer WHERE email = ?`)
		.get(email) as { customerId: number } | undefined;
	if (existing) return existing.customerId;
	const result = client
		.prepare(`INSERT INTO customer (full_name, email, phone) VALUES (?, ?, ?)`)
		.run(order.fullName.trim(), email, order.phone.trim());
	return Number(result.lastInsertRowid);
}

// ---------- Create order ----------

// Places a full customer order from the checkout page: validates it, then saves
// customer_order (using createOrder above) + order_item + the first status history row
// in one transaction, so an order is never half-saved.
export function placeOrder(order: NewOrder): { orderId: number } | { errors: string[] } {
	const errors = validateOrder(order);
	if (errors.length) return { errors };

	const priced: { line: CartLine; item: NonNullable<ReturnType<typeof getAvailableItem>> }[] = [];
	for (const line of order.lines) {
		const item = getAvailableItem(line.menuItemId);
		if (!item) return { errors: ['One of the items in your order is no longer available.'] };
		priced.push({ line, item });
	}

	client.exec('BEGIN');
	try {
		const statusId = getFirstStatusId();
		const customerId = findOrCreateCustomer(order);

		const orderId = Number(createOrder(customerId, statusId, order.pickupTime.replace('T', ' ')));

		const addItem = client.prepare(
			`INSERT INTO order_item (order_id, menu_item_id, quantity, unit_price, item_notes)
			 VALUES (?, ?, ?, ?, ?)`
		);
		for (const { line, item } of priced) {
			// unit_price = price at the time of the order
			addItem.run(orderId, item.menuItemId, line.quantity, item.price, line.notes?.trim() || null);
		}

		client
			.prepare(`INSERT INTO order_status_history (order_id, status_id, note) VALUES (?, ?, ?)`)
			.run(orderId, statusId, 'Order placed');

		client.exec('COMMIT');
		return { orderId };
	} catch (err) {
		client.exec('ROLLBACK');
		throw err;
	}
}

// ---------- Read order (confirmation page) ----------

export function getOrderSummary(orderId: number) {
	const order = client
		.prepare(
			`SELECT o.order_id AS orderId, o.pickup_time AS pickupTime, o.created_at AS createdAt,
			        s.status_name AS status, c.full_name AS customerName
			 FROM customer_order o
			 JOIN order_status s ON s.status_id = o.status_id
			 JOIN customer c ON c.customer_id = o.customer_id
			 WHERE o.order_id = ?`
		)
		.get(orderId) as
		| { orderId: number; pickupTime: string; createdAt: string; status: string; customerName: string }
		| undefined;

	if (!order) return null;

	const items = client
		.prepare(
			`SELECT m.name, i.quantity, i.unit_price AS unitPrice, i.item_notes AS notes
			 FROM order_item i
			 JOIN menu_item m ON m.menu_item_id = i.menu_item_id
			 WHERE i.order_id = ?`
		)
		.all(orderId) as { name: string; quantity: number; unitPrice: number; notes: string | null }[];

	const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
	return { ...order, items, total: Math.round(total * 100) / 100 };
}
