<!-- this is a Svelte component for the employee site header to make it less prominent from the rest of the navigation bar, putting it in its own hamburger menu -->

<script lang="ts">
  import { page } from '$app/state';
  import { navigation } from '../index';
  import Brand from './Brand.svelte';

  let employeeNav: HTMLDetailsElement;
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

<header class="site-header sticky-top border-bottom bg-white">

  <nav class="navbar container py-3 gap-3" aria-label="Main navigation">
    <Brand />

    <ul
      class="navbar-nav public-navigation flex-row flex-wrap gap-1 ms-lg-auto"
    >
      {#each navigation as item}
        <li class="nav-item">
          <a
            class="nav-link px-3 rounded"
            class:active={page.url.pathname === item.href}
            aria-current={page.url.pathname === item.href
              ? 'page'
              : undefined}
            href={item.href}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <!-- Separate employee hamburger. -->
    <details
      class="employee-navigation position-relative"
      bind:this={employeeNav}
    >
      <summary class="navbar-toggler" aria-label="Employee navigation">
        <span class="navbar-toggler-icon" aria-hidden="true"></span>
      </summary>

      <div
        class="employee-panel position-absolute end-0 bg-white border rounded shadow-sm p-2"
      >
        <a
          class="dropdown-item rounded p-2"
          href="/employee"
          onclick={() => (employeeNav.open = false)}
        >
          Employee
        </a>
      </div>
    </details>
  </nav>
</header>