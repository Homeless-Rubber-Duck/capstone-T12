<script lang="ts">
  import { page } from '$app/state';
  import { cartCount } from '../cart.svelte';
  import { navigation } from '../index';
  import Brand from './Brand.svelte';

  let itemCount = $derived(cartCount());
</script>

<header class="site-header sticky-top">
  <nav class="navbar container py-3 gap-2" aria-label="Main navigation">
    <Brand variant="header" />

    <ul class="navbar-nav public-navigation flex-row flex-wrap gap-1 ms-lg-auto">
      {#each navigation as item}
        <li class="nav-item">
          <a
            class="nav-link px-2"
            aria-current={page.url.pathname === item.href ? 'page' : undefined}
            href={item.href}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <a
      class="cart-link"
      href="/checkout"
      aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      aria-current={page.url.pathname === '/checkout' ? 'page' : undefined}
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

<style>
  .site-header {
    background-color: #14110c;
    color: #d4d0ce;
    border-bottom: 1px solid #c8c0bb;
  }

  .site-header .nav-link {
    color: #d4d0ce;
    background-color: transparent;
    text-decoration: none;
  }

  .site-header .nav-link:is(:hover, :focus-visible, [aria-current='page']) {
    color: #d4d0ce;
    background-color: transparent;
    text-decoration: underline;
    text-underline-offset: 6px;
  }

  .cart-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-width: 44px;
    min-height: 44px;
    padding-inline: 0.5rem;
    color: #d4d0ce;
    text-decoration: none;
  }

  .cart-link:is(:hover, :focus-visible, [aria-current='page'])::after {
    position: absolute;
    inset-inline: 0.5rem;
    bottom: 0.25rem;
    height: 1px;
    background-color: currentColor;
    content: '';
  }

  .cart-count {
    font-size: 0.8rem;
    font-weight: 700;
  }

  .site-header :global(a:focus-visible) {
    outline: 2px solid #d4d0ce;
    outline-offset: 3px;
  }

  @media (max-width: 991.98px) {
    .public-navigation {
      order: 1;
      flex-basis: 100%;
    }
  }
</style>