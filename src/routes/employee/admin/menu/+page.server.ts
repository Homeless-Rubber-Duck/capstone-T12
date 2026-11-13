import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { client } from '../../../../lib/server/db';
import { requireAdmin } from '../../../../lib/server/requireAdmin';

type Category = { id: number; name: string; active: number };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  category: string;
  available: number;
  categoryActive: number;
};

export const load: PageServerLoad = ({ cookies }) => {
  requireAdmin(cookies);
  const categories = client.prepare(`
    SELECT category_id AS id, category_name AS name, is_active AS active
    FROM menu_category ORDER BY display_order, category_name
  `).all() as Category[];
  const items = client.prepare(`
    SELECT i.menu_item_id AS id, i.name, i.description, i.price, i.category_id AS categoryId,
      c.category_name AS category, i.is_available AS available, c.is_active AS categoryActive
    FROM menu_item i JOIN menu_category c ON c.category_id = i.category_id
    ORDER BY c.display_order, i.name, i.menu_item_id
  `).all() as MenuItem[];
  return { categories, items };
};

function parseItem(form: FormData) {
  const name = String(form.get('name') ?? '').trim();
  const description = String(form.get('description') ?? '').trim() || null;
  const price = String(form.get('price') ?? '').trim();
  const categoryId = Number(form.get('categoryId'));
  if (
    !name || name.length > 120 || (description?.length ?? 0) > 500 ||
    !/^\d{1,5}(?:\.\d{1,2})?$/.test(price) ||
    !Number.isSafeInteger(categoryId) || categoryId < 1
  ) return null;
  return { name, description, price: Number(price), categoryId, available: form.has('available') ? 1 : 0 };
}

const invalidItem = 'Enter a name, category and a price with up to two decimal places.';

export const actions: Actions = {
  add: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const item = parseItem(await request.formData());
    if (!item) return fail(400, { error: invalidItem });
    const result = client.prepare(`
      INSERT INTO menu_item (name, description, price, category_id, is_available)
      SELECT ?, ?, ?, category_id, ? FROM menu_category WHERE category_id = ?
    `).run(item.name, item.description, item.price, item.available, item.categoryId);
    if (!result.changes) return fail(400, { error: 'Select an existing category.' });
    return { message: 'Menu item added.' };
  },
  edit: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const form = await request.formData();
    const id = Number(form.get('id'));
    const item = parseItem(form);
    if (!Number.isSafeInteger(id) || id < 1 || !item) return fail(400, { error: invalidItem });
    const result = client.prepare(`
      UPDATE menu_item SET name = ?, description = ?, price = ?, category_id = ?, is_available = ?
      WHERE menu_item_id = ? AND EXISTS (SELECT 1 FROM menu_category WHERE category_id = ?)
    `).run(item.name, item.description, item.price, item.categoryId, item.available, id, item.categoryId);
    if (!result.changes) return fail(400, { error: 'The item or category is no longer available.' });
    return { message: 'Menu item updated.' };
  },
  remove: async ({ cookies, request }) => {
    requireAdmin(cookies);
    const id = Number((await request.formData()).get('id'));
    if (!Number.isSafeInteger(id) || id < 1) return fail(400, { error: 'Invalid menu item.' });
    const result = client.prepare('UPDATE menu_item SET is_available = 0 WHERE menu_item_id = ?').run(id);
    if (!result.changes) return fail(404, { error: 'Menu item not found.' });
    return { message: 'Item removed from the customer menu.' };
  }
};
