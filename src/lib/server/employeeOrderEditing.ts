import { client } from './db';

export type ManagedOrder = {
  id: number;
  customer: string;
  status: string;
  pickup: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
    modifiers: string[];
  }[];
};

type OrderRow = Omit<ManagedOrder, 'items'>;

export function getManagedOrders(): ManagedOrder[] {
  const orders = client.prepare(`
    SELECT o.order_id AS id, c.full_name AS customer,
           s.status_name AS status, o.pickup_time AS pickup
    FROM customer_order o
    JOIN customer c ON c.customer_id = o.customer_id
    JOIN order_status s ON s.status_id = o.status_id
    ORDER BY o.created_at DESC, o.order_id DESC
  `).all() as OrderRow[];

  const getItems = client.prepare(`
    SELECT oi.order_item_id AS id, mi.name, oi.quantity,
           oi.unit_price AS unitPrice, oi.item_notes AS notes
    FROM order_item oi
    JOIN menu_item mi ON mi.menu_item_id = oi.menu_item_id
    WHERE oi.order_id = ?
  `);

  const getModifiers = client.prepare(`
    SELECT mo.option_name AS name
    FROM order_item_modifier oim
    JOIN modifier_option mo
      ON mo.modifier_option_id = oim.modifier_option_id
    WHERE oim.order_item_id = ?
  `);

  return orders.map((order) => ({
    ...order,
    items: (
      getItems.all(order.id) as Omit<ManagedOrder['items'][number], 'modifiers'>[]
    ).map((item) => ({
      ...item,
      modifiers: (
        getModifiers.all(item.id) as { name: string }[]
      ).map((modifier) => modifier.name)
    }))
  }));
}

export function getAvailableMenuItems() {
  return client.prepare(`
    SELECT menu_item_id AS id, name, price
    FROM menu_item
    WHERE is_available = 1
    ORDER BY name
  `).all() as { id: number; name: string; price: number }[];
}

function editableStatus(status: string): boolean {
  return !['canceled', 'cancelled', 'picked up', 'completed']
    .includes(status.toLowerCase());
}

function validId(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function updateManagedOrder(
  orderId: number,
  quantities: { itemId: number; quantity: number }[],
  newMenuItemId: number,
  newQuantity: number
): 'updated' | 'invalid' | 'locked' {
  if (!validId(orderId) ||
      !validId(newMenuItemId) && newMenuItemId !== 0 ||
      !Number.isSafeInteger(newQuantity) ||
      newQuantity < 0 || newQuantity > 20 ||
      quantities.some(
        ({ itemId, quantity }) =>
          !validId(itemId) ||
          !Number.isSafeInteger(quantity) ||
          quantity < 0 || quantity > 20
      )) {
    return 'invalid';
  }

  client.exec('BEGIN IMMEDIATE');

  try {
    const order = client.prepare(`
      SELECT s.status_name AS status
      FROM customer_order o
      JOIN order_status s ON s.status_id = o.status_id
      WHERE o.order_id = ?
    `).get(orderId) as { status: string } | undefined;

    if (!order) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    if (!editableStatus(order.status)) {
      client.exec('ROLLBACK');
      return 'locked';
    }

    const existing = client.prepare(`
      SELECT order_item_id AS id
      FROM order_item
      WHERE order_id = ?
    `).all(orderId) as { id: number }[];

    const existingIds = new Set(existing.map((item) => item.id));
    const submittedIds = new Set(quantities.map((item) => item.itemId));

    if (submittedIds.size !== existingIds.size ||
        quantities.length !== existingIds.size ||
        quantities.some((item) => !existingIds.has(item.itemId))) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    if (newMenuItemId === 0 && newQuantity !== 0 ||
        newMenuItemId !== 0 && newQuantity === 0) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    if (!quantities.some((item) => item.quantity > 0) &&
        newMenuItemId === 0) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    let newItem: { price: number } | undefined;

    if (newMenuItemId !== 0) {
      newItem = client.prepare(`
        SELECT price
        FROM menu_item
        WHERE menu_item_id = ? AND is_available = 1
      `).get(newMenuItemId) as { price: number } | undefined;

      if (!newItem) {
        client.exec('ROLLBACK');
        return 'invalid';
      }
    }

    const updateQuantity = client.prepare(`
      UPDATE order_item SET quantity = ?
      WHERE order_item_id = ? AND order_id = ?
    `);

    const deleteModifiers = client.prepare(`
      DELETE FROM order_item_modifier WHERE order_item_id = ?
    `);

    const deleteItem = client.prepare(`
      DELETE FROM order_item WHERE order_item_id = ? AND order_id = ?
    `);

    for (const item of quantities) {
      if (item.quantity === 0) {
        deleteModifiers.run(item.itemId);
        deleteItem.run(item.itemId, orderId);
      } else {
        updateQuantity.run(item.quantity, item.itemId, orderId);
      }
    }

    if (newItem) {
      client.prepare(`
        INSERT INTO order_item
          (order_id, menu_item_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `).run(orderId, newMenuItemId, newQuantity, newItem.price);
    }

    client.exec('COMMIT');
    return 'updated';
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    throw error;
  }
}

export function cancelManagedOrder(
  orderId: number,
  staffId: number
): 'canceled' | 'invalid' | 'locked' {
  if (!validId(orderId) || !validId(staffId)) return 'invalid';

  client.exec('BEGIN IMMEDIATE');

  try {
    const order = client.prepare(`
      SELECT s.status_name AS status
      FROM customer_order o
      JOIN order_status s ON s.status_id = o.status_id
      WHERE o.order_id = ?
    `).get(orderId) as { status: string } | undefined;

    if (!order) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    if (!editableStatus(order.status)) {
      client.exec('ROLLBACK');
      return 'locked';
    }

    client.prepare(`
      INSERT OR IGNORE INTO order_status (status_name, description)
      VALUES ('Canceled', 'Order canceled by an employee')
    `).run();

    const status = client.prepare(`
      SELECT status_id AS id
      FROM order_status
      WHERE status_name = 'Canceled'
    `).get() as { id: number };

    client.prepare(`
      UPDATE customer_order SET status_id = ? WHERE order_id = ?
    `).run(status.id, orderId);

    client.prepare(`
      INSERT INTO order_status_history
        (order_id, status_id, changed_by_staff_id, note)
      VALUES (?, ?, ?, ?)
    `).run(orderId, status.id, staffId, 'Canceled by employee');

    client.exec('COMMIT');
    return 'canceled';
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    throw error;
  }
}
