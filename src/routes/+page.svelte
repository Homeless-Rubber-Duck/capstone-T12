<script lang="ts">
    import type { PageData } from './$types';

    // Receives menu items from the server
    let { data }: { data: PageData } = $props();
</script>

<h1>Heritage Cafe Menu</h1>

<!-- Loops through each menu item -->
{#each data.menuItems as item}
    <div>
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <p>${item.price}</p>

        <!-- Checks if the item is available -->
        {#if item.isAvailable}
            <p>Available</p>
        {:else}
            <p>Not Available</p>
        {/if}
    </div>
{/each}