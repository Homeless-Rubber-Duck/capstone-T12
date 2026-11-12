<!-- this is a Svelte component for the site brand, which is the logo and name of the site, which is used in the site header and other places where the site brand is needed -->

<script lang="ts">
    import {site} from '../index';
</script>

<a
    class = "site-brand text-decoration-none d-inline-flex align-items-center gap-2"
    href="/"
>

    <span>
        <strong class = "d-block">{site.name}</strong>
        <small class = "d-block">{site.location}</small>
    </span>
</a>