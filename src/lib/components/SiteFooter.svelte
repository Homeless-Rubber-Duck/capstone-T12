<!-- this is a Svelte component for the site footer, which includes business hours and contact information, as well as a compact row visible while scrolling -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { site } from '../index';

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

<footer class="site-footer" bind:this={footer}>
  <!-- Compact row visible while scrolling. -->
  <div class="footer-summary" bind:this={summary}>
    <div class="container py-2">
      <address class="mb-0 small text-center">
        {site.address}
      </address>
    </div>
  </div>

  <!-- Business hours and contact details revealed at the page bottom. -->
  <div class="footer-details" bind:this={details}>
    <div class="container py-4">
      <div class="row g-4">
        <section class="col-md-6" aria-labelledby="hours-heading">
          <h2 id="hours-heading" class="h6 fw-bold">
            Business Hours
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
            Contact Information
          </h2>

          <p class="small mb-1">
            Phone:
            <a href={`tel:${site.phone.replace(/\D/g, '')}`}>
              {site.phone}
            </a>
          </p>

          <p class="small mb-1">
            Email:
            <a href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>

          <p class="small mb-0">
            <a
              class="footer-facebook"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="footer-facebook-icon" aria-hidden="true"></span>
              <span>Facebook<span class="visually-hidden"> (opens in a new tab)</span></span>
            </a>
          </p>

        </section>
      </div>

      <p class="small mt-3 pt-3 mb-0">
        © {new Date().getFullYear()} {site.name}
      </p>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid #b7aea7;
  }

  .site-footer,
  .footer-summary {
    background-color: #c8c0bb;
    color: #14110c;
  }

  .footer-details {
    background-color: #14110c;
    color: #d4d0ce;
    border-top: 1px solid #b7aea7;
  }

  .footer-details a {
    color: inherit;
    text-decoration: none;
  }

  .footer-facebook {
    display: flex;
    width: fit-content;
    align-items: center;
    gap: 0.5rem;
    font: inherit;
  }

  .footer-facebook-icon {
    flex: 0 0 1em;
    height: 1em;
    background-color: currentColor;
    mask: url('/images/facebook-dark.png') center / contain no-repeat;
  }

  .footer-facebook:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
</style>