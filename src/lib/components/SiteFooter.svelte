<!-- this is a Svelte component for the site footer, which includes business hours and contact information, as well as a compact row visible while scrolling -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { site } from '../index';
  import Brand from './Brand.svelte';

  let details: HTMLDivElement;
  let summary: HTMLDivElement;
  let footer: HTMLElement;

  onMount(() => {
    const measure = () => {
      footer.style.setProperty(
        '--footer-details-height',
        `${details.offsetHeight}px`
      );

      document.documentElement.style.setProperty(
        '--footer-summary-height',
        `${summary.offsetHeight}px`
      );
    };

    const observer = new ResizeObserver(measure);

    observer.observe(details);
    observer.observe(summary);
    measure();

    return () => {
      observer.disconnect();

      document.documentElement.style.removeProperty(
        '--footer-summary-height'
      );
    };
  });
</script>

<footer class="site-footer border-top" bind:this={footer}>
  <!-- Compact row visible while scrolling. -->
  <div class="footer-summary" bind:this={summary}>
    <div
      class="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3"
    >
      <Brand />

      <address class="mb-0 small">
        {site.address}
      </address>

      <a
        class="facebook-link d-inline-flex align-items-center gap-2"
        href={site.facebook}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M16 8.049C16 3.603 12.418 0 8 0S0 3.603 0 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625H4.719V8.049H6.75V6.276c0-2.017 1.194-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.994 0-1.304.621-1.304 1.258v1.509h2.219l-.355 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"
          />
        </svg>

        Facebook
        <span class="visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  </div>

  <!-- Business hours and contact details revealed at the page bottom. -->
  <div class="footer-details border-top" bind:this={details}>
    <div class="container py-4">
      <div class="row g-4">
        <section class="col-md-6" aria-labelledby="hours-heading">
          <h2 id="hours-heading" class="h6 fw-bold">
            Business hours
          </h2>

          <dl class="mb-0 small">
            {#each site.hours as hours}
              <div class="d-flex flex-wrap gap-2">
                <dt>{hours.days}</dt>
                <dd class="mb-1">{hours.time}</dd>
              </div>
            {/each}
          </dl>
        </section>

        <section class="col-md-6" aria-labelledby="contact-heading">
          <h2 id="contact-heading" class="h6 fw-bold">
            Contact information
          </h2>

          <p class="small mb-1">
            Phone:
            <a href={`tel:${site.phone.replace(/\D/g, '')}`}>
              {site.phone}
            </a>
          </p>

          <p class="small mb-0">
            Email:
            <a href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </section>
      </div>

      <p class="small text-body-secondary mt-4 mb-0">
        © {new Date().getFullYear()} {site.name}
      </p>
    </div>
  </div>
</footer>