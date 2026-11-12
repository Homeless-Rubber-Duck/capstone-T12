<script lang="ts">
  import favicon from '#lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  <a class="brand" href="/">Heritage Café</a>

  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/menu">Menu</a>
    <a href="/employee/login">Employee</a>
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
    font-family: 'Dancing Script', cursive;
    font-size: 2rem;
    font-weight: 700;
    color: #d4d0ce;
    text-decoration: none;
  }

  nav {
    display: flex;
    gap: 1.4rem;
  }

  nav a {
    color: #d4d0ce;
    text-decoration: none;
  }

  nav a:hover {
    text-decoration: underline;
    text-underline-offset: 6px;
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