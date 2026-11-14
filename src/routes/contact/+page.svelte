<script lang="ts">
  // Contact Us page (issue #50). Same layout as before (info card + photo),
  // cleaned up to match the home and About pages' fonts, colors, and spacing.
  const address = '15825 Hope Village Rd, Suite B, Friendswood, TX 77546';
  const phone = '(832) 569-4556';
  const email = 'heritagecafeo@gmail.com';
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
</script>

<svelte:head>
  <title>Contact Us | Heritage Café</title>
  <meta name="description" content="Contact Heritage Café in Friendswood, Texas." />
</svelte:head>

<div class="contact-band">
  <section class="contact-page" aria-labelledby="contact-heading">
    <p class="eyebrow">GET IN TOUCH</p>
    <h1 id="contact-heading">Contact Us</h1>
    <p class="intro">Have a question? We'd love to hear from you. Feel free to visit us or reach out.</p>

    <div class="contact-content">
      <dl class="contact-details">
        <div>
          <dt>Visit Us</dt>
          <dd><a href={directions} target="_blank" rel="noopener noreferrer">{address}</a></dd>
        </div>
        <div>
          <dt>Call Us</dt>
          <dd><a href="tel:+18325694556">{phone}</a></dd>
        </div>
        <div>
          <dt>Email Us</dt>
          <dd><a href={`mailto:${email}`}>{email}</a></dd>
        </div>
        <div>
          <dt>Business Hours</dt>
          <dd>
            Monday – Saturday: <span class="time">8:00 AM – 8:00 PM</span><br />
            Sunday: <span class="time">8:30 AM – 8:00 PM</span>
          </dd>
        </div>
      </dl>

      <img
        src="/images/contact-chalk-wall.jpg"
        alt="Chalk mural wall above a table and chairs at Heritage Café"
        class="contact-image"
        width="1066"
        height="1600"
      />
    </div>
  </section>
</div>

<style>
  .contact-band {
    --ink: #14110c;
    --cream: #d4d0ce;
    --stone: #c8c0bb;
    background: var(--cream);
    /* fill the layout's minimum page height so no off-white gap shows on big screens */
    min-height: 75vh;
  }

  .contact-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(2.5rem, 5vw, 3.5rem) 1.5rem;
    color: var(--ink);
  }

  .eyebrow {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
  }

  h1 {
    margin: 0.4rem 0 0.8rem;
    font-family: 'Dancing Script', cursive;
    font-size: clamp(2.8rem, 5vw, 3.8rem);
    font-weight: 700;
    line-height: 1.15;
  }

  .intro {
    max-width: 560px;
    margin: 0 0 2rem;
    font-size: 1.1rem;
    line-height: 1.7;
  }

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: stretch;
  }

  .contact-details {
    display: grid;
    align-content: center;
    gap: 1.4rem;
    margin: 0;
    padding: clamp(1.8rem, 4vw, 2.5rem);
    background: var(--ink);
    color: var(--cream);
    border-radius: 5px;
  }

  dt {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--stone);
  }

  dd {
    margin: 0.35rem 0 0;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  dd a {
    color: inherit;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }

  .time { white-space: nowrap; }

  a:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 4px;
  }

  .contact-image {
    width: 100%;
    height: 100%;
    max-height: 450px;
    object-fit: cover;
    object-position: 50% 80%;
    border-radius: 5px;
  }

  @media (max-width: 768px) {
    .contact-content {
      grid-template-columns: 1fr;
    }

    .contact-image {
      height: 260px;
    }
  }
</style>
