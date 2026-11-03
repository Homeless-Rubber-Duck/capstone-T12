// Shared cart for the customer ordering pages (menu → checkout).
// Lives in the browser only; saved to sessionStorage so a page refresh keeps it.

export type CartEntry = {
	menuItemId: number;
	name: string;
	price: number; // shown to the customer; the server re-checks prices on submit
	quantity: number;
	notes: string;
};

const KEY = 'heritage-cart';

function load(): CartEntry[] {
	try {
		const saved = sessionStorage.getItem(KEY);
		return saved ? JSON.parse(saved) : [];
	} catch {
		return [];
	}
}

export const cart = $state<{ lines: CartEntry[] }>({ lines: [] });

let loaded = false;
export function initCart() {
	if (loaded) return;
	cart.lines = load();
	loaded = true;
}

function save() {
	try {
		sessionStorage.setItem(KEY, JSON.stringify(cart.lines));
	} catch {
		/* storage blocked — cart still works for this page */
	}
}

export function addToCart(item: { menuItemId: number; name: string; price: number }) {
	const existing = cart.lines.find((l) => l.menuItemId === item.menuItemId);
	if (existing) existing.quantity = Math.min(existing.quantity + 1, 20);
	else cart.lines.push({ ...item, quantity: 1, notes: '' });
	save();
}

export function setQuantity(menuItemId: number, quantity: number) {
	const line = cart.lines.find((l) => l.menuItemId === menuItemId);
	if (!line) return;
	if (quantity <= 0) cart.lines = cart.lines.filter((l) => l.menuItemId !== menuItemId);
	else line.quantity = Math.min(quantity, 20);
	save();
}

export function setNotes(menuItemId: number, notes: string) {
	const line = cart.lines.find((l) => l.menuItemId === menuItemId);
	if (line) line.notes = notes.slice(0, 500);
	save();
}

export function clearCart() {
	cart.lines = [];
	save();
}

export function cartCount() {
	return cart.lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartTotal() {
	return Math.round(cart.lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
}

export const money = (n: number) => `$${n.toFixed(2)}`;
