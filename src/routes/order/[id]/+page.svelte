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
				<span>{item.quantity}× {item.name}{#if item.notes}<em class="note">({item.notes})</em>{/if}</span>
				<span>{money(item.quantity * item.unitPrice)}</span>
			</li>
		{/each}
	</ul>
	<p class="total">Total: {money(order.total)}</p>
	<p class="hint">Pay at pickup.</p>

	<a href="/menu">Place another order</a>
</main>

<style>
	main { max-width: 640px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif; }
	.big { font-size: 1.6rem; font-weight: 700; margin: 0; }
	ul { list-style: none; padding: 0; }
	li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
	.total { font-size: 1.2rem; font-weight: 600; text-align: right; }
	.hint { color: #666; }
	.note { margin-left: 6px; color: #666; }
</style>
