<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let query = $state('');
  let editingId = $state<number | null>(null);
  let items = $derived(data.items.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())
  ));
</script>

<svelte:head><title>Manage Café Menu | Heritage Café</title></svelte:head>

<main class="workspace">
  <a class="back" href="/employee/admin">← Admin Dashboard</a>
  <header>
    <h1>Manage Café Menu</h1>
    <a href="/menu">View customer menu</a>
  </header>

  {#if form?.error}<p class="feedback error" role="alert">{form.error}</p>{/if}
  {#if form?.message}<p class="feedback" role="status">{form.message}</p>{/if}

  {#snippet fields(item?: PageData['items'][number])}
    <label>Name <input name="name" required maxlength="120" value={item?.name ?? ''} /></label>
    <label>Price ($)
      <input name="price" type="number" min="0" max="99999.99" step="0.01" required value={item?.price} />
    </label>
    <label>Category
      <select name="categoryId" value={item?.categoryId ?? data.categories[0]?.id} required>
        {#each data.categories as category (category.id)}
          <option value={category.id}>{category.name}{category.active ? '' : ' (inactive)'}</option>
        {/each}
      </select>
    </label>
    <label class="description">Description
      <textarea name="description" rows="2" maxlength="500" value={item?.description ?? ''}></textarea>
    </label>
    <label class="checkbox">
      <input name="available" type="checkbox" checked={item ? Boolean(item.available) : true} />
      Available to customers
    </label>
  {/snippet}

  <section class="panel">
    <h2>Add a menu item</h2>
    {#if data.categories.length}
      <form class="fields" method="POST" action="?/add">
        {@render fields()}
        <button type="submit">Add item</button>
      </form>
    {:else}
      <p>Menu categories are required before items can be added.</p>
    {/if}
  </section>

  <section class="panel">
    <header>
      <h2>Menu items ({items.length})</h2>
      <label>Search <input type="search" placeholder="Item or category" bind:value={query} /></label>
    </header>
    {#each items as item (item.id)}
      <article>
        <div class="item-heading">
          <div>
            <strong>{item.name}</strong>
            <p>{item.category} · ${item.price.toFixed(2)} · {item.available && item.categoryActive ? 'On menu' : 'Hidden'}</p>
          </div>
          <div class="item-actions">
            <button class="secondary" type="button" aria-expanded={editingId === item.id}
              onclick={() => editingId = editingId === item.id ? null : item.id}>
              {editingId === item.id ? 'Close edit' : 'Edit'}
            </button>
            {#if item.available}
              <form method="POST" action="?/remove"
                onsubmit={(event) => { if (!confirm(`Remove ${item.name} from the customer menu?`)) event.preventDefault(); }}>
                <input type="hidden" name="id" value={item.id} />
                <button class="remove" type="submit">Remove from menu</button>
              </form>
            {/if}
          </div>
        </div>
        {#if editingId === item.id}
          <form class="fields edit" method="POST" action="?/edit">
            <input type="hidden" name="id" value={item.id} />
            {@render fields(item)}
            <button type="submit">Save changes</button>
          </form>
        {/if}
      </article>
    {:else}
      <p>No menu items match your search.</p>
    {/each}
  </section>
</main>

<style>
  .workspace { max-width: 1060px; margin: auto; padding: 2.5rem 1.25rem 4rem; color: #35261e; }
  a { color: #65452f; }
  header, .item-heading, .item-actions { display: flex; align-items: center; gap: .85rem; flex-wrap: wrap; }
  header, .item-heading { justify-content: space-between; }
  header { margin: 1rem 0; }
  h1, h2 { margin: 0; }
  .panel { border: 1px solid #e5d8c9; background: #fffaf4; border-radius: 14px; padding: 1.25rem; margin: 1.25rem 0; }
  .fields { display: grid; grid-template-columns: 2fr 1fr 1.4fr; gap: .8rem; align-items: end; margin-top: 1rem; }
  label { display: grid; gap: .3rem; font-weight: 600; }
  input:not([type=checkbox]), select, textarea { min-width: 0; width: 100%; border: 1px solid #bead9d; border-radius: 7px; padding: .55rem; background: white; }
  .description { grid-column: 1 / -1; }
  .checkbox { display: flex; align-items: center; gap: .45rem; }
  button { border: 1px solid #65452f; border-radius: 7px; background: #65452f; color: white; padding: .55rem .8rem; }
  .secondary, .remove { background: white; color: #65452f; }
  .remove { color: #892921; }
  article { border-top: 1px solid #e5d8c9; padding: .75rem 0; }
  article p { color: #68564a; margin: .2rem 0 0; }
  .edit { background: #f6ede2; padding: 1rem; border-radius: 8px; }
  .feedback { padding: .8rem; border-radius: 8px; background: #e7f0e5; }
  .error { background: #fce9e6; color: #892921; }
  @media (max-width: 650px) { .fields { grid-template-columns: 1fr; } }
</style>
