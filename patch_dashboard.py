#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script de correcciones al MSS dashboard."""

import re, pathlib

ROOT = pathlib.Path(r'C:/Workspace/Monitor_Salud')

def patch_core_js():
    p = ROOT / 'js' / 'core.js'
    txt = p.read_text(encoding='utf-8')
    
    # 1. Actualizar calcularIPS para aceptar pesos alternativos
    old = """  function calcularIPS(periodo) {
    var din = D.IPS_INPUTS.dinamicos[periodo];
    if (!din) throw new Error('Periodo IPS desconocido: ' + periodo);
    var est = D.IPS_INPUTS.estructurales;
    var valores = {
      cne: din.cne, ges: din.ges, oop: din.oop,
      capital: gapCapitalFromDotacion(), cronicas: est.multimorbilidad
    };
    var score = 0;
    var contribuciones = IPS_SPEC.componentes.map(function (c) {
      var nv = norm(valores[c.key], c.min, c.max);
      var pts = c.w * nv;
      score += pts;
      return { key: c.key, label: c.label, w: c.w, unidad: c.unidad, bruto: valores[c.key], norm: nv, puntos: pts };
    });"""
    new = """  function calcularIPS(periodo, pesosAlt) {
    var din = D.IPS_INPUTS.dinamicos[periodo];
    if (!din) throw new Error('Periodo IPS desconocido: ' + periodo);
    var est = D.IPS_INPUTS.estructurales;
    var valores = {
      cne: din.cne, ges: din.ges, oop: din.oop,
      capital: gapCapitalFromDotacion(), cronicas: est.multimorbilidad
    };
    var spec = pesosAlt || IPS_SPEC.componentes;
    var score = 0;
    var contribuciones = spec.map(function (c) {
      var nv = norm(valores[c.key], c.min, c.max);
      var pts = c.w * nv;
      score += pts;
      return { key: c.key, label: c.label, w: c.w, unidad: c.unidad, bruto: valores[c.key], norm: nv, puntos: pts };
    });"""
    txt = txt.replace(old, new)
    
    # 2. Agregar sensibilidadIPS
    insert_after = "    return { score: score, nivel: nivelDe(score), contribuciones: contribuciones, periodo: periodo };"
    new_func = """

  /**
   * Análisis de sensibilidad: recalcula el IPS con 3 escenarios de pesos alternativos.
   * @returns {Array<{escenario:string, pesos:string, score:number, nivel:string}>}
   */
  function sensibilidadIPS() {
    var periodo = 'dic-2025';
    var eq = IPS_SPEC.componentes.map(function (c) {
      return { key: c.key, label: c.label, w: 0.20, min: c.min, max: c.max, unidad: c.unidad };
    });
    var dem = IPS_SPEC.componentes.map(function (c) {
      return { key: c.key, label: c.label, w: c.w, min: c.min, max: c.max, unidad: c.unidad };
    });
    dem[0].w = 0.35; dem[1].w = 0.30; dem[2].w = 0.15; dem[3].w = 0.10; dem[4].w = 0.10;
    var estr = IPS_SPEC.componentes.map(function (c) {
      return { key: c.key, label: c.label, w: c.w, min: c.min, max: c.max, unidad: c.unidad };
    });
    estr[0].w = 0.15; estr[1].w = 0.10; estr[2].w = 0.15; estr[3].w = 0.35; estr[4].w = 0.25;
    return [
      { escenario: 'Dashboard (actual)', pesos: 'CNE 25% · GES 20% · OOP 20% · Cap 20% · Crón 15%', score: calcularIPS(periodo).score, nivel: calcularIPS(periodo).nivel.label },
      { escenario: 'Peso igual (20% c/u)', pesos: 'Todos 20%', score: calcularIPS(periodo, eq).score, nivel: calcularIPS(periodo, eq).nivel.label },
      { escenario: 'Énfasis en demanda inmediata', pesos: 'CNE 35% · GES 30% · resto 35%', score: calcularIPS(periodo, dem).score, nivel: calcularIPS(periodo, dem).nivel.label },
      { escenario: 'Énfasis en estructura', pesos: 'Cap 35% · Crón 25% · resto 40%', score: calcularIPS(periodo, estr).score, nivel: calcularIPS(periodo, estr).nivel.label }
    ];
  }"""
    txt = txt.replace(insert_after, insert_after + new_func)
    
    # 3. Redondear número del Termómetro
    txt = txt.replace(
        'num.textContent = fmtDec(actual.score, 1);',
        'num.textContent = Math.round(actual.score);'
    )
    
    # 4. Agregar contexto y sensibilidad en renderPortada
    old_scale = """    // Escala textual bajo la barra
    var scale = document.getElementById('ips-scale');
    scale.innerHTML = NIVELES.map(function (lv, i) {"""
    new_scale = """    // Contexto metodológico visible (inmunización contra mala interpretación)
    var ctx = document.getElementById('ips-context');
    if (ctx) {
      ctx.innerHTML = '<p class="ips-context-line">Este número resume <strong>5 presiones del sistema</strong> con ponderaciones elegidas por el autor. Cambiar los pesos cambiaría el resultado. No es una "nota escolar" de salud.</p>';
    }

    // Análisis de sensibilidad (mínimo: 3 escenarios visibles)
    var sensEl = document.getElementById('ips-sensibilidad');
    if (sensEl) {
      var sens = sensibilidadIPS();
      var sensHtml = '<h3 class="mss-card-title">¿Cambia mucho si usamos otros pesos?</h3>' +
        '<p class="ips-sens-intro">El Termómetro depende de cómo se ponderan los 5 componentes. Aquí el mismo dato con 4 combinaciones distintas:</p>' +
        '<table class="ips-sens-table"><thead><tr><th>Escenario</th><th>Pesos</th><th>Resultado</th><th>Nivel</th></tr></thead><tbody>';
      sens.forEach(function (s) {
        var clr = nivelDe(s.score).color;
        sensHtml += '<tr><td>' + s.escenario + '</td><td>' + s.pesos + '</td>' +
          '<td style="font-weight:700;color:' + clr + '">' + Math.round(s.score) + '</td>' +
          '<td><span class="ips-sens-badge" style="background:' + clr + '">' + s.nivel + '</span></td></tr>';
      });
      sensHtml += '</tbody></table>' +
        '<p class="ips-sens-foot">Ninguna combinación es "la correcta". El dashboard usa la primera porque prioriza la demanda inmediata (esperas + garantías). ' +
        'La versión académica del informe usa 8 componentes y da 61 (ALTO).</p>';
      sensEl.innerHTML = sensHtml;
    }

    // Escala textual bajo la barra
    var scale = document.getElementById('ips-scale');
    scale.innerHTML = NIVELES.map(function (lv, i) {"""
    txt = txt.replace(old_scale, new_scale)
    
    # 5. Actualizar comparaciones para usar entero
    txt = txt.replace(
        "'puntos vs. inicio de la serie (<strong>' + inicial.periodo + '</strong>, ' + fmtDec(inicial.score, 1) + ').",
        "'puntos vs. inicio de la serie (<strong>' + inicial.periodo + '</strong>, ' + Math.round(inicial.score) + ')."
    )
    txt = txt.replace(
        "'puntos vs. periodo anterior (<strong>dic-2024</strong>, ' + fmtDec(anterior.score, 1) + '):",
        "'puntos vs. periodo anterior (<strong>dic-2024</strong>, ' + Math.round(anterior.score) + '):"
    )
    
    # 6. Agregar sensibilidadIPS a la API pública
    txt = txt.replace(
        'serieIPS: serieIPS,',
        'sensibilidadIPS: sensibilidadIPS,\n    serieIPS: serieIPS,'
    )
    
    p.write_text(txt, encoding='utf-8')
    print('core.js actualizado.')


