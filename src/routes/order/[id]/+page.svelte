<script lang="ts">
	import type { PageProps } from './$types';
	import { money } from '../../../lib/cart.svelte';

	let { data }: PageProps = $props();
	const order = $derived(data.order);

	const pickup = $derived(
		new Date(order.pickupTime.replace(' ', 'T')).toLocaleString([], {
			weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
		})
	);
</script>

<svelte:head><title>Order #{order.orderId} confirmed | Heritage Cafe</title></svelte:head>

<main>
	<h1>Order confirmed ✓</h1>
	<p class="big">Order #{order.orderId}</p>
	<p>Thanks, {order.customerName}! Pick up your order at <strong>{pickup}</strong>.</p>
	<p>Status: <strong>{order.status}</strong></p>

	<ul>
		{#each order.items as item}
			<li>
				<span>
					{item.quantity}× {item.name}
					{#if item.notes}<em class="note">({item.notes})</em>{/if}
					{#if item.modifiers.length}
						<small class="item-options">
							{item.modifiers.map((modifier) => modifier.name).join(' · ')}
						</small>
					{/if}
				</span>
				<span>{money(item.quantity * item.unitPrice)}</span>
			</li>
		{/each}
	</ul>
	<dl class="totals">
		{#if order.salesTaxBasisPoints > 0}
			<div>
				<dt>Subtotal</dt>
				<dd>{money(order.subtotal)}</dd>
			</div>
			<div>
				<dt>Sales tax</dt>
				<dd>{money(order.salesTax)}</dd>
			</div>
		{/if}
		<div class="total">
			<dt>Total</dt>
			<dd>{money(order.total)}</dd>
		</div>
	</dl>
	<p class="hint">Pay at pickup.</p>
	<p class="hint">You can come back to this page on this device to check your order.</p>

	<a href="/menu">Place another order</a>
</main>

<style>
	main { max-width: 640px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif; }
	.big { font-size: 1.6rem; font-weight: 700; margin: 0; }
	ul { list-style: none; padding: 0; }
	li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
	.totals { margin: 1rem 0; font-variant-numeric: tabular-nums; }
	.totals > div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.3rem 0;}

	.totals dt,
	.totals dd { margin: 0; font-weight: 400; }

	.totals .total { margin-top: 0.4rem; padding-top: 0.75rem; border-top: 1px solid #d4d0ce; font-size: 1.15rem; }

	.totals .total dt,
	.totals .total dd { font-weight: 700; }
	.hint { color: #666; }
	.note { margin-left: 6px; color: #666; }

	.item-options {
		display: block;
		margin-top: 0.25rem;
		color: #666;
	}
</style>
