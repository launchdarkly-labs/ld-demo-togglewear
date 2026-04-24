function renderCart(container) {
  const page = SkinManager.getPageContent('cart');
  const term = SkinManager.getTerminology;

  container.innerHTML = `
    <div class="container page">
      <h1 class="section__title">${page.title}</h1>
      <div class="mt-xl">
        <p class="empty-state">${page.emptyState}</p>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
        <a href="#/browse" class="btn btn--secondary">${page.continueShopping}</a>
        <div style="text-align:right">
          <p class="text-muted">${page.subtotalLabel}</p>
          <p style="font-size:1.5rem; font-weight:700;">$0.00</p>
          <button class="btn btn--primary mt-sm" disabled>${page.checkoutCta}</button>
        </div>
      </div>
    </div>
  `;
}
