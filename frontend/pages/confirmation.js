function renderConfirmation(container) {
  const page = SkinManager.getPageContent('confirmation');
  const orderId = 'TG-' + Date.now().toString(36).toUpperCase();

  container.innerHTML = `
    <div class="container page text-center" style="max-width:600px">
      <div style="font-size:3rem; margin-bottom: var(--spacing-md);">&#10003;</div>
      <h1 class="section__title">${page.title}</h1>
      <p class="mt-md" style="font-size:1.05rem; color: var(--color-text-muted);">${page.message}</p>

      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius);">
        <p class="text-muted">${page.orderNumberLabel}</p>
        <p style="font-size:1.5rem; font-weight:700; font-family: monospace; margin-top: var(--spacing-xs);">${orderId}</p>
      </div>

      <a href="#/" class="btn btn--primary mt-xl">${page.continueCta}</a>
    </div>
  `;
}
