import { getMenuItems } from '../lib/server/menuHandler';

// Gets menu items and sends them to the webpage
export const load = async() => {
    const menuItems = await getMenuItems();

    return { menuItems };
}
