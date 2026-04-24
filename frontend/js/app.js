/**
 * App — main entry point. Renders the shell (nav, footer) and initializes routing.
 */
const App = (() => {
  let _currentUser = null;
  let _userDropdownOpen = false;

  function renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <nav class="nav">
        <div class="nav__inner">
          <a href="#/" class="nav__brand" id="nav-brand"></a>
          <div class="nav__links" id="nav-links"></div>
          <div class="nav__actions">
            <div id="skin-switcher"></div>
            <div id="user-switcher"></div>
            <a href="#/cart" class="cart-icon" id="cart-icon">
              &#128722;
              <span class="cart-icon__badge" id="cart-badge" style="display:none">0</span>
            </a>
          </div>
        </div>
      </nav>
      <main id="app-content"></main>
      <footer class="footer" id="app-footer"></footer>
    `;
  }

  function renderNav() {
    const brand = SkinManager.getBrand();
    const links = SkinManager.getNav();

    document.getElementById('nav-brand').textContent = brand.name;

    const navLinksEl = document.getElementById('nav-links');
    navLinksEl.innerHTML = links.map((link) => `
      <a href="#${link.route}" class="nav__link">${link.label}</a>
    `).join('');
  }

  function renderSkinSwitcher() {
    const current = SkinManager.getSkin();
    const el = document.getElementById('skin-switcher');

    const labels = { retail: 'Retail', health: 'Health', financial: 'Finance' };

    el.innerHTML = `
      <div class="skin-switcher">
        <span class="skin-switcher__label">Industry:</span>
        ${SkinManager.AVAILABLE_SKINS.map((id) => `
          <button class="skin-switcher__btn ${id === current.id ? 'skin-switcher__btn--active' : ''}"
                  data-skin="${id}">
            ${labels[id]}
          </button>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('.skin-switcher__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        SkinManager.switchSkin(btn.dataset.skin);
      });
    });
  }

  function renderUserSwitcher() {
    const el = document.getElementById('user-switcher');
    const user = _currentUser;

    el.innerHTML = `
      <div class="user-switcher">
        <button class="user-switcher__trigger" id="user-trigger">
          ${user
            ? `<span class="user-switcher__avatar">${user.initial}</span>
               <span>${user.name}</span>`
            : `<span>Select User</span>`
          }
          <span style="font-size:0.6rem; margin-left:4px;">&#9660;</span>
        </button>
        <div class="user-switcher__dropdown" id="user-dropdown">
          ${AppConfig.USERS.map((u) => `
            <button class="user-switcher__option ${_currentUser?.key === u.key ? 'user-switcher__option--active' : ''}"
                    data-user-key="${u.key}">
              ${u.name}
              <span class="user-switcher__role">${u.role}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('user-trigger').addEventListener('click', () => {
      _userDropdownOpen = !_userDropdownOpen;
      document.getElementById('user-dropdown')
        .classList.toggle('user-switcher__dropdown--open', _userDropdownOpen);
    });

    el.querySelectorAll('.user-switcher__option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const userKey = btn.dataset.userKey;
        _currentUser = AppConfig.USERS.find((u) => u.key === userKey);
        _userDropdownOpen = false;
        renderUserSwitcher();
        // TODO: Phase 3 — call LDClient.identify() with _currentUser.context
      });
    });

    document.addEventListener('click', (e) => {
      if (!el.contains(e.target)) {
        _userDropdownOpen = false;
        const dd = document.getElementById('user-dropdown');
        if (dd) dd.classList.remove('user-switcher__dropdown--open');
      }
    });
  }

  function renderFooter() {
    const brand = SkinManager.getBrand();
    const footerEl = document.getElementById('app-footer');

    footerEl.innerHTML = `
      <div class="footer__inner">
        <span class="footer__brand">${brand.name}</span>
        <span class="footer__text">Built with LaunchDarkly. This is a demo application.</span>
      </div>
    `;
  }

  function updateActiveNavLink() {
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.nav__link').forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = hash === href || (href !== '#/' && hash.startsWith(href));
      link.classList.toggle('nav__link--active', isActive);
    });
  }

  function registerRoutes() {
    Router.addRoute('/', renderHome);
    Router.addRoute('/browse', renderBrowse);
    Router.addRoute('/browse/:group', renderBrowse);
    Router.addRoute('/browse/:group/:category', renderBrowse);
    Router.addRoute('/detail/:id', renderDetail);
    Router.addRoute('/cart', renderCart);
    Router.addRoute('/checkout', renderCheckout);
    Router.addRoute('/confirmation', renderConfirmation);
    Router.addRoute('/about', renderAbout);
    Router.addRoute('/contact', renderContact);

    Router.setNotFound((container) => {
      container.innerHTML = `
        <div class="container page text-center">
          <h1 class="section__title">Page Not Found</h1>
          <p class="text-muted mt-md">The page you're looking for doesn't exist.</p>
          <a href="#/" class="btn btn--primary mt-lg">Go Home</a>
        </div>
      `;
    });
  }

  function refreshUI() {
    renderNav();
    renderSkinSwitcher();
    renderUserSwitcher();
    renderFooter();
    Router.resolve();
  }

  async function init() {
    renderShell();
    await SkinManager.init(AppConfig.DEFAULT_SKIN);

    _currentUser = AppConfig.USERS[0];

    registerRoutes();
    refreshUI();
    Router.init();

    window.addEventListener('hashchange', updateActiveNavLink);
    updateActiveNavLink();

    SkinManager.onChange(() => {
      refreshUI();
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
