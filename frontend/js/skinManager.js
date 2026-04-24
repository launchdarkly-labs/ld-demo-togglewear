/**
 * SkinManager — loads skin configs and applies theme tokens to the DOM.
 *
 * Skins define brand, copy, and terminology.
 * Themes (retro vs modern) are controlled by LaunchDarkly flags, not by the skin itself.
 * The active theme is set separately via setTheme().
 */
const SkinManager = (() => {
  const SKINS_PATH = '/skins';
  const AVAILABLE_SKINS = ['retail', 'health', 'financial'];
  const SKIN_STORAGE_KEY = 'toggleapp-active-skin';

  let _activeSkin = null;
  let _activeTheme = 'retro';
  let _skinCache = {};
  let _listeners = [];

  async function loadSkin(skinId) {
    if (_skinCache[skinId]) return _skinCache[skinId];

    const response = await fetch(`${SKINS_PATH}/${skinId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load skin: ${skinId}`);
    }

    const skin = await response.json();
    _skinCache[skinId] = skin;
    return skin;
  }

  function applyThemeTokens(skin, themeName) {
    const theme = skin.themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--color-bg', theme.backgroundColor);
    root.style.setProperty('--color-surface', theme.surfaceColor);
    root.style.setProperty('--color-text', theme.textColor);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.borderColor);
    root.style.setProperty('--font-heading', theme.fontHeading);
    root.style.setProperty('--font-body', theme.fontBody);
    root.style.setProperty('--radius', theme.borderRadius);
    root.style.setProperty('--shadow-card', theme.cardShadow);

    root.setAttribute('data-skin', skin.id);
    root.setAttribute('data-theme', themeName);
    root.setAttribute('data-button-style', theme.buttonStyle);
    root.setAttribute('data-nav-style', theme.navStyle);
    root.setAttribute('data-hero-style', theme.heroStyle);
  }

  function updateDocumentMeta(skin) {
    document.title = `${skin.brand.name} — ${skin.brand.tagline}`;
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = skin.brand.favicon;
    }
  }

  function notifyListeners() {
    _listeners.forEach((fn) => fn(_activeSkin, _activeTheme));
  }

  // ---- Public API ----

  async function init(skinId) {
    const saved = localStorage.getItem(SKIN_STORAGE_KEY);
    const id = skinId || saved || 'retail';

    _activeSkin = await loadSkin(id);
    applyThemeTokens(_activeSkin, _activeTheme);
    updateDocumentMeta(_activeSkin);
    localStorage.setItem(SKIN_STORAGE_KEY, id);

    return _activeSkin;
  }

  async function switchSkin(skinId) {
    if (_activeSkin && _activeSkin.id === skinId) return _activeSkin;

    _activeSkin = await loadSkin(skinId);
    applyThemeTokens(_activeSkin, _activeTheme);
    updateDocumentMeta(_activeSkin);
    localStorage.setItem(SKIN_STORAGE_KEY, skinId);
    notifyListeners();

    return _activeSkin;
  }

  function setTheme(themeName) {
    if (themeName !== 'retro' && themeName !== 'modern') return;
    _activeTheme = themeName;

    if (_activeSkin) {
      applyThemeTokens(_activeSkin, _activeTheme);
      notifyListeners();
    }
  }

  function getSkin() {
    return _activeSkin;
  }

  function getTheme() {
    return _activeTheme;
  }

  function getTerminology(key) {
    return _activeSkin?.terminology?.[key] || key;
  }

  function getPageContent(pageKey) {
    return _activeSkin?.pages?.[pageKey] || {};
  }

  function getCategories() {
    return _activeSkin?.categories?.groups || [];
  }

  function getNav() {
    return _activeSkin?.nav || [];
  }

  function getBrand() {
    return _activeSkin?.brand || {};
  }

  function onChange(callback) {
    _listeners.push(callback);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== callback);
    };
  }

  return {
    AVAILABLE_SKINS,
    init,
    switchSkin,
    setTheme,
    getSkin,
    getTheme,
    getTerminology,
    getPageContent,
    getCategories,
    getNav,
    getBrand,
    onChange,
  };
})();
