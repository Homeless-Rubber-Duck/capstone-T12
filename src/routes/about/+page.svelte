<script lang="ts">
  // About Us page (issues #35 and follow-up). Story and details come from the
  // 11/4 & 11/5 sponsor meeting. Styling matches the new home page.
  const family = [
    {
      name: 'Aeran Kang',
      role: 'Owner',
      photo: '/images/about/aeran-kang.jpg'
    },
    {
      name: 'Jonathan Choe',
      role: 'Manager',
      photo: '/images/about/jonathan-choe.jpg'
    }
  ];

  // Same contact info as the Contact page
  const address = '15825 Hope Village Rd, Suite B, Friendswood, TX 77546';
  const phone = '(832) 569-4556';
  const email = 'heritagecafeo@gmail.com';
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent('Heritage Cafe, ' + address)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
</script>

<svelte:head>
  <title>Heritage Café | About Us</title>
  <meta
    name="description"
    content="Meet the family behind Heritage Café and find us in Friendswood, TX."
  />
</svelte:head>

<section class="hero" aria-labelledby="about-heading">
  <img class="hero-image" src="/images/home/DSC_2165.jpg" alt="" width="1600" height="1067" />
  <div class="shade"></div>

  <div class="hero-content">
    <p class="eyebrow">ABOUT US</p>
    <h1 id="about-heading">Our Story</h1>
    <p class="hero-description">A family café made for the neighborhood.</p>
  </div>
</section>

<div class="story-band">
<section class="story" aria-label="How Heritage Café started">
  <div class="story-text">
    <p>
      Aeran Kang came to the U.S. from South Korea in 1989, starting in New York before
      moving to Texas in 1990, where she’s lived ever since. In 2017, at 53, she and her
      eldest son, Justin, opened Heritage Café after noticing their neighborhood didn’t
      have many places to grab a coffee. They named it after the Heritage district it
      calls home.
    </p>
    <p>
      The family had run a beauty supply store in Galveston before, but coffee and food
      were brand new to them. That first year was a learning curve, so Aeran practiced
      and perfected her craft one cup at a time. When things slowed down during COVID,
      she used the time to experiment with the menu and came back better than ever.
    </p>
    <p>
      Justin helped get the café on its feet in those early days, and his younger
      brother, Jonathan, was right there with them from the start. Today, Jonathan runs
      the café alongside his mom. Over the years, Heritage has gotten a new layout, new
      seating, and a fresh look, but the heart of it hasn’t changed. Just look at the
      community wall, which started with a box of crayons and some construction paper
      and is now covered in drawings from neighborhood kids.
    </p>
    <p class="goal">
      The plan is simple: keep getting better at the coffee, food, and service.
    </p>
  </div>

</section>
</div>

