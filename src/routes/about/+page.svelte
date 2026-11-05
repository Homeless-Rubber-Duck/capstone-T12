<!-- About Us page (issue #22). Owner photo, bio, and cafe history are placeholders
     until we get them from the owner at the next sponsor meeting. -->

<svelte:head>
	<title>Heritage Café | About Us</title>
	<meta name="description" content="Learn about Heritage Café and the people behind it." />
</svelte:head>

<section class="hero">
	<p class="eyebrow">ABOUT US</p>
	<h1>Meet Heritage Café</h1>
	<p>A neighborhood café serving good coffee and good food, made for your day.</p>
</section>

<section class="owner">
	<!-- TODO: replace with the owner's portrait once we get the photos -->
	<div class="photo placeholder" role="img" aria-label="Owner photo coming soon">
		<span>Owner photo<br />coming soon</span>
	</div>

	<div class="bio">
		<h2>Meet the Owner</h2>
		<!-- TODO: replace with the owner's bio from the next sponsor meeting -->
		<p class="placeholder-text">
			The owner's bio is coming soon. Check back to learn more about the person behind Heritage Café.
		</p>
	</div>
</section>

<section class="story">
	<h2>Our Story</h2>
	<!-- TODO: replace with the cafe history from the next sponsor meeting -->
	<p class="placeholder-text">
		The history of Heritage Café is coming soon.
	</p>
</section>

<section class="visit">
	<h2>Visit Us</h2>
	<ul class="hours">
		<li><span>Monday – Saturday</span><span>8:00 AM – 8:00 PM</span></li>
		<li><span>Sunday</span><span>8:30 AM – 8:00 PM</span></li>
	</ul>
	<a class="button" href="/menu">View the menu →</a>
</section>

<style>
	.hero { padding: 4rem 1.5rem; text-align: center; background: #f0e3d0; }
	.hero h1 { font-size: clamp(2.2rem, 5vw, 3.5rem); margin: 0.75rem auto; color: #38271e; }
	.hero p { font-size: 1.1rem; margin: 0; }
	.eyebrow { font-weight: 700; letter-spacing: 0.15em; font-size: 0.8rem !important; }

	section:not(.hero) { max-width: 900px; margin: 3.5rem auto; padding: 0 1.5rem; }
	h2 { color: #38271e; margin: 0 0 0.75rem; }

	.owner { display: grid; grid-template-columns: 260px 1fr; gap: 2.5rem; align-items: center; }
	.photo { aspect-ratio: 4 / 5; border-radius: 12px; display: grid; place-items: center; text-align: center; }
	.placeholder { background: #f6eee3; border: 2px dashed #c9b49b; color: #8a7461; font-weight: 600; }
	.placeholder-text { color: #786a5d; font-style: italic; line-height: 1.6; }

	.story { border-top: 1px solid #e9dfd2; padding-top: 3rem !important; }

	.visit { text-align: center; }
	.hours { list-style: none; padding: 0; margin: 0 auto 1.5rem; max-width: 420px; }
	.hours li { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #e9dfd2; }
	.button { display: inline-block; padding: 0.9rem 1.5rem; background: #493426; color: white; border-radius: 8px; text-decoration: none; }

	@media (max-width: 640px) {
		.owner { grid-template-columns: 1fr; text-align: center; }
		.photo { width: 100%; max-width: 240px; margin: 0 auto; }
	}
</style>
