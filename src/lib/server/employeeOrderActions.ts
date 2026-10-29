import { client } from './db';

export type EmployeeStatusHistory = {
  id: number;
  status: string;
  employee: string | null;
  changedAt: string;
  note: string | null;
};

export function getOrderStatusHistory(orderId: number): EmployeeStatusHistory[] {
  return client.prepare(`
    SELECT
      h.status_history_id AS id,
      os.status_name AS status,
      s.full_name AS employee,
      h.changed_at AS changedAt,
      h.note
    FROM order_status_history h
    JOIN order_status os ON os.status_id = h.status_id
    LEFT JOIN staff s ON s.staff_id = h.changed_by_staff_id
    WHERE h.order_id = ?
    ORDER BY h.changed_at DESC, h.status_history_id DESC
  `).all(orderId) as EmployeeStatusHistory[];
}

export function changeEmployeeOrderStatus(
  orderId: number,
  statusId: number,
  staffId: number
): 'updated' | 'unchanged' | 'invalid' {
  if (
    !Number.isSafeInteger(orderId) ||
    !Number.isSafeInteger(statusId) ||
    !Number.isSafeInteger(staffId) ||
    orderId <= 0 ||
    statusId <= 0 ||
    staffId <= 0
  ) {
    return 'invalid';
  }

  client.exec('BEGIN IMMEDIATE');

  try {
    const order = client.prepare(`
      SELECT status_id AS statusId
      FROM customer_order
      WHERE order_id = ?
    `).get(orderId) as { statusId: number } | undefined;

    const status = client.prepare(`
      SELECT status_id AS id
      FROM order_status
      WHERE status_id = ?
    `).get(statusId);

    if (!order || !status) {
      client.exec('ROLLBACK');
      return 'invalid';
    }

    if (order.statusId === statusId) {
      client.exec('ROLLBACK');
      return 'unchanged';
    }

    client.prepare(`
      UPDATE customer_order
      SET status_id = ?
      WHERE order_id = ?
    `).run(statusId, orderId);

    client.prepare(`
      INSERT INTO order_status_history
        (order_id, status_id, changed_by_staff_id)
      VALUES (?, ?, ?)
    `).run(orderId, statusId, staffId);

    client.exec('COMMIT');
    return 'updated';
  } catch (error) {
    if (client.isTransaction) client.exec('ROLLBACK');
    throw error;
  }
}
