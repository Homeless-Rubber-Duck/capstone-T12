<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../lib/styles.css';

  import { onMount } from 'svelte';
  import favicon from '#lib/assets/favicon.svg';
  import { initCart } from '../lib/cart.svelte';
  import SiteHeader from '../lib/components/SiteHeader.svelte';
  import SiteFooter from '../lib/components/SiteFooter.svelte';

  let { children } = $props();

  onMount(initCart);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<SiteHeader />

<main>
  {@render children()}
</main>

<SiteFooter />

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

  main {
    min-height: 75vh;
  }
</style>