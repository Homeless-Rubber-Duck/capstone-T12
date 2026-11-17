import { client } from './db';
import { createOrderKey, deleteOrderKey } from './orderAccess';
import { orderTotals, SALES_TAX_BASIS_POINTS, toCents } from '../orderPricing';
import { COOKING_NOTICE, isCookingService, onlineOptions, type MenuOption, type MenuOptionGroup } from '../menuOptions';

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
    pickupTime: string,
    salesTaxBasisPoints = 0
) {
    const result = client.prepare(`
        INSERT INTO customer_order
        (customer_id, status_id, pickup_time, sales_tax_basis_points)
        VALUES (?, ?, ?, ?);
    `).run(customerId, statusId, pickupTime, salesTaxBasisPoints);

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
    deleteOrderKey(orderId);

    return result.changes;
}

// ======================================================================
// Customer ordering flow (menu → checkout → confirmation) — issue #12
// Builds on the order functions above.
// ======================================================================

// ---------- Types ----------

// What the checkout page sends to the server.
export type CartLine = {
	menuItemId: number;
	quantity: number;
	notes?: string;
	modifierOptionIds?: number[];
	price?: number;
};

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

// All modifier groups and options for one or all menu items.
function getModifierGroups(menuItemId?: number) {
	const rows = client.prepare(`
		SELECT DISTINCT
			link.menu_item_id AS menuItemId,
			g.modifier_group_id AS modifierGroupId,
			g.group_name AS groupName,
			g.min_selection AS minSelection,
			g.max_selection AS maxSelection,
			o.modifier_option_id AS modifierOptionId,
			o.option_name AS optionName,
			o.price_adjustment AS priceAdjustment
		FROM menu_item_modifier_group link
		JOIN modifier_group g ON g.modifier_group_id = link.modifier_group_id
		LEFT JOIN modifier_option o
			ON o.modifier_group_id = g.modifier_group_id
			AND o.is_available = 1
		WHERE (? IS NULL OR link.menu_item_id = ?)
		ORDER BY g.display_order, g.modifier_group_id, o.display_order, o.modifier_option_id
	`).all(menuItemId ?? null, menuItemId ?? null) as (
		Omit<MenuOptionGroup, 'options'> &
		(MenuOption | { modifierOptionId: null }) &
		{ menuItemId: number }
	)[];

	const groupsByItem = new Map<number, MenuOptionGroup[]>();

	for (const row of rows) {
		const { menuItemId, modifierGroupId, groupName, minSelection, maxSelection } = row;
		const groups = groupsByItem.get(menuItemId) ?? [];
		groupsByItem.set(menuItemId, groups);

		let group = groups.find((group) => group.modifierGroupId === modifierGroupId);
		if (!group) {
			group = { modifierGroupId, groupName, minSelection, maxSelection, options: [] };
			groups.push(group);
		}

		if (row.modifierOptionId !== null) {
			const { modifierOptionId, optionName, priceAdjustment } = row;
			group.options.push({ modifierOptionId, optionName, priceAdjustment });
		}
	}

	return groupsByItem;
}

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

	const groupsByItem = getModifierGroups();

	return categories
		.map((category) => ({
			...category,
			items: items
				.filter((item) => item.categoryId === category.categoryId)
				.map((item) => {
					const groups = groupsByItem.get(item.menuItemId) ?? [];

					return {
						...item,
						packagedOnly: groups.some(isCookingService),
						groups: groups.filter((group) => !isCookingService(group))
					};
				})
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
export function placeOrder(
	order: NewOrder
): { orderId: number; key: string } | { errors: string[] } {
	const errors = validateOrder(order);
	if (errors.length) return { errors };

	client.exec('BEGIN IMMEDIATE');

	try {
		const priced: {
			line: CartLine;
			item: NonNullable<ReturnType<typeof getAvailableItem>>;
			options: MenuOption[];
		}[] = [];

		for (const line of order.lines) {
			const item = getAvailableItem(line.menuItemId);
			if (!item) {
				return { errors: ['One of the items in your order is no longer available.'] };
			}

			const groups = getModifierGroups(item.menuItemId).get(item.menuItemId) ?? [];
			const selectedIds = line.modifierOptionIds ?? [];
			const selected = new Set(selectedIds);

			const requestedCooking = groups.some(
				(group) =>
					isCookingService(group) &&
					group.options.some((option) => selected.has(option.modifierOptionId))
			);
			if (requestedCooking) return { errors: [COOKING_NOTICE] };

			const options: MenuOption[] = [];

			for (const group of onlineOptions(item.menuItemId, groups, selectedIds)) {
				const choices = group.options.filter((option) => selected.has(option.modifierOptionId));

				if (
					choices.length < group.minSelection ||
					(group.maxSelection !== null && choices.length > group.maxSelection)
				) {
					return { errors: [`Please reselect ${group.groupName} for ${item.name} on the menu.`] };
				}

				options.push(...choices);
			}

			if (options.length !== selectedIds.length) {
				return { errors: [`An option for ${item.name} is unavailable or selected more than once.`] };
			}

			const unitCents = options.reduce(
				(sum, option) => sum + toCents(option.priceAdjustment),
				toCents(item.price)
			);

			if (line.price !== undefined && toCents(line.price) !== unitCents) {
				return {
					errors: [`The price for ${item.name} changed. Remove it from your cart and add it again.`]
				};
			}

			priced.push({ line, item, options });
		}
		const statusId = getFirstStatusId();
		const customerId = findOrCreateCustomer(order);
		const orderId = Number(
			createOrder(
				customerId,
				statusId,
				order.pickupTime.replace('T', ' '),
				SALES_TAX_BASIS_POINTS
			)
		);

		const addItem = client.prepare(`
			INSERT INTO order_item (order_id, menu_item_id, quantity, unit_price, item_notes)
			VALUES (?, ?, ?, ?, ?)
		`);

		const addModifier = client.prepare(`
			INSERT INTO order_item_modifier (order_item_id, modifier_option_id, price_adjustment)
			VALUES (?, ?, ?)
		`);

		for (const { line, item, options } of priced) {
			const { lastInsertRowid } = addItem.run(
				orderId,
				item.menuItemId,
				line.quantity,
				item.price,
				line.notes?.trim() || null
			);

			for (const option of options) {
				addModifier.run(lastInsertRowid, option.modifierOptionId, option.priceAdjustment);
			}
		}

		client
			.prepare(`INSERT INTO order_status_history (order_id, status_id, note) VALUES (?, ?, ?)`)
			.run(orderId, statusId, 'Order placed');

		const key = createOrderKey(orderId);

		client.exec('COMMIT');
		return { orderId, key };
	} finally {
		if (client.isTransaction) client.exec('ROLLBACK');
	}
}

// ---------- Read order (confirmation page) ----------

export function getOrderSummary(orderId: number) {
	const order = client
		.prepare(
			`SELECT o.order_id AS orderId, o.pickup_time AS pickupTime, o.created_at AS createdAt,
			        s.status_name AS status, c.full_name AS customerName,
					o.sales_tax_basis_points AS salesTaxBasisPoints
			 FROM customer_order o
			 JOIN order_status s ON s.status_id = o.status_id
			 JOIN customer c ON c.customer_id = o.customer_id
			 WHERE o.order_id = ?`
		)
		.get(orderId) as
		| { orderId: number; pickupTime: string; createdAt: string; status: string; customerName: string; salesTaxBasisPoints: number }
		| undefined;

	if (!order) return null;

	const itemRows = client.prepare(`
		SELECT i.order_item_id AS itemId, m.name, i.quantity,
		       i.unit_price AS baseUnitPrice, i.item_notes AS notes
		FROM order_item i
		JOIN menu_item m ON m.menu_item_id = i.menu_item_id
		WHERE i.order_id = ?
		ORDER BY i.order_item_id
	`).all(orderId) as {
		itemId: number;
		name: string;
		quantity: number;
		baseUnitPrice: number;
		notes: string | null;
	}[];

	const getModifiers = client.prepare(`
		SELECT mo.option_name AS name, om.price_adjustment AS priceAdjustment
		FROM order_item_modifier om
		JOIN modifier_option mo ON mo.modifier_option_id = om.modifier_option_id
		WHERE om.order_item_id = ?
		ORDER BY om.order_item_modifier_id
	`);

	let subtotalCents = 0;

	const items = itemRows.map(({ itemId, baseUnitPrice, ...item }) => {
		const modifiers = getModifiers.all(itemId) as {
			name: string;
			priceAdjustment: number;
		}[];

		const unitCents = modifiers.reduce(
			(sum, modifier) => sum + toCents(modifier.priceAdjustment),
			toCents(baseUnitPrice)
		);

		subtotalCents += unitCents * item.quantity;

		return { ...item, unitPrice: unitCents / 100, modifiers };
	});

	return {
		...order,
		items,
		...orderTotals(subtotalCents, order.salesTaxBasisPoints)
	};
}