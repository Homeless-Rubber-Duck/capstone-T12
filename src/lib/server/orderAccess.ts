import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { client } from './db';

// Order visibility (issue #54).
// Customers don't have accounts, so each order gets a secret key when it's placed.
// The key is saved in a cookie on the customer's browser (see checkout). The order
// page only opens if that cookie matches, so nobody can look up /order/1, /order/2...
// We only store a hash of the key (same idea as employee sessions), never the key itself.

// Creates the table if it isn't there yet, so nobody has to run a setup script
client.exec(`
	CREATE TABLE IF NOT EXISTS order_access (
		order_id INTEGER PRIMARY KEY,
		key_hash TEXT NOT NULL
	)
`);

function hashKey(key: string): string {
	return createHash('sha256').update(key).digest('hex');
}

// Makes a new secret key for an order and saves its hash. Returns the key for the link.
export function createOrderKey(orderId: number): string {
	const key = randomBytes(24).toString('base64url'); // 32 random characters
	client
		.prepare('INSERT OR REPLACE INTO order_access (order_id, key_hash) VALUES (?, ?)')
		.run(orderId, hashKey(key));
	return key;
}

// True only if the key matches the one made for this order
export function canViewOrder(orderId: number, key: string | null): boolean {
	if (!key || !/^[A-Za-z0-9_-]{32}$/.test(key)) return false;

	const row = client
		.prepare('SELECT key_hash AS keyHash FROM order_access WHERE order_id = ?')
		.get(orderId) as { keyHash: string } | undefined;
	if (!row) return false;

	const expected = Buffer.from(row.keyHash, 'hex');
	const actual = Buffer.from(hashKey(key), 'hex');
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Removes the key when an order is deleted
export function deleteOrderKey(orderId: number) {
	client.prepare('DELETE FROM order_access WHERE order_id = ?').run(orderId);
}
