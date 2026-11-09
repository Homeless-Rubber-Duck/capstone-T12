<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import favicon from '#lib/assets/favicon.svg';
  import { cartCount, initCart } from '../lib/cart.svelte';

  let { children } = $props();
  let itemCount = $derived(cartCount());

  onMount(initCart);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  <a class="brand" href="/">
    <span class="brand-cup" aria-hidden="true"></span>
    Heritage Café
  </a>

  <nav aria-label="Main navigation">
    <a href="/" aria-current={page.route.id === '/' ? 'page' : undefined}>
      Home
    </a>

    <a href="/menu" aria-current={page.route.id === '/menu' ? 'page' : undefined}>
      Menu
    </a>

    <a
      href="/employee/login"
      aria-current={page.route.id === '/employee/login' ? 'page' : undefined}
    >
      Employee
    </a>

    <a
      class="cart-link"
      href="/checkout"
      aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      aria-current={page.route.id === '/checkout' ? 'page' : undefined}
    >
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M2 3h3l2.5 12h11l2.5-9H5.6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>

      {#if itemCount > 0}
        <span class="cart-count" aria-hidden="true">{itemCount}</span>
      {/if}
    </a>
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer>Heritage Café · Team 12 Capstone Project</footer>

<style>
  @font-face {
    font-family: 'Dancing Script';
    src: url('/fonts/dancing-script/DancingScript-VariableFont_wght.ttf')
      format('truetype');
    font-weight: 400 700;
    font-style: normal;
    font-display: swap;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #fffaf4;
    color: #322820;
  }

  :global(button),
  :global(input) {
    font: inherit;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1.1rem max(1.5rem, calc((100vw - 1100px) / 2));
    background: #14110c;
    border-bottom: 1px solid #c8c0bb;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    font-family: 'Dancing Script', cursive;
    font-size: 2rem;
    font-weight: 700;
    color: #d4d0ce;
    text-decoration: none;
  }

  .brand-cup {
    width: 3.25rem;
    aspect-ratio: 2 / 1;
    background: currentColor;
    mask: url('/images/darkgray-cup-logo.png') center / contain no-repeat;
  }

  nav {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 3vw, 1.4rem);
  }

  nav a {
    color: #d4d0ce;
    text-decoration: none;
  }

  nav a:not(.cart-link):is(:hover, [aria-current='page']) {
    text-decoration: underline;
    text-underline-offset: 6px;
  }

  .cart-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-width: 44px;
    min-height: 44px;
    padding: 0.35rem 0.55rem;
    border-radius: 0.5rem;
  }

  .cart-link:is(:hover, [aria-current='page']) {
    background: #d4d0ce;
    color: #14110c;
  }

  .cart-count {
    font-size: 0.8rem;
    font-weight: 700;
  }

  @media (max-width: 34rem) {
    nav {
      width: 100%;
    }

    .cart-link {
      margin-inline-start: auto;
    }
  }

  header a:focus-visible {
    outline: 2px solid #d4d0ce;
    outline-offset: 6px;
  }

  main {
    min-height: 75vh;
  }

  footer {
    text-align: center;
    padding: 2rem;
    background: #c8c0bb;
    color: #14110c;
    border-top: 1px solid #b7aea7;
  }
</style>