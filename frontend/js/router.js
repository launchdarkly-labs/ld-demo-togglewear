/**
 * Router — lightweight hash-based SPA router.
 * Routes are defined as { path, handler(params) } where handler renders into #app-content.
 */
const Router = (() => {
  let _routes = [];
  let _notFound = null;

  function addRoute(path, handler) {
    _routes.push({ path, handler });
  }

  function setNotFound(handler) {
    _notFound = handler;
  }

  function matchRoute(hash) {
    const path = hash.replace('#', '') || '/';

    for (const route of _routes) {
      const params = extractParams(route.path, path);
      if (params !== null) {
        return { handler: route.handler, params };
      }
    }
    return null;
  }

  /**
   * Match route patterns like "/browse/:group/:category" against actual paths.
   * Returns param object on match, null otherwise.
   */
  function extractParams(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  function navigate(path) {
    window.location.hash = path;
  }

  function resolve() {
    const hash = window.location.hash || '#/';
    const match = matchRoute(hash);

    const container = document.getElementById('app-content');
    if (!container) return;

    if (match) {
      match.handler(container, match.params);
    } else if (_notFound) {
      _notFound(container);
    }
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { addRoute, setNotFound, navigate, resolve, init };
})();
