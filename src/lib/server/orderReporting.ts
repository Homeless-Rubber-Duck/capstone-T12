import { client } from './db';

export type ReportOrder = {
  id: number;
  customer: string;
  placedAt: string;
  pickup: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number; modifierTotal: number }[];
};

export function getOrderReport() {
  const rows = client.prepare(`
    SELECT o.order_id AS id, c.full_name AS customer, o.created_at AS placedAt,
      o.pickup_time AS pickup, s.status_name AS status, i.order_item_id AS itemId,
      m.name, i.quantity, i.unit_price AS unitPrice,
      COALESCE((
        SELECT SUM(price_adjustment) FROM order_item_modifier WHERE order_item_id = i.order_item_id
      ), 0) AS modifierTotal
    FROM customer_order o
    JOIN customer c ON c.customer_id = o.customer_id
    JOIN order_status s ON s.status_id = o.status_id
    LEFT JOIN order_item i ON i.order_id = o.order_id
    LEFT JOIN menu_item m ON m.menu_item_id = i.menu_item_id
    ORDER BY o.created_at DESC, o.order_id DESC, i.order_item_id
  `).all() as (Omit<ReportOrder, 'total' | 'items'> & {
    itemId: number | null;
    name: string | null;
    quantity: number;
    unitPrice: number;
    modifierTotal: number;
  })[];

  const orders = new Map<number, ReportOrder>();
  for (const { id, customer, placedAt, pickup, status, itemId, name, quantity, unitPrice, modifierTotal } of rows) {
    let order = orders.get(id);
    if (!order) {
      order = { id, customer, placedAt, pickup, status, total: 0, items: [] };
      orders.set(id, order);
    }
    if (itemId !== null) {
      order.items.push({ name: name ?? 'Menu item', quantity, unitPrice, modifierTotal });
      order.total += quantity * Math.round((unitPrice + modifierTotal) * 100);
    }
  }
  return [...orders.values()].map((order) => ({ ...order, total: order.total / 100 }));
}

export function summarizeOrders(orders: ReportOrder[]) {
  const byStatus = new Map<string, number>();
  let completed = 0;
  let canceled = 0;
  let completedTotal = 0;
  for (const order of orders) {
    byStatus.set(order.status, (byStatus.get(order.status) ?? 0) + 1);
    const status = order.status.trim().toLowerCase();
    if (status === 'completed' || status === 'picked up') {
      completed += 1;
      completedTotal += Math.round(order.total * 100);
    }
    if (status === 'canceled' || status === 'cancelled') canceled += 1;
  }
  return {
    count: orders.length,
    completed,
    canceled,
    completedTotal: completedTotal / 100,
    byStatus: [...byStatus].map(([status, count]) => ({ status, count }))
  };
}
