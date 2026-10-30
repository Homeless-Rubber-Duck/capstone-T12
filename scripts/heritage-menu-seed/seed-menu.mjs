import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const target = process.argv[2] || process.env.DATABASE_URL;
if (!target || target.startsWith('file:') || target.includes('://')) {
  console.error('Usage: node scripts/heritage-menu-seed/seed-menu.mjs ./local.db\nSupply a SQLite filesystem path, not a connection URL.');
  process.exit(1);
}
if (!existsSync(target)) {
  console.error('Database file does not exist. Create its tables with the project schema first.');
  process.exit(1);
}
const data = JSON.parse(readFileSync(new URL('./menu-data.json', import.meta.url), 'utf8'));
const tables = ['menu_category', 'menu_item', 'modifier_group', 'modifier_option', 'menu_item_modifier_group'];
const expected = [14, 153, 18, 82, 443];
const quote = name => '"' + name.replaceAll('"', '""') + '"';
let db;
try {
  db = new DatabaseSync(resolve(target));
  db.exec('PRAGMA foreign_keys = ON; BEGIN IMMEDIATE;');
  for (const [i, table] of tables.entries()) {
    if (!Array.isArray(data[table]) || data[table].length !== expected[i]) throw new Error('Unexpected seed count: ' + table);
    const count = db.prepare(`SELECT COUNT(*) AS n FROM ${quote(table)}`).get().n;
    if (count !== 0) throw new Error(table + ' already contains records. Import cancelled; existing menu data is not replaced.');
  }
  for (const table of tables) {
    const rows = data[table];
    const columns = Object.keys(rows[0]);
    const statement = db.prepare(`INSERT INTO ${quote(table)} (${columns.map(quote).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`);
    for (const row of rows) statement.run(...columns.map(column => row[column]));
  }
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeys.length) throw new Error('Foreign-key check failed.');
  const duplicates = db.prepare('SELECT menu_item_id, modifier_group_id FROM menu_item_modifier_group GROUP BY menu_item_id, modifier_group_id HAVING COUNT(*) > 1').all();
  if (duplicates.length) throw new Error('Duplicate menu links found.');
  for (const [i, table] of tables.entries()) {
    if (db.prepare(`SELECT COUNT(*) AS n FROM ${quote(table)}`).get().n !== expected[i]) throw new Error('Final count mismatch: ' + table);
  }
  db.exec('COMMIT;');
  console.log('Menu import complete: 14 categories, 153 items, 18 modifier groups, 82 options, 443 links.');
} catch (error) {
  try { db?.exec('ROLLBACK;'); } catch {}
  console.error('Menu import failed: ' + error.message);
  process.exitCode = 1;
} finally {
  db?.close();
}
