<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { orderFlags } from '../../lib/employeeOrderFlags';
  import type { ActionData, PageData } from './$types';
  import { invalidate } from '$app/navigation';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let selectedId = $state<number | null>(null);
  let statusFilter = $state('All');

  const pickupViews = ['Next 30 Minutes', 'All Day', 'History'] as const;
  const closedStatuses = new Set(['completed', 'picked up', 'canceled', 'cancelled']);

  const cafeClock = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Chicago',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  let pickupView = $state<(typeof pickupViews)[number]>('Next 30 Minutes');

  let currentTime = $state(Date.now());

  onMount(() => {
    let refreshing = false;

    async function refreshOrders() {
      if (document.hidden || refreshing) return;

      currentTime = Date.now();
      refreshing = true;

      try {
        await invalidate('app:employee-orders');
      } catch (error) {
        console.error('Could not refresh employee orders:', error);
      } finally {
        refreshing = false;
      }
    }

    const timer = window.setInterval(refreshOrders, 15_000);
    document.addEventListener('visibilitychange', refreshOrders);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshOrders);
    };
  });

  let orders = $derived(data.orders ?? []);
  let statuses = $derived(data.statuses ?? []);

  function pickupTimestamp(value: string) {
    return Date.parse(value.replace(' ', 'T') + 'Z');
  }

  const minute = 60_000;
  const tenMinutes = 10 * minute;
  const hour = 60 * minute;

  let cafeNow = $derived(cafeClock.format(currentTime));
  let now = $derived(pickupTimestamp(cafeNow));

  const pickupTimeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC'
  });

  let filteredOrders = $derived.by(() => {
    const cafeDate = cafeNow.slice(0, 10);
    const next30Minutes = now + 30 * minute;

    return orders
      .filter((order) => {
        if (statusFilter !== 'All' && order.status !== statusFilter) return false;

        const pickupDate = order.pickup.slice(0, 10);
        const closed = closedStatuses.has(order.status.toLowerCase());

        if (pickupView === 'History') return closed || pickupDate < cafeDate;
        if (closed) return false;
        if (pickupView === 'All Day') return pickupDate === cafeDate;

        const pickup = pickupTimestamp(order.pickup);
        return pickup >= now && pickup <= next30Minutes;
      })
      .sort((a, b) => {
        const difference = pickupTimestamp(a.pickup) - pickupTimestamp(b.pickup);
        return pickupView === 'History' ? -difference : difference;
      });
  });

  let orderGroups = $derived.by(() => {
    const groups = new Map<string, {
      label: string;
      orders: typeof filteredOrders;
    }>();

    for (const order of filteredOrders) {
      const pickup = pickupTimestamp(order.pickup);
      let key: string;
      let label: string;

      if (pickupView === 'History') {
        key = order.pickup.slice(0, 10);
        label = key;
      } else if (pickupView === 'All Day') {
        const start = Math.floor(pickup / hour) * hour;
        key = String(start);
        label = pickupTimeLabel.format(start);
      } else {
        const bucket = Math.min(2, Math.floor((pickup - now) / tenMinutes));
        const start = now + bucket * tenMinutes;
        key = String(bucket);
        label = `${pickupTimeLabel.format(start)} – ${pickupTimeLabel.format(start + tenMinutes)}`;
      }

      const group = groups.get(key);
      if (group) {
        group.orders.push(order);
      } else {
        groups.set(key, { label, orders: [order] });
      }
    }

    return Array.from(groups, ([key, group]) => ({ key, ...group }));
  });

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
    {#if data.employee.role === 'admin'}
      <a class="admin-link" href="/employee/admin">Admin Dashboard</a>
    {/if}
    <form method="POST" action="/employee/logout">
      <button type="submit">Log out</button>
    </form>
  </div>

  <p class="notice">
    Select an incoming order to review its details and update its status.
  </p>

  <a class="manage-orders-link" href="/employee/manage-orders">Manage Orders</a>

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

  <div class="queue-controls pickup-views" role="group" aria-label="Pickup view">
    {#each pickupViews as view}
      <button
        type="button"
        aria-pressed={pickupView === view}
        onclick={() => (pickupView = view)}
      >
        {view}
      </button>
    {/each}
  </div>

  {#if filteredOrders.length === 0}
    <p class="notice">No orders match the selected filters.</p>
  {/if}

  {#each orderGroups as group (group.key)}
    <h3 class="pickup-group">{group.label}</h3>

    <div class="orders">
      {#each group.orders as order (order.id)}
      {@const flag = orderFlags.find((option) => option.value === order.flag)}
      <article data-flag={order.flag ?? undefined}>
        <div class="top">
          <strong>Order #{order.id}</strong>
          <span class="status">{order.status}</span>

          {#if flag}
            <span class="order-flag">{flag.label}</span>
          {/if}
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
{/each}

  {#if selected}
    <section class="details">
      <div class="top">
        <h3>Order #{selected.id} details</h3>
        <button onclick={() => selectedId = null}>Close</button>
      </div>

      <p>Customer: {selected.customer}</p>
      <p>Pickup: {selected.pickup}</p>
      <p>Status: {selected.status}</p>

      <form method="POST" action="?/updateFlag" use:enhance>
        <input type="hidden" name="orderId" value={selected.id} />

        <fieldset>
          <legend>Order flag</legend>
          <div class="queue-controls">
            {#each orderFlags as option}
              <button
                type="submit"
                name="flag"
                value={option.value}
                aria-pressed={selected.flag === option.value}
              >
                {option.label}
              </button>
            {/each}

            <button type="submit" name="flag" value="" disabled={selected.flag === null}>
              Clear flag
            </button>
          </div>
        </fieldset>
      </form>

      {#if form?.error}
        <p class="notice" role="alert">{form.error}</p>
      {:else if form?.message}
        <p role="status">{form.message}</p>
      {/if}

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
  .manage-orders-link {
    display: inline-block;
    background: #65452f;
    color: white;
    padding: .6rem .9rem;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
  }
  .manage-orders-link:hover { background: #493426; }
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

  .admin-link {
    display: inline-block;
    background: #65452f;
    color: white;
    padding: 0.6rem 0.9rem;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
  }

  .admin-link:hover {
    background: #493426;
  }

  article[data-flag="priority"] { --flag-color: #8f2828; }
  article[data-flag="drinks"] { --flag-color: #205c83; }
  article[data-flag="food"] { --flag-color: #346242; }

  article[data-flag] {
    border-left: 5px solid var(--flag-color);
  }

  .order-flag {
    color: var(--flag-color);
    font-weight: 700;
  }

  fieldset button {
    min-height: 44px;
  }

  fieldset button[aria-pressed="true"] {
    box-shadow: inset 0 0 0 2px currentColor;
  }

  .pickup-views button {
    min-height: 44px;
  }

  .pickup-views button[aria-pressed="false"] {
    background: #efe5d6;
    color: #493426;
  }

  .pickup-group {
    font-size: 1.1rem;
    margin: 1.5rem 0 0.75rem;
  }
</style>