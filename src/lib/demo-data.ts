// Temporary demo data. Replace with backend API responses after integration.
export type MenuItem = { id: number; name: string; category: string; price: number; available: boolean };
export type CafeOrder = { id: number; customer: string; items: string[]; status: 'New' | 'Preparing' | 'Ready' | 'Completed'; pickup: string };
export const initialMenu: MenuItem[] = [
 { id: 1, name: 'House Coffee', category: 'Drinks', price: 3.5, available: true },
 { id: 2, name: 'Iced Latte', category: 'Drinks', price: 5.25, available: true },
 { id: 3, name: 'Breakfast Sandwich', category: 'Food', price: 7.5, available: true },
 { id: 4, name: 'Blueberry Muffin', category: 'Bakery', price: 3.75, available: false }
];
export const initialOrders: CafeOrder[] = [
 { id: 101, customer: 'Alex Morgan', items: ['Iced Latte', 'Breakfast Sandwich'], status: 'New', pickup: '10:30 AM' },
 { id: 102, customer: 'Taylor Smith', items: ['House Coffee'], status: 'Preparing', pickup: '10:45 AM' }
];
