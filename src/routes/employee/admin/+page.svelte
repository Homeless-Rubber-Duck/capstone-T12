<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let editingId = $state<number | null>(null);
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Employee Administration | Heritage Café</title></svelte:head>
<main class="admin">
  <nav><a href="/employee">← Order Management</a> · <strong>Employee Administration</strong></nav>
  <h1>Manage Employee Accounts</h1>
  <p>Only administrators can create, edit, reset passwords, and remove employee accounts.</p>
  {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
  {#if form?.success}<p class="success" role="status">{form.success}</p>{/if}
  <section>
    <h2>Add an employee</h2>
    <form method="POST" action="?/create">
      <label>Full name <input name="fullName" required maxlength="120" autocomplete="off" /></label>
      <label>Email <input name="email" type="email" required maxlength="255" autocomplete="off" /></label>
      <label>Username <input name="username" required minlength="3" maxlength="100" pattern="[A-Za-z0-9_.-]+" autocomplete="off" /></label>
      <label>Temporary password <input name="password" type="password" required minlength="12" maxlength="256" autocomplete="new-password" /></label>
      <button type="submit">Create employee</button>
    </form>
  </section>
  <section>
    <h2>Existing accounts</h2>
    <table><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
      <tbody>{#each data.accounts as account (account.id)}
        <tr><td>{account.fullName}</td><td>{account.username}</td><td>{account.email}</td><td>{account.role}</td>
          <td>{#if account.role === 'employee'}
            <button type="button" onclick={() => editingId = editingId === account.id ? null : account.id}>
              {editingId === account.id ? 'Cancel edit' : 'Edit'}
            </button>
            <form method="POST" action="?/delete" onsubmit={(event) => { if (!confirm(`Delete ${account.fullName}?`)) event.preventDefault(); }}>
              <input type="hidden" name="staffId" value={account.id} />
              <button type="submit" class="danger">Delete</button>
            </form>
          {:else}Protected{/if}</td></tr>
        {#if editingId === account.id && account.role === 'employee'}
          <tr><td colspan="5">
            <form method="POST" action="?/update" class="edit-form">
              <input type="hidden" name="staffId" value={account.id} />
              <label>Full name <input name="fullName" required maxlength="120" value={account.fullName} /></label>
              <label>Email <input name="email" type="email" required maxlength="255" value={account.email} /></label>
              <label>Username <input name="username" required minlength="3" maxlength="100" pattern="[A-Za-z0-9_.-]+" value={account.username} /></label>
              <label>New password (leave blank to keep current password) <input name="password" type="password" minlength="12" maxlength="256" autocomplete="new-password" /></label>
              <p>Resetting a password signs the employee out of all existing sessions.</p>
              <button type="submit">Save employee changes</button>
            </form>
          </td></tr>
        {/if}
      {/each}</tbody></table>
  </section>
</main>
<style>
  .admin{max-width:980px;margin:3rem auto;padding:1.5rem;font-family:system-ui,sans-serif}
  section{border:1px solid #ddd;border-radius:10px;padding:1.5rem;margin:1.5rem 0}
  label{display:block;margin:.8rem 0}input{display:block;width:100%;max-width:440px;padding:.6rem;margin-top:.3rem}
  button{padding:.65rem 1rem;cursor:pointer}.danger{color:#9b1c1c}.error{color:#b91c1c}.success{color:#166534}
  .edit-form{padding:1rem;background:rgba(128,128,128,.07);border-radius:8px} table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.7rem;border-bottom:1px solid #ddd}
</style>
