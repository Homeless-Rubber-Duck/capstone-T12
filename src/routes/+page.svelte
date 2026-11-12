<script lang="ts">
  import { onMount } from 'svelte';

  const slides = [
    {
      src: '/images/home/DSC_2134.jpg',
      alt: 'Tables and chairs beside the tea mural at Heritage Café',
      position: '50% 55%'
    },
    {
      src: '/images/home/DSC_2165.jpg',
      alt: 'Fresh espresso pouring into a white ceramic cup',
      position: '50% 60%'
    },
    {
      src: '/images/home/DSC_2058.jpg',
      alt: 'Two cold drinks in Heritage Café branded cups',
      position: '50% 55%'
    },
    {
      src: '/images/home/DSC_2070.jpg',
      alt: 'Set of coffee beans on the counter',
      position: '50% 45%'
    },
    {
      src: '/images/home/DSC_2180.jpg',
      alt: 'A white cup of coffee on the café counter',
      position: '50% 60%'
    }
  ];

  const intervalMs = 15_000;

  let current = $state(0);
  let reducedMotion = $state(false);
  let pageHidden = $state(false);

  let elapsed = 0;

  function selectSlide(index: number) {
    current = (index + slides.length) % slides.length;
    elapsed = 0;
  }

  onMount(() => {
    const preference = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updatePreference = () => {
      reducedMotion = preference.matches;
      elapsed = 0;
    };

    const updateVisibility = () => {
      pageHidden = document.hidden;
      elapsed = 0;
    };

    updatePreference();
    updateVisibility();

    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);

    const timer = window.setInterval(() => {
      if (reducedMotion || pageHidden) {
        elapsed = 0;
        return;
      }

      elapsed += 250;

      if (elapsed >= intervalMs) {
        selectSlide(current + 1);
      }
    }, 250);

    return () => {
      window.clearInterval(timer);

      preference.removeEventListener('change', updatePreference);
      document.removeEventListener(
        'visibilitychange',
        updateVisibility
      );
    };
  });
</script>

<!-- Draft of beautifying the homepage -->
<svelte:head>
  <title>Heritage Café | Home</title>
  <meta
    name="description"
    content="Make yourself at home at Heritage Café. Explore our coffee, tea, and food menu, and take a look around our café."
  />
</svelte:head>

