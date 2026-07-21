/**
 * @file modules.js — MSS · módulos temáticos M1-M7.
 * @description
 *   Renderiza los charts D3 de los 7 módulos del monitor. Cada función pública
 *   es pura respecto del DOM: lee MSS.DATA, dibuja en los <svg> declarados en
 *   index.html y registra en MSS.filters los charts reactivos (.chart-card-filterable).
 *
 *   Convenciones de reactividad:
 *     - Charts con datos agregados nacionales: el filtro aplica un FACTOR
 *       multiplicativo (MSS.filters.factorFor) calibrado a distribuciones oficiales.
 *     - Charts desagregados por la misma dimensión del filtro: el filtro
 *       RESALTA la categoría seleccionada (atenuando el resto).
 *
 *   Convenciones de rotulación:
 *     - Todo chart declara yLabel (o xLabel en barras horizontales) con la unidad.
 *     - Líneas: opts.pointLabels ('all'|'last') dibuja etiquetas de valor.
 *     - Barras verticales y agrupadas: etiqueta de valor sobre cada barra.
 *     - Referencias (metas/promedios): píldora roja vía MSS.core.refBadge.
 *
 *   API pública: window.MSS.modules.{m1..m7, renderAll}
 *   Dependencias: d3 v7, MSS.DATA, MSS.core, MSS.filters (registro diferido).
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};
  var D = window.MSS.DATA;
  var C = function () { return window.MSS.core; };
  var P = function () { return window.MSS.core.PALETTE; };

  function reg(chartId, fn) {
    if (window.MSS.filters && window.MSS.filters.register) window.MSS.filters.register(chartId, fn);
  }

  /** Estado + factorFor actuales (o nulos si filters aún no inicializó). */
  function cur() {
    var f = window.MSS.filters;
    return f && f.getState ? [f.getState(), f.factorFor] : [null, null];
  }

  /* ==================================================================== */
  function m1() {
    var c = C(), p = P(), d = D.M1;

    // M1.1 Línea CHE % PIB 2010-2023 con referencia promedio OCDE
    c.lines('chart-m1-1', [{
      label: 'Chile — CHE % PIB', color: p.blueDark,
      puntos: d.gdpSeries.map(function (r) { return { x: r.anio, v: r.v }; })
    }], {
      xType: 'linear', ticks: 8, unidad: '% del PIB', yLabel: '% del PIB',
      pointLabels: 'last',
      lineaRef: { v: 9.3, label: 'Promedio OCDE 2024: 9,3%' },
      margins: { top: 26, right: 16, bottom: 30, left: 44 }
    });

    // M1.2 Barras apiladas descomposición público/privado (% CHE)
    c.stackedBars('chart-m1-2',
      d.financiamiento.map(function (r) { return { k: String(r.anio), publico: r.publico, privado: r.privado }; }),
      [{ key: 'publico', label: 'Público/obligatorio', color: p.blueDark },
       { key: 'privado', label: 'Privado', color: p.blueLight }],
      { pct: true, unidad: '% del CHE', yLabel: '% del CHE',
        margins: { top: 24, right: 12, bottom: 52, left: 46 } });

    // M1.3 Comparativa países 2023 (CHE % PIB y OOP % CHE)
    c.groupedBars('chart-m1-3',
      d.paises2023.map(function (r) { return { k: r.pais, che: r.che, oop: r.oop }; }),
      [{ key: 'che', label: 'Gasto % PIB', color: p.blue },
       { key: 'oop', label: 'Gasto de bolsillo % CHE', color: p.amber }],
      { unidad: '%', yLabel: '%', margins: { top: 24, right: 12, bottom: 52, left: 40 } });

    // M1.4 Presupuesto MINSAL partida 16 (ley inicial vs ejecutado)
    c.lines('chart-m1-4', [
      { label: 'Ley inicial', color: p.blueLight, puntos: d.presupuesto.map(function (r) { return { x: r.anio, v: r.ley }; }) },
      { label: 'Ejecutado a diciembre', color: p.blueDark, puntos: d.presupuesto.map(function (r) { return { x: r.anio, v: r.ejecutado }; }) }
    ], {
      xType: 'linear', ticks: 8, unidad: ' billones CLP', area: true,
      yLabel: 'billones CLP', pointLabels: 'last',
      margins: { top: 22, right: 16, bottom: 48, left: 44 }
    });
  }

  /* ==================================================================== */
  function m2() {
    var c = C(), p = P(), d = D.M2;

    // M2.1 Previsión nacional 2017-2024 (FONASA vs isapre)
    c.lines('chart-m2-1', [
      { label: 'FONASA', color: p.blueDark, puntos: d.prevision.map(function (r) { return { x: String(r.anio), v: r.fonasa }; }) },
      { label: 'Isapre', color: p.amber, puntos: d.prevision.map(function (r) { return { x: String(r.anio), v: r.isapre }; }) },
      { label: 'Ninguno (particular)', color: p.muted, puntos: d.prevision.map(function (r) { return { x: String(r.anio), v: r.ninguno }; }) }
    ], {
      unidad: '% de la población', max: 100, min: 0, area: false,
      yLabel: '% de la población', pointLabels: 'last',
      margins: { top: 22, right: 16, bottom: 48, left: 44 }
    });

    // M2.2 Deciles CASEN 2024 (filterable: resalta deciles del quintil elegido)
    var drawDecil = function (state) {
      var qmap = { Q1: ['I', 'II'], Q2: ['III', 'IV'], Q3: ['V', 'VI'], Q4: ['VII', 'VIII'], Q5: ['IX', 'X'] };
      var hl = state && state.quintil !== 'Todos' ? qmap[state.quintil] : null;
      c.groupedBars('chart-m2-2',
        d.decil.map(function (r) { return { k: r.decil, fonasa: r.fonasa, isapre: r.isapre }; }),
        [{ key: 'fonasa', label: 'FONASA', color: p.blueDark }, { key: 'isapre', label: 'Isapre', color: p.amber }],
        { unidad: '%', yLabel: '%', highlightKeys: hl, margins: { top: 22, right: 12, bottom: 52, left: 40 } });
    };
    drawDecil(cur()[0]);
    reg('chart-m2-2', drawDecil);

    // M2.3 Beneficiarios isapre 2013-2025
    c.lines('chart-m2-3', [{
      label: 'Beneficiarios isapre (cotizantes + cargas)', color: p.amber,
      puntos: d.isapreBenef.map(function (r) { return { x: r.anio, v: r.n }; })
    }], {
      xType: 'linear', ticks: 6, area: true, unidad: '',
      yLabel: 'beneficiarios', pointLabels: 'last',
      fmtVal: function (v) { return c.fmtMiles(v); },
      margins: { top: 22, right: 16, bottom: 30, left: 62 }
    });

    // M2.4 Tramos FONASA dic-2025
    c.barV('chart-m2-4',
      d.tramos.map(function (r) { return { k: 'Tramo ' + r.tramo, v: r.pct }; }),
      {
        unidad: '% de beneficiarios', color: p.blue, max: 50, yLabel: '% de beneficiarios',
        margins: { top: 24, right: 14, bottom: 30, left: 40 }
      });
  }

  /* ==================================================================== */
  function m3() {
    var c = C(), p = P(), d = D.M3;

    // M3.1 Medianas CNE/IQ (filterable: factor por grupo etario sobre CNE)
    var drawMedianas = function (state, factorFor) {
      var f = factorFor ? factorFor('lista_espera_cne') : 1;
      c.lines('chart-m3-1', [
        {
          label: 'CNE (consultas nuevas)', color: p.blueDark,
          puntos: d.medianasCNE.map(function (r) { return { x: r.p, v: Math.round(r.v * f) }; })
        },
        {
          label: 'IQ (quirúrgicas)', color: p.red,
          puntos: d.medianasIQ.map(function (r) { return { x: r.p, v: r.v }; })
        }
      ], {
        unidad: ' días (mediana)', yLabel: 'días (mediana)', pointLabels: 'last',
        fmtVal: function (v) { return c.fmtMiles(v); },
        lineaRef: { v: 200, label: 'Meta MINSAL 2026: <200 días' },
        margins: { top: 28, right: 16, bottom: 48, left: 48 }
      });
    };
    drawMedianas.apply(null, cur());
    reg('chart-m3-1', drawMedianas);

    // M3.2 Volumen en lista 2024 vs 2025
    c.groupedBars('chart-m3-2',
      d.volumen.map(function (r) { return { k: r.tipo.replace(' (CNE)', '').replace(' (IQ)', ''), r2024: r.r2024, r2025: r.r2025 }; }),
      [{ key: 'r2024', label: 'dic-2024', color: p.blueLight }, { key: 'r2025', label: 'dic-2025', color: p.blueDark }],
      {
        unidad: ' registros', yLabel: 'registros en espera',
        fmtVal: function (v) { return c.fmtMiles(v); },
        margins: { top: 22, right: 12, bottom: 66, left: 64 }
      });

    // M3.3 GES retrasadas (filterable: factor por tramo FONASA)
    var drawGes = function (state, factorFor) {
      var f = factorFor ? factorFor('ges_retrasadas') : 1;
      c.barV('chart-m3-3',
        d.ges.map(function (r) { return { k: String(r.anio), v: Math.round(r.n * f) }; }),
        {
          color: p.red, fmtVal: function (v) { return c.fmtMiles(v); }, unidad: ' garantías retrasadas',
          yLabel: 'garantías retrasadas',
          margins: { top: 24, right: 14, bottom: 30, left: 62 }
        });
    };
    drawGes.apply(null, cur());
    reg('chart-m3-3', drawGes);

    // M3.4 Fallecidos en lista (con advertencia de no-causalidad en el foot)
    c.barV('chart-m3-4',
      d.fallecidos.map(function (r) { return { k: String(r.anio) + (r.estado === 'preliminar' ? '*' : ''), v: r.n }; }),
      {
        color: p.muted, fmtVal: function (v) { return c.fmtMiles(v); }, unidad: ' personas',
        yLabel: 'personas',
        margins: { top: 24, right: 14, bottom: 30, left: 62 }
      });
  }

  /* ==================================================================== */
  function m4() {
    var c = C(), p = P(), d = D.M4;

    // M4.1 Principales causas de muerte 2022
    c.barH('chart-m4-1',
      d.causas2022.map(function (r) { return { k: r.causa, v: r.n }; }),
      {
        color: p.blueDark, fmtVal: function (v) { return c.fmtMiles(v); }, unidad: ' defunciones',
        xLabel: 'defunciones (2022)',
        margins: { top: 12, right: 70, bottom: 34, left: 230 }
      });

    // M4.2 Prevalencias de crónicas y factores de riesgo
    c.barH('chart-m4-2',
      d.cronicas.map(function (r) { return { k: r.ind, v: r.v }; }),
      {
        color: p.blue, unidad: '%', max: 70, xLabel: '% de la población',
        margins: { top: 12, right: 48, bottom: 34, left: 230 }
      });

    // M4.3 Gradiente calidad de vida por quintil (filterable: resalta quintil)
    var drawQV = function (state) {
      var qmap = { Q1: 'Quintil 1', Q5: 'Quintil 5' };
      var hl = state && state.quintil !== 'Todos' ? (qmap[state.quintil] || '∅') : null;
      c.barV('chart-m4-3',
        d.calidadVida.map(function (r) { return { k: r.g, v: r.v }; }),
        {
          unidad: '% califica su calidad de vida como buena/muy buena', max: 100, yLabel: '%',
          highlight: hl,
          colorFn: function (dd) { return dd.k === 'Nacional' ? p.muted : p.blueDark; },
          margins: { top: 24, right: 14, bottom: 30, left: 40 }
        });
    };
    drawQV(cur()[0]);
    reg('chart-m4-3', drawQV);

    // M4.4 Mortalidad prevenible y tratable vs OCDE
    c.groupedBars('chart-m4-4',
      d.prevenible.map(function (r) { return { k: r.ind.replace('Mortalidad ', ''), chile: r.chile, ocde: r.ocde }; }),
      [{ key: 'chile', label: 'Chile', color: p.blueDark }, { key: 'ocde', label: 'Promedio OCDE', color: p.blueLight }],
      {
        unidad: ' por 100.000 hab.', yLabel: 'por 100.000 hab.',
        fmtVal: function (v) { return c.fmtMiles(v); },
        margins: { top: 22, right: 12, bottom: 52, left: 44 }
      });
  }

  /* ==================================================================== */
  function m5() {
    var c = C(), p = P(), d = D.M5;

    // M5.1 Catastrófico 2006-2016 (filterable: factor quintil, proxy hardship)
    var drawCat = function (state, factorFor) {
      var f = factorFor ? factorFor('gasto_catastrofico') : 1;
      c.lines('chart-m5-1', [
        {
          label: '>10% del presupuesto del hogar', color: p.red,
          puntos: d.catastrofico.map(function (r) { return { x: String(r.anio), v: Math.round(r.u10 * f * 100) / 100 }; })
        },
        {
          label: '>25% del presupuesto del hogar', color: p.blueLight,
          puntos: d.catastrofico.map(function (r) { return { x: String(r.anio), v: r.u25 }; })
        }
      ], {
        unidad: '% de la población', max: f > 1 ? 65 : 20, min: 0, area: false,
        yLabel: '% de la población', pointLabels: 'all',
        margins: { top: 22, right: 16, bottom: 48, left: 44 }
      });
    };
    drawCat.apply(null, cur());
    reg('chart-m5-1', drawCat);

    // M5.2 Dificultad financiera por quintil 2021 (filterable: resalta quintil)
    var drawHard = function (state) {
      var hl = state && state.quintil !== 'Todos' ? state.quintil : null;
      c.barV('chart-m5-2',
        d.hardship.quintil.map(function (r) { return { k: r.q, v: r.v }; }),
        {
          unidad: '% con dificultad financiera por salud', highlight: hl, yLabel: '%',
          colorFn: function (dd) { return dd.k === 'Q1' ? p.red : p.blue; },
          margins: { top: 24, right: 14, bottom: 30, left: 40 }
        });
    };
    drawHard(cur()[0]);
    reg('chart-m5-2', drawHard);

    // M5.3 EPF IX: % del presupuesto en salud por quintil (filterable: resalta quintil)
    var drawEpf = function (state) {
      var qmap = { Q1: 'I', Q2: 'II', Q3: 'III', Q4: 'IV', Q5: 'V' };
      var hl = state && state.quintil !== 'Todos' ? qmap[state.quintil] : null;
      c.barV('chart-m5-3',
        d.epf.quintil.map(function (r) { return { k: r.q, v: r.v }; }),
        {
          unidad: '% del gasto del hogar', highlight: hl, color: p.blue, yLabel: '% del gasto del hogar',
          lineaRef: { v: d.epf.pctSalud, label: 'Promedio: 7,9%' },
          margins: { top: 30, right: 14, bottom: 30, left: 40 }
        });
    };
    drawEpf(cur()[0]);
    reg('chart-m5-3', drawEpf);

    // M5.4 Gasto en salud por macrozona (filterable: resalta macrozona)
    var drawMacro = function (state) {
      var hl = state && state.region !== 'Todos' ? state.region : null;
      c.barH('chart-m5-4',
        d.epf.macrozona.map(function (r) { return { k: r.z, v: r.monto }; }),
        {
          highlight: hl, color: p.blueDark, unidad: ' $/mes por hogar', xLabel: '$/mes por hogar',
          fmtVal: function (v) { return '$' + c.fmtMiles(v); },
          margins: { top: 12, right: 90, bottom: 34, left: 110 }
        });
    };
    drawMacro(cur()[0]);
    reg('chart-m5-4', drawMacro);
  }

  /* ==================================================================== */
  function m6() {
    var c = C(), p = P(), d = D.M6;

    // M6.1 Dotación Chile vs OCDE
    c.groupedBars('chart-m6-1',
      d.dotacion.map(function (r) { return { k: r.ind, chile: r.chile, ocde: r.ocde }; }),
      [{ key: 'chile', label: 'Chile', color: p.blueDark }, { key: 'ocde', label: 'Promedio OCDE', color: p.blueLight }],
      { unidad: ' por 1.000 hab.', yLabel: 'por 1.000 hab.', margins: { top: 22, right: 12, bottom: 52, left: 40 } });

    // M6.2 Remuneración relativa al salario medio
    c.barV('chart-m6-2',
      d.remuneracion.map(function (r) { return { k: r.ind, v: r.v }; }),
      {
        unidad: '× salario del trabajador promedio', color: p.amber, yLabel: '× salario medio',
        fmtVal: function (v) { return c.fmtDec(v, 1) + '×'; },
        lineaRef: { v: 1, label: 'Salario medio (1,0×)' },
        margins: { top: 28, right: 14, bottom: 30, left: 40 }
      });

    // M6.3 Actividad hospitalaria, índice 2019=100 (derivado)
    c.lines('chart-m6-3', [{
      label: 'Egresos hospitalarios (índice oct-2019 = 100)', color: p.green,
      puntos: d.egresosIdx.map(function (r) { return { x: r.anio, v: r.v }; })
    }], {
      xType: 'linear', ticks: 5, unidad: ' (índice)', area: true, min: 70,
      yLabel: 'índice (oct-2019 = 100)', pointLabels: 'all',
      fmtVal: function (v) { return c.fmtMiles(v); },
      lineaRef: { v: 100, label: 'Nivel pre-pandemia (100)' },
      margins: { top: 28, right: 16, bottom: 30, left: 44 }
    });
  }

  /* ==================================================================== */
  function m7() {
    var c = C(), p = P(), d = D.M7;

    // M7.1 Envejecimiento: hitos % 65+ (área) y <15 (línea), cruce 2028
    c.lines('chart-m7-1', [
      {
        label: 'Población 65+ (% del total)', color: p.blueDark,
        puntos: d.envejecimiento.hitos65.map(function (r) { return { x: r.anio, v: r.v }; })
      },
      {
        label: 'Menores de 15 (% del total)', color: p.blueLight,
        puntos: d.envejecimiento.hitos15.map(function (r) { return { x: r.anio, v: r.v }; })
      }
    ], {
      xType: 'linear', ticks: 5, unidad: '%', area: true,
      yLabel: '% del total', pointLabels: 'all',
      margins: { top: 22, right: 16, bottom: 48, left: 44 }
    });

    // M7.2 Esperanza de vida vs OCDE
    c.barH('chart-m7-2',
      d.esperanza.map(function (r) { return { k: r.g, v: r.v }; }),
      {
        unidad: ' años', min: 0, max: 90, xLabel: 'años',
        colorFn: function (dd) { return dd.k.indexOf('OCDE') === 0 || dd.k === 'Promedio OCDE' ? p.blueLight : p.blueDark; },
        fmtVal: function (v) { return c.fmtDec(v, v % 1 === 0 ? 1 : 2); },
        margins: { top: 12, right: 56, bottom: 34, left: 210 }
      });

    // M7.3 APB isapre vs IPC
    c.barV('chart-m7-3',
      d.apb.map(function (r) { return { k: String(r.anio), v: r.v }; }),
      {
        unidad: '% alza máxima autorizada', color: p.amber, max: 9, yLabel: '% alza autorizada',
        lineaRef: { v: d.ipcRef.ipc2025, label: 'IPC 2025: 3,5%' },
        margins: { top: 30, right: 14, bottom: 30, left: 40 }
      });

    // M7.4 Población total: hitos 2026 / 2035 (máximo) / 2070
    c.barV('chart-m7-4',
      d.poblacion.map(function (r) {
        return { k: String(r.anio) + (r.anio === 2035 ? ' (máx.)' : ''), v: Math.round(r.n / 100000) / 10 };
      }),
      {
        unidad: ' millones de personas', color: p.blueDark, min: 0, yLabel: 'millones de personas',
        fmtVal: function (v) { return c.fmtDec(v, 1) + ' M'; },
        margins: { top: 24, right: 14, bottom: 30, left: 44 }
      });
  }

  /** Renderiza los 7 módulos en orden. Cada módulo se invoca con su propio try/catch en main.js. */
  window.MSS.modules = {
    m1: m1, m2: m2, m3: m3, m4: m4, m5: m5, m6: m6, m7: m7,
    renderAll: function () { m1(); m2(); m3(); m4(); m5(); m6(); m7(); }
  };
})();
