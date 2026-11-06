<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { cart, initCart, addToCart, cartCount, cartTotal, money } from '../../lib/cart.svelte';

	let { data }: PageProps = $props();

	onMount(initCart);
	let cartExpanded = $state(false);
	const coffeeCategories = ['Espresso Drinks', 'More Coffee Options'];

	let sortedCategories = $derived(
    	[...data.categories].sort((a, b) => {
        	const aCoffee = coffeeCategories.includes(a.categoryName.trim());
        	const bCoffee = coffeeCategories.includes(b.categoryName.trim());

        	return Number(bCoffee) - Number(aCoffee);
    	})
	);
</script>

<svelte:head><title>Order | Heritage Cafe</title></svelte:head>

<main>
	<h1>Order for Pickup</h1>

	{#if data.categories.length === 0}
		<p class="empty">The menu isn't available right now.</p>
	{/if}

	{#each sortedCategories as category (category.categoryId)}
		<details
		 	class="menu-category"
			open={coffeeCategories.includes(category.categoryName.trim())}
		>
			<summary>{category.categoryName}</summary>
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
		</details>
	{/each}

	{#if cart.lines.length > 0}
    	<aside class="cart-preview">
        	<button
            	class="cart-toggle"
            	onclick={() => (cartExpanded = !cartExpanded)}
            	aria-expanded={cartExpanded}
        	>
            	Your Cart ({cartCount()}) — {money(cartTotal())}
            	<span>{cartExpanded ? '▲' : '▼'}</span>
        	</button>

        	<div class:expanded={cartExpanded} class="cart-content">
            	<h2>Your Cart ({cartCount()})</h2>

        	<ul>
            	{#each cart.lines as item (item.menuItemId)}
                	<li>
                    	<span>{item.quantity}x {item.name}</span>
                    	<span>{money(item.price * item.quantity)}</span>
                	</li>
            	{/each}
        	</ul>

        	<p class="cart-total">
            	<strong>Total: {money(cartTotal())}</strong>
        	</p>

        	<a class="checkout-link" href="/checkout">
            	Continue to Checkout
        	</a>
			</div>
    	</aside>
	{/if}
</main>


<style>
    main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px 16px 100px;
        color: var(--cafe-text);
    }

    h1 {
        margin-bottom: 28px;
        font-size: 2.2rem;
        font-weight: 700;
    }

    .menu-category {
        max-width: 700px;
        margin-bottom: 16px;
        border: 1px solid #d4d0ce;
        border-radius: 10px;
        background: #fffaf4;
        overflow: hidden;
    }

    summary {
        padding: 16px 20px;
        font-size: 1.3rem;
        font-weight: 600;
        cursor: pointer;
        background: var(--cafe-footer);
        color: var(--cafe-text);
    }

    summary:hover {
        background: #eef2ed;
    }

    ul {
        list-style: none;
        padding: 0 20px;
        margin: 0;
    }

    li {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 12px;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #e5e5e5;
    }

    li:last-child {
        border-bottom: none;
    }

    li p {
        margin: 4px 0 0;
        color: #666;
        font-size: 0.9rem;
    }

    .price {
        font-variant-numeric: tabular-nums;
    }

   button,
    .checkout-link {
		padding: 10px 16px;
    	border: none;
    	border-radius: 6px;
    	background: #405949;
    	color: white;
    	cursor: pointer;
}
	.cart-toggle {
    	display: none;
	}

	.cart-content {
    	display: block;
	}
    .cart-preview {
        position: fixed;
        right: 24px;
        bottom: calc(var(--footer-summary-height, 120px) + 16px);
        width: 300px;
        max-height: 55vh;
        overflow-y: auto;
        padding: 20px;
        background: #fffaf4;
        border: 1px solid #d4d0ce;
        border-radius: 12px;
        box-shadow: 0 4px 16px #0002;
        z-index: 1000;
    }

    .cart-preview h2 {
        font-size: 1.3rem;
        margin-bottom: 12px;
    }

    .cart-preview ul {
        padding: 0;
    }

    .cart-preview li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
    }

    .cart-total {
        margin-top: 16px;
        font-weight: 600;
    }

    .checkout-link {
        display: block;
        margin-top: 12px;
        text-align: center;
        text-decoration: none;
    }

    .checkout-link:hover {
        background: var(--cafe-text);
        color: white;
    }

    .empty {
        color: #666;
    }

    @media (max-width: 900px) {
        .menu-category {
            max-width: 100%;
        }

        .cart-preview {
    		left: 16px;
    		right: 16px;
    		bottom: calc(var(--footer-summary-height, 120px) + 8px);
    		width: auto;
    		max-height: 55vh;
    		padding: 0;
		}
		.cart-toggle {
    		display: flex;
    		width: 100%;
    		align-items: center;
    		justify-content: space-between;
    		padding: 14px 16px;
    		border-radius: 10px;
		}

		.cart-content {
    		display: none;
    		padding: 14px;
		}

		.cart-content.expanded {
    		display: block;
		}
    }

    @media (max-width: 480px) {
        li {
            grid-template-columns: 1fr auto;
        }

        li > div {
            grid-column: 1 / -1;
        }
    }
</style>
