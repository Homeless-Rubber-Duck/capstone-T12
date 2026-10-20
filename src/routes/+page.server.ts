import { getMenuItems } from '../lib/server/menuHandler';

// Gets menu items and sends them to the webpage
export function load() {
    const menuItems = getMenuItems();

    return { menuItems };
}