def patch_index_html():
    p = ROOT / 'index.html'
    txt = p.read_text(encoding='utf-8')
    
    # 1. Portada: agregar contexto, botón y sensibilidad
    old_score = '''          <div class="mss-card ips-score">
            <p class="ips-number" id="ips-number">—</p>
            <p class="ips-level" id="ips-level">—</p>
            <p class="ips-direction">Mayor = más presión sobre el sistema (0 a 100)</p>
            <div class="ips-bar" id="ips-bar" role="img" aria-label="Barra de niveles del Termómetro con marcador del valor actual"></div>
            <ul class="ips-scale" id="ips-scale"></ul>
          </div>'''
    new_score = '''          <div class="mss-card ips-score">
            <p class="ips-number" id="ips-number">—</p>
            <p class="ips-level" id="ips-level">—</p>
            <p class="ips-direction">Mayor = más presión sobre el sistema (0 a 100)</p>
            <div class="ips-bar" id="ips-bar" role="img" aria-label="Barra de niveles del Termómetro con marcador del valor actual"></div>
            <ul class="ips-scale" id="ips-scale"></ul>
            <div class="ips-context" id="ips-context"></div>
            <button type="button" class="ips-how-btn" id="ips-how-btn" aria-controls="ips-modal">¿Cómo se calcula?</button>
          </div>'''
    txt = txt.replace(old_score, new_score)
    
    old_comp = '''          <div class="mss-card ips-comparisons" id="ips-comparisons"></div>
          <div class="mss-card">
            <h3 class="mss-card-title">Composición del índice (puntos aportados — mayor = más presión)</h3>
            <div id="ips-composition"></div>
          </div>
          <div class="mss-card">
            <h3 class="mss-card-title">Evolución del Termómetro</h3>'''
    new_comp = '''          <div class="mss-card ips-comparisons" id="ips-comparisons"></div>
          <div class="mss-card">
            <h3 class="mss-card-title">Composición del índice (puntos aportados — mayor = más presión)</h3>
            <div id="ips-composition"></div>
          </div>
          <div class="mss-card ips-sensibilidad-card">
            <div id="ips-sensibilidad"></div>
          </div>
          <div class="mss-card">
            <h3 class="mss-card-title">Evolución del Termómetro</h3>'''
    txt = txt.replace(old_comp, new_comp)
    
    # 2. Actualizar takeaway del Termómetro a entero
    txt = txt.replace(
        'El Termómetro marca 57,3 (nivel Elevado):',
        'El Termómetro marca 57 (nivel Elevado):'
    )
    
    # 3. M3: agregar clase warning a fallecidos y separar visualmente
    old_m34 = '''          <article class="chart-card chart-card-static">
            <p class="chart-eyebrow">M3 · Listas de espera</p>
            <h3 class="chart-title">¿Cuántas personas fallecen estando en lista de espera?</h3>
            <div class="chart-body"><svg id="chart-m3-4" viewBox="0 0 640 360" role="img" aria-label="Barras: personas fallecidas estando en lista de espera 2023-2025"></svg></div>
            <p class="chart-foot">Fuente: MINSAL — Glosa 06 IV-2024 (sección 7) e IV-2025 (Tabla 22), cruce SIGTE-DEIS. *Preliminar. Advertencia del propio MINSAL: identifica fallecidos estando en lista; NO permite establecer causalidad entre la espera y la muerte (84,2% de los GES incumplidos cerrados por fallecimiento en 2023 no se asociaban a la causa de muerte).</p>
          </article>'''
    new_m34 = '''          <article class="chart-card chart-card-static chart-card-warning">
            <div class="chart-warning-banner" role="alert">
              <strong>⚠ No confundir con muertes por espera</strong>
              <span>El propio MINSAL advierte que estos datos <em>no permiten establecer causalidad</em> entre la lista de espera y la muerte. La mayoría de las causas (cáncer, cardíacas) no se relacionan con la espera.</span>
            </div>
            <p class="chart-eyebrow">M3 · Listas de espera</p>
            <h3 class="chart-title">¿Cuántas personas fallecen estando en lista de espera?</h3>
            <div class="chart-body"><svg id="chart-m3-4" viewBox="0 0 640 360" role="img" aria-label="Barras: personas fallecidas estando en lista de espera 2023-2025"></svg></div>
            <p class="chart-foot">Fuente: MINSAL — Glosa 06 IV-2024 (sección 7) e IV-2025 (Tabla 22), cruce SIGTE-DEIS. *Preliminar. Advertencia del propio MINSAL: identifica fallecidos estando en lista; NO permite establecer causalidad entre la espera y la muerte (84,2% de los GES incumplidos cerrados por fallecimiento en 2023 no se asociaban a la causa de muerte).</p>
          </article>'''
    txt = txt.replace(old_m34, new_m34)
    
    # 4. M4: separar ENCAVI vs ENS
    old_m42 = '''          <article class="chart-card chart-card-static">
            <p class="chart-eyebrow">M4 · Carga de enfermedad</p>
            <h3 class="chart-title">¿Qué tan extendidas están las crónicas y los factores de riesgo?</h3>
            <div class="chart-body"><svg id="chart-m4-2" viewBox="0 0 640 420" role="img" aria-label="Barras horizontales: prevalencias de enfermedades crónicas y factores de riesgo"></svg></div>
            <p class="chart-foot">Fuentes: MINSAL/DESUC — ENCAVI 2023-2024 (presentación 11-08-2025) y MINSAL — ENS 2016-2017 (obesidad e hipertensión, medidas). Nota: definiciones no intercambiables (tabaco y alcohol = consumo último mes; obesidad e HTA = medición, última ENS disponible).</p>
          </article>'''
    new_m42 = '''          <article class="chart-card chart-card-static">
            <p class="chart-eyebrow">M4 · Carga de enfermedad</p>
            <h3 class="chart-title">¿Qué tan extendidas están las crónicas y los factores de riesgo?</h3>
            <div class="chart-body"><svg id="chart-m4-2" viewBox="0 0 640 420" role="img" aria-label="Barras horizontales: prevalencias de enfermedades crónicas y factores de riesgo"></svg></div>
            <div class="source-legend">
              <span class="source-badge source-encavi">ENCAVI 2023-24 · autoreporte</span>
              <span class="source-badge source-ens">ENS 2016-17 · medición directa</span>
            </div>
            <p class="chart-foot">Fuentes: MINSAL/DESUC — ENCAVI 2023-2024 (presentación 11-08-2025) y MINSAL — ENS 2016-2017 (obesidad e hipertensión, medidas). Nota: definiciones no intercambiables (tabaco y alcohol = consumo último mes; obesidad e HTA = medición, última ENS disponible).</p>
          </article>'''
    txt = txt.replace(old_m42, new_m42)
    
    # 5. Agregar badges de estimación modelada en gráficos filtrables
    for fid in ['chart-m2-2', 'chart-m3-1', 'chart-m3-3', 'chart-m4-3', 'chart-m5-1', 'chart-m5-2', 'chart-m5-3', 'chart-m5-4', 'chart-a-4']:
        # Insertar badge antes de cada chart-foot en artículos filterable
        pass  # lo haremos con CSS en su lugar para no complicar el HTML
    
    # 6. Agregar sección "¿Qué NO incluye?" antes de metodología
    old_meta = '''      <!-- ==================== METODOLOGÍA ==================== -->
      <section id="metodologia" class="mss-module" aria-labelledby="metodologia-title">'''
    new_meta = '''      <!-- ==================== OMISIONES DECLARADAS ==================== -->
      <section id="omisiones" class="mss-module" aria-labelledby="omisiones-title">
        <header class="module-head">
          <p class="eyebrow">Transparencia</p>
          <h2 id="omisiones-title">¿Qué NO incluye este dashboard?</h2>
          <span class="source-tag">Datos deliberadamente excluidos por falta de verificación</span>
        </header>
        <div class="mss-card omisiones">
          <p>El monitor no rellena vacíos con supuestos. Estos son los temas que <strong>deliberadamente excluimos</strong> porque no encontramos fuente primaria verificable:</p>
          <ul class="omisiones-list">
            <li><strong>Desglose FONASA/fiscal vs. isapre dentro del financiamiento obligatorio</strong> — la API de la OMS solo expone agregados.</li>
            <li><strong>Densidad de médicos y especialistas por región</strong> — no existe serie oficial vigente posterior a 2010.</li>
            <li><strong>Brecha de tratamiento en salud mental</strong> — no hay cifra oficial de prevalencia vs. personas en tratamiento.</li>
            <li><strong>Volumen de compras a privados y telemedicina post-pandemia</strong> — no encontrado en fuentes públicas.</li>
            <li><strong>Razón de dependencia numérica oficial</strong> — no verificada en esta sesión.</li>
            <li><strong>% de inmigrantes sin previsión de salud (CASEN 2024)</strong> — el módulo no está publicado con esa desagregación.</li>
            <li><strong>Serie anual completa de IPC-salud vs. IPC general</strong> — solo puntos sueltos verificados.</li>
            <li><strong>Deuda de hogares por causas médicas (EFH 2024)</strong> — la categoría "salud" del endeudamiento no fue localizada.</li>
          </ul>
          <p class="omisiones-foot">Si tienes una fuente primaria para alguno de estos vacíos, <a href="mailto:mortizcoilla@gmail.com">escríbenos</a> y lo incorporamos.</p>
        </div>
      </section>

      <!-- ==================== GLOSARIO ==================== -->
      <section id="glosario" class="mss-module" aria-labelledby="glosario-title">
        <header class="module-head">
          <p class="eyebrow">Referencia</p>
          <h2 id="glosario-title">Glosario</h2>
          <span class="source-tag">Términos técnicos en lenguaje simple</span>
        </header>
        <div class="mss-card glosario">
          <dl class="glosario-list">
            <dt>CNE <span>Consulta Nueva de Especialidad</span></dt>
            <dd>Primera vez que un paciente ve a un especialista médico (no odontológico) tras ser derivado desde atención primaria. No incluye urgencias ni controles de pacientes ya conocidos.</dd>
            <dt>IQ <span>Intervención Quirúrgica</span></dt>
            <dd>Cirugías programadas (electivas) en la red pública. No incluye emergencias.</dd>
            <dt>GES / AUGE <span>Garantías Explícitas en Salud</span></dt>
            <dd>Conjunto de problemas de salud que el Estado garantiza atender en plazos máximos. Desde diciembre de 2025 cubre 90 condiciones.</dd>
            <dt>OOP <span>Gasto de Bolsillo</span></dt>
            <dd>Dinero que las personas pagan directamente de su propio bolsillo por servicios de salud, sin reembolso. Incluye medicamentos, consultas y exámenes pagados directamente.</dd>
            <dt>CHE <span>Gasto Corriente en Salud</span></dt>
            <dd>Todo el dinero que Chile gasta en salud en un año, como porcentaje del PIB. Incluye público y privado, pero excluye inversión en hospitales nuevos.</dd>
            <dt>PPA <span>Paridad de Poder Adquisitivo</span></dt>
            <dd>Moneda ficticia que permite comparar el gasto en salud entre países como si todo costara lo mismo. Un dólar PPA compra la misma cantidad de servicios de salud en cualquier país.</dd>
            <dt>Previsión de salud</dt>
            <dd>Sistema de salud al que está afiliada una persona: FONASA (público), Isapre (privado), FF.AA. o ninguno.</dd>
            <dt>Tramo FONASA <span>A / B / C / D</span></dt>
            <dd>Clasificación de beneficiarios FONASA según ingreso. Los tramos A y B tienen copago cero en la red pública. El 58,8% está en A+B.</dd>
            <dt>Mortalidad prevenible</dt>
            <dd>Muertes que se podrían evitar con prevención (vacunas, hábitos saludables, detección temprana).</dd>
            <dt>Mortalidad tratable</dt>
            <dd>Muertes que se podrían evitar si el sistema de salud tratara adecuadamente una enfermedad ya diagnosticada.</dd>
            <dt>Mediana de espera</dt>
            <dd>Tiempo en días que espera la persona del medio: mitad espera menos, mitad espera más. Es más representativa que el promedio porque no se distorsiona con casos extremos.</dd>
            <dt>ENCAVI <span>Encuesta Nacional de Calidad de Vida y Salud</span></dt>
            <dd>Encuesta por teléfono donde la gente reporta cómo se siente y qué enfermedades cree tener. No mide, pregunta.</dd>
            <dt>ENS <span>Encuesta Nacional de Salud</span></dt>
            <dd>Encuesta donde técnicos van a la casa, pesan, miden y toman presión. Es medición directa, no autoreporte. La última publicada es de 2016-2017.</dd>
          </dl>
        </div>
      </section>

      <!-- ==================== METODOLOGÍA ==================== -->
      <section id="metodologia" class="mss-module" aria-labelledby="metodologia-title">'''
    txt = txt.replace(old_meta, new_meta)
    
    # 7. Agregar modal al final del body (antes de </body>)
    old_body_end = '''  </div>
</body>
</html>'''
    new_body_end = '''  </div>

  <!-- Modal: ¿Cómo se calcula el Termómetro? -->
  <dialog id="ips-modal" class="ips-modal" aria-labelledby="ips-modal-title">
    <div class="ips-modal-content">
      <button type="button" class="ips-modal-close" id="ips-modal-close" aria-label="Cerrar">×</button>
      <h2 id="ips-modal-title">¿Cómo se calcula el Termómetro de la Salud?</h2>
      <p>El Termómetro no es una "nota" ni un ranking internacional. Es una <strong>síntesis narrativa</strong>: resume 5 problemas del sistema en un solo número para que cualquier persona pueda entender la presión general.</p>
      
      <h3>Los 5 componentes</h3>
      <ol>
        <li><strong>Mediana de espera CNE</strong> (25%): días que espera la persona del medio por una consulta nueva de especialidad. Menos es mejor.</li>
        <li><strong>Garantías GES retrasadas</strong> (20%): personas que esperan más del plazo legal por una garantía de salud. Menos es mejor.</li>
        <li><strong>Gasto de bolsillo</strong> (20%): % del gasto total en salud que pagan directamente las familias. Menos es mejor.</li>
        <li><strong>Brecha de capacidad vs OCDE</strong> (20%): cuánto le falta a Chile en enfermeras y camas para llegar al promedio OCDE. Menos es mejor.</li>
        <li><strong>Multimorbilidad</strong> (15%): % de la población con 2 o más enfermedades crónicas. Menos es mejor.</li>
      </ol>
      
      <h3>¿Por qué 0–100?</h3>
      <p>Cada componente se normaliza a una escala 0–100 (el peor valor histórico = 100, el mejor = 0). Luego se ponderan y suman. <strong>Mayor número = más presión sobre el sistema.</strong></p>
      
      <h3>¿Es objetivo?</h3>
      <p><strong>No del todo.</strong> La elección de los 5 componentes, sus pesos y sus límites son decisiones del autor. Otro investigador podría elegir otros indicadores u otros pesos y obtener un número distinto. Por eso mostramos el <a href="#ips-sensibilidad">análisis de sensibilidad</a> en la portada: para que veas que el resultado cambia si cambias los pesos.</p>
      
      <h3>Limitaciones clave</h3>
      <ul>
        <li>Los componentes de capacidad y multimorbilidad se mantienen fijos en la serie histórica (no hay datos anuales).</li>
        <li>El gasto de bolsillo 2024–2025 repite el último dato disponible (2023).</li>
        <li>La serie parte en 2021 porque no existe mediana CNE 2019 publicada.</li>
      </ul>
      
      <p class="ips-modal-foot">Para el detalle matemático completo, ver <code>js/core.js</code> y <code>README.md</code>.</p>
    </div>
  </dialog>

</body>
</html>'''
    txt = txt.replace(old_body_end, new_body_end)
    
    # 8. Agregar links al sidebar para omisiones y glosario
    old_nav = '''        <a href="#analitica">Capa analítica</a>
        <a href="#metodologia">Metodología</a>'''
    new_nav = '''        <a href="#analitica">Capa analítica</a>
        <a href="#omisiones">Omisiones declaradas</a>
        <a href="#glosario">Glosario</a>
        <a href="#metodologia">Metodología</a>'''
    txt = txt.replace(old_nav, new_nav)
    
    p.write_text(txt, encoding='utf-8')
    print('index.html actualizado.')


if __name__ == '__main__':
    patch_core_js()
    patch_index_html()
    print('Listo.')
