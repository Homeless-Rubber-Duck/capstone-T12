# Heritage Cafe menu seed

Exports Calvin's entered menu catalog from the updated local(1).db upload. Includes only the five menu tables, with original primary keys and links. No customer, staff, authentication, or order records are included. The uploaded database is unchanged.

## For Calvin

Your local.db already contains this menu. Do not run this importer on that file. Copy this entire folder into `scripts/heritage-menu-seed` in the project, commit the three files, and submit them through your feature branch. Teammates can review menu-data.json and follow the import instructions below. Keep local.db as your working database and make a separate backup before further changes. No Git commits or remote changes were made by preparing this package.

## For teammates: import into an empty menu catalog

Use Node.js 22.13 or newer (tested here with Node 24.22.1). This uses the built-in node:sqlite API, matching the project's SQLite storage; it needs no additional npm packages. It is a data seed, not a schema migration.

1. Use the team's Drizzle database branch and install its dependencies.
2. Copy the full folder into `scripts/heritage-menu-seed`.
3. Create a separate development database with the project's current schema. From the project root in PowerShell:

```powershell
$env:DATABASE_URL = "./menu-review.db"
npm run db:push
node ./scripts/heritage-menu-seed/seed-menu.mjs ./menu-review.db
npm run db:studio
```

Review the schema changes proposed by db:push. Use the same DATABASE_URL for Studio and the application when reviewing this database. The explicit path passed to the importer is relative to the terminal's working directory; the bundled JSON is resolved relative to the script.

The importer requires all five menu tables to exist and be empty. It refuses a populated or partially populated menu, including Calvin's current local.db, and rolls back on error. It inserts in dependency order with foreign keys enabled, preserves IDs, verifies counts and duplicate links, and commits all records together. Rerunning it on an imported database exits with an error without adding duplicates. Do not delete another person's records to make the importer run; use a separate development database.

The importer does not create or change the schema and does not implement the website's selection rules or price calculation. The frontend/backend must enforce min/max selections and calculate modifier charges.

## Expected totals

| Table | Rows |
| --- | ---: |
| menu_category | 14 |
| menu_item | 153 |
| modifier_group | 18 |
| modifier_option | 82 |
| menu_item_modifier_group | 443 |

## Sponsor-confirmed rules and integration requirements

- Sparkling Ade: 6.99; Virgin Mojitos: 7.99; refreshers: 5.99, all available.
- Regular and sugar-free syrup additions: +0.80 each. All three refreshers have the full syrup list.
- Less Sweet, Regular, Extra Sweet: no surcharge where linked. Cold Brew has no iced-preparation surcharge.
- Honey: +0.80. Lime and Mint: free. Alternative milk: +0.80 where linked.
- Matcha Coconut, Lavender, Strawberry flavors are powders: free. Paid syrups remain separate at +0.80. Powder group 14 applies to Matcha (36), Matcha Green Tea Frappe (63), and Matcha Milk Tea (99).
- Cold Foam: +0.50, group 17. Linked to coffee/espresso items 6-23 and Matcha items 36 and 99. It is NOT linked to any frappe, including item 63.
- Coffee/espresso Cold Foam eligibility is ICED ONLY. The link table cannot express the dependency: frontend and server must enforce it. Cold Brew (10) and Viet Coffee (22) are inherently cold. Other items 6-23 require an iced selection or a confirmed cold preparation; do not infer cold status merely because group 17 is linked. Items 18-23 generally have no temperature selection configured, so the developer must account for their fixed preparation rather than exposing Cold Foam on every one by default. Matcha eligibility is stored separately as linked; the sponsor notes did not explicitly impose the coffee-only temperature restriction on Matcha.
- Drink Size group 18 offers one optional Size Upgrade at +1.00. Linked to prepared beverage IDs 6-118; excludes food and packaged drinks. Exact ounce sizes by item are not provided, so the option is intentionally generic.
- Extra Espresso Shot currently permits a single extra shot. Syrup/topping/powder groups with NULL maximum have no selection cap in the stored configuration; confirm any business limits before launch.
- UI and server must enforce group selection limits, validate options belong to groups linked to the ordered item, check availability, and calculate totals from database prices rather than trusting client totals. Preserve modifier charges in order records.

## Validation performed

Source database passed SQLite integrity_check and foreign_key_check, with no duplicate item/group pairs. Export counts, confirmed prices, Matcha syrup/powder links, all size links, and Cold Foam eligibility links (including frappe exclusion) were checked. Import into a fresh copy of the source schema was compared field-for-field with the original five menu tables; repeat import and partial-failure rollback were tested. These checks validate the stored data and importer, not the live website integration or all sponsor business rules.