<section class="family" aria-labelledby="family-heading">
  <p class="eyebrow">THE PEOPLE BEHIND THE COUNTER</p>
  <h2 id="family-heading">Meet the Family</h2>

  <div class="cards">
    {#each family as person}
      <article class="card">
        {#if person.photo}
          <img
            class="portrait"
            src={person.photo}
            alt={`${person.name}, ${person.role} of Heritage Café`}
            width="600"
            height="600"
            loading="lazy"
          />
        {:else}
          <div class="portrait initials" aria-hidden="true">
            {person.name.split(' ').map((n) => n[0]).join('')}
          </div>
        {/if}
        <h3>{person.name}</h3>
        <p class="role">{person.role}</p>
      </article>
    {/each}
  </div>
</section>

<div class="find-band">
<section class="find-us" aria-labelledby="find-heading">
  <div class="info">
    <h2 id="find-heading">Visit Us</h2>
    <span class="accent" aria-hidden="true"></span>

    <dl>
      <div>
        <dt>Address</dt>
        <dd><a href={directions} target="_blank" rel="noopener noreferrer">{address}</a></dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd><a href="tel:+18325694556">{phone}</a></dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd><a href={`mailto:${email}`}>{email}</a></dd>
      </div>
      <div>
        <dt>Hours</dt>
        <dd>Mon – Sat: 8:00 AM – 8:00 PM<br />Sun: 8:30 AM – 8:00 PM</dd>
      </div>
    </dl>

    <a class="button" href="/menu">Order ahead <span aria-hidden="true">→</span></a>
  </div>

  <div class="map">
    <iframe
      title="Map showing Heritage Café in Friendswood, TX"
      src={mapSrc}
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</section>
</div>

<style>
  .hero, .story, .family, .find-us {
    --ink: #14110c;
    --cream: #d4d0ce;
    --stone: #c8c0bb;
  }

  .eyebrow {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    line-height: 1.6;
  }

  h1, h2 {
    font-family: 'Dancing Script', cursive;
    font-weight: 700;
    text-wrap: balance;
  }

  h2 {
    font-size: clamp(2.6rem, 5vw, 3.7rem);
    margin: 0.6rem 0 1.2rem;
  }

  /* Hero */
  .hero {
    position: relative;
    isolation: isolate;
    display: grid;
    place-items: center;
    min-height: clamp(340px, 48svh, 500px);
    overflow: hidden;
    background: var(--ink);
    color: var(--cream);
    text-align: center;
  }

  .hero-image, .shade {
    position: absolute;
    inset: 0;
  }

  .hero-image {
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 60%;
  }

  .shade {
    z-index: -1;
    background: linear-gradient(180deg, rgba(20, 17, 12, 0.3), rgba(20, 17, 12, 0.5) 50%, rgba(20, 17, 12, 0.45));
  }

  .hero-content { padding: 3rem 1.5rem; }

  .hero h1 {
    font-size: clamp(3.4rem, 6.5vw, 6rem);
    line-height: 1.15;
    margin: 1rem 0;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  }

  .hero-description {
    margin: 0;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
    font-size: 1.1rem;
    line-height: 1.7;
  }

  /* Story */
  .story-band { background: #d4d0ce; }

  .story {
    max-width: 760px;
    margin: 0 auto;
    padding: clamp(2.5rem, 5vw, 3.5rem) 1.5rem;
    color: var(--ink);
  }

  .story-text p {
    margin: 0 0 1.3rem;
    font-size: 1.15rem;
    line-height: 1.8;
  }

  .story .goal {
    margin: 2.2rem 0 0;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(20, 17, 12, 0.2);
    font-family: 'Dancing Script', cursive;
    font-size: clamp(1.7rem, 3vw, 2.2rem);
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
  }

  /* Family */
  .family {
    background: var(--ink);
    color: var(--cream);
    padding: clamp(2.5rem, 5vw, 3.5rem) 1.5rem;
    text-align: center;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1.5rem, 4vw, 3rem);
    max-width: 760px;
    margin: 0 auto;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }

  .portrait {
    display: block;
    width: clamp(200px, 24vw, 280px);
    height: clamp(200px, 24vw, 280px);
    margin: 0 auto 1rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--stone);
  }

  .initials {
    display: grid;
    place-items: center;
    background: rgba(212, 208, 206, 0.08);
    font-family: 'Dancing Script', cursive;
    font-size: 4rem;
    font-weight: 700;
    color: var(--cream);
  }

  .card h3 {
    margin: 0;
    font-family: 'Dancing Script', cursive;
    font-size: clamp(2.2rem, 3.5vw, 2.8rem);
  }

  .role {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--stone);
  }

  /* Find us */
  .find-band { background: #d4d0ce; }

  .find-us {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: clamp(2rem, 5vw, 4rem);
    align-items: center;
    padding: clamp(2.5rem, 5vw, 3.5rem) clamp(1.5rem, 6vw, 5rem);
    max-width: 1200px;
    margin: 0 auto;
    color: var(--ink);
  }

  .find-us h2 { margin-bottom: 0.8rem; }

  .accent {
    display: block;
    width: 120px;
    height: 6px;
    margin-bottom: 1.8rem;
    background: var(--ink);
    border-radius: 3px;
  }

  dl {
    margin: 0 0 2rem;
    display: grid;
    gap: 1rem;
  }

  dt {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  dd {
    margin: 0.25rem 0 0;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  dd a {
    color: inherit;
    text-underline-offset: 3px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.7rem;
    border: 1px solid var(--ink);
    border-radius: 5px;
    background: var(--ink);
    color: var(--cream);
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }

  .button:hover {
    background: transparent;
    color: var(--ink);
  }

  a:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 4px;
  }

  .map {
    aspect-ratio: 4 / 3;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid rgba(20, 17, 12, 0.25);
    background: var(--stone);
  }

  .map iframe {
    filter: grayscale(1) contrast(0.95);
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  @media (max-width: 800px) {
    .cards { grid-template-columns: 1fr; }
    .find-us { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .button { transition: none; }
  }
</style>
