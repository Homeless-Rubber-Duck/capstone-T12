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