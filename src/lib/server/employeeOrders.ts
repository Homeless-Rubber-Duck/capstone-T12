import { client } from './db';

export type EmployeeOrder = {
  id: number;
  customer: string;
  status: string;
  pickup: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    notes: string | null;
    modifiers: string[];
  }[];
};

export function getEmployeeOrders(): EmployeeOrder[] {
  const orders = client.prepare(`
    SELECT
      o.order_id AS id,
      c.full_name AS customer,
      s.status_name AS status,
      o.pickup_time AS pickup
    FROM customer_order o
    JOIN customer c ON c.customer_id = o.customer_id
    JOIN order_status s ON s.status_id = o.status_id
    ORDER BY o.created_at DESC, o.order_id DESC
  `).all() as Omit<EmployeeOrder, 'items'>[];

  const items = client.prepare(`
    SELECT
      oi.order_item_id AS id,
      mi.name,
      oi.quantity,
      oi.item_notes AS notes
    FROM order_item oi
    JOIN menu_item mi ON mi.menu_item_id = oi.menu_item_id
    WHERE oi.order_id = ?
  `);

  const modifiers = client.prepare(`
    SELECT mo.option_name AS name
    FROM order_item_modifier oim
    JOIN modifier_option mo
      ON mo.modifier_option_id = oim.modifier_option_id
    WHERE oim.order_item_id = ?
  `);

  return orders.map((order) => ({
    ...order,
    items: (items.all(order.id) as {
      id: number;
      name: string;
      quantity: number;
      notes: string | null;
    }[]).map((item) => ({
      ...item,
      modifiers: (modifiers.all(item.id) as { name: string }[])
        .map((modifier) => modifier.name)
    }))
  }));
}

export function getEmployeeStatuses() {
  return client.prepare(`
    SELECT status_id AS id, status_name AS name
    FROM order_status
    ORDER BY status_id
  `).all() as { id: number; name: string }[];
}
