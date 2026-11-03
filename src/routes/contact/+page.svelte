<script lang="ts">
  const address = '15825 Hope Village Rd, Suite B, Friendswood, TX 77546';
  const phone = '(832) 569-4556';
  const email = 'heritagecafeo@gmail.com';
</script>

<svelte:head>
  <title>Contact Us | Heritage Café</title>
  <meta
    name="description"
    content="Contact Heritage Café in Friendswood, Texas."
  />
</svelte:head>

<section class="contact-page">
  <h1>Contact Us</h1>
  <p class="intro">
    Have a question? We'd love to hear from you.
    Feel free to visit us or reach out.
  </p>

  <div class="contact-content">
    <div class="contact-details">
      <h2>Visit Us</h2>
      <p>{address}</p>

      <h2>Call Us</h2>
      <p><a href="tel:+18325694556">{phone}</a></p>

      <h2>Email Us</h2>
      <p><a href="mailto:{email}">{email}</a></p>

      <h2>Business Hours</h2>
      <p>Monday – Saturday: 8:00 AM – 8:00 PM</p>
      <p>Sunday: 8:30 AM – 8:00 PM</p>
    </div>

    <img
      src="/images/contact-coffee.jpg"
      alt="Coffee being prepared at Heritage Café"
      class="contact-image"
    />
  </div>
</section>

<style>
  .contact-page {
    padding: 50px 0;
    color: #473023;
  }

  h1 {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .intro {
    color: #755744;
    margin-bottom: 30px;
  }

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    align-items: stretch;
  }

  .contact-details {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
  }

  h2 {
    font-size: 20px;
    margin-top: 15px;
    margin-bottom: 8px;
  }

  p {
    line-height: 1.6;
  }

  a {
    color: #755744;
    text-decoration: none;
  }

  .contact-image {
    width: 100%;
    height: 100%;
    max-height: 450px;
    object-fit: cover;
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    .contact-content {
      grid-template-columns: 1fr;
    }

    .contact-image {
      height: 280px;
    }
  }
</style>
