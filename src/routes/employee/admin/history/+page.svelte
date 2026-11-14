<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<svelte:head><title>Order History | Heritage Café</title></svelte:head>

<main class="workspace">
  <a href="/employee/admin">← Admin Dashboard</a>
  <header>
    <h1>Order History &amp; Reporting</h1>
    <a class="download" href="/employee/admin/history/export" download>Download Excel</a>
  </header>

  <dl class="summary">
    <div><dt>Orders placed</dt><dd>{data.summary.count}</dd></div>
    <div><dt>Completed</dt><dd>{data.summary.completed}</dd></div>
    <div><dt>Canceled</dt><dd>{data.summary.canceled}</dd></div>
    <div><dt>Completed order value</dt><dd>{usd.format(data.summary.completedTotal)}</dd></div>
  </dl>

  {#if data.orders.length}
    <div class="table-wrap">
      <table>
        <caption>All orders, newest first</caption>
        <thead><tr><th>Order</th><th>Placed (UTC)</th><th>Pickup</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {#each data.orders as order (order.id)}
            <tr>
              <th scope="row">#{order.id}</th>
              <td>{order.placedAt}</td>
              <td>{order.pickup}</td>
              <td>{order.customer}</td>
              <td>{order.status}</td>
              <td>{usd.format(order.total)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="empty">No orders have been placed yet.</p>
  {/if}
</main>

<style>
  .workspace { max-width: 1100px; margin: auto; padding: 2.5rem 1.25rem 4rem; color: #35261e; }
  a { color: #65452f; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
  h1 { margin: 0; }
  .download { display: inline-block; background: #65452f; color: white; border-radius: 8px; padding: .7rem 1rem; text-decoration: none; font-weight: 600; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: .75rem; margin: 1.25rem 0; }
  .summary div, .empty { background: #fffaf4; border: 1px solid #e5d8c9; border-radius: 12px; padding: 1rem; }
  .summary dd { font-size: 1.65rem; font-weight: 700; margin: .2rem 0 0; }
  .table-wrap { overflow-x: auto; border: 1px solid #e5d8c9; border-radius: 12px; }
  table { width: 100%; border-collapse: collapse; }
  caption { text-align: left; caption-side: top; padding: .8rem; }
  th, td { text-align: left; padding: .75rem; border-bottom: 1px solid #e5d8c9; white-space: nowrap; }
  thead { background: #f6ede2; }
  tbody tr:last-child > * { border-bottom: 0; }
</style>
