import { getEmployeeOrders, getEmployeeStatuses } from './employeeOrders';

export function loadEmployeeQueue() {
  return {
    orders: getEmployeeOrders(),
    statuses: getEmployeeStatuses()
  };
}
