function renderHome(container) {
  const page = SkinManager.getPageContent('home');
  const brand = SkinManager.getBrand();
  const categories = SkinManager.getCategories();
  const term = SkinManager.getTerminology;

  container.innerHTML = `
    <section class="hero" style="background-image: url('${page.heroImage}')">
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <h1 class="hero__title">${page.heroTitle}</h1>
        <p class="hero__subtitle">${page.heroSubtitle}</p>
        <a href="#/browse" class="btn btn--primary">${page.heroCta}</a>
      </div>
    </section>

    <div class="container page">
      <section class="section">
        <h2 class="section__title">${page.featuredSectionTitle}</h2>
        <div class="grid mt-lg">
          ${categories.map((group) => `
            <div class="card" onclick="Router.navigate('/browse/${group.key}')">
              <div class="card__body">
                <h3 class="card__title">${group.label}</h3>
                <p class="card__subtitle">${group.items.length} ${term('categories').toLowerCase()}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">${page.featuredItemsTitle}</h2>
        <p class="empty-state">
          ${term('items')} coming soon — data will load from the backend in Phase 2.
        </p>
      </section>
    </div>
  `;
}
