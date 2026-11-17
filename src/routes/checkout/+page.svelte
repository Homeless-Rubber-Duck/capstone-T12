<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { cart, initCart, setQuantity, setNotes, clearCart, cartTotal, money } from '../../lib/cart.svelte';
	import { orderTotals, SALES_TAX_BASIS_POINTS, toCents } from '../../lib/orderPricing';

	let { form }: PageProps = $props();
	let submitting = $state(false);
	let pickupOption = $state<'today' | 'later'>('today');

	const totals = $derived(orderTotals(toCents(cartTotal()), SALES_TAX_BASIS_POINTS));
	const submittedCart = $derived(
		cart.lines.map((line) => ({
			menuItemId: line.menuItemId,
			quantity: line.quantity,
			notes: line.notes,
			price: line.price,
			modifierOptionIds: line.modifiers.map((option) => option.modifierOptionId)
		}))
	);

	onMount(initCart);
</script>

<svelte:head><title>Review Order | Heritage Cafe</title></svelte:head>

	<div class="checkout-page">
		{#if cart.lines.length === 0}
			<section class="checkout-empty" aria-labelledby="checkout-empty-title">
				<img
					class="checkout-empty-logo"
					src="/images/darkgray-cup-logo.png"
					alt=""
					width="553"
					height="784"
				/>

				<h1 id="checkout-empty-title">Your cart is empty</h1>
				<p>Find something you like on the menu and add it to your cart.</p>

				<a class="checkout-menu-button" href="/menu">
					Browse the Menu <span aria-hidden="true">→</span>
				</a>
			</section>
		{:else}
			<a class="back-to-menu" href="/menu">← Back to menu</a>
			<h1>Review your order</h1>

			<div class="checkout-grid">
				<section class="checkout-panel" aria-labelledby="order-summary-title">
					<h2 id="order-summary-title">Order summary</h2>

					<ul class="order-items">
						{#each cart.lines as line (line.id)}
							<li>
								<div class="item-row">
									<strong>{line.name}</strong>
									<span class="amount">{money(line.price * line.quantity)}</span>
								</div>

								{#if line.modifiers.length}
									<p class="item-options">
										{line.modifiers.map((option) =>
											option.priceAdjustment > 0
												? `${option.optionName} (+${money(option.priceAdjustment)} each)`
												: option.optionName
										).join(' · ')}
									</p>
								{/if}

								<div class="item-row item-controls">
									<label>
										Qty
										<input
											type="number"
											min="0"
											max="20"
											value={line.quantity}
											onchange={(e) => setQuantity(line.id, Number(e.currentTarget.value))}
										/>
									</label>
									<button
										type="button"
										class="link"
										onclick={() => setQuantity(line.id, 0)}
									>
										Remove
									</button>
								</div>

								<input
									class="notes"
									aria-label={`Notes for ${line.name}`}
									placeholder="Notes (e.g., extra hot)"
									maxlength="500"
									value={line.notes}
									onchange={(e) => setNotes(line.id, e.currentTarget.value)}
								/>
							</li>
						{/each}
					</ul>

					<dl class="totals">
						<div>
							<dt>Subtotal</dt>
							<dd>{money(totals.subtotal)}</dd>
						</div>
						<div>
							<dt>Sales tax</dt>
							<dd>{money(totals.salesTax)}</dd>
						</div>
						<div class="total">
							<dt>Total</dt>
							<dd>{money(totals.total)}</dd>
						</div>
					</dl>
				</section>

				<form
					class="checkout-panel"
					method="POST"
					use:enhance={() => {
						submitting = true;
						return async ({ result, update }) => {
							if (result.type === 'redirect') clearCart();
							await update();
							submitting = false;
						};
					}}
				>
					<h2>Pickup details</h2>
					<input type="hidden" name="cart" value={JSON.stringify(submittedCart)} />

					<label>Name <input name="fullName" required autocomplete="name" /></label>
					<label>Email <input name="email" type="email" required autocomplete="email" /></label>
					<label>Phone <input name="phone" type="tel" required autocomplete="tel" /></label>

					<fieldset>
						<legend>Pickup time</legend>
						<label class="radio">
							<input type="radio" name="pickupOption" value="today" bind:group={pickupOption} />
							Pickup today
						</label>
						<label class="radio">
							<input type="radio" name="pickupOption" value="later" bind:group={pickupOption} />
							Another day
						</label>

						{#if pickupOption === 'today'}
							<label>Time <input name="pickupTodayTime" type="time" min="08:00" max="20:00" required /></label>
						{:else}
							<label>Date and time <input name="pickupDateTime" type="datetime-local" required /></label>
						{/if}
						<p class="hint">Mon–Sat 8:00am–8:00pm · Sun 8:30am–8:00pm</p>
					</fieldset>

					{#if form?.errors}
						<ul class="errors">
							{#each form.errors as err}<li>{err}</li>{/each}
						</ul>
					{/if}

					<button type="submit" disabled={submitting}>
						{submitting ? 'Placing order…' : 'Place order'}
					</button>
				</form>
			</div>
		{/if}
</div>

<style>
	.checkout-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 1.5rem 1rem 2rem;
		font-family: system-ui, sans-serif;
	}

	.back-to-menu {
		display: inline-block;
		margin-bottom: 0.5rem;
		color: #405949;
		text-underline-offset: 0.2em;
	}

	.checkout-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: start;
		gap: 1.25rem;
		margin-top: 1.25rem;
	}

	.checkout-panel {
		padding: clamp(1rem, 3vw, 1.5rem);
		border: 1px solid #d4d0ce;
		border-radius: 12px;
		background: #fffaf4;
	}

	.checkout-panel h2 {
		margin: 0 0 0.75rem;
		font-size: 1.2rem;
	}

	.order-items,
	.errors {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.order-items li {
		padding: 0.85rem 0;
		border-bottom: 1px solid #ded8d1;
	}

	.item-row,
	.totals > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.item-controls {
		margin: 0.65rem 0;
	}

	.amount,
	.totals dd {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.checkout-panel input:not([type='radio']):not([type='hidden']) {
		min-height: 2.5rem;
		padding: 0.45rem 0.65rem;
		border: 1px solid #b9b2ac;
		border-radius: 6px;
	}

	input[type='number'] {
		width: 4.5rem;
		margin-left: 0.35rem;
	}

	.notes,
	form input:not([type='radio']):not([type='hidden']) {
		display: block;
		width: 100%;
		box-sizing: border-box;
	}

	.totals {
		margin: 1rem 0 0;
	}

	.totals > div {
		padding: 0.3rem 0;
	}

	.totals dt,
	.totals dd {
		margin: 0;
		font-weight: 400;
	}

	.totals .total {
		margin-top: 0.4rem;
		padding-top: 0.75rem;
		border-top: 1px solid #d4d0ce;
		font-size: 1.15rem;
	}

	.totals .total dt,
	.totals .total dd {
		font-weight: 700;
	}

	form label {
		display: block;
		margin: 0.75rem 0;
	}

	form label input:not([type='radio']) {
		margin-top: 0.25rem;
	}

	fieldset {
		margin: 0.75rem 0 1rem;
		padding: 0.75rem;
		border: 1px solid #ded8d1;
		border-radius: 6px;
	}

	legend {
		float: none;
		width: auto;
		margin: 0;
		padding: 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	form label.radio {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.4rem 0;
	}

	.hint {
		margin: 0.5rem 0 0;
		color: #666;
		font-size: 0.85rem;
	}

	.errors {
		margin-bottom: 0.75rem;
		color: #b00020;
	}

	.link {
		padding: 0.25rem 0;
		border: 0;
		background: transparent;
		color: #a12622;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	button[type='submit'] {
		width: 100%;
		min-height: 44px;
		padding: 0.65rem 1rem;
		border: 0;
		border-radius: 6px;
		background: #405949;
		color: white;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.6;
	}

	@media (max-width: 700px) {
		.checkout-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.checkout-empty {
		display: grid;
		min-block-size: clamp(22rem, 48vh, 32rem);
		align-content: center;
		justify-items: center;
		gap: 1rem;
		padding: 2rem 1rem;
		color: #14110c;
		text-align: center;
	}

	.checkout-empty-logo {
		width: auto;
		height: 3.5rem;
	}

	.checkout-empty h1 {
		margin: 0;
		font-family: 'Dancing Script', cursive;
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
	}

	.checkout-empty p {
		max-width: 34ch;
		margin: 0;
		line-height: 1.6;
	}

	.checkout-menu-button {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		min-height: 44px;
		padding: 0.75rem 1.25rem;
		border-radius: 0.375rem;
		background-color: #14110c;
		color: #d4d0ce;
		font-weight: 700;
		text-decoration: none;
	}

	.checkout-menu-button:hover {
		background-color: #322820;
		color: #d4d0ce;
	}

	.checkout-menu-button:focus-visible {
		outline: 2px solid #14110c;
		outline-offset: 4px;
	}

	.item-options {
		margin: 0.25rem 0 0;
		color: #666;
		font-size: 0.9rem;
	}
</style>
