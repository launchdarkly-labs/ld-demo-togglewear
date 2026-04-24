function renderBrowse(container, params) {
  const page = SkinManager.getPageContent('browse');
  const categories = SkinManager.getCategories();
  const term = SkinManager.getTerminology;

  const activeGroup = params.group || null;
  const activeCategory = params.category || null;

  const groupsHtml = categories.map((group) => `
    <div class="section">
      <h3 class="section__title" style="font-size:1.25rem">${group.label}</h3>
      <div class="grid mt-md">
        ${group.items.map((cat) => {
          const isActive = activeGroup === group.key && activeCategory === cat;
          return `
            <div class="card ${isActive ? 'card--active' : ''}"
                 onclick="Router.navigate('/browse/${group.key}/${encodeURIComponent(cat)}')">
              <div class="card__body">
                <h4 class="card__title">${cat}</h4>
                <p class="card__subtitle">View ${term('items').toLowerCase()}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  const itemsHtml = activeCategory
    ? `
      <section class="section mt-xl">
        <h3 class="section__title">${decodeURIComponent(activeCategory)}</h3>
        <p class="empty-state">${page.emptyState} (Phase 2 — DynamoDB integration)</p>
      </section>
    `
    : '';

  container.innerHTML = `
    <div class="container page">
      <h1 class="section__title">${page.title}</h1>
      <p class="section__subtitle">${page.subtitle}</p>
      ${groupsHtml}
      ${itemsHtml}
    </div>
  `;
}
