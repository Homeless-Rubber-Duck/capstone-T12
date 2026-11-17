export type MenuOption = {
	modifierOptionId: number;
	optionName: string;
	priceAdjustment: number;
};

export type MenuOptionGroup = {
	modifierGroupId: number;
	groupName: string;
	minSelection: number;
	maxSelection: number | null;
	options: MenuOption[];
};

export const COOKING_NOTICE =
	'Ramen and other items with cooking service are sold packaged online. Please order in-store if you’d like us to cook them.';

export function isCookingService(group: MenuOptionGroup) {
	return group.groupName.startsWith('Cooking Service - ');
}

export function onlineOptions(
	menuItemId: number,
	groups: MenuOptionGroup[],
	selectedIds: number[]
) {
	// The seeded coffee items are IDs 6–23. Cold Brew and Viet Coffee are always iced.
	const isCoffee = menuItemId >= 6 && menuItemId <= 23;
	const isIced =
		menuItemId === 10 ||
		menuItemId === 22 ||
		groups
			.find((group) => group.groupName === 'Espresso Temperature')
			?.options.some(
				(option) =>
					option.optionName.toLowerCase() === 'iced' &&
					selectedIds.includes(option.modifierOptionId)
			);

	return groups.filter(
		(group) =>
			!isCookingService(group) &&
			(group.groupName !== 'Cold Foam' || !isCoffee || isIced)
	);
}