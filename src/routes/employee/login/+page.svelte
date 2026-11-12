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
    <div class="brand-mark">HC</div>

    <div class="heading">
      <span class="eyebrow">HERITAGE CAFÉ · STAFF PORTAL</span>
      <h1>Welcome Back</h1>
      <p>Sign in to access your employee dashboard.</p>
    </div>

    <form method="POST" use:enhance>
      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="Enter your username"
          autocomplete="username"
          required
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          autocomplete="current-password"
          required
        />
      </div>

      {#if form?.error}
        <p class="error" role="alert">{form.error}</p>
      {/if}

      <button type="submit">Sign In <span aria-hidden="true">→</span></button>
    </form>

    <p class="footer-note">Employee access only</p>
  </section>
</main>

<style>
  .login-container {
    min-height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.25rem;
    background:
      radial-gradient(circle at 15% 20%, #e9d8c1 0, transparent 35%),
      radial-gradient(circle at 85% 80%, #e7d6c4 0, transparent 35%),
      #f8f5ef;
  }

  .login-card {
    width: 100%;
    max-width: 440px;
    padding: 2.75rem;
    background: #fffefa;
    border: 1px solid #eee3d6;
    border-radius: 18px;
    box-shadow: 0 18px 50px #4b332618;
  }

  .brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    margin: 0 auto 1.5rem;
    border-radius: 16px;
    background: #65452f;
    color: #fff;
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.04em;
  }

  .heading {
    text-align: center;
  }

  .eyebrow {
    color: #96765c;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0.6rem 0 0.5rem;
    color: #3e291e;
    font-size: clamp(1.8rem, 4vw, 2.2rem);
    font-weight: 750;
    letter-spacing: -0.04em;
  }

  .heading p {
    margin: 0;
    color: #786d66;
    font-size: 0.92rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    color: #4b3326;
    font-size: 0.9rem;
    font-weight: 650;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.95rem 1rem;
    border: 1px solid #ded5cb;
    border-radius: 9px;
    background: white;
    color: #35271f;
    font: inherit;
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input::placeholder {
    color: #a49b94;
  }

  input:focus {
    outline: none;
    border-color: #806047;
    box-shadow: 0 0 0 3px #80604720;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.35rem;
    padding: 1rem;
    border: none;
    border-radius: 9px;
    background: #65452f;
    color: white;
    font: inherit;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  button:hover {
    background: #4b3326;
    transform: translateY(-1px);
  }

  button:focus-visible {
    outline: 3px solid #b9906e;
    outline-offset: 3px;
  }

  .error {
    margin: 0;
    color: #b42318;
    font-size: 0.9rem;
  }

  .footer-note {
    margin: 1.75rem 0 0;
    text-align: center;
    color: #a0958d;
    font-size: 0.78rem;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 2rem 1.5rem;
    }
  }
</style>
