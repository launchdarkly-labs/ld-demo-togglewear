function renderContact(container) {
  const page = SkinManager.getPageContent('contact');
  const info = page.storeInfo || {};

  container.innerHTML = `
    <div class="container page" style="max-width:800px">
      <h1 class="section__title">${page.title}</h1>
      <p class="section__subtitle">${page.subtitle}</p>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap: var(--spacing-xl);" class="mt-lg">
        <div>
          <form onsubmit="event.preventDefault(); alert('Message sent! (Not really — Phase 4)');">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" type="text" placeholder="Your name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-textarea" placeholder="How can we help?" required></textarea>
            </div>
            <button class="btn btn--primary" type="submit">${page.submitLabel}</button>
          </form>
        </div>

        <div>
          <div class="value-card">
            <h3 class="value-card__title">Visit Us</h3>
            <p class="value-card__desc">${info.address || ''}</p>
          </div>
          <div class="value-card mt-md">
            <h3 class="value-card__title">Email</h3>
            <p class="value-card__desc">${info.email || ''}</p>
          </div>
          <div class="value-card mt-md">
            <h3 class="value-card__title">Phone</h3>
            <p class="value-card__desc">${info.phone || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
