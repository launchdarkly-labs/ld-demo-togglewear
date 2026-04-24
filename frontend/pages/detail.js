function renderDetail(container, params) {
  const page = SkinManager.getPageContent('detail');
  const term = SkinManager.getTerminology;

  container.innerHTML = `
    <div class="container page">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl);">
        <div>
          <div class="card__image" style="height:400px; background: var(--color-border); display:flex; align-items:center; justify-content:center; border-radius: var(--radius); color: var(--color-text-muted);">
            Item image (Phase 2)
          </div>
        </div>
        <div>
          <h1 class="section__title" style="font-size:1.75rem">${term('item')} #${params.id || '...'}</h1>
          <p class="text-muted mt-sm">${page.descriptionLabel}</p>
          <p class="mt-md" style="color: var(--color-text-muted);">
            ${term('item')} details will load from the backend in Phase 2.
          </p>
          <p class="card__price mt-lg" style="font-size:1.5rem">$—</p>

          <div class="form-group mt-lg">
            <label class="form-label">${page.sizeLabel}</label>
            <select class="form-select">
              <option>Select...</option>
            </select>
          </div>

          <button class="btn btn--primary mt-md">${page.addToCartLabel}</button>
        </div>
      </div>

      <section class="section mt-xl">
        <h2 class="section__title" style="font-size:1.25rem">${page.relatedTitle}</h2>
        <p class="empty-state">Related ${term('items').toLowerCase()} coming in Phase 2.</p>
      </section>
    </div>
  `;
}
