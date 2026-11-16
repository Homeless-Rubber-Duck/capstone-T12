<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../lib/styles.css';

  import { onMount } from 'svelte';
  import { initCart } from '../lib/cart.svelte';
  import SiteHeader from '../lib/components/SiteHeader.svelte';
  import SiteFooter from '../lib/components/SiteFooter.svelte';

  let { children } = $props();

  let favicon = $state('/images/darkgray-cup-logo.png');

  onMount(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function updateFavicon() {
      favicon = colorScheme.matches
        ? '/images/lightgray-cup-logo.png'
        : '/images/darkgray-cup-logo.png';
    }

    updateFavicon();
    colorScheme.addEventListener('change', updateFavicon);
    initCart();

    return () => colorScheme.removeEventListener('change', updateFavicon);
  });
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={favicon} />
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