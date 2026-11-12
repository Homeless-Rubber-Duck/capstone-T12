<!-- this is a Svelte component for the employee site header to make it less prominent from the rest of the navigation bar, putting it in its own hamburger menu -->

<script lang="ts">
  import { page } from '$app/state';
  import { cartCount } from '../cart.svelte';
  import { navigation } from '../index';
  import Brand from './Brand.svelte';

  let employeeNav: HTMLDetailsElement;
  let itemCount = $derived(cartCount());
</script>

<svelte:window
  onkeydown={(event) => {
    if (
      event.key === 'Escape' &&
      employeeNav?.open &&
      employeeNav.contains(event.target as Node)
    ) {
      employeeNav.open = false;
      employeeNav.querySelector('summary')?.focus();
    }
  }}
/>

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

    <div class="header-controls d-flex align-items-center gap-2">
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

    <!-- Separate employee hamburger. -->
    <details
        class="employee-navigation position-relative"
        bind:this={employeeNav}
      >
        <summary class="navbar-toggler" aria-label="Employee navigation">
          <span class="navbar-toggler-icon" aria-hidden="true"></span>
        </summary>

        <div class="employee-panel position-absolute end-0 rounded shadow-sm p-2">
          <a
            class="dropdown-item rounded p-2"
            href="/employee"
            aria-current={page.url.pathname === '/employee' ? 'page' : undefined}
            onclick={() => (employeeNav.open = false)}
          >
            Employee
          </a>
        </div>
      </details>
    </div>
  </nav>
</header>

<style>
  .site-header {
    background-color: #14110c;
    color: #d4d0ce;
    border-bottom: 1px solid #c8c0bb;
  }

  .site-header .nav-link,
  .employee-panel .dropdown-item {
    color: #d4d0ce;
    background-color: transparent;
    text-decoration: none;
  }

  .site-header .nav-link:is(:hover, :focus-visible, [aria-current='page']),
  .employee-panel .dropdown-item:is(:hover, :focus-visible, [aria-current='page']) {
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

  .navbar-toggler {
    display: grid;
    min-width: 44px;
    min-height: 44px;
    place-items: center;
    padding: 0.5rem;
    color: #d4d0ce;
    border-color: #c8c0bb;
    list-style: none;
  }

  .navbar-toggler::-webkit-details-marker {
    display: none;
  }

  .navbar-toggler-icon {
    width: 1.25rem;
    height: 0.875rem;
    border-block: 2px solid currentColor;
    background: linear-gradient(currentColor, currentColor) center / 100% 2px no-repeat;
  }

  .employee-panel {
    top: calc(100% + 0.5rem);
    min-width: 9rem;
    background-color: #14110c;
    border: 1px solid #c8c0bb;
  }

  .site-header :global(:is(a, summary):focus-visible) {
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