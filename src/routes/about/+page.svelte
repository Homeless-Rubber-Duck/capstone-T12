<script lang="ts">
  // About Us page (issue #35). Story and details come from the
  // 11/4 & 11/5 sponsor meeting. Styling matches the new home page.
  const wallPhotos = [
    { src: '/images/about/community-wall-1.jpg', alt: 'Kids’ drawings on the community wall, including a “Heritage Café” sign' },
    { src: '/images/about/community-wall-2.jpg', alt: 'Crayon drawings hung above the snack shelf' },
    { src: '/images/about/community-wall-3.jpg', alt: 'Kids’ art covering the wall beside the café window' },
    { src: '/images/about/community-wall-4.jpg', alt: 'Colorful drawings above the shelf of snacks and ramen cups' },
    { src: '/images/about/community-wall-5.jpg', alt: 'Construction paper art next to the drink fridge' },
    { src: '/images/about/community-wall-6.jpg', alt: 'Drawings of animals and characters filling the wall' }
  ];

  const family = [
    {
      name: 'Aeran Kang',
      role: 'Owner',
      line: 'Her favorite part is when the regulars walk in.',
      photo: ''
    },
    {
      name: 'Jonathan Choe',
      role: 'Manager',
      line: 'He’s helped out since day one and loves the café’s calm, easygoing vibe.',
      photo: '/images/about/jonathan-choe.jpg'
    }
  ];
</script>

<svelte:head>
  <title>Heritage Café | About Us</title>
  <meta
    name="description"
    content="Meet the family behind Heritage Café and see the community art wall."
  />
</svelte:head>

<section class="hero" aria-labelledby="about-heading">
  <img class="hero-image" src="/images/about/community-wall-1.jpg" alt="" width="900" height="1200" />
  <div class="shade"></div>

  <div class="hero-content">
    <p class="eyebrow">ABOUT US</p>
    <h1 id="about-heading">Our Story</h1>
    <p class="hero-description">A family café made for the neighborhood.</p>
  </div>
</section>

<section class="story" aria-label="How Heritage Café started">
  <p>
    Heritage Café opened in 2017, when Aeran Kang and her eldest son, Justin, saw
    that their neighborhood didn’t have many places to grab a coffee. They named it
    after the Heritage district it calls home.
  </p>
  <p>
    They’d run a business before, but coffee was brand new to them, so Aeran learned
    it from the ground up, and she’s been perfecting it ever since.
  </p>
  <p class="goal">
    The plan is simple: keep getting better at the coffee, food, and service.
  </p>
</section>

<section class="family" aria-labelledby="family-heading">
  <p class="eyebrow">THE PEOPLE BEHIND THE COUNTER</p>
  <h2 id="family-heading">Meet the Family</h2>

  <div class="cards">
    {#each family as person}
      <article class="card">
        {#if person.photo}
          <img class="portrait" src={person.photo} alt={`${person.name}, ${person.role} of Heritage Café`} width="600" height="600" loading="lazy" />
        {:else}
          <div class="portrait initials" aria-hidden="true">{person.name.split(' ').map((n) => n[0]).join('')}</div>
        {/if}
        <h3>{person.name}</h3>
        <p class="role">{person.role}</p>
        <p>{person.line}</p>
      </article>
    {/each}
  </div>
</section>

<section class="wall" aria-labelledby="wall-heading">
  <p class="eyebrow">ART FROM OUR NEIGHBORHOOD</p>
  <h2 id="wall-heading">The Community Wall</h2>
  <p class="wall-text">
    It started with construction paper and a box of crayons to keep kids busy. Over
    time, they started hanging their drawings on the wall, and it grew into the
    community art wall you see today.
  </p>

  <ul class="gallery">
    {#each wallPhotos as photo}
      <li>
        <img src={photo.src} alt={photo.alt} width="900" height="1200" loading="lazy" />
      </li>
    {/each}
  </ul>
</section>


<style>
  .hero, .story, .family, .wall {
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
    min-height: clamp(380px, 55svh, 560px);
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
    object-position: 50% 40%;
  }

  .shade {
    z-index: -1;
    background: linear-gradient(180deg, rgba(20, 17, 12, 0.6), rgba(20, 17, 12, 0.78));
  }

  .hero-content { padding: 4rem 1.5rem; }

  .hero h1 {
    font-size: clamp(3.4rem, 6.5vw, 6rem);
    line-height: 1.15;
    margin: 1rem 0;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  }

  .hero-description {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.7;
  }

  /* Story */
  .story {
    background: var(--cream);
    color: var(--ink);
    padding: clamp(3rem, 7vw, 5rem) 1.5rem;
  }

  .story p {
    max-width: 650px;
    margin: 0 auto 1.2rem;
    font-size: 1.05rem;
    line-height: 1.8;
    text-align: center;
  }

  .story .goal {
    margin: 2rem auto 0;
    font-family: 'Dancing Script', cursive;
    font-size: clamp(1.6rem, 3vw, 2rem);
    font-weight: 700;
    line-height: 1.4;
  }

  /* Family */
  .family {
    background: var(--ink);
    color: var(--cream);
    padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    text-align: center;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    max-width: 760px;
    margin: 0 auto;
  }

  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1.5rem;
    border: 1px solid var(--stone);
    border-radius: 5px;
  }

  .portrait {
    display: block;
    width: 160px;
    height: 160px;
    margin: 0 auto 1.2rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--stone);
  }

  .initials {
    display: grid;
    place-items: center;
    background: rgba(212, 208, 206, 0.08);
    font-family: 'Dancing Script', cursive;
    font-size: 3.2rem;
    font-weight: 700;
    color: var(--cream);
  }

  .card h3 {
    margin: 0;
    font-family: 'Dancing Script', cursive;
    font-size: 2rem;
  }

  .role {
    margin: 0.4rem 0 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--stone);
  }

  .card p:last-child {
    margin: 0;
    line-height: 1.7;
  }

  /* Community wall */
  .wall {
    background: var(--cream);
    color: var(--ink);
    padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    text-align: center;
  }

  .wall-text {
    max-width: 650px;
    margin: 0 auto 2.5rem;
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .gallery {
    list-style: none;
    padding: 0;
    margin: 0 auto;
    max-width: 1100px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .gallery img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 5px;
  }
  @media (max-width: 720px) {
    .cards { grid-template-columns: 1fr; }
    .gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  }

</style>
