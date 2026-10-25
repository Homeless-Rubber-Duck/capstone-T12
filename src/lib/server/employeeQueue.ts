import { getOrders } from './orderHandler';
import { getEmployeeOrders, getEmployeeStatuses } from './employeeOrders';

export function loadEmployeeQueue() {
  // Reuse the team's existing order retrieval function.
  const baseOrders = getOrders();

  // Add the customer and item details required by KAN-65/KAN-66.
  const detailedOrders = getEmployeeOrders();

  const validIds = new Set(
    baseOrders.map((order) => Number(order.order_id))
  );

  return {
    orders: detailedOrders.filter((order) => validIds.has(order.id)),
    statuses: getEmployeeStatuses()
  };
}
