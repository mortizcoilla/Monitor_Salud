/**
 * @file core.js — MSS · núcleo: paleta, niveles, IPS, helpers D3 y portada.
 * @description
 *   Expone window.MSS.core con:
 *     - PALETTE / NIVELES (constantes de diseño)
 *     - Motor del «Termómetro de la Salud» (índice compuesto 0-100; antes
 *       «Índice de Presión Sanitaria — IPS», renombrado para evitar confusión
 *       con el Instituto de Previsión Social). Los identificadores internos
 *       (IPS_SPEC, calcularIPS, IPS_INPUTS, ids ips-*) conservan su nombre
 *       histórico; el nombre público nuevo se aplica en todos los textos.
 *     - Helpers D3 genéricos (barras V/H, agrupadas, apiladas, líneas, dona,
 *       leyendas, tooltip, títulos de ejes, líneas de referencia con píldora)
 *       usados por modules.js y analytics.js.
 *     - renderPortada(): scorecard del Termómetro.
 *
 *   API pública: window.MSS.core
 *   Dependencias: window.MSS.DATA (data.js), d3 v7 (vendorizado en js/vendor/).
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};
  var D = window.MSS.DATA;

  /**
   * @namespace PALETTE
   * @description Paleta institucional sobria. Los mismos valores existen como
   * variables CSS en :root (styles.css). Mantener sincronizados.
   * @example MSS.core.PALETTE.blue // '#2f6f9f'
   */
  var PALETTE = {
    blueDark: '#0e3a5d',
    blue: '#2f6f9f',
    blueLight: '#8fb8d4',
    bluePale: '#dbe8f1',
    ink: '#1d2b36',
    muted: '#5b6b7a',
    grid: '#d8e0e8',
    green: '#2e7d52',
    amber: '#c98a1b',
    red: '#b23a3a',
    // Serie categórica para charts
    cat: ['#0e3a5d', '#2f6f9f', '#8fb8d4', '#c98a1b', '#2e7d52', '#b23a3a']
  };

  /**
   * @namespace NIVELES
   * @description Escala de 5 niveles del IPS (0-100). El color se usa en la
   * portada, la barra de zonas y todo sello de nivel del sitio.
   *   Bajo <20 · Moderado 20-39 · Elevado 40-59 · Alto 60-79 · Crítico ≥80
   * @example MSS.core.nivelDe(57.3) // { id:'elevado', label:'Elevado', ... }
   */
  var NIVELES = [
    { id: 'bajo', label: 'Bajo', min: 0, color: '#2e7d52' },
    { id: 'moderado', label: 'Moderado', min: 20, color: '#8aa84f' },
    { id: 'elevado', label: 'Elevado', min: 40, color: '#d9a13b' },
    { id: 'alto', label: 'Alto', min: 60, color: '#c25e2e' },
    { id: 'critico', label: 'Crítico', min: 80, color: '#a52f2f' }
  ];

  /**
   * Nivel del IPS para un puntaje dado.
   * @param {number} score Puntaje 0-100.
   * @returns {object} Entrada de NIVELES correspondiente.
   */
  function nivelDe(score) {
    var n = NIVELES[0];
    NIVELES.forEach(function (lv) { if (score >= lv.min) n = lv; });
    return n;
  }

  /* ==================================================================== *
   * MOTOR IPS
   * ==================================================================== */

  /**
   * @namespace IPS_SPEC
   * @description Especificación del Índice de Presión Sanitaria.
   *
   * FÓRMULA:  IPS = Σ wᵢ · normᵢ(xᵢ), con Σwᵢ = 1 y resultado en escala 0-100.
   *
   * NORMALIZACIÓN min-max: norm(x) = 100 · (x − min) / (max − min), acotada a
   * [0,100]. Los límites [min,max] de cada componente son supuestos de diseño
   * del índice (no datos): se anclan a referencias verificadas y se documentan:
   *
   * | Componente (fuente del dato)                    | w    | min | max  | Ancla |
   * |-------------------------------------------------|------|-----|------|-------|
   * | Mediana espera CNE, días (Glosa 06)             | 0,25 | 200 | 550  | min = meta oficial MINSAL <200 días; max ≈ peak pandémico 2021 (547) |
   * | Garantías GES retrasadas, n (SIGGES/Glosa 06)   | 0,20 | 50k | 80k  | rango observado 2021-2025 (54.333-78.594) con holgura |
   * | Gasto de bolsillo, % del CHE (GHED/OMS)         | 0,20 | 15  | 40   | min ≈ umbral OCDE típico; max ≈ México 2023 (41,2), mayor regional |
   * | Brecha capital humano/camas vs OCDE, % (OCDE)   | 0,20 | 0   | 100  | brecha relativa directa (sin brecha = 0; 100% = duplicar dotación) |
   * | Multimorbilidad, % población (ENCAVI)           | 0,15 | 20  | 50   | rango plausible para encuestas de crónicas en la región |
   *
   * TRATAMIENTO TEMPORAL: los componentes "capital" y "multimorbilidad" son
   * estructurales y se mantienen fijos en la serie (sus fuentes no tienen
   * periodicidad anual). El OOP 2024-2025 repite el último dato disponible
   * (2023, GHED). La serie IPS parte en 2021, primer año con los tres
   * componentes dinámicos verificados (no existe mediana CNE 2019 publicada).
   */
  var IPS_SPEC = {
    componentes: [
      { key: 'cne', label: 'Mediana de espera CNE', w: 0.25, min: 200, max: 550, unidad: 'días' },
      { key: 'ges', label: 'Garantías GES retrasadas', w: 0.20, min: 50000, max: 80000, unidad: 'casos' },
      { key: 'oop', label: 'Gasto de bolsillo (% CHE)', w: 0.20, min: 15, max: 40, unidad: '%' },
      { key: 'capital', label: 'Brecha de capacidad vs OCDE', w: 0.20, min: 0, max: 100, unidad: '% brecha' },
      { key: 'cronicas', label: 'Multimorbilidad (≥2 crónicas)', w: 0.15, min: 20, max: 50, unidad: '%' }
    ]
  };

  function norm(x, min, max) {
    var v = 100 * (x - min) / (max - min);
    return Math.max(0, Math.min(100, v));
  }

  /**
   * Calcula el IPS para un periodo.
   * @param {string} periodo Clave de MSS.DATA.IPS_INPUTS.dinamicos (ej. 'dic-2025').
   * @returns {{score:number, nivel:object, contribuciones:Array, periodo:string}}
   *   contribuciones: [{key,label,w,bruto,norm,puntos,pctDelIndice}]
   */
  function calcularIPS(periodo) {
    var din = D.IPS_INPUTS.dinamicos[periodo];
    if (!din) throw new Error('Periodo IPS desconocido: ' + periodo);
    var est = D.IPS_INPUTS.estructurales;
    var valores = {
      cne: din.cne, ges: din.ges, oop: din.oop,
      capital: est.gapCapital, cronicas: est.multimorbilidad
    };
    var score = 0;
    var contribuciones = IPS_SPEC.componentes.map(function (c) {
      var nv = norm(valores[c.key], c.min, c.max);
      var pts = c.w * nv;
      score += pts;
      return { key: c.key, label: c.label, w: c.w, unidad: c.unidad, bruto: valores[c.key], norm: nv, puntos: pts };
    });
    contribuciones.forEach(function (c) { c.pctDelIndice = score > 0 ? 100 * c.puntos / score : 0; });
    return { score: score, nivel: nivelDe(score), contribuciones: contribuciones, periodo: periodo };
  }

  /**
   * Serie completa del IPS en los periodos con datos verificados.
   * @returns {Array<{periodo:string, score:number, nivel:object}>}
   */
  function serieIPS() {
    return D.IPS_INPUTS.periodos.map(function (p) {
      var r = calcularIPS(p);
      return { periodo: p, score: r.score, nivel: r.nivel };
    });
  }

  /* ==================================================================== *
   * HELPERS D3
   * ==================================================================== */

  var TIP = null;
  /** Tooltip único reutilizable. @returns {d3.Selection} */
  function tooltip() {
    if (!TIP) {
      TIP = d3.select('body').append('div').attr('class', 'mss-tooltip').attr('role', 'status')
        .style('opacity', 0);
    }
    return TIP;
  }
  function tipShow(html, ev) {
    var t = tooltip();
    t.html(html).style('opacity', 1)
      .style('left', (ev.pageX + 12) + 'px').style('top', (ev.pageY - 10) + 'px');
  }
  function tipHide() { tooltip().style('opacity', 0); }

  var fmtInt = d3.format(',');
  var fmt1 = d3.format('.1f');
  /** Formatea entero con separador de miles estilo es-CL (punto). */
  function fmtMiles(n) { return fmtInt(Math.round(n)).replace(/,/g, '.'); }
  /** Formatea decimal con coma (es-CL). */
  function fmtDec(n, d) {
    var s = d3.format('.' + (d == null ? 1 : d) + 'f')(n);
    return s.replace('.', ',');
  }

  /**
   * Prepara un <svg> con viewBox 640×H y grupo de trabajo con márgenes.
   * @param {string} svgId id del svg (ya presente en el DOM con viewBox).
   * @param {object} [m] márgenes {top,right,bottom,left}.
   * @returns {{svg:Selection,g:Selection,W:number,H:number,w:number,h:number,m:object}}
   */
  function stage(svgId, m) {
    m = m || { top: 18, right: 16, bottom: 34, left: 52 };
    var svg = d3.select('#' + svgId);
    if (svg.empty()) throw new Error('SVG no encontrado: #' + svgId);
    svg.selectAll('*').remove();
    var vb = (svg.attr('viewBox') || '0 0 640 360').split(/\s+/).map(Number);
    var W = vb[2], H = vb[3];
    var g = svg.append('g').attr('transform', 'translate(' + m.left + ',' + m.top + ')');
    return { svg: svg, g: g, W: W, H: H, w: W - m.left - m.right, h: H - m.top - m.bottom, m: m };
  }

  function axisStyle(g) {
    g.selectAll('path,line').attr('stroke', PALETTE.grid);
    g.selectAll('text').attr('fill', PALETTE.muted).attr('font-size', 11);
  }

  function gridY(g, y, w, ticks) {
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(ticks || 5).tickSize(-w).tickFormat(''))
      .call(function (gg) { gg.select('.domain').remove(); })
      .selectAll('line').attr('stroke', PALETTE.grid).attr('stroke-dasharray', '2,3');
  }

  /**
   * Título del eje Y: texto horizontal en la esquina superior izquierda del
   * área de trazado (estilo publicación; evita rotar y no colisiona con los
   * ticks). Requiere margen top ≥ ~16 y left ≥ ~30.
   * @param {object} s resultado de stage()
   * @param {string} [text] texto del eje; si falta, no dibuja nada
   */
  function yTitle(s, text) {
    if (!text) return;
    s.g.append('text').attr('class', 'axis-title')
      .attr('x', -s.m.left + 4).attr('y', -7)
      .attr('font-size', 10.5).attr('font-style', 'italic').attr('fill', PALETTE.muted)
      .text(text);
  }

  /**
   * Título del eje X: centrado bajo el eje. Requiere margen bottom ≥ ~30.
   * @param {object} s resultado de stage()
   * @param {string} [text] texto del eje; si falta, no dibuja nada
   */
  function xTitle(s, text) {
    if (!text) return;
    s.g.append('text').attr('class', 'axis-title')
      .attr('x', s.w / 2).attr('y', s.h + s.m.bottom - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10.5).attr('font-style', 'italic').attr('fill', PALETTE.muted)
      .text(text);
  }

  /**
   * Línea de referencia punteada con su etiqueta en una "píldora" (badge con
   * fondo y borde), anclada a la izquierda para no tapar los extremos de las
   * series. Si no hay espacio sobre la línea, la píldora va debajo.
   * @param {object} s resultado de stage()
   * @param {d3.ScaleLinear} y escala vertical del chart
   * @param {{v:number,label:string}} ref referencia a dibujar
   */
  function refBadge(s, y, ref) {
    var ry = y(ref.v);
    s.g.append('line').attr('x1', 0).attr('x2', s.w).attr('y1', ry).attr('y2', ry)
      .attr('stroke', PALETTE.red).attr('stroke-dasharray', '5,4').attr('stroke-width', 1.4);
    var bw = ref.label.length * 6.0 + 16;
    var by = ry - 26;                    // sobre la línea
    if (by < 0) by = ry + 8;             // sin espacio arriba: va debajo
    var bg = s.g.append('g').attr('transform', 'translate(2,' + by + ')');
    bg.append('rect').attr('width', bw).attr('height', 18).attr('rx', 9)
      .attr('fill', '#fdf1ee').attr('stroke', PALETTE.red).attr('stroke-width', 0.9);
    bg.append('text').attr('x', 8).attr('y', 12.5)
      .attr('font-size', 10).attr('font-weight', 600).attr('fill', PALETTE.red)
      .text(ref.label);
  }

  /**
   * Leyenda horizontal con ajuste de línea.
   * @param {Selection} g grupo raíz del stage
   * @param {Array<{label:string,color:string}>} items
   * @param {number} y posición vertical inicial
   * @param {number} [maxW] ancho máximo antes de saltar de línea (default 620)
   */
  function legend(g, items, y, maxW) {
    maxW = maxW || 620;
    var x = 0, dy = 0;
    var lg = g.append('g').attr('transform', 'translate(0,' + y + ')');
    items.forEach(function (it) {
      var item = lg.append('g').attr('transform', 'translate(' + x + ',' + dy + ')');
      item.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('y', -9).attr('fill', it.color);
      var t = item.append('text').attr('x', 14).attr('y', 0).attr('font-size', 11).attr('fill', PALETTE.muted).text(it.label);
      var w = 22 + t.node().getComputedTextLength() + 14;
      if (x + w > maxW && x > 0) { // salto de línea
        x = 0; dy += 16;
        item.attr('transform', 'translate(0,' + dy + ')');
        x = w;
      } else {
        x += w;
      }
    });
  }

  /* ---- Barras verticales simples ----
   * data: [{k, v}] ; opts: {color|colorFn, yLabel, fmtVal, highlight, lineaRef} */
  function barV(svgId, data, opts) {
    opts = opts || {};
    var s = stage(svgId, opts.margins);
    var x = d3.scaleBand().domain(data.map(function (d) { return d.k; })).range([0, s.w]).padding(0.32);
    var maxV = opts.max != null ? opts.max : d3.max(data, function (d) { return d.v; }) * 1.12;
    var y = d3.scaleLinear().domain([0, maxV]).nice().range([s.h, 0]);
    gridY(s.g, y, s.w);
    s.g.selectAll('.bar').data(data).join('rect')
      .attr('x', function (d) { return x(d.k); }).attr('width', x.bandwidth())
      .attr('y', function (d) { return y(d.v); }).attr('height', function (d) { return s.h - y(d.v); })
      .attr('rx', 3)
      .attr('fill', function (d, i) { return opts.colorFn ? opts.colorFn(d, i) : (opts.color || PALETTE.blue); })
      .attr('opacity', function (d) {
        return opts.highlight && opts.highlight !== d.k && opts.highlight !== 'Todos' ? 0.28 : 1;
      })
      .on('mousemove', function (ev, d) { tipShow('<strong>' + d.k + '</strong><br>' + (opts.fmtVal || fmt1)(d.v) + (opts.unidad || ''), ev); })
      .on('mouseleave', tipHide);
    if (opts.valueLabels !== false) {
      s.g.selectAll('.vl').data(data).join('text')
        .attr('x', function (d) { return x(d.k) + x.bandwidth() / 2; })
        .attr('y', function (d) { return y(d.v) - 5; })
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', PALETTE.ink)
        .attr('opacity', function (d) {
          return opts.highlight && opts.highlight !== d.k && opts.highlight !== 'Todos' ? 0.28 : 1;
        })
        .text(function (d) { return (opts.fmtVal || fmt1)(d.v); });
    }
    s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(d3.axisBottom(x).tickSize(0)).call(axisStyle);
    s.g.append('g').call(d3.axisLeft(y).ticks(5)).call(axisStyle);
    if (opts.lineaRef) refBadge(s, y, opts.lineaRef);
    yTitle(s, opts.yLabel);
    return { x: x, y: y, stage: s };
  }

  /* ---- Barras horizontales simples ----
   * data: [{k, v}] ; ideal para etiquetas largas */
  function barH(svgId, data, opts) {
    opts = opts || {};
    var s = stage(svgId, opts.margins || { top: 12, right: 56, bottom: 22, left: 170 });
    var y = d3.scaleBand().domain(data.map(function (d) { return d.k; })).range([0, s.h]).padding(0.3);
    var maxV = opts.max != null ? opts.max : d3.max(data, function (d) { return d.v; }) * 1.08;
    var x = d3.scaleLinear().domain([0, maxV]).nice().range([0, s.w]);
    s.g.selectAll('.bar').data(data).join('rect')
      .attr('y', function (d) { return y(d.k); }).attr('height', y.bandwidth())
      .attr('x', 0).attr('width', function (d) { return x(d.v); }).attr('rx', 3)
      .attr('fill', function (d, i) { return opts.colorFn ? opts.colorFn(d, i) : (opts.color || PALETTE.blue); })
      .attr('opacity', function (d) {
        return opts.highlight && opts.highlight !== d.k && opts.highlight !== 'Todos' ? 0.28 : 1;
      })
      .on('mousemove', function (ev, d) { tipShow('<strong>' + d.k + '</strong><br>' + (opts.fmtVal || fmt1)(d.v) + (opts.unidad || ''), ev); })
      .on('mouseleave', tipHide);
    s.g.selectAll('.vl').data(data).join('text')
      .attr('x', function (d) { return x(d.v) + 6; }).attr('y', function (d) { return y(d.k) + y.bandwidth() / 2 + 4; })
      .attr('font-size', 11).attr('fill', PALETTE.ink)
      .text(function (d) { return (opts.fmtVal || fmt1)(d.v); });
    s.g.append('g').call(d3.axisLeft(y).tickSize(0)).call(axisStyle);
    s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(d3.axisBottom(x).ticks(5)).call(axisStyle);
    xTitle(s, opts.xLabel);
    return { x: x, y: y, stage: s };
  }

  /* ---- Barras agrupadas (2-3 series) ----
   * data: [{k, ...}] ; keys: [{key,label,color}]
   * opts.valueLabels !== false dibuja el valor sobre cada barra. */
  function groupedBars(svgId, data, keys, opts) {
    opts = opts || {};
    var s = stage(svgId, opts.margins || { top: 16, right: 12, bottom: 52, left: 46 });
    var x0 = d3.scaleBand().domain(data.map(function (d) { return d.k; })).range([0, s.w]).padding(0.25);
    var x1 = d3.scaleBand().domain(keys.map(function (k) { return k.key; })).range([0, x0.bandwidth()]).padding(0.08);
    var maxV = opts.max != null ? opts.max : d3.max(data, function (d) {
      return d3.max(keys, function (k) { return d[k.key] || 0; });
    }) * 1.12;
    var y = d3.scaleLinear().domain([0, maxV]).nice().range([s.h, 0]);
    gridY(s.g, y, s.w);
    var rows = s.g.selectAll('.grp').data(data).join('g').attr('transform', function (d) { return 'translate(' + x0(d.k) + ',0)'; });
    rows.selectAll('rect').data(function (d) {
      return keys.map(function (k) { return { k: d.k, key: k.key, label: k.label, color: k.color, v: d[k.key] }; });
    }).join('rect')
      .attr('x', function (d) { return x1(d.key); }).attr('width', x1.bandwidth())
      .attr('y', function (d) { return y(d.v || 0); }).attr('height', function (d) { return s.h - y(d.v || 0); })
      .attr('rx', 2).attr('fill', function (d) { return d.color; })
      .attr('opacity', function (d) {
        var hl = opts.highlightKeys; // resalta categorías del eje x
        return hl && hl.length && hl.indexOf(d.k) === -1 ? 0.25 : 1;
      })
      .on('mousemove', function (ev, d) { tipShow('<strong>' + d.k + ' · ' + d.label + '</strong><br>' + (opts.fmtVal || fmt1)(d.v) + (opts.unidad || ''), ev); })
      .on('mouseleave', tipHide);
    if (opts.valueLabels !== false) {
      rows.selectAll('text.vl').data(function (d) {
        return keys.map(function (k) { return { k: d.k, key: k.key, v: d[k.key] }; });
      }).join('text')
        .attr('class', 'vl')
        .attr('x', function (d) { return x1(d.key) + x1.bandwidth() / 2; })
        .attr('y', function (d) { return y(d.v || 0) - 4; })
        .attr('text-anchor', 'middle').attr('font-size', 9.5).attr('fill', PALETTE.ink)
        .attr('opacity', function (d) {
          var hl = opts.highlightKeys;
          return hl && hl.length && hl.indexOf(d.k) === -1 ? 0.25 : 1;
        })
        .text(function (d) { return (opts.fmtVal || fmt1)(d.v || 0); });
    }
    s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(d3.axisBottom(x0).tickSize(0)).call(axisStyle);
    s.g.append('g').call(d3.axisLeft(y).ticks(5)).call(axisStyle);
    legend(s.g, keys, s.h + 34);
    yTitle(s, opts.yLabel);
    return { stage: s };
  }

  /* ---- Barras apiladas 100% o absolutas ----
   * data: [{k, ...}] ; keys: [{key,label,color}] ; opts.pct: normaliza a 100 */
  function stackedBars(svgId, data, keys, opts) {
    opts = opts || {};
    var s = stage(svgId, opts.margins || { top: 16, right: 12, bottom: 52, left: 46 });
    var x = d3.scaleBand().domain(data.map(function (d) { return d.k; })).range([0, s.w]).padding(0.3);
    var rows = data.map(function (d) {
      var total = d3.sum(keys, function (k) { return d[k.key]; });
      var acc = 0;
      return {
        k: d.k,
        segs: keys.map(function (kk) {
          var v = opts.pct ? 100 * d[kk.key] / total : d[kk.key];
          var seg = { key: kk.key, label: kk.label, color: kk.color, v: v, raw: d[kk.key], y0: acc, y1: acc + v };
          acc += v;
          return seg;
        })
      };
    });
    var yMax = opts.pct ? 100 : d3.max(rows, function (r) { return d3.max(r.segs, function (sg) { return sg.y1; }); }) * 1.05;
    var y = d3.scaleLinear().domain([0, yMax]).nice().range([s.h, 0]);
    gridY(s.g, y, s.w);
    var rg = s.g.selectAll('.grp').data(rows).join('g').attr('transform', function (d) { return 'translate(' + x(d.k) + ',0)'; });
    rg.selectAll('rect').data(function (d) { return d.segs; }).join('rect')
      .attr('width', x.bandwidth())
      .attr('y', function (d) { return y(d.y1); })
      .attr('height', function (d) { return y(d.y0) - y(d.y1); })
      .attr('fill', function (d) { return d.color; })
      .on('mousemove', function (ev, d) {
        tipShow('<strong>' + d.label + '</strong><br>' + fmt1(d.raw) + (opts.unidad || '') + (opts.pct ? ' (' + fmt1(d.v) + '%)' : ''), ev);
      })
      .on('mouseleave', tipHide);
    s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(d3.axisBottom(x).tickSize(0)).call(axisStyle);
    s.g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(opts.pct ? function (v) { return v + '%'; } : null)).call(axisStyle);
    legend(s.g, keys, s.h + 34);
    yTitle(s, opts.yLabel);
    return { stage: s };
  }

  /* ---- Líneas multi-serie ----
   * series: [{label,color,puntos:[{x,v}]}] ; xType: 'band'|'linear'
   * opts.pointLabels: 'all' etiqueta cada punto; 'last' solo el último de cada serie. */
  function lines(svgId, series, opts) {
    opts = opts || {};
    var s = stage(svgId, opts.margins || { top: 16, right: 16, bottom: 52, left: 48 });
    var allPts = [];
    series.forEach(function (sr) { sr.puntos.forEach(function (p) { if (p.v != null) allPts.push(p); }); });
    var xs = [];
    series.forEach(function (sr) { sr.puntos.forEach(function (p) { if (xs.indexOf(p.x) === -1) xs.push(p.x); }); });
    var x, xPos;
    if (opts.xType === 'linear') {
      x = d3.scaleLinear().domain(d3.extent(xs)).range([0, s.w]);
      xPos = function (v) { return x(v); };
    } else {
      x = d3.scalePoint().domain(xs).range([0, s.w]).padding(0.2);
      xPos = function (v) { return x(v); };
    }
    var yMax = opts.max != null ? opts.max : d3.max(allPts, function (p) { return p.v; }) * 1.1;
    var yMin = opts.min != null ? opts.min : Math.min(0, d3.min(allPts, function (p) { return p.v; }));
    var y = d3.scaleLinear().domain([yMin, yMax]).nice().range([s.h, 0]);
    gridY(s.g, y, s.w);
    var line = d3.line().defined(function (p) { return p.v != null; })
      .x(function (p) { return xPos(p.x); }).y(function (p) { return y(p.v); });
    series.forEach(function (sr, si) {
      if (opts.area) {
        s.g.append('path').datum(sr.puntos).attr('fill', sr.color).attr('opacity', 0.14)
          .attr('d', d3.area().defined(function (p) { return p.v != null; })
            .x(function (p) { return xPos(p.x); }).y0(s.h).y1(function (p) { return y(p.v); }));
      }
      s.g.append('path').datum(sr.puntos).attr('fill', 'none').attr('stroke', sr.color)
        .attr('stroke-width', 2.2).attr('d', line);
      // Clase por índice: las etiquetas con espacios/%/paréntesis rompen selectAll('.pt-<label>')
      s.g.selectAll('circle.pt-s' + si).data(sr.puntos.filter(function (p) { return p.v != null; })).join('circle')
        .attr('class', 'pt-s' + si)
        .attr('cx', function (p) { return xPos(p.x); }).attr('cy', function (p) { return y(p.v); })
        .attr('r', 3.2).attr('fill', sr.color)
        .on('mousemove', function (ev, p) {
          tipShow('<strong>' + sr.label + '</strong><br>' + p.x + ': ' + (opts.fmtVal || fmt1)(p.v) + (opts.unidad || ''), ev);
        })
        .on('mouseleave', tipHide);
    });
    // Etiquetas de valores sobre los puntos ('all') o solo en el cierre de cada serie ('last')
    if (opts.pointLabels) {
      series.forEach(function (sr, si) {
        var pts = sr.puntos.filter(function (p) { return p.v != null; });
        var show = opts.pointLabels === 'last' ? pts.slice(pts.length - 1) : pts;
        s.g.selectAll('text.pl-s' + si).data(show).join('text')
          .attr('class', 'pl-s' + si)
          .attr('x', function (p) { return xPos(p.x); })
          .attr('y', function (p) { return y(p.v) - 7; })
          .attr('text-anchor', opts.pointLabels === 'last' ? 'end' : 'middle')
          .attr('font-size', 10).attr('font-weight', 600).attr('fill', sr.color)
          .text(function (p) { return (opts.fmtVal || fmt1)(p.v); });
      });
    }
    if (opts.lineaRef) refBadge(s, y, opts.lineaRef);
    var xAxis = opts.xType === 'linear'
      ? d3.axisBottom(x).ticks(opts.ticks || 6).tickFormat(d3.format('d'))
      : d3.axisBottom(x).tickSize(0);
    s.g.append('g').attr('transform', 'translate(0,' + s.h + ')').call(xAxis).call(axisStyle);
    s.g.append('g').call(d3.axisLeft(y).ticks(5)).call(axisStyle);
    if (series.length > 1 || opts.showLegend) {
      legend(s.g, series.map(function (sr) { return { label: sr.label, color: sr.color }; }), s.h + 34);
    }
    yTitle(s, opts.yLabel);
    return { x: x, y: y, stage: s };
  }

  /* ---- Dona ---- */
  function donut(svgId, data, opts) {
    opts = opts || {};
    var s = stage(svgId, { top: 10, right: 10, bottom: 40, left: 10 });
    var r = Math.min(s.w, s.h) / 2;
    var g = s.g.append('g').attr('transform', 'translate(' + s.w / 2 + ',' + s.h / 2 + ')');
    var pie = d3.pie().value(function (d) { return d.v; }).sort(null);
    var arc = d3.arc().innerRadius(r * 0.58).outerRadius(r * 0.95);
    g.selectAll('path').data(pie(data)).join('path')
      .attr('d', arc).attr('fill', function (d) { return d.data.color; })
      .attr('stroke', '#fff').attr('stroke-width', 2)
      .on('mousemove', function (ev, d) { tipShow('<strong>' + d.data.k + '</strong><br>' + fmt1(d.data.v) + (opts.unidad || '%'), ev); })
      .on('mouseleave', tipHide);
    if (opts.centro) {
      g.append('text').attr('text-anchor', 'middle').attr('dy', -2).attr('font-size', 24)
        .attr('font-weight', 700).attr('fill', PALETTE.ink).text(opts.centro);
      if (opts.centroSub) {
        g.append('text').attr('text-anchor', 'middle').attr('dy', 18).attr('font-size', 11)
          .attr('fill', PALETTE.muted).text(opts.centroSub);
      }
    }
    legend(s.g, data.map(function (d) { return { label: d.k, color: d.color }; }), s.h + 18);
    return { stage: s };
  }

  /* ==================================================================== *
   * PORTADA — Scorecard del IPS
   * ==================================================================== */

  /**
   * Renderiza la portada: número IPS, nivel, barra de 5 zonas con marcador,
   * 3 comparaciones y composición del índice.
   * @returns {void}
   */
  function renderPortada() {
    var actual = calcularIPS('dic-2025');
    var serie = serieIPS();
    var anterior = calcularIPS('dic-2024');
    var inicial = serie[0];

    // Número grande + nivel
    var num = document.getElementById('ips-number');
    num.textContent = fmtDec(actual.score, 1);
    num.style.color = actual.nivel.color;
    var lvl = document.getElementById('ips-level');
    lvl.textContent = 'Nivel ' + actual.nivel.label;
    lvl.style.background = actual.nivel.color;

    // Barra de zonas con marcador (DOM, no svg, para nitidez)
    var bar = document.getElementById('ips-bar');
    bar.innerHTML = '';
    NIVELES.forEach(function (lv, i) {
      var zone = document.createElement('div');
      zone.className = 'ips-zone';
      zone.style.background = lv.color;
      zone.style.left = (i * 20) + '%';
      zone.style.width = '20%';
      zone.title = lv.label + ' (' + lv.min + '–' + (i < 4 ? NIVELES[i + 1].min - 1 : 100) + ')';
      bar.appendChild(zone);
    });
    var marker = document.createElement('div');
    marker.className = 'ips-marker';
    marker.style.left = Math.min(100, Math.max(0, actual.score)) + '%';
    marker.setAttribute('aria-label', 'Termómetro actual ' + fmtDec(actual.score, 1));
    bar.appendChild(marker);

    // Escala textual bajo la barra
    var scale = document.getElementById('ips-scale');
    scale.innerHTML = NIVELES.map(function (lv, i) {
      var hi = i < NIVELES.length - 1 ? NIVELES[i + 1].min - 1 : 100;
      return '<li><span class="dot" style="background:' + lv.color + '"></span>' +
        lv.label + ' <span class="rng">' + (i === 0 ? '<' + NIVELES[1].min : (i === NIVELES.length - 1 ? '≥' + lv.min : lv.min + '–' + hi)) + '</span></li>';
    }).join('');

    // 3 comparaciones
    var dominante = actual.contribuciones.slice().sort(function (a, b) { return b.puntos - a.puntos; })[0];
    var dAnterior = actual.score - anterior.score;
    var dInicial = actual.score - inicial.score;
    var comp = document.getElementById('ips-comparisons');
    comp.innerHTML =
      '<h3 class="mss-card-title">Tres lecturas del índice</h3>' +
      '<ul class="ips-comp-list">' +
      '<li><span class="ips-comp-num ' + (dInicial <= 0 ? 'down' : 'up') + '">' + (dInicial >= 0 ? '+' : '−') + fmtDec(Math.abs(dInicial), 1) + '</span>' +
      '<span class="ips-comp-txt">puntos vs. inicio de la serie (<strong>' + inicial.periodo + '</strong>, ' + fmtDec(inicial.score, 1) + '). La serie parte en 2021: no existe mediana de espera CNE verificada para 2019.</span></li>' +
      '<li><span class="ips-comp-num ' + (dAnterior <= 0 ? 'down' : 'up') + '">' + (dAnterior >= 0 ? '+' : '−') + fmtDec(Math.abs(dAnterior), 1) + '</span>' +
      '<span class="ips-comp-txt">puntos vs. periodo anterior (<strong>dic-2024</strong>, ' + fmtDec(anterior.score, 1) + '): bajan las medianas de espera y suben las garantías GES retrasadas.</span></li>' +
      '<li><span class="ips-comp-num neutral">' + fmtDec(dominante.pctDelIndice, 0) + '%</span>' +
      '<span class="ips-comp-txt">del puntaje lo explica <strong>' + dominante.label.toLowerCase() + '</strong> (' + fmtMiles(dominante.bruto) + ' ' + dominante.unidad + '), el componente dominante del índice.</span></li>' +
      '</ul>';

    // Composición (barras de contribución)
    var compEl = document.getElementById('ips-composition');
    compEl.innerHTML = '';
    var wrap = d3.select(compEl);
    actual.contribuciones.forEach(function (c) {
      var row = wrap.append('div').attr('class', 'ips-comp-row');
      row.append('div').attr('class', 'ips-comp-head')
        .html('<span>' + c.label + ' <em>(w = ' + fmtDec(c.w, 2) + ')</em></span><span>' + fmtDec(c.puntos, 1) + ' pts</span>');
      var track = row.append('div').attr('class', 'ips-comp-track');
      track.append('div').attr('class', 'ips-comp-fill')
        .style('width', c.norm + '%')
        .style('background', 'linear-gradient(90deg,' + PALETTE.blue + ',' + PALETTE.blueDark + ')');
      row.append('div').attr('class', 'ips-comp-sub')
        .text('Valor: ' + fmtMiles(c.bruto) + (c.unidad.indexOf('%') === 0 ? c.unidad : ' ' + c.unidad) +
          ' · normalizado ' + fmtDec(c.norm, 0) + '/100');
    });

    // Mini serie histórica del IPS (con etiqueta de valor en cada punto)
    var miniEl = document.getElementById('ips-serie');
    if (miniEl) {
      lines('ips-serie-svg', [{
        label: 'IPS', color: PALETTE.blueDark,
        puntos: serie.map(function (p) { return { x: p.periodo, v: Math.round(p.score * 10) / 10 }; })
      }], {
        max: 100, min: 0, unidad: ' pts', yLabel: 'Termómetro (0-100)',
        pointLabels: 'all', fmtVal: function (v) { return fmtDec(v, 1); },
        margins: { top: 20, right: 14, bottom: 30, left: 36 }
      });
    }
  }

  /* API pública */
  window.MSS.core = {
    PALETTE: PALETTE,
    NIVELES: NIVELES,
    IPS_SPEC: IPS_SPEC,
    nivelDe: nivelDe,
    calcularIPS: calcularIPS,
    serieIPS: serieIPS,
    fmtMiles: fmtMiles,
    fmtDec: fmtDec,
    tooltip: tooltip, tipShow: tipShow, tipHide: tipHide,
    stage: stage, legend: legend, gridY: gridY, axisStyle: axisStyle,
    yTitle: yTitle, xTitle: xTitle, refBadge: refBadge,
    barV: barV, barH: barH, groupedBars: groupedBars, stackedBars: stackedBars,
    lines: lines, donut: donut,
    renderPortada: renderPortada
  };
})();
