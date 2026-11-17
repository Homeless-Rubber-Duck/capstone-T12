// Shared cart for the customer ordering pages (menu → checkout).
// Lives in the browser only; saved to sessionStorage so a page refresh keeps it.
import type { MenuOption } from './menuOptions';
import { toCents } from './orderPricing';

export type CartEntry = {
	id: string;
	menuItemId: number;
	name: string;
	price: number; // shown to the customer; the server re-checks prices on submit
	quantity: number;
	notes: string;
	modifiers: MenuOption[];
};

const KEY = 'heritage-cart';

function load(): CartEntry[] {
	try {
		const saved = sessionStorage.getItem(KEY);
		const lines: CartEntry[] = saved ? JSON.parse(saved) : [];

		return lines.map((line) => ({
			...line,
			id: line.id ?? String(line.menuItemId),
			modifiers: line.modifiers ?? []
		}));
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

export function addToCart(item: {
	menuItemId: number;
	name: string;
	price: number;
	modifiers?: MenuOption[];
}) {
	const modifiers = item.modifiers ?? [];
	const optionIds = modifiers
		.map((option) => option.modifierOptionId)
		.sort((a, b) => a - b);

	const id = [item.menuItemId, ...optionIds].join('-');
	const existing = cart.lines.find((line) => line.id === id);

	if (existing) {
		existing.quantity = Math.min(existing.quantity + 1, 20);
	} else {
		const unitCents = modifiers.reduce(
			(sum, option) => sum + toCents(option.priceAdjustment),
			toCents(item.price)
		);

		cart.lines.push({
			...item,
			id,
			price: unitCents / 100,
			quantity: 1,
			notes: '',
			modifiers
		});
	}

	save();
}

export function setQuantity(id: string, quantity: number) {
	const line = cart.lines.find((line) => line.id === id);
	if (!line) return;

	if (quantity <= 0) {
		cart.lines = cart.lines.filter((line) => line.id !== id);
	} else {
		line.quantity = Math.min(quantity, 20);
	}

	save();
}

export function setNotes(id: string, notes: string) {
	const line = cart.lines.find((line) => line.id === id);
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
