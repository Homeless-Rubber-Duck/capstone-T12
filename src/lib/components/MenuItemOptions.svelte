<script lang="ts">
	import { addToCart, money } from '../cart.svelte';
	import { onlineOptions, type MenuOptionGroup } from '../menuOptions';
	import { toCents } from '../orderPricing';

	let { item }: {
		item: {
			menuItemId: number;
			name: string;
			price: number;
			groups: MenuOptionGroup[];
		};
	} = $props();

	let selectedIds = $state<number[]>([]);
	const groups = $derived(onlineOptions(item.menuItemId, item.groups, selectedIds));
	const modifiers = $derived(
		groups.flatMap((group) =>
			group.options.filter((option) => selectedIds.includes(option.modifierOptionId))
		)
	);
	const price = $derived(
		modifiers.reduce(
			(sum, option) => sum + toCents(option.priceAdjustment),
			toCents(item.price)
		) / 100
	);
	const canAdd = $derived(
		groups.every((group) => selectedIn(group).length >= group.minSelection)
	);

	function selectedIn(group: MenuOptionGroup) {
		return group.options.filter((option) => selectedIds.includes(option.modifierOptionId));
	}

	function updateSelection(nextIds: number[]) {
		const eligibleIds = new Set(
			onlineOptions(item.menuItemId, item.groups, nextIds)
				.flatMap((group) => group.options)
				.map((option) => option.modifierOptionId)
		);

		selectedIds = nextIds.filter((id) => eligibleIds.has(id));
	}

	function selectOne(group: MenuOptionGroup, value: string) {
		const groupIds = group.options.map((option) => option.modifierOptionId);
		const nextIds = selectedIds.filter((id) => !groupIds.includes(id));
		if (value) nextIds.push(Number(value));
		updateSelection(nextIds);
	}

	function toggleOption(id: number, checked: boolean) {
		updateSelection(
			checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id)
		);
	}

	function optionPrice(adjustment: number) {
		if (adjustment === 0) return '';
		const sign = adjustment > 0 ? '+' : '−';
		return ` (${sign}${money(Math.abs(adjustment))})`;
	}

	function addItem() {
		if (!canAdd) return;

		addToCart({
			menuItemId: item.menuItemId,
			name: item.name,
			price: item.price,
			modifiers
		});
	}
</script>

<details class="options">
	<summary>Customize {item.name}</summary>

	<div class="option-groups">
		{#each groups as group (group.modifierGroupId)}
			{@const selected = selectedIn(group)}

			{#if group.maxSelection === 1}
				<label class="single-option">
					{group.groupName}{group.minSelection > 0 ? ' (required)' : ''}
					<select
						value={selected[0]?.modifierOptionId ?? ''}
						onchange={(e) => selectOne(group, e.currentTarget.value)}
					>
						<option value="">{group.minSelection > 0 ? 'Choose one' : 'No selection'}</option>
						{#each group.options as option (option.modifierOptionId)}
							<option value={option.modifierOptionId}>
								{option.optionName}{optionPrice(option.priceAdjustment)}
							</option>
						{/each}
					</select>
				</label>
			{:else}
				<fieldset>
					<legend>
						{group.groupName}
						{#if group.minSelection > 0} · Choose at least {group.minSelection}{/if}
						{#if group.maxSelection !== null} · Up to {group.maxSelection}{/if}
					</legend>

					<div class="option-choices">
						{#each group.options as option (option.modifierOptionId)}
							{@const checked = selectedIds.includes(option.modifierOptionId)}
							<label class="choice">
								<input
									type="checkbox"
									{checked}
									disabled={!checked && group.maxSelection !== null && selected.length >= group.maxSelection}
									onchange={(e) => toggleOption(option.modifierOptionId, e.currentTarget.checked)}
								/>
								<span>{option.optionName}{optionPrice(option.priceAdjustment)}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{/if}
		{/each}
	</div>
</details>

<div class="option-actions">
	<span>{money(price)}</span>
	<button type="button" disabled={!canAdd} onclick={addItem}>Add</button>
</div>

<style>
	.options {
		border: 1px solid #d4d0ce;
		border-radius: 8px;
		background: #fffaf4;
	}

	.options summary {
		padding: 0.5rem 0.75rem;
		color: #405949;
		font-weight: 600;
		cursor: pointer;
	}

	.option-groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: 0.75rem;
		padding: 0.25rem 0.75rem 0.75rem;
		font-size: 0.9rem;
	}

	.single-option,
	fieldset {
		min-width: 0;
		margin: 0;
	}

	.single-option select {
		display: block;
		width: 100%;
		min-height: 2.25rem;
		margin-top: 0.25rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid #b9b2ac;
		border-radius: 6px;
		background: white;
	}

	fieldset {
		grid-column: 1 / -1;
		padding: 0.5rem 0 0;
		border: 0;
		border-top: 1px solid #ded8d1;
	}

	legend {
		float: none;
		width: auto;
		margin: 0;
		padding-right: 0.35rem;
		font-size: inherit;
		font-weight: 600;
	}

	.option-choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
		gap: 0.35rem 0.75rem;
		max-height: 10rem;
		overflow-y: auto;
		padding: 0.25rem 0.5rem 0.25rem 0;
	}

	.choice {
		display: flex;
		align-items: flex-start;
		gap: 0.45rem;
	}

	.choice input {
		flex-shrink: 0;
		margin-top: 0.2rem;
		accent-color: #405949;
	}

	.option-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.option-actions span {
		font-variant-numeric: tabular-nums;
	}

	button {
		padding: 10px 16px;
		border: 0;
		border-radius: 6px;
		background: #405949;
		color: white;
	}

	button:disabled {
		opacity: 0.55;
	}
</style>