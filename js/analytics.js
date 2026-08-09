/**
 * @file analytics.js — MSS · capa analítica (sección #analitica).
 * @description
 *   Tres análisis sobre los datos verificados:
 *     (a) TERRITORIO: tabla compacta con mini-barras de progreso.
 *     (b) PANEL LONGITUDINAL: 3 mini paneles (small multiples) con 2 líneas cada uno.
 *     (c) SUBGRUPOS: acceso efectivo FONASA vs isapre y gradiente socioeconómico.
 *
 *   API pública: window.MSS.analytics.render()
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};
  var D = window.MSS.DATA;
  var C = function () { return window.MSS.core; };

  function reg(chartId, fn) {
    if (window.MSS.filters && window.MSS.filters.register) window.MSS.filters.register(chartId, fn);
  }

  /* (a) Territorio: tabla compacta con mini-barras */
  function analisisA() {
    var c = C(), p = c.PALETTE, t = D.M3.territorio;

    var container = document.getElementById('chart-a-1');
    if (!container) return;
    var wrap = container.parentNode;
    var maxVal = 220;

    var html = '<div class="a1-wrap">' +
      '<table class="a1-table">' +
      '<thead><tr><th>Servicio de Salud</th><th class="num">Días</th><th style="width:50%">Meta: 200 días</th></tr></thead>' +
      '<tbody>';
    t.iqBajo200.forEach(function (r) {
      var pct = Math.min(100, (r.v / maxVal) * 100);
      var color = r.v <= 150 ? p.green : (r.v <= 180 ? p.amber : p.red);
      html += '<tr>' +
        '<td class="a1-name">' + r.ss + '</td>' +
        '<td class="a1-days">' + r.v + '</td>' +
        '<td class="a1-bar">' +
          '<div class="a1-track"><div class="a1-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '</td>' +
      '</tr>';
    });
    html += '</tbody></table></div>';
    wrap.innerHTML = html;

    var el = document.getElementById('a-1-stats');
    if (el) {
      el.innerHTML =
        '<div class="stat"><strong>' + t.ssBajo200CNE + '/' + t.totalSS + '</strong><span>SS bajo meta 200 días en CNE</span></div>' +
        '<div class="stat"><strong>' + t.ssBajo200IQ + '/' + t.totalSS + '</strong><span>SS bajo meta en cirugía (IQ)</span></div>' +
        '<div class="stat"><strong>' + t.minDias + '–' + t.maxDias + '</strong><span>rango CNE: ' + t.minSS + ' vs ' + t.maxSS + '</span></div>';
    }
  }

  /* (b) Panel longitudinal: 3 small multiples */
  function analisisB() {
    var c = C(), p = c.PALETTE;
    var che = D.M1.gdpSeries;
    var che19 = che.filter(function (r) { return r.anio === 2019; })[0].v;
    var oop = D.M1.financiamiento;
    var oop19 = oop.filter(function (r) { return r.anio === 2019; })[0].oop;
    var pres = D.M1.presupuesto;
    var pres19 = pres.filter(function (r) { return r.anio === 2019; })[0].ejecutado;
    var isa = D.M2.isapreBenef;
    var isa19 = isa.filter(function (r) { return r.anio === 2019; })[0].n;
    var cne21 = D.M3.medianasCNE[0].v;
    var ges21 = D.M3.ges[0].n;

    var container = document.getElementById('chart-a-2');
    if (!container) return;
    var wrap = container.parentNode;
    wrap.innerHTML =
      '<div class="a2-grid">' +
        '<div class="a2-panel">' +
          '<h4 class="a2-title">Financiamiento público</h4>' +
          '<svg id="chart-a-2a" viewBox="0 0 300 150"></svg>' +
          '<p class="a2-foot">Base 100 = 2019</p>' +
        '</div>' +
        '<div class="a2-panel">' +
          '<h4 class="a2-title">Sector privado</h4>' +
          '<svg id="chart-a-2b" viewBox="0 0 300 150"></svg>' +
          '<p class="a2-foot">Base 100 = 2019</p>' +
        '</div>' +
        '<div class="a2-panel">' +
          '<h4 class="a2-title">Demoras y cumplimiento</h4>' +
          '<svg id="chart-a-2c" viewBox="0 0 300 150"></svg>' +
          '<p class="a2-foot">Base 100 = 2021 (sin dato 2019)</p>' +
        '</div>' +
      '</div>';

    var opts = { xType: 'linear', ticks: 5, unidad: '', yLabel: '', lineaRef: { v: 100, label: '' }, margins: { top: 14, right: 10, bottom: 30, left: 34 } };

    c.lines('chart-a-2a', [
      { label: 'CHE % PIB', color: p.blueDark,
        puntos: che.map(function (r) { return { x: r.anio, v: Math.round(100 * r.v / che19 * 10) / 10 }; }) },
      { label: 'Presup. MINSAL', color: p.green,
        puntos: pres.filter(function (r) { return r.ejecutado != null; })
          .map(function (r) { return { x: r.anio, v: Math.round(100 * r.ejecutado / pres19 * 10) / 10 }; }) }
    ], opts);

    c.lines('chart-a-2b', [
      { label: 'OOP % CHE', color: p.amber,
        puntos: oop.map(function (r) { return { x: r.anio, v: Math.round(100 * r.oop / oop19 * 10) / 10 }; }) },
      { label: 'Benef. isapre', color: p.red,
        puntos: isa.map(function (r) { return { x: r.anio, v: Math.round(100 * r.n / isa19 * 10) / 10 }; }) }
    ], opts);

    c.lines('chart-a-2c', [
      { label: 'Mediana CNE', color: p.blueLight,
        puntos: [{ x: 2021, v: 100 }, { x: 2023, v: Math.round(100 * 240 / cne21 * 10) / 10 },
                 { x: 2024, v: Math.round(100 * 263 / cne21 * 10) / 10 },
                 { x: 2025, v: Math.round(100 * 226 / cne21 * 10) / 10 }] },
      { label: 'GES retrasadas', color: p.muted,
        puntos: D.M3.ges.map(function (r) { return { x: r.anio, v: Math.round(100 * r.n / ges21 * 10) / 10 }; }) }
    ], opts);
  }

  /* (c) Subgrupos: acceso efectivo y gradiente socioeconómico */
  function analisisC() {
    var c = C(), p = c.PALETTE, a = D.M2.acceso;

    // C1 · Acceso efectivo: 3 tarjetas KPI con mini-barras e insight
    var c1wrap = document.getElementById('chart-a-3');
    if (c1wrap) {
      var c1parent = c1wrap.parentNode;
      var ratio = (a.problemasFonasa / a.problemasIsapre).toFixed(1);
      c1parent.innerHTML =
        '<div class="c1-grid">' +
          '<div class="c1-card">' +
            '<p class="c1-label">Nacional</p>' +
            '<p class="c1-num">' + a.problemas2024 + '<span>%</span></p>' +
            '<div class="c1-track"><div class="c1-fill" style="width:' + Math.min(100, a.problemas2024 * 2.5) + '%;background:' + p.amber + '"></div></div>' +
            '<p class="c1-insight">Atención recibida: <strong>' + a.atencion2024 + '%</strong></p>' +
          '</div>' +
          '<div class="c1-card c1-card-highlight">' +
            '<p class="c1-label">FONASA</p>' +
            '<p class="c1-num">' + a.problemasFonasa + '<span>%</span></p>' +
            '<div class="c1-track"><div class="c1-fill" style="width:' + Math.min(100, a.problemasFonasa * 2.5) + '%;background:' + p.red + '"></div></div>' +
            '<p class="c1-insight"><strong>' + ratio + '× más</strong> problemas que Isapre</p>' +
          '</div>' +
          '<div class="c1-card">' +
            '<p class="c1-label">Isapre</p>' +
            '<p class="c1-num">' + a.problemasIsapre + '<span>%</span></p>' +
            '<div class="c1-track"><div class="c1-fill" style="width:' + Math.min(100, a.problemasIsapre * 2.5) + '%;background:' + p.green + '"></div></div>' +
            '<p class="c1-insight">~' + c.fmtMiles(Math.round(a.personasConProblemas / 1000)) + ' mil personas afectadas en total</p>' +
          '</div>' +
        '</div>';
    }

    // C2 · Riesgo financiero × previsión: tabla comparativa con mini-barras dobles
    var c2wrap = document.getElementById('chart-a-4');
    if (c2wrap) {
      var c2parent = c2wrap.parentNode;
      var dec = D.M2.decil;
      var hard = D.M5.hardship.quintil;
      var isaQ = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map(function (q, i) {
        return { q: q, v: (dec[i * 2].isapre + dec[i * 2 + 1].isapre) / 2 };
      });

      var html = '<div class="c2-wrap">' +
        '<table class="c2-table">' +
        '<thead><tr><th>Quintil</th><th>Dificultad financiera</th><th>% Isapre</th><th>Patrón</th></tr></thead>' +
        '<tbody>';
      hard.forEach(function (h, i) {
        var isa = isaQ[i];
        var hPct = Math.min(100, (h.v / 65) * 100);
        var iPct = Math.min(100, (isa.v / 60) * 100);
        var arrow = i > 2 ? '↗' : (i < 2 ? '↘' : '→');
        html += '<tr>' +
          '<td class="c2-q">' + h.q + '</td>' +
          '<td class="c2-cell">' +
            '<span class="c2-val">' + c.fmtDec(h.v, 1) + '%</span>' +
            '<div class="c2-track"><div class="c2-fill c2-fill-red" style="width:' + hPct + '%"></div></div>' +
          '</td>' +
          '<td class="c2-cell">' +
            '<span class="c2-val">' + c.fmtDec(isa.v, 1) + '%</span>' +
            '<div class="c2-track"><div class="c2-fill c2-fill-amber" style="width:' + iPct + '%"></div></div>' +
          '</td>' +
          '<td class="c2-arrow">' + arrow + '</td>' +
        '</tr>';
      });
      html += '</tbody></table>' +
        '<p class="c2-foot">Leyendo de arriba hacia abajo: la dificultad financiera cae mientras crece el acceso a Isapre. La correlación inversa es el patrón central.</p>' +
        '</div>';
      c2parent.innerHTML = html;
    }
  }

  window.MSS.analytics = {
    render: function () { analisisA(); analisisB(); analisisC(); }
  };
})();
