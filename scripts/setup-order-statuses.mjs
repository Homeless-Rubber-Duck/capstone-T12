
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.argv[2];

if (!dbPath) {
    console.log('Please provide a database path.');
    process.exit(1);
}

const db = new DatabaseSync(dbPath);

const statuses = [
    ['Preparing', 'Employee is preparing the order'],
    ['Ready', 'Order is ready for pickup'],
    ['Completed', 'Customer has picked up the order']
];

const insertStatus = db.prepare(`
    INSERT OR IGNORE INTO order_status (status_name, description)
    VALUES (?, ?)
`);

for (const [name, description] of statuses) {
    insertStatus.run(name, description);
}

console.log('Order statuses are ready.');

console.table(
    db.prepare('SELECT status_id, status_name FROM order_status ORDER BY status_id').all()
);

db.close();
