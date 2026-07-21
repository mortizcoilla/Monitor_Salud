/**
 * @file filters.js — MSS · filtros globales.
 * @description
 *   Cuatro filtros (<select>) en el sidebar: quintil de ingreso, región
 *   (macrozona), tramo FONASA y grupo etario. Valor por defecto "Todos".
 *
 *   Mecánica:
 *     - Los charts .chart-card-filterable registran un callback de redibujado
 *       vía MSS.filters.register(chartId, fn). Al cambiar un filtro se invoca
 *       fn(state, factorFor) sin recargar la página.
 *     - factorFor(indicator) devuelve el producto de los factores activos
 *       para ese indicador (factores multiplicativos por filtro).
 *     - Deep linking: ?filtro=quintil:Q1&filtro=region:Norte (lectura al
 *       cargar y escritura con history.replaceState).
 *     - Chips de filtros activos y botón "Limpiar" (deshabilitado en default).
 *
 *   API pública: window.MSS.filters
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};

  /**
   * @namespace FILTROS_ADJUST
   * @description Factores multiplicativos por filtro/selección/indicador.
   *   Estructura: FILTROS_ADJUST[filterKey][selection][indicator] = factor.
   *   Se aplican SOLO sobre valores base de charts filterables y se calibran
   *   con distribuciones oficiales verificadas (ver README §Filtros):
   *
   *   CLAVES VÁLIDAS DE INDICADOR:
   *     - 'lista_espera_cne'     : mediana CNE (días)
   *     - 'ges_retrasadas'       : garantías GES retrasadas (casos)
   *     - 'gasto_catastrofico'   : gasto catastrófico >10% (% población)
   *     - 'gasto_salud_hogar_monto' / 'gasto_salud_hogar_pct' (reservados)
   *
   *   CALIBRACIÓN:
   *   - quintil → gasto_catastrofico: razón entre dificultad financiera por
   *     quintil de riqueza (OMS GHO 2021: Q1 59,8 / Q2 15,1 / Q3 5,3 / Q4 3,4 /
   *     Q5 3,4) y el total nacional (17,38%). PROXY declarado: se aplica al
   *     indicador catastrófico clásico por falta de serie por quintil.
   *   - edad → lista_espera_cne: sobre/sub-representación de cada grupo etario
   *     en los registros CNE (Glosa 06 IV-2025: <15 = 16,6%; 15-64 = 53,0%;
   *     65+ = 30,4%) vs su peso poblacional (INE EEPP 2024: 16,3% / 70,2% /
   *     13,5%; el 70,2% se deriva como 100 − 16,3 − 13,5).
   *   - tramo → ges_retrasadas: solo el tramo B tiene dato oficial (64,9% de
   *     los retrasos vs 40,9% de la población FONASA → factor 1,59). A, C y D
   *     no tienen distribución publicada: factor 1,0 y limitación declarada.
   *   - region → (reservado): macrozonas EPF IX documentadas en data.js; el
   *     filtro región opera como RESALTE en charts por macrozona.
   * @example MSS.filters.factorFor('lista_espera_cne') // 2.25 con edad='65+'
   */
  var FILTROS_ADJUST = {
    quintil: {
      Todos: {},
      Q1: { gasto_catastrofico: 3.44 },
      Q2: { gasto_catastrofico: 0.87 },
      Q3: { gasto_catastrofico: 0.30 },
      Q4: { gasto_catastrofico: 0.20 },
      Q5: { gasto_catastrofico: 0.20 }
    },
    region: {
      Todos: {},
      Norte: { gasto_salud_hogar_monto: 0.774, gasto_salud_hogar_pct: 0.848 },
      'Gran Santiago': { gasto_salud_hogar_monto: 1.124, gasto_salud_hogar_pct: 1.025 },
      Centro: { gasto_salud_hogar_monto: 0.850, gasto_salud_hogar_pct: 0.987 },
      Sur: { gasto_salud_hogar_monto: 0.908, gasto_salud_hogar_pct: 1.063 }
    },
    tramo: {
      Todos: {},
      A: {},
      B: { ges_retrasadas: 1.59 },
      C: {},
      D: {}
    },
    edad: {
      Todos: {},
      '0-14': { lista_espera_cne: 1.02 },
      '15-64': { lista_espera_cne: 0.75 },
      '65+': { lista_espera_cne: 2.25 }
    }
  };

  var FILTER_DEFS = [
    { key: 'quintil', label: 'Quintil de ingreso', options: ['Todos', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'] },
    { key: 'region', label: 'Región (macrozona)', options: ['Todos', 'Norte', 'Gran Santiago', 'Centro', 'Sur'] },
    { key: 'tramo', label: 'Tramo FONASA', options: ['Todos', 'A', 'B', 'C', 'D'] },
    { key: 'edad', label: 'Grupo etario', options: ['Todos', '0-14', '15-64', '65+'] }
  ];

  var state = { quintil: 'Todos', region: 'Todos', tramo: 'Todos', edad: 'Todos' };
  var registry = {}; // chartId -> redraw fn

  /** @returns {object} copia del estado actual de filtros */
  function getState() { return { quintil: state.quintil, region: state.region, tramo: state.tramo, edad: state.edad }; }

  /**
   * Factor multiplicativo combinado para un indicador.
   * @param {string} indicator clave válida (ver FILTROS_ADJUST).
   * @returns {number} producto de factores activos (1 si ninguno aplica).
   */
  function factorFor(indicator) {
    var f = 1;
    Object.keys(state).forEach(function (fk) {
      var sel = state[fk];
      var table = FILTROS_ADJUST[fk] && FILTROS_ADJUST[fk][sel];
      if (table && typeof table[indicator] === 'number') f *= table[indicator];
    });
    return f;
  }

  /**
   * Registra un chart filterable.
   * @param {string} chartId id del <svg>.
   * @param {function} fn callback redraw(state, factorFor).
   */
  function register(chartId, fn) { registry[chartId] = fn; }

  function isDefault() {
    return Object.keys(state).every(function (k) { return state[k] === 'Todos'; });
  }

  function syncUrl() {
    var params = [];
    Object.keys(state).forEach(function (k) {
      if (state[k] !== 'Todos') params.push('filtro=' + encodeURIComponent(k + ':' + state[k]));
    });
    var qs = params.length ? '?' + params.join('&') : window.location.pathname;
    try { window.history.replaceState(null, '', qs); } catch (e) { /* file:// puede restringir */ }
  }

  function readUrl() {
    var qs = window.location.search || '';
    var re = /[?&]filtro=([^&]+)/g, m;
    while ((m = re.exec(qs)) !== null) {
      var pair = decodeURIComponent(m[1]).split(':');
      if (pair.length === 2 && state.hasOwnProperty(pair[0])) {
        var def = FILTER_DEFS.filter(function (d) { return d.key === pair[0]; })[0];
        if (def && def.options.indexOf(pair[1]) !== -1) state[pair[0]] = pair[1];
      }
    }
  }

  function renderChips() {
    var box = document.getElementById('flt-chips');
    if (!box) return;
    var chips = [];
    FILTER_DEFS.forEach(function (d) {
      if (state[d.key] !== 'Todos') {
        chips.push('<span class="mss-chip" data-key="' + d.key + '">' + d.label + ': <strong>' +
          state[d.key] + '</strong><button type="button" class="chip-x" aria-label="Quitar filtro ' +
          d.label + '" data-clear="' + d.key + '">×</button></span>');
      }
    });
    box.innerHTML = chips.length
      ? chips.join('')
      : '<span class="mss-chip mss-chip-empty">Sin filtros activos</span>';
  }

  function syncControls() {
    FILTER_DEFS.forEach(function (d) {
      var el = document.getElementById('flt-' + d.key);
      if (el) el.value = state[d.key];
    });
    var clear = document.getElementById('flt-clear');
    if (clear) clear.disabled = isDefault();
    renderChips();
    syncUrl();
  }

  function applyAll() {
    var s = getState();
    Object.keys(registry).forEach(function (id) {
      try { registry[id](s, factorFor); }
      catch (e) { console.error('[MSS] Error redibujando chart filterable #' + id, e); }
    });
  }

  function setFilter(key, value) {
    if (!state.hasOwnProperty(key)) return;
    state[key] = value;
    syncControls();
    applyAll();
  }

  /**
   * Inicializa filtros: lee deep link, cablea selects, chips y botón Limpiar.
   * Debe llamarse ANTES de renderizar los módulos para que el estado inicial
   * (incluido el deep link) se respete en el primer dibujado.
   * @returns {void}
   */
  function init() {
    readUrl();
    FILTER_DEFS.forEach(function (d) {
      var el = document.getElementById('flt-' + d.key);
      if (!el) return;
      el.addEventListener('change', function () { setFilter(d.key, el.value); });
    });
    var clear = document.getElementById('flt-clear');
    if (clear) {
      clear.addEventListener('click', function () {
        Object.keys(state).forEach(function (k) { state[k] = 'Todos'; });
        syncControls();
        applyAll();
      });
    }
    var chips = document.getElementById('flt-chips');
    if (chips) {
      chips.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-clear]');
        if (btn) setFilter(btn.getAttribute('data-clear'), 'Todos');
      });
    }
    syncControls();
  }

  window.MSS.filters = {
    FILTROS_ADJUST: FILTROS_ADJUST,
    FILTER_DEFS: FILTER_DEFS,
    init: init,
    getState: getState,
    factorFor: factorFor,
    register: register,
    setFilter: setFilter
  };
})();
