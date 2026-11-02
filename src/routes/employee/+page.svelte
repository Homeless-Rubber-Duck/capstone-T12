<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedId = $state<number | null>(null);
  let statusFilter = $state('All');

  let orders = $derived(data.orders ?? []);
  let statuses = $derived(data.statuses ?? []);

  let filteredOrders = $derived(
    statusFilter === 'All'
      ? orders
      : orders.filter((order) => order.status === statusFilter)
  );

  let selected = $derived(
    orders.find((order) => order.id === selectedId)
  );
</script>

<svelte:head>
  <title>Employee Dashboard | Heritage Café</title>
</svelte:head>

<section class="page">
  <p class="eyebrow">EMPLOYEE WORKSPACE</p>
  <div class="dashboard-header">
    <h1>Order Management</h1>
    <form method="POST" action="/employee/logout">
      <button type="submit">Log out</button>
    </form>
  </div>

  <p class="notice">
    Select an incoming order to review its details and update its status.
  </p>

  <h2>Incoming Orders</h2>

  <div class="queue-controls">
    <label for="order-filter">Filter orders</label>

    <select id="order-filter" bind:value={statusFilter}>
      <option value="All">All Orders</option>
      {#each statuses as status}
        <option value={status.name}>{status.name}</option>
      {/each}
    </select>

    <span>{filteredOrders.length} order(s)</span>
  </div>

  {#if filteredOrders.length === 0}
    <p class="notice">No orders match this status.</p>
  {/if}

  <div class="orders">
    {#each filteredOrders as order (order.id)}
      <article>
        <div class="top">
          <strong>Order #{order.id}</strong>
          <span class="status">{order.status}</span>
        </div>

        <p>{order.customer} · Pickup {order.pickup}</p>

        <p>
          {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
        </p>

        <button onclick={() => selectedId = order.id}>
          View details
        </button>
      </article>
    {/each}
  </div>

  {#if selected}
    <section class="details">
      <div class="top">
        <h3>Order #{selected.id} details</h3>
        <button onclick={() => selectedId = null}>Close</button>
      </div>

      <p>Customer: {selected.customer}</p>
      <p>Pickup: {selected.pickup}</p>
      <p>Status: {selected.status}</p>

      <form method="POST" action="?/updateStatus" class="queue-controls">
        <input type="hidden" name="orderId" value={selected.id} />

        <label for="new-status">Update status</label>
        <select id="new-status" name="statusId" required>
          {#each statuses as status}
            <option value={status.id} selected={status.name === selected.status}>
              {status.name}
            </option>
          {/each}
        </select>

        <button type="submit">Save status</button>
      </form>

      <strong>Items:</strong>
      <ul>
        {#each selected.items as item (item.id)}
          <li>
            {item.quantity}x {item.name}
            {#if item.modifiers.length}
              ({item.modifiers.join(', ')})
            {/if}
            {#if item.notes}
              — {item.notes}
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</section>

<style>
  .page { max-width: 1100px; margin: auto; padding: 3rem 1.5rem; }
  .eyebrow { font-size: .75rem; letter-spacing: .15em; font-weight: 700; color: #84674e; }
  h1 { font-size: 2.5rem; margin: .5rem 0; }
  h2 { margin-top: 2.5rem; }
  .notice { background: #fff0d4; padding: 1rem; border-radius: 8px; border: 1px solid #e7ce9f; }
  .queue-controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
  .orders { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1rem; }
  article, .details { background: #fff; border: 1px solid #e5d8c9; border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .status { background: #efe5d6; padding: .3rem .6rem; border-radius: 20px; }
  button { background: #493426; color: white; border: 0; padding: .6rem .9rem; border-radius: 7px; cursor: pointer; }
  select { padding: .55rem; border: 1px solid #c8b7a6; border-radius: 6px; }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
</style>
