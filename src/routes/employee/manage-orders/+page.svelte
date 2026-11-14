<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let {
    data,
    form
  }: {
    data: PageData;
    form: ActionData;
  } = $props();

  let selectedId = $state<number | null>(null);

  let selected = $derived(
    data.orders.find((order) => order.id === selectedId)
  );

  let locked = $derived(
    selected
      ? ['canceled', 'cancelled', 'picked up', 'completed']
          .includes(selected.status.toLowerCase())
      : false
  );

  let total = $derived(
    selected
      ? selected.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        )
      : 0
  );
</script>

<svelte:head>
  <title>Manage Orders | Heritage Café</title>
</svelte:head>

<main class="page">
  <a href="/employee">← Employee Dashboard</a>

  <p class="eyebrow">HERITAGE CAFÉ · EMPLOYEE</p>
  <h1>Manage Customer Orders</h1>
  <p>Edit order items, update quantities, or cancel an order.</p>

  {#if form?.message}
    <p class="success">{form.message}</p>
  {/if}

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <section class="layout">
    <div>
      <h2>Orders</h2>

      {#each data.orders as order (order.id)}
        <button
          class="order"
          class:active={selectedId === order.id}
          onclick={() => (selectedId = order.id)}
        >
          <strong>Order #{order.id}</strong>
          <span>{order.customer}</span>
          <small>{order.status} · {order.pickup}</small>
        </button>
      {/each}
    </div>

    <div>
      {#if selected}
        <section class="details">
          <h2>Order #{selected.id}</h2>
          <p><strong>Customer:</strong> {selected.customer}</p>
          <p><strong>Status:</strong> {selected.status}</p>
          <p><strong>Pickup:</strong> {selected.pickup}</p>

          <h3>Items</h3>

          {#if locked}
            <p class="error">This order is no longer editable.</p>
          {:else}
            <form method="POST" action="?/save">
              <input
                type="hidden"
                name="orderId"
                value={selected.id}
              />

              {#each selected.items as item (item.id)}
                <div class="item">
                  <input
                    type="hidden"
                    name="itemId"
                    value={item.id}
                  />

                  <div>
                    <strong>{item.name}</strong>
                    <p>${item.unitPrice.toFixed(2)} each</p>

                    {#if item.modifiers.length}
                      <small>{item.modifiers.join(', ')}</small>
                    {/if}

                    {#if item.notes}
                      <small>{item.notes}</small>
                    {/if}
                  </div>

                  <label>
                    Quantity
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      max="20"
                      value={item.quantity}
                      required
                    />
                  </label>
                </div>
              {/each}

              <p class="hint">Set quantity to 0 to remove an item.</p>

              <h3>Add an Item</h3>

              <div class="add-item">
                <select name="newMenuItemId">
                  <option value="0">No additional item</option>
                  {#each data.menuItems as menuItem (menuItem.id)}
                    <option value={menuItem.id}>
                      {menuItem.name} — ${menuItem.price.toFixed(2)}
                    </option>
                  {/each}
                </select>

                <label>
                  Quantity
                  <input
                    type="number"
                    name="newQuantity"
                    min="0"
                    max="20"
                    value="0"
                    required
                  />
                </label>
              </div>

              <p><strong>Current item subtotal:</strong> ${total.toFixed(2)}</p>
              <button type="submit">Save Changes</button>
            </form>

            <form
              method="POST"
              action="?/cancel"
              onsubmit={(event) => {
                if (!confirm('Cancel this order?')) {
                  event.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="orderId"
                value={selected.id}
              />
              <button class="danger" type="submit">Cancel Order</button>
            </form>
          {/if}
        </section>
      {:else}
        <section class="details">
          <h2>Select an order</h2>
          <p>Choose an order from the list to manage its items.</p>
        </section>
      {/if}
    </div>
  </section>
</main>

<style>
  .page {
    max-width: 1150px;
    margin: auto;
    padding: 3rem 1.5rem;
  }

  .eyebrow {
    color: #84674e;
    font-size: .75rem;
    font-weight: 700;
    letter-spacing: .15em;
    margin-top: 2rem;
  }

  h1 { font-size: 2.4rem; }
  h2 { margin-top: 0; }

  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 2fr;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .order, .details {
    background: white;
    border: 1px solid #e5d8c9;
    border-radius: 12px;
    padding: 1.2rem;
  }

  .order {
    display: flex;
    flex-direction: column;
    gap: .4rem;
    width: 100%;
    text-align: left;
    margin-bottom: .75rem;
    color: #493426;
    cursor: pointer;
  }

  .order.active { border: 2px solid #493426; }

  .details { min-height: 220px; }

  .item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid #eee;
    padding: 1rem 0;
  }

  .item p { margin: .25rem 0; }
  .item small { display: block; }

  .add-item {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  input, select {
    border: 1px solid #c8b7a6;
    border-radius: 6px;
    padding: .55rem;
  }

  input[type="number"] { width: 75px; }

  label {
    display: flex;
    flex-direction: column;
    gap: .35rem;
  }

  button[type="submit"] {
    background: #493426;
    color: white;
    border: 0;
    border-radius: 7px;
    padding: .75rem 1rem;
    cursor: pointer;
    margin-top: .75rem;
  }

  button.danger { background: #a33434; }

  .hint { color: #715f50; font-size: .85rem; }
  .success { color: #176b39; }
  .error { color: #a33434; }

  @media (max-width: 700px) {
    .layout { grid-template-columns: 1fr; }
  }
</style>
