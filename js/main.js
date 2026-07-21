/**
 * @file main.js — MSS · orquestador y shell de UI.
 * @description
 *   Secuencia de arranque (DOMContentLoaded):
 *     1. Verifica dependencias (d3, MSS.DATA).
 *     2. Inicializa filtros (deep link incluido).
 *     3. Renderiza portada (core), módulos M1-M7 y analítica, cada bloque con
 *        su propio try/catch: un fallo deja una nota de error en la sección
 *        afectada sin tumbar el resto del dashboard.
 *     4. Activa el shell móvil: drawer del sidebar (hamburguesa, botón X,
 *        overlay, tecla Escape y cierre al pulsar un link).
 *
 *   API pública: window.MSS.main
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};

  function failSection(step, err) {
    console.error('[MSS] Fallo en paso "' + step.name + '"', err);
    var host = document.querySelector(step.section);
    if (host) {
      var note = document.createElement('p');
      note.className = 'mss-error-note';
      note.setAttribute('role', 'alert');
      note.textContent = 'Este bloque no pudo renderizarse (' + (err && err.message ? err.message : 'error desconocido') +
        '). El resto del monitor sigue disponible.';
      host.appendChild(note);
    }
  }

  /** @returns {Array<{name:string, section:string, run:function}>} pasos de render */
  function steps() {
    var M = window.MSS;
    return [
      { name: 'portada', section: '#portada', run: function () { M.core.renderPortada(); } },
      { name: 'm1', section: '#m1', run: M.modules.m1 },
      { name: 'm2', section: '#m2', run: M.modules.m2 },
      { name: 'm3', section: '#m3', run: M.modules.m3 },
      { name: 'm4', section: '#m4', run: M.modules.m4 },
      { name: 'm5', section: '#m5', run: M.modules.m5 },
      { name: 'm6', section: '#m6', run: M.modules.m6 },
      { name: 'm7', section: '#m7', run: M.modules.m7 },
      { name: 'analitica', section: '#analitica', run: M.analytics.render }
    ];
  }

  /* ---------------- Drawer móvil ---------------- */
  function initDrawer() {
    var btn = document.getElementById('mss-menu-btn');
    var sidebar = document.getElementById('mss-sidebar');
    var overlay = document.getElementById('mss-overlay');
    var closeBtn = document.getElementById('mss-drawer-close');
    if (!btn || !sidebar || !overlay) return;

    function open() {
      sidebar.classList.add('is-open');
      overlay.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      sidebar.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open');
      var first = sidebar.querySelector('button, a, select');
      if (first && window.matchMedia('(max-width: 900px)').matches) first.focus();
    }
    function close() {
      sidebar.classList.remove('is-open');
      overlay.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
    }
    function toggle() { sidebar.classList.contains('is-open') ? close() : open(); }

    btn.addEventListener('click', toggle);
    overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && sidebar.classList.contains('is-open')) close();
    });
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', close);
    });
    // En desktop el sidebar siempre es visible: aria-hidden solo aplica al drawer móvil
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (ev) {
      if (ev.matches) { close(); sidebar.setAttribute('aria-hidden', 'false'); }
    });
    sidebar.setAttribute('aria-hidden', window.matchMedia('(max-width: 900px)').matches ? 'true' : 'false');
  }

  /** Arranque del dashboard. @returns {void} */
  function init() {
    if (!window.d3) {
      console.error('[MSS] D3.js no cargó (CDN). Se requiere conexión para el primer render.');
      document.body.classList.add('mss-no-d3');
    }
    if (!window.MSS.DATA) {
      console.error('[MSS] data.js no cargó: abortando render.');
      return;
    }
    try { window.MSS.filters.init(); }
    catch (e) { console.error('[MSS] Fallo inicializando filtros', e); }

    steps().forEach(function (step) {
      try { step.run(); }
      catch (e) { failSection(step, e); }
    });

    initDrawer();
    document.body.classList.add('mss-ready');
    console.info('[MSS] Monitor renderizado.');
  }

  window.MSS.main = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
