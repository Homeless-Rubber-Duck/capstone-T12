<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { cart, initCart, setQuantity, setNotes, clearCart, cartTotal, money } from '../../lib/cart.svelte';

	let { form }: PageProps = $props();
	let submitting = $state(false);
	let pickupOption = $state<'today' | 'later'>('today');

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
			<a href="/menu">← Back to menu</a>
			<h1>Review your order</h1>

			<ul>
			{#each cart.lines as line (line.menuItemId)}
				<li>
					<div class="row">
						<strong>{line.name}</strong>
						<span>{money(line.price * line.quantity)}</span>
					</div>
					<div class="row">
						<label>
							Qty
							<input
								type="number" min="0" max="20" value={line.quantity}
								onchange={(e) => setQuantity(line.menuItemId, Number(e.currentTarget.value))}
							/>
						</label>
						<button type="button" class="link" onclick={() => setQuantity(line.menuItemId, 0)}>Remove</button>
					</div>
					<input
						class="notes" placeholder="Notes (e.g., extra hot)" maxlength="500" value={line.notes}
						onchange={(e) => setNotes(line.menuItemId, e.currentTarget.value)}
					/>
				</li>
			{/each}
		</ul>
		<p class="total">Total: {money(cartTotal())}</p>

		<form
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
			<input type="hidden" name="cart" value={JSON.stringify(cart.lines)} />

			<label>Name <input name="fullName" required autocomplete="name" /></label>
			<label>Email <input name="email" type="email" required autocomplete="email" /></label>
			<label>Phone <input name="phone" type="tel" required autocomplete="tel" /></label>
			<fieldset>
				<legend>Pickup</legend>
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

			<button disabled={submitting}>{submitting ? 'Placing order…' : 'Place order'}</button>
		</form>
	{/if}
</div>

<style>
	ul { list-style: none; padding: 0; }
	li { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
	.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 6px; }
	input[type='number'] { width: 60px; margin-left: 6px; }
	.notes { width: 100%; box-sizing: border-box; }
	.total { font-size: 1.2rem; font-weight: 600; text-align: right; }
	form label { display: block; margin: 12px 0; }
	form input { display: block; width: 100%; box-sizing: border-box; padding: 8px; margin-top: 4px; }
	.hint { color: #666; font-size: 0.85rem; margin-top: -6px; }
	fieldset { border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; margin: 12px 0; }
	legend { padding: 0 4px; }
	form label.radio { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
	form label.radio input { display: inline; width: auto; margin: 0; }
	.errors li { color: #b00020; border: 0; padding: 2px 0; }
	button { padding: 12px 18px; border: 0; border-radius: 6px; background: #3b2a20; color: white; cursor: pointer; width: 100%; font-size: 1rem; }
	button:disabled { opacity: 0.6; }
	.link { background: none; color: #b00020; width: auto; padding: 0; font-size: 0.9rem; }

	.checkout-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 16px;
		font-family: system-ui, sans-serif;
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
</style>
