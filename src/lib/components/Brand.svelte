<!-- this is a Svelte component for the site brand, which is the logo and name of the site, which is used in the site header and other places where the site brand is needed -->

<script lang="ts">
  import { site } from '../index';

  let {
  variant = 'default',
  showLocation = true
}: {
  variant?: 'default' | 'header';
  showLocation?: boolean;
} = $props();
</script>

<a
  class="site-brand text-decoration-none d-inline-flex align-items-center gap-3"
  class:header-brand={variant === 'header'}
  href="/"
>
  {#if variant === 'header'}
    <img class="brand-cup" src="/images/lightgray-cup-logo.png" alt="" />
  {/if}

  <span>
    <strong class="brand-name d-block">{site.name}</strong>
    {#if variant === 'default' && showLocation}
      <small class="d-block">{site.location}</small>
    {/if}
  </span>
</a>

<style>
  .site-brand.header-brand {
    color: #d4d0ce;
  }

  .brand-name {
    font-family: 'Dancing Script', cursive;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .header-brand .brand-name {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }

  .brand-cup {
    display: block;
    flex: 0 0 auto;
    width: auto;
    height: clamp(2rem, 5vw, 2.75rem);
    }
</style>