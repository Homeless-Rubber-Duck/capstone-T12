<script lang="ts">import favicon from '$lib/assets/favicon.svg'; let { children } = $props();</script>
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header><a class="brand" href="/">Heritage Café</a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/menu">Menu</a><a href="/employee/login">Employee</a></nav></header>
<main>{@render children()}</main>
<footer>Heritage Café · Team 12 Capstone Project</footer>
<style>:global(*){box-sizing:border-box}:global(body){margin:0;font-family:Arial,Helvetica,sans-serif;background:#fffaf4;color:#322820}:global(button),:global(input){font:inherit}header{display:flex;justify-content:space-between;align-items:center;padding:1.1rem max(1.5rem,calc((100vw - 1100px)/2));background:#fff;gap:1rem;flex-wrap:wrap;border-bottom:1px solid #e9dfd2}.brand{font-size:1.4rem;font-weight:800;color:#39271c;text-decoration:none}nav{display:flex;gap:1.4rem}nav a{color:#493426;text-decoration:none}nav a:hover{text-decoration:underline}main{min-height:75vh}footer{text-align:center;padding:2rem;color:#786a5d;border-top:1px solid #e9dfd2}</style>
