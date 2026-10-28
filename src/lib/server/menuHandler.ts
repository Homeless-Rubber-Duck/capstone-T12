import { client, db } from './db';
import { menuItem } from './db/schema';

// Gets menu items from the SQLite database
export function getMenuItems() {
    const result = client.prepare(`
      SELECT * FROM menu_item;
    `).all();

    return result;
}
