/**
 * @file data.js — Monitor Socioeconómico de la Salud en Chile (MSS)
 * @description
 *   Datos EMBEBIDOS y VERIFICADOS del monitor. Toda cifra proviene de los
 *   archivos de verificación de fuentes:
 *     - fuentes/M1_M5_financiamiento.md
 *     - fuentes/M2_M3_aseguramiento_listas.md
 *     - fuentes/M4_M6_M7_carga_capital_demografia.md
 *   No se incluye ninguna cifra no verificada. Cuando un valor es DERIVADO por
 *   aritmética simple sobre cifras verificadas, se marca `derivada: true` y se
 *   declara en la nota metodológica del chart correspondiente.
 *
 *   Esquema: MSS.DATA = { SOURCES, M1..M7, IPS_INPUTS }
 *   API expuesta: window.MSS.DATA (solo lectura conceptual)
 */
(function () {
  'use strict';
  window.MSS = window.MSS || {};

  /** Catálogo corto de fuentes primarias (emisor — documento, fecha). */
  var SOURCES = {
    OCDE_HAG2025: 'OCDE — Panorama de la salud 2025 (Health at a Glance), nota país Chile, 13-11-2025',
    GHED_WB: 'Banco Mundial — World Development Indicators / OMS GHED (API), serie actualizada 13-jul-2026',
    BCN_DIPRES: 'BCN — API Presupuesto de la Nación (fuente DIPRES), partida 16 MINSAL',
    CASEN2024: 'MDSF Observatorio Social — Salud_Casen_2024.xlsx, enero 2026',
    GLOSA6_2024: 'MINSAL — Informe Glosa 06, IV trimestre 2024 (Oficio CP N°2169/2025), 31-01-2025',
    GLOSA6_2025: 'MINSAL — Informe Glosa 06, IV trimestre 2025, 10-02-2026',
    BCN_ATP: 'BCN Asesoría Técnica Parlamentaria — Medición y reportes de la Lista de Espera No GES, abr-2025',
    INE_VITALES: 'INE — Anuario Estadísticas Vitales 2022 y boletín provisional 2023, 17-03-2025',
    ENCAVI: 'MINSAL/DESUC-UC — ENCAVI 2023-2024, presentación oficial 11-08-2025',
    ENS: 'MINSAL — Encuesta Nacional de Salud 2016-2017 (última ENS publicada)',
    OMS_GHO: 'OMS — Global Health Observatory, protección financiera (API ghoapi.azureedge.net)',
    INE_EPF: 'INE — IX Encuesta de Presupuestos Familiares, síntesis e informe de resultados, oct-2023',
    INE_EEPP: 'INE — Estimaciones y Proyecciones de Población base 2024, 28-01-2026',
    SIS_APB: 'Superintendencia de Salud — Res. Ex. SS/N°196 (2024), N°229 (2025) y N°294/329 (2026)',
    INE_IPC: 'INE — Boletines IPC dic-2025 (08-01-2026) y ene-2026',
    LYD: 'Libertad y Desarrollo — SIE-332 (feb-2025) y TP-1716 (nov-2025), sobre datos OCDE',
    CLINICAS: 'Clínicas de Chile A.G. — Dimensionamiento del Sector Salud en Chile, cifras a 2024 (dic-2025), con datos FONASA/Superintendencia',
    FONASA: 'FONASA — página oficial Tramos y cifras institucionales 2024',
    INE_SERMIG: 'INE-SERMIG — Estimación de personas extranjeras residentes 2023, 30-12-2024',
    PRENSA_SIS: 'Prensa citando a la Superintendencia de Salud (La Tercera 20-02-2025; Emol 04-02-2026)',
    OECD_FARMA: 'OCDE — Policy actions: affordable and accessible pharmaceuticals (Chile), datos OECD Health Statistics 2019 / EPF-INE'
  };

  window.MSS.DATA = {
    SOURCES: SOURCES,

    /* ------------------------------------------------------------------ *
     * M1 — FINANCIAMIENTO Y GASTO
     * ------------------------------------------------------------------ */
    M1: {
      // Gasto corriente en salud (CHE) como % del PIB, Chile 2010-2023. Fuente: GHED_WB.
      gdpSeries: [
        { anio: 2010, v: 6.82 }, { anio: 2011, v: 6.80 }, { anio: 2012, v: 7.02 },
        { anio: 2013, v: 7.48 }, { anio: 2014, v: 7.84 }, { anio: 2015, v: 8.35 },
        { anio: 2016, v: 8.56 }, { anio: 2017, v: 9.09 }, { anio: 2018, v: 9.15 },
        { anio: 2019, v: 9.31 }, { anio: 2020, v: 9.70 }, { anio: 2021, v: 9.72 },
        { anio: 2022, v: 10.01 }, { anio: 2023, v: 10.17 }
      ],
      // Comparación con pares, 2023. Fuente: GHED_WB.
      paises2023: [
        { pais: 'Chile', che: 10.17, oop: 34.59 },
        { pais: 'Argentina', che: 10.27, oop: 24.47 },
        { pais: 'Brasil', che: 9.73, oop: 26.23 },
        { pais: 'Colombia', che: 8.16, oop: 14.63 },
        { pais: 'Costa Rica', che: 6.87, oop: 24.13 },
        { pais: 'México', che: 5.50, oop: 41.24 }
      ],
      // Descomposición del financiamiento (% del CHE). Fuente: GHED_WB.
      financiamiento: [
        { anio: 2010, publico: 47.10, privado: 52.89, oop: 34.47 },
        { anio: 2012, publico: 47.94, privado: 52.06, oop: 33.41 },
        { anio: 2014, publico: 47.74, privado: 52.26, oop: 34.27 },
        { anio: 2016, publico: 49.65, privado: 50.35, oop: 34.75 },
        { anio: 2018, publico: 51.24, privado: 48.76, oop: 32.70 },
        { anio: 2019, publico: 51.26, privado: 48.74, oop: 32.34 },
        { anio: 2020, publico: 56.51, privado: 43.49, oop: 29.04 },
        { anio: 2021, publico: 53.66, privado: 46.34, oop: 32.63 },
        { anio: 2022, publico: 50.88, privado: 49.12, oop: 35.60 },
        { anio: 2023, publico: 51.61, privado: 48.39, oop: 34.59 }
      ],
      // Presupuesto partida 16 MINSAL (miles de millones CLP). Fuente: BCN_DIPRES.
      presupuesto: [
        { anio: 2019, ley: 9.06, vigente: 10.47, ejecutado: 10.52 },
        { anio: 2020, ley: 9.99, vigente: 12.41, ejecutado: 12.30 },
        { anio: 2021, ley: 9.95, vigente: 14.25, ejecutado: 14.05 },
        { anio: 2022, ley: 11.85, vigente: 14.63, ejecutado: 14.67 },
        { anio: 2023, ley: 12.80, vigente: 15.54, ejecutado: 15.88 },
        { anio: 2024, ley: 14.68, vigente: 16.81, ejecutado: 17.21 },
        { anio: 2025, ley: 16.04, vigente: 18.75, ejecutado: 19.34 },
        { anio: 2026, ley: 17.25, vigente: null, ejecutado: null }
      ],
      kpis: {
        chePib: 10.5, chePibOcde: 9.3, ppa: 3749, ppaOcde: 5967,
        cobertura: 97, prepago: 59, prepagoOcde: 75,
        oop2023: 34.59, oopMin2020: 29.04, oopMax2022: 35.60
      }
    },

    /* ------------------------------------------------------------------ *
     * M2 — ASEGURAMIENTO Y SEGMENTACIÓN
     * ------------------------------------------------------------------ */
    M2: {
      // Previsión de salud declarada, nacional (%). Fuente: CASEN2024, Tabla 1.
      prevision: [
        { anio: 2017, fonasa: 77.1, isapre: 15.1, ffaa: 2.1, ninguno: 3.0, otro: 0.6, nosabe: 2.0 },
        { anio: 2020, fonasa: 75.6, isapre: 16.3, ffaa: 1.7, ninguno: 4.3, otro: 0.8, nosabe: 1.2 },
        { anio: 2022, fonasa: 78.9, isapre: 15.3, ffaa: 1.7, ninguno: 3.0, otro: 0.3, nosabe: 0.8 },
        { anio: 2024, fonasa: 82.6, isapre: 13.2, ffaa: 1.8, ninguno: 2.0, otro: 0.2, nosabe: 0.3 }
      ],
      // Previsión por decil de ingreso autónomo, 2024 (%). Fuente: CASEN2024, Tabla 7.
      decil: [
        { decil: 'I', fonasa: 95.4, isapre: 1.7, ninguno: 2.1 },
        { decil: 'II', fonasa: 95.3, isapre: 1.1, ninguno: 2.5 },
        { decil: 'III', fonasa: 94.1, isapre: 2.1, ninguno: 2.4 },
        { decil: 'IV', fonasa: 93.0, isapre: 2.8, ninguno: 2.5 },
        { decil: 'V', fonasa: 91.2, isapre: 4.4, ninguno: 2.1 },
        { decil: 'VI', fonasa: 87.5, isapre: 7.6, ninguno: 2.1 },
        { decil: 'VII', fonasa: 82.8, isapre: 12.2, ninguno: 1.9 },
        { decil: 'VIII', fonasa: 74.3, isapre: 20.1, ninguno: 1.6 },
        { decil: 'IX', fonasa: 57.4, isapre: 38.1, ninguno: 1.0 },
        { decil: 'X', fonasa: 27.1, isapre: 69.4, ninguno: 0.8 }
      ],
      // Beneficiarios isapre (cotizantes + cargas). Fuentes: CLINICAS y PRENSA_SIS.
      // 2019 DERIVADO: dic-2024 (~2,6 M) + 786 mil perdidos dic-2019→dic-2024.
      isapreBenef: [
        { anio: 2013, n: 3206312, derivada: false },
        { anio: 2019, n: 3386000, derivada: true },
        { anio: 2023, n: 2788257, derivada: false },
        { anio: 2024, n: 2600000, derivada: false },
        { anio: 2025, n: 2530000, derivada: false }
      ],
      // Población FONASA por tramo, dic-2025. Fuente: GLOSA6_2025, Tabla 10.
      tramos: [
        { tramo: 'A', n: 3058341, pct: 17.9 },
        { tramo: 'B', n: 6996569, pct: 40.9 },
        { tramo: 'C', n: 2535630, pct: 14.8 },
        { tramo: 'D', n: 4505064, pct: 26.4 }
      ],
      tramosTotal: 17095604,
      // Cobertura efectiva. Fuente: CASEN2024, Tablas 22, 34 y 43.
      acceso: {
        atencion2024: 92.1, atencion2022: 90.0,
        problemas2024: 34.2, problemas2022: 37.8,
        problemasFonasa: 37.4, problemasIsapre: 16.4,
        personasConProblemas: 1199872
      },
      // Crisis isapre. Fuentes: BCN_ATP (deuda), PRENSA_SIS (migración).
      isapreCrisis: { contratosDeuda: 696768, deudaUF: 30246766, perdidos2019a2024: 786000, variacionPct: -23.5 }
    },

    /* ------------------------------------------------------------------ *
     * M3 — LISTAS DE ESPERA
     * ------------------------------------------------------------------ */
    M3: {
      // Medianas de espera (días). Fuentes: GLOSA6_2024, GLOSA6_2025, BCN_ATP.
      medianasCNE: [
        { p: '2021', v: 547 }, { p: 'dic-2023', v: 240 }, { p: 'jun-2024', v: 255 },
        { p: 'dic-2024', v: 263 }, { p: 'dic-2025', v: 226 }
      ],
      medianasIQ: [
        { p: '2021', v: 661 }, { p: 'jun-2024', v: 305 },
        { p: 'dic-2024', v: 294 }, { p: 'dic-2025', v: 251 }
      ],
      // Volumen en lista (registros). Fuentes: GLOSA6_2024 y GLOSA6_2025.
      volumen: [
        { tipo: 'Consultas nuevas (CNE)', r2024: 2601084, r2025: 2464738 },
        { tipo: 'Intervenciones quirúrgicas (IQ)', r2024: 390229, r2025: 425095 }
      ],
      volumenNota: {
        personas2024: 2508227, registros2024: 2991313, registros2025: 2889833,
        personasCNE2025: 2047191, personasIQ2025: 371907
      },
      // Garantías GES retrasadas (corte dic.). Fuente: GLOSA6_2025, Tabla 1.
      ges: [
        { anio: 2021, n: 54333, cumpl: 97.76 },
        { anio: 2022, n: 61191, cumpl: 97.95 },
        { anio: 2023, n: 70440, cumpl: 97.95 },
        { anio: 2024, n: 77107, cumpl: 97.90 },
        { anio: 2025, n: 78594, cumpl: 98.01 }
      ],
      gesNota: { tramoBPct: 64.9, terciarioPct: 80.9 },
      // Fallecidos estando en lista (no causal). Fuentes: GLOSA6_2024 y GLOSA6_2025.
      fallecidos: [
        { anio: 2023, n: 35492, estado: 'definitivo', pct: 1.6 },
        { anio: 2024, n: 33928, estado: 'preliminar' },
        { anio: 2025, n: 35326, estado: 'preliminar' }
      ],
      // Territorio (dic-2025). Fuente: GLOSA6_2025, Tabla 12.
      territorio: {
        ssBajo200CNE: 14, ssBajo200IQ: 7, totalSS: 29,
        minDias: 92, minSS: 'Aconcagua', maxDias: 378, maxSS: 'Metropolitano Norte',
        iqBajo200: [
          { ss: 'Araucanía Norte', v: 128 }, { ss: 'Aysén', v: 147 },
          { ss: 'Talcahuano', v: 153 }, { ss: 'Antofagasta', v: 182 },
          { ss: 'Arauco', v: 185 }, { ss: 'Los Ríos', v: 189 },
          { ss: 'Magallanes', v: 189 }
        ]
      },
      // Especialidades CNE médica, dic-2025. Fuente: GLOSA6_2025, Tabla 15.
      especialidades: [
        { esp: 'Oftalmología', n: 349214, pct: 17.9 },
        { esp: 'Otorrinolaringología', n: 260811, pct: 13.4 },
        { esp: 'Ginecología', n: 152733, pct: 7.8 },
        { esp: 'Traumatología y Ortopedia', n: 127766, pct: null },
        { esp: 'Cirugía General', n: 102452, pct: null },
        { esp: 'Urología', n: 100560, pct: null }
      ],
      // Composición CNE dic-2025 (sexo/edad). Fuente: GLOSA6_2025, Tablas 13-14.
      composicion: { mujeres: 61.2, e0a14: 16.6, e15a64: 53.0, e65mas: 30.4 },
      // Problemas GES con más personas retrasadas 2025. Fuente: GLOSA6_2025, Tabla 4.
      gesTop: [
        { g: 'Diabetes mellitus tipo 2', n: 11743 }, { g: 'Cirugía de cataratas', n: 9387 },
        { g: 'Hipoacusia bilateral 65+', n: 6066 }, { g: 'Vicios de refracción 65+', n: 6041 },
        { g: 'Retinopatía diabética', n: 5909 }
      ]
    },

    /* ------------------------------------------------------------------ *
     * M4 — CARGA DE ENFERMEDAD Y SALUD MENTAL
     * ------------------------------------------------------------------ */
    M4: {
      // Principales causas de muerte 2022 (CIE-10). Fuente: INE_VITALES.
      causas2022: [
        { causa: 'Enfermedades del sistema circulatorio', n: 33503, pct: 24.5 },
        { causa: 'Tumores (neoplasias)', n: 29931, pct: 21.9 },
        { causa: 'COVID-19', n: 13433, pct: 9.8 }
      ],
      defunciones: { total2022: 136972, total2023prov: 121975 },
      // Prevalencias (% población). Fuentes: ENCAVI y ENS (definiciones distintas, ver nota).
      cronicas: [
        { ind: '≥1 enfermedad crónica', v: 63.9, f: 'ENCAVI 2023-24' },
        { ind: 'Multimorbilidad (≥2 crónicas)', v: 40.1, f: 'ENCAVI 2023-24' },
        { ind: 'Inactividad física', v: 51.2, f: 'ENCAVI 2023-24' },
        { ind: 'Alcohol último mes', v: 40.0, f: 'ENCAVI 2023-24 (DESUC)' },
        { ind: 'Obesidad (IMC ≥30, medida)', v: 31.2, f: 'ENS 2016-17' },
        { ind: 'Tabaco último mes', v: 27.9, f: 'ENCAVI 2023-24' },
        { ind: 'Hipertensión arterial', v: 27.6, f: 'ENS 2016-17' },
        { ind: 'Depresión/ansiedad u otro trastorno', v: 19.0, f: 'ENCAVI 2023-24' }
      ],
      // Calidad de vida buena/muy buena (%). Fuente: ENCAVI. Q2-Q4 no publicados en la presentación.
      calidadVida: [
        { g: 'Quintil 1', v: 63.3 }, { g: 'Nacional', v: 68.5 }, { g: 'Quintil 5', v: 89.2 }
      ],
      // Mortalidad prevenible/tratable por 100.000. Fuente: OCDE_HAG2025.
      prevenible: [
        { ind: 'Mortalidad prevenible', chile: 151, ocde: 145 },
        { ind: 'Mortalidad tratable', chile: 78, ocde: 77 }
      ],
      suicidioBruta: 11, // por 100.000, = promedio OCDE. Fuente: OCDE_HAG2025.
      tmi: { y2022: 5.9, y2023prov: 6.6 }
    },

    /* ------------------------------------------------------------------ *
     * M5 — GASTO DE BOLSILLO Y PROTECCIÓN FINANCIERA
     * ------------------------------------------------------------------ */
    M5: {
      // Gasto catastrófico ODS 3.8.2 clásico (% población). Fuente: OMS_GHO.
      catastrofico: [
        { anio: 2006, u10: 9.19, u25: 1.91 },
        { anio: 2011, u10: 11.35, u25: 2.11 },
        { anio: 2016, u10: 14.60, u25: 2.08 }
      ],
      // Nueva definición "financial hardship" (ODS 3.8.2 rev. 2025). Fuente: OMS_GHO.
      hardship: {
        total2021: 17.38,
        serie: [
          { anio: 1996, v: 18.7 }, { anio: 2006, v: 12.6 }, { anio: 2011, v: 14.8 },
          { anio: 2016, v: 15.9 }, { anio: 2021, v: 17.4 }
        ],
        quintil: [
          { q: 'Q1', v: 59.8 }, { q: 'Q2', v: 15.1 }, { q: 'Q3', v: 5.3 },
          { q: 'Q4', v: 3.4 }, { q: 'Q5', v: 3.4 }
        ]
      },
      // IX EPF: gasto del hogar en salud. Fuente: INE_EPF.
      epf: {
        gastoTotalMes: 1451782, saludMes: 115283, pctSalud: 7.9,
        quintil: [
          { q: 'I', v: 6.3 }, { q: 'II', v: 7.6 }, { q: 'III', v: 8.1 },
          { q: 'IV', v: 8.8 }, { q: 'V', v: 8.0 }
        ],
        macrozona: [
          { z: 'Norte', monto: 89217, pct: 6.7 },
          { z: 'Gran Santiago', monto: 129555, pct: 8.1 },
          { z: 'Centro', monto: 98034, pct: 7.8 },
          { z: 'Sur', monto: 104693, pct: 8.4 }
        ]
      },
      // Composición del OOP: medicamentos. Fuentes: OECD_FARMA (36%) / OCEC-UDP VIII EPF (38%).
      oopMedicamentos: { medicamentos: 38, resto: 62 },
      // Régimen GES vigente. Fuente: Decreto GES N°29 (28-11-2025).
      gesProblemas: 90
    },

    /* ------------------------------------------------------------------ *
     * M6 — CAPITAL HUMANO Y CAPACIDAD
     * ------------------------------------------------------------------ */
    M6: {
      // Dotación por 1.000 hab. Fuente: OCDE_HAG2025. Médicos Chile = licenciados (sobrestima vs OCDE practising).
      dotacion: [
        { ind: 'Médicos', chile: 3.3, ocde: 3.9, nota: 'Chile: con licencia; OCDE: en ejercicio' },
        { ind: 'Enfermeras', chile: 4.4, ocde: 9.2, nota: 'En ejercicio, comparable' },
        { ind: 'Camas hospitalarias', chile: 1.9, ocde: 4.2, nota: 'Total camas; promedio OCDE 2023' }
      ],
      // Remuneración relativa al salario medio (veces). Fuente: LYD (datos OCDE).
      remuneracion: [
        { ind: 'Médico general', v: 2.6 },
        { ind: 'Médico especialista', v: 4.4 }
      ],
      // Actividad hospitalaria, índice 2019=100. DERIVADO de variaciones MINSAL (Seis Prioridades, feb-2026):
      // producción ene-oct 2025 = +19% vs 2021, +11% vs 2022, +3% vs 2023, +2% vs 2024 y −6% vs oct-2019.
      egresosIdx: [
        { anio: 2019, v: 100.0 }, { anio: 2021, v: 79.0 }, { anio: 2022, v: 84.7 },
        { anio: 2023, v: 91.3 }, { anio: 2024, v: 92.2 }, { anio: 2025, v: 94.0 }
      ],
      especialistas: { chile: 1.73 }, // por 1.000 hab., 5° más bajo OCDE. Fuente: CLINICAS (citando OCDE).
      // Personas atendidas por sector con ~la mitad de los médicos cada uno.
      // Fuente: INDH — Informe Anual 2016 (con datos MINSAL). Dato antiguo, sin actualización oficial reciente.
      medicosSectores: [
        { sector: 'Privado', personas: 2.0 },
        { sector: 'Público', personas: 15.0 }
      ]
    },

    /* ------------------------------------------------------------------ *
     * M7 — DEMOGRAFÍA Y CONTEXTO
     * ------------------------------------------------------------------ */
    M7: {
      // Envejecimiento. Fuentes: INE_EEPP y CEPS-UDD (serie base Censo 2017 para %65+).
      envejecimiento: {
        hitos65: [
          { anio: 2026, v: 13.5 }, { anio: 2035, v: 18.9 },
          { anio: 2050, v: 24.8 }, { anio: 2070, v: 42.6 }
        ],
        hitos15: [ { anio: 2026, v: 16.3 }, { anio: 2070, v: 7.2 } ],
        cruce: 2028, // desde 2028 habrá más 65+ que <15
        pct80en65: 16.4
      },
      // Esperanza de vida al nacer. Fuentes: OCDE_HAG2025, INE_VITALES, INE_EEPP.
      esperanza: [
        { g: 'Chile (OCDE, 2023)', v: 81.6 },
        { g: 'Promedio OCDE', v: 81.1 },
        { g: 'Chile (INE, 2023 provisional)', v: 81.39 },
        { g: 'Chile (INE, proyección 2026)', v: 81.8 }
      ],
      // Alzas precio base isapre (APB) vs IPC. Fuentes: SIS_APB e INE_IPC.
      apb: [
        { anio: 2024, v: 7.4 }, { anio: 2025, v: 3.7 }, { anio: 2026, v: 3.5 }
      ],
      ipcRef: { ipc2025: 3.5, ipc12mEne2026: 2.8 },
      // Población total proyectada. Fuente: INE_EEPP.
      poblacion: [
        { anio: 2026, n: 20150948 }, { anio: 2035, n: 20643490 }, { anio: 2070, n: 16970000 }
      ],
      inmigrantes2023: 1918583 // INE_SERMIG
    },

    /* ------------------------------------------------------------------ *
     * IPS — insumos del Índice de Presión Sanitaria (ver metodología en core.js)
     * Solo valores verificados arriba; OOP 2024-2025 repite el último dato
     * disponible (2023) y los componentes estructurales se mantienen fijos.
     * ------------------------------------------------------------------ */
    IPS_INPUTS: {
      periodos: ['2021', 'dic-2023', 'dic-2024', 'dic-2025'],
      // Componentes dinámicos por periodo
      dinamicos: {
        '2021':    { cne: 547, ges: 54333, oop: 32.63 },
        'dic-2023': { cne: 240, ges: 70440, oop: 34.59 },
        'dic-2024': { cne: 263, ges: 77107, oop: 34.59 },
        'dic-2025': { cne: 226, ges: 78594, oop: 34.59 }
      },
      // Componentes estructurales (constantes en la serie)
      estructurales: {
        // Brecha % vs promedio OCDE: promedio simple de enfermeras (4,4 vs 9,2) y camas (1,9 vs 4,2)
        gapCapital: ((1 - 4.4 / 9.2) + (1 - 1.9 / 4.2)) / 2 * 100,
        multimorbilidad: 40.1
      }
    }
  };
})();
