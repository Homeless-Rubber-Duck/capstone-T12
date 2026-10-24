import { getMenuForOrdering } from '../../lib/server/orderHandler';

// Sends the menu (grouped by category) to the ordering page
export const load = async () => {
	return { categories: getMenuForOrdering() };
};
