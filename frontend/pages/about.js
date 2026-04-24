function renderAbout(container) {
  const page = SkinManager.getPageContent('about');

  const valuesHtml = (page.values || []).map((v) => `
    <div class="value-card">
      <h3 class="value-card__title">${v.title}</h3>
      <p class="value-card__desc">${v.description}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="container page" style="max-width:800px">
      <h1 class="section__title">${page.title}</h1>
      <p class="mt-lg" style="font-size:1.05rem; line-height:1.8; color: var(--color-text-muted);">
        ${page.mission}
      </p>

      <div class="values-grid mt-xl">
        ${valuesHtml}
      </div>
    </div>
  `;
}
