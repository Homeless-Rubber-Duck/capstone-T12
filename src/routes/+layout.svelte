<script lang="ts">

  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../lib/styles.css';

  import favicon from '../lib/assets/favicon.svg';
  import SiteHeader from '../lib/components/SiteHeader.svelte';
  import SiteFooter from '../lib/components/SiteFooter.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="site-shell">
  <SiteHeader />

  <main id="main-content" class="site-main container">
    {@render children()}
  </main>

  <SiteFooter />
</div>