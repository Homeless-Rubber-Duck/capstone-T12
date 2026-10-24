<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { cart, initCart, addToCart, cartCount, cartTotal, money } from '../../lib/cart.svelte';

	let { data }: PageProps = $props();

	onMount(initCart);
</script>

<svelte:head><title>Order | Heritage Cafe</title></svelte:head>

<main>
	<h1>Order for Pickup</h1>

	{#if data.categories.length === 0}
		<p class="empty">The menu isn't available right now.</p>
	{/if}

	{#each data.categories as category (category.categoryId)}
		<section>
			<h2>{category.categoryName}</h2>
			<ul>
				{#each category.items as item (item.menuItemId)}
					<li>
						<div>
							<strong>{item.name}</strong>
							{#if item.description}<p>{item.description}</p>{/if}
						</div>
						<span class="price">{money(item.price)}</span>
						<button
							onclick={() =>
								addToCart({ menuItemId: item.menuItemId, name: item.name, price: item.price })}
						>
							Add
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	{#if cart.lines.length > 0}
		<a class="cart-bar" href="/checkout">
			View order ({cartCount()} {cartCount() === 1 ? 'item' : 'items'}) · {money(cartTotal())}
		</a>
	{/if}
</main>

<style>
	main { max-width: 640px; margin: 0 auto; padding: 16px 16px 96px; font-family: system-ui, sans-serif; }
	h2 { margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
	ul { list-style: none; padding: 0; margin: 0; }
	li { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
	li p { margin: 4px 0 0; color: #666; font-size: 0.9rem; }
	.price { font-variant-numeric: tabular-nums; }
	button { padding: 8px 14px; border: 0; border-radius: 6px; background: #3b2a20; color: white; cursor: pointer; }
	.cart-bar { position: fixed; left: 16px; right: 16px; bottom: 16px; max-width: 608px; margin: 0 auto; padding: 14px; border-radius: 8px; background: #3b2a20; color: white; text-align: center; text-decoration: none; font-weight: 600; }
	.empty { color: #666; }
</style>
