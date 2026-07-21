/**
 * @file analytics.js — MSS · capa analítica (sección #analitica).
 * @description
 *   Tres análisis sobre los datos verificados:
 *     (a) TERRITORIO: el brief pedía clustering de Servicios de Salud. Las
 *         fuentes solo verifican CONTEOS (14/29 SS bajo 200 días en CNE; 7 en
 *         IQ) y las 7 medianas IQ de los SS bajo la meta. No existe matriz
 *         servicio × indicadores, por lo que el clustering no es factible sin
 *         inventar datos: se implementa el ranking disponible y se declara la
 *         limitación en el chart-foot y el README.
 *     (b) PANEL LONGITUDINAL: indicadores clave normalizados a índice base
 *         100. Series con base 2019 (CHE %PIB, OOP, presupuesto MINSAL,
 *         beneficiarios isapre) y, declarado en el foot, series con base 2021
 *         (mediana CNE, GES retrasadas) por no existir dato 2019.
 *     (c) SUBGRUPOS: acceso efectivo FONASA vs isapre (CASEN 2024) y
 *         gradiente socioeconómico (deciles CASEN + hardship por quintil).
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

  /* (a) Territorio: ranking de medianas IQ disponibles (sustituto del clustering) */
  function analisisA() {
    var c = C(), p = c.PALETTE, t = D.M3.territorio;
    c.barH('chart-a-1',
      t.iqBajo200.map(function (r) { return { k: r.ss, v: r.v }; }),
      {
        unidad: ' días (mediana IQ, dic-2025)', color: p.blueDark, max: 220,
        xLabel: 'días (mediana IQ, dic-2025)',
        margins: { top: 12, right: 48, bottom: 34, left: 130 }
      });
    // Síntesis de conteos en el DOM
    var el = document.getElementById('a-1-stats');
    if (el) {
      el.innerHTML =
        '<div class="stat"><strong>' + t.ssBajo200CNE + '/' + t.totalSS + '</strong><span>Servicios de Salud bajo la meta de 200 días en CNE (dic-2025)</span></div>' +
        '<div class="stat"><strong>' + t.ssBajo200IQ + '/' + t.totalSS + '</strong><span>bajo la meta en intervenciones quirúrgicas</span></div>' +
        '<div class="stat"><strong>' + t.minDias + '–' + t.maxDias + '</strong><span>días: rango de medianas CNE entre SS (' + t.minSS + ' vs ' + t.maxSS + ')</span></div>';
    }
  }

  /* (b) Panel longitudinal, índice base 100 */
  function analisisB() {
    var c = C(), p = c.PALETTE;
    // Base 100 en 2019
    var che = D.M1.gdpSeries;
    var che19 = che.filter(function (r) { return r.anio === 2019; })[0].v;
    var oop = D.M1.financiamiento;
    var oop19 = oop.filter(function (r) { return r.anio === 2019; })[0].oop;
    var pres = D.M1.presupuesto;
    var pres19 = pres.filter(function (r) { return r.anio === 2019; })[0].ejecutado;
    var isa = D.M2.isapreBenef;
    var isa19 = isa.filter(function (r) { return r.anio === 2019; })[0].n;
    // Base 100 en 2021 (declarado en foot)
    var cne21 = D.M3.medianasCNE[0].v;
    var ges21 = D.M3.ges[0].n;

    c.lines('chart-a-2', [
      { label: 'CHE % PIB (2019=100)', color: p.blueDark,
        puntos: che.map(function (r) { return { x: r.anio, v: Math.round(100 * r.v / che19 * 10) / 10 }; }) },
      { label: 'OOP % CHE (2019=100)', color: p.amber,
        puntos: oop.map(function (r) { return { x: r.anio, v: Math.round(100 * r.oop / oop19 * 10) / 10 }; }) },
      { label: 'Presup. MINSAL (2019=100)', color: p.green,
        puntos: pres.filter(function (r) { return r.ejecutado != null; })
          .map(function (r) { return { x: r.anio, v: Math.round(100 * r.ejecutado / pres19 * 10) / 10 }; }) },
      { label: 'Benef. isapre (2019=100)', color: p.red,
        puntos: isa.map(function (r) { return { x: r.anio, v: Math.round(100 * r.n / isa19 * 10) / 10 }; }) },
      { label: 'Mediana CNE (2021=100)', color: p.blueLight,
        puntos: [{ x: 2021, v: 100 }, { x: 2023, v: Math.round(100 * 240 / cne21 * 10) / 10 },
                 { x: 2024, v: Math.round(100 * 263 / cne21 * 10) / 10 },
                 { x: 2025, v: Math.round(100 * 226 / cne21 * 10) / 10 }] },
      { label: 'GES retrasadas (2021=100)', color: p.muted,
        puntos: D.M3.ges.map(function (r) { return { x: r.anio, v: Math.round(100 * r.n / ges21 * 10) / 10 }; }) }
    ], {
      xType: 'linear', ticks: 8, unidad: ' (índice)', yLabel: 'índice (base = 100)',
      lineaRef: { v: 100, label: 'Base = 100' },
      margins: { top: 28, right: 16, bottom: 62, left: 44 }
    });
  }

  /* (c) Subgrupos: acceso efectivo y gradiente socioeconómico */
  function analisisC() {
    var c = C(), p = c.PALETTE, a = D.M2.acceso;

    // c1: acceso efectivo FONASA vs isapre
    c.barV('chart-a-3', [
      { k: 'Nacional', v: a.problemas2024 },
      { k: 'FONASA', v: a.problemasFonasa },
      { k: 'Isapre', v: a.problemasIsapre }
    ], {
      unidad: '% declara problemas para obtener atención', max: 45, yLabel: '%',
      colorFn: function (d) { return d.k === 'Nacional' ? p.muted : (d.k === 'FONASA' ? p.blueDark : p.amber); },
      margins: { top: 24, right: 14, bottom: 30, left: 40 }
    });

    // c2: gradiente — dificultad financiera por quintil + isapre por decil (filterable: resalta)
    var drawGrad = function (state) {
      var hlQ = state && state.quintil !== 'Todos' ? state.quintil : null;
      var s = c.stage('chart-a-4', { top: 24, right: 56, bottom: 52, left: 44 });
      var hard = D.M5.hardship.quintil;
      var x = d3.scaleBand().domain(hard.map(function (r) { return r.q; })).range([0, s.w]).padding(0.3);
      var yL = d3.scaleLinear().domain([0, 70]).range([s.h, 0]);
      var yR = d3.scaleLinear().domain([0, 80]).range([s.h, 0]);
      c.gridY(s.g, yL, s.w);
      s.g.selectAll('.bar').data(hard).join('rect')
        .attr('x', function (d) { return x(d.q); }).attr('width', x.bandwidth())
        .attr('y', function (d) { return yL(d.v); }).attr('height', function (d) { return s.h - yL(d.v); })
        .attr('rx', 3).attr('fill', p.blueDark)
        .attr('opacity', function (d) { return hlQ && hlQ !== d.q ? 0.28 : 1; })
        .on('mousemove', function (ev, d) {
          c.tipShow('<strong>' + d.q + '</strong><br>' + c.fmtDec(d.v, 1) + '% con dificultad financiera (2021)', ev);
        })
        .on('mouseleave', c.tipHide);
      // Etiquetas de valor sobre las barras
      s.g.selectAll('.vl').data(hard).join('text')
        .attr('class', 'vl')
        .attr('x', function (d) { return x(d.q) + x.bandwidth() / 2; })
        .attr('y', function (d) { return yL(d.v) - 5; })
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', p.ink)
        .attr('opacity', function (d) { return hlQ && hlQ !== d.q ? 0.28 : 1; })
        .text(function (d) { return c.fmtDec(d.v, 1); });
      // Línea: % isapre por decil (agrupado a quintil como promedio simple de sus dos deciles)
      var dec = D.M2.decil;
      var isaQ = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map(function (q, i) {
        return { q: q, v: (dec[i * 2].isapre + dec[i * 2 + 1].isapre) / 2 };
      });
      s.g.append('path').datum(isaQ)
        .attr('fill', 'none').attr('stroke', p.amber).attr('stroke-width', 2.2)
        .attr('d', d3.line().x(function (d) { return x(d.q) + x.bandwidth() / 2; }).y(function (d) { return yR(d.v); }));
      s.g.selectAll('.pt').data(isaQ).join('circle')
        .attr('cx', function (d) { return x(d.q) + x.bandwidth() / 2; }).attr('cy', function (d) { return yR(d.v); })
        .attr('r', 3.4).attr('fill', p.amber)
        .on('mousemove', function (ev, d) {
          c.tipShow('<strong>' + d.q + '</strong><br>' + c.fmtDec(d.v, 1) + '% declara previsión isapre (promedio simple de sus deciles, CASEN 2024)', ev);
        })
        .on('mouseleave', c.tipHide);
      // Etiquetas de valor de la línea isapre (desplazadas a la derecha del punto)
      s.g.selectAll('.pl').data(isaQ).join('text')
        .attr('class', 'pl')
        .attr('x', function (d) { return x(d.q) + x.bandwidth() / 2 + 7; })
        .attr('y', function (d) { return yR(d.v) - 6; })
        .attr('font-size', 10).attr('font-weight', 600).attr('fill', p.amber)
        .text(function (d) { return c.fmtDec(d.v, 1); });
      s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(d3.axisBottom(x).tickSize(0)).call(c.axisStyle);
      s.g.append('g').call(d3.axisLeft(yL).ticks(5)).call(c.axisStyle);
      s.g.append('g').attr('transform', 'translate(' + s.w + ',0)').call(d3.axisRight(yR).ticks(4)).call(c.axisStyle);
      // Títulos de ambos ejes Y
      c.yTitle(s, '% con dificultad financiera');
      s.g.append('text').attr('class', 'axis-title')
        .attr('x', s.w + s.m.right - 4).attr('y', -7)
        .attr('text-anchor', 'end')
        .attr('font-size', 10.5).attr('font-style', 'italic').attr('fill', p.muted)
        .text('% isapre en el quintil');
      c.legend(s.g, [
        { label: 'Dificultad financiera por salud (eje izq.)', color: p.blueDark },
        { label: '% isapre en el quintil (eje der.)', color: p.amber }
      ], s.h + 34);
    };
    drawGrad(window.MSS.filters ? window.MSS.filters.getState() : null);
    reg('chart-a-4', drawGrad);
  }

  window.MSS.analytics = {
    render: function () { analisisA(); analisisB(); analisisC(); }
  };
})();