<section class="hero" aria-labelledby="welcome-heading">
  <div
    class="slideshow"
    role="region"
    aria-roledescription="carousel"
    aria-label="A look inside Heritage Café"
  >
    <div class="slides">
      {#each slides as slide, index}
        <div
          class="slide"
          class:active={current === index}
          aria-hidden={current !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            style:object-position={slide.position}
            width="1920"
            height="1280"
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchpriority={index === 0 ? 'high' : 'auto'}
          />
        </div>
      {/each}
    </div>

    <div class="shade"></div>

    <div class="hero-content">
      <p class="eyebrow">WELCOME TO HERITAGE CAFÉ</p>

      <h1 id="welcome-heading">
        Good coffee. Good food.<br />Made for your day.
      </h1>

      <p class="hero-description">
        Make yourself at home. Find your favorite coffee, tea,
        and something good to eat.
      </p>

      <a class="button hero-button" href="/menu">
        View the menu
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <div class="carousel-controls">
      <button
        class="arrow"
        type="button"
        aria-label="Previous café photo"
        onclick={() => selectSlide(current - 1)}
      >
        ‹
      </button>

      <div class="dots" aria-label="Choose a café photo">
        {#each slides as slide, index}
          <button
            type="button"
            class="dot"
            class:selected={current === index}
            aria-label={`Show photo ${index + 1}: ${slide.alt}`}
            aria-pressed={current === index}
            onclick={() => selectSlide(index)}
          >
            <span></span>
          </button>
        {/each}
      </div>

      <button
        class="arrow"
        type="button"
        aria-label="Next café photo"
        onclick={() => selectSlide(current + 1)}
      >
        ›
      </button>
    </div>
  </div>
</section>

<!-- gallery of the cafe's community wall -->
<section class="community-wall" aria-labelledby="community-wall-heading">
  <p class="eyebrow">YOUR NEXT CAFÉ MOMENT</p>
  <h2 id="community-wall-heading">Our Community Wall</h2>

  <p>
    A little corner of Heritage Café, filled with drawings and notes from
    the people who stop by.
  </p>

  <div class="community-gallery">
    <img
      src="/images/community-wall/community-wall-1.jpg"
      alt=""
      loading="lazy"
    />
    <img
      src="/images/community-wall/community-wall-2.jpg"
      alt=""
      loading="lazy"
    />
    <img
      src="/images/community-wall/community-wall-3.jpg"
      alt=""
      loading="lazy"
    />
    <img
      src="/images/community-wall/community-wall-4.jpg"
      alt=""
      loading="lazy"
    />
    <img
      src="/images/community-wall/community-wall-5.jpg"
      alt=""
      loading="lazy"
    />
    <img
      src="/images/community-wall/community-wall-6.jpg"
      alt=""
      loading="lazy"
    />
  </div>
</section>


<!-- homepage styling -->
 <style>
  .hero,
  .intro {
    --ink: #14110c;
    --cream: #d4d0ce;
    --stone: #c8c0bb;
  }

  .hero {
    background: var(--ink);
  }

  .slideshow {
    position: relative;
    isolation: isolate;
    min-height: clamp(560px, 78svh, 850px);
    display: grid;
    place-items: center;
    overflow: hidden;
    color: var(--cream);
  }

  .slides,
  .slide,
  .shade {
    position: absolute;
    inset: 0;
  }

  .slides {
    z-index: -2;
  }

  .slide {
    opacity: 0;
    transition: opacity 1.2s ease;
  }

  .slide.active {
    opacity: 1;
  }

  .slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .shade {
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgba(20, 17, 12, 0.45),
      rgba(20, 17, 12, 0.68) 50%,
      rgba(20, 17, 12, 0.65)
    );
  }

  .hero-content {
    max-width: 960px;
    padding: 5rem 1.5rem 7rem;
    text-align: center;
  }

  .eyebrow {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    line-height: 1.6;
  }

  h1,
  h2 {
    font-family: 'Dancing Script', cursive;
    font-weight: 700;
    text-wrap: balance;
  }

  h1 {
    font-size: clamp(3.4rem, 6.5vw, 6rem);
    line-height: 1.15;
    margin: 1.3rem 0;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  }

  .hero-description {
    max-width: 540px;
    margin: 1.5rem auto 0;
    font-size: 1.1rem;
    line-height: 1.7;
    text-wrap: pretty;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem 1.7rem;
    border: 1px solid var(--cream);
    border-radius: 5px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }

  .hero-button {
    background: var(--cream);
    color: var(--ink);
  }

  .hero-button:hover {
    background: var(--stone);
  }

  .carousel-controls {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.4rem;
    border-radius: 30px;
    background: rgba(20, 17, 12, 0.7);
  }

  button {
    cursor: pointer;
    color: var(--cream);
    background: transparent;
    border: 0;
    min-width: 44px;
    min-height: 44px;
  }

  button:hover {
    background: rgba(212, 208, 206, 0.15);
    border-radius: 30px;
  }

  .arrow {
    font-size: 2rem;
    line-height: 1;
  }

  .dots {
    display: flex;
  }

  .dot {
    display: grid;
    place-items: center;
    min-width: 36px;
    padding: 0;
  }

  .dot span {
    width: 8px;
    height: 8px;
    border: 1px solid var(--cream);
    border-radius: 50%;
  }

  .dot.selected span {
    background: var(--cream);
  }

  .intro {
    background: var(--cream);
    color: var(--ink);
    padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    text-align: center;
  }

  .intro h2 {
    font-size: clamp(2.6rem, 5vw, 3.7rem);
    margin: 0.6rem 0 1.2rem;
  }

  .intro > p:not(.eyebrow) {
    max-width: 650px;
    margin: 0 auto;
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .menu-link {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.5rem 0;
    color: var(--ink);
    font-weight: 700;
    text-underline-offset: 5px;
  }

  a:focus-visible,
  button:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 4px;
  }

  @media (max-width: 480px) {
    .slideshow {
      min-height: 610px;
    }

    .hero-content {
      padding-inline: 1.2rem;
    }

    .hero-description {
      font-size: 1rem;
    }

    .carousel-controls {
      gap: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .slideshow:hover .carousel-controls,
    .slideshow:focus-within .carousel-controls {
      opacity: 1;
      pointer-events: auto;
    }

    @media (hover: none), (pointer: coarse) {
        .carousel-controls {
          opacity: 1;
          pointer-events: auto;
        }
    }

    .dot {
      min-width: 30px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slide,
    .button,
    .carousel-controls {
      transition: none;
    }
  }

.community-wall {
  padding: clamp(3rem, 7vw, 5rem) 1.5rem;
  background: #fffaf4;
  color: #14110c;
  text-align: center;
}

.community-wall h2 {
  margin: 0 0 0.75rem;
  font-size: clamp(2.6rem, 5vw, 3.7rem);
}

.community-wall p {
  max-width: 36rem;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.community-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.community-gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  background: #eae2da;
  border-radius: 0.5rem;
}

@media (max-width: 48rem) {
  .community-gallery {
    grid-template-columns: 1fr;
    max-width: 32rem;
  }
}

</style>
