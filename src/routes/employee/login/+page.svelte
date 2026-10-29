<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData | null } = $props();
</script>

<svelte:head>
  <title>Employee Login | Heritage Café</title>
</svelte:head>

<main class="login-container">
  <section class="login-card">
    <h1>Heritage Café</h1>
    <h2>Employee Login</h2>
    <p>Sign in to manage incoming orders.</p>

    <form method="POST" use:enhance>
      <label for="username">Username</label>
      <input
        id="username"
        type="text"
        name="username"
        autocomplete="username"
        required
      />

      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        name="password"
        autocomplete="current-password"
        required
      />

      {#if form?.error}
        <p class="error" role="alert">{form.error}</p>
      {/if}

      <button type="submit">Sign In</button>
    </form>
  </section>
</main>

<style>
  .login-container {
    min-height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f8f5ef;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px #00000012;
  }

  h1, h2 {
    text-align: center;
    color: #4b3326;
  }

  h2 { margin-bottom: 0.5rem; }
  p { text-align: center; color: #666; }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1.5rem;
  }

  label { font-weight: 600; }

  input {
    padding: 0.85rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.9rem;
    border: none;
    border-radius: 6px;
    background: #65452f;
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }

  .error { color: #b42318; }
</style>
