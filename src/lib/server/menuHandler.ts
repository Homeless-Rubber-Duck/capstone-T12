import { db } from './db';
import { menuItem } from './db/schema';

// Gets menu items from the SQLite database
export function getMenuItems() {
    return db.select().from(menuItem).all();
}