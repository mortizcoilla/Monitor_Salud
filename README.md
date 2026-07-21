# Monitor Socioeconómico de la Salud en Chile (MSS)

![status](https://img.shields.io/badge/status-estable-2e7d52)
![stack](https://img.shields.io/badge/stack-JS%20ES6%2B%20%C2%B7%20D3%20v7%20%C2%B7%20CSS%20vanilla-0e3a5d)
![license](https://img.shields.io/badge/license-MIT-2f6f9f)
![author](https://img.shields.io/badge/autor-por%20completar-c98a1b)

Dashboard analítico **estático** que monitorea la presión socioeconómica sobre el sistema de salud chileno: financiamiento, aseguramiento, listas de espera, carga de enfermedad, gasto de bolsillo, capital humano y demografía. Toda cifra publicada en el tablero fue verificada contra fuentes primarias y cita su origen en el pie de cada gráfico.

## Autor

**[Nombre del autor — completar]**
LinkedIn: [completar] · Email: [completar] · WhatsApp: [completar]

## Tabla de contenidos

1. [Cómo servirlo localmente](#cómo-servirlo-localmente)
2. [Stack técnico](#stack-técnico)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Metodología del IPS](#metodología-del-ips)
5. [Módulos del monitor](#módulos-del-monitor)
6. [Filtros globales](#filtros-globales)
7. [Trazabilidad de fuentes](#trazabilidad-de-fuentes)
8. [Limitaciones declaradas](#limitaciones-declaradas)
9. [Licencia](#licencia)

## Cómo servirlo localmente

No requiere build ni `npm install`. Tres formas:

1. **Doble clic:** abrir `index.html` directamente en el navegador (funciona con `file://`; los datos están embebidos y D3/Inter se cargan por CDN, por lo que se requiere conexión a internet para el primer render).
2. **Python:** `python -m http.server 8000` en esta carpeta y abrir <http://localhost:8000>.
3. **Node (sin instalar nada):** `npx serve .` y abrir la URL indicada.

## Stack técnico

- **JavaScript ES6+** en módulos IIFE con `'use strict'`. Sin TypeScript, sin frameworks, cero build step.
- **D3.js v7** vía CDN (`https://cdn.jsdelivr.net/npm/d3@7/dist/d3.v7.min.js`) como única librería de gráficos.
- **CSS vanilla** con variables (`:root`), grid y flexbox. Sin preprocesador.
- **Tipografía Inter** desde Google Fonts.
- Datos **embebidos** en `js/data.js` (sin `fetch`, sin backend).
- Namespace raíz `window.MSS`: `MSS.data` (constantes, en data.js como `MSS.DATA`), `MSS.core`, `MSS.modules`, `MSS.analytics`, `MSS.filters`, `MSS.main`. El orquestador envuelve cada módulo en `try/catch`: un fallo deja una nota visible en la sección afectada sin tumbar el resto.

## Estructura del proyecto

```
dashboard/
├── index.html          # Estructura: sidebar, portada IPS, M1-M7, analítica, metodología
├── css/styles.css      # Variables, layout responsive (desktop/tablet/mobile), badges, drawer
├── js/
│   ├── data.js         # MSS.DATA: todas las cifras verificadas + catálogo de fuentes
│   ├── core.js         # MSS.core: paleta, niveles, motor IPS, helpers D3, portada
│   ├── modules.js      # MSS.modules: charts de los 7 módulos temáticos
│   ├── analytics.js    # MSS.analytics: territorio, panel longitudinal, subgrupos
│   ├── filters.js      # MSS.filters: FILTROS_ADJUST, estado, chips, deep linking
│   └── main.js         # MSS.main: orquestador con try/catch por módulo + drawer móvil
├── README.md
├── LICENSE             # MIT
└── .gitignore
```

## Metodología del IPS

El **Índice de Presión Sanitaria (IPS)** es un índice compuesto 0-100 calculado en `js/core.js` (`MSS.core.calcularIPS`).

**Fórmula:** `IPS = Σ wᵢ · normᵢ(xᵢ)`, con `norm(x) = 100·(x − min)/(max − min)` acotada a [0,100] (min-max).

| Componente | Peso | Límites [min, max] | Dato verificado (dic-2025) |
|---|---|---|---|
| Mediana de espera CNE (días) | 0,25 | [200, 550] | 226 (mínimo histórico) |
| Garantías GES retrasadas (casos) | 0,20 | [50.000, 80.000] | 78.594 |
| Gasto de bolsillo (% del CHE) | 0,20 | [15, 40] | 34,59 (dato 2023, último disponible) |
| Brecha de capacidad vs OCDE (% brecha enfermeras+camas) | 0,20 | [0, 100] | 53,5 |
| Multimorbilidad ≥2 crónicas (%) | 0,15 | [20, 50] | 40,1 |

**Anclas de los límites:** mediana CNE: min = meta oficial MINSAL (<200 días hacia 2026), max ≈ peak pandémico 2021 (547). OOP: min ≈ nivel típico OCDE, max ≈ México 2023 (41,2), el mayor regional. Los límites y pesos son **decisiones de diseño del monitor** (no datos oficiales); los insumos sí son datos verificados.

**Niveles:** Bajo <20 · Moderado 20-39 · Elevado 40-59 · Alto 60-79 · Crítico ≥80.

**Serie histórica:** 2021, dic-2023, dic-2024 y dic-2025. Parte en **2021** porque no existe mediana CNE 2019 publicada (se descartó el punto inicial 2019 del brief por falta de dato). Los componentes estructurales (capacidad, multimorbilidad) se mantienen constantes y el OOP 2024-2025 repite el dato 2023 — todo declarado en el pie de la portada.

**Recálculo:** editar `MSS.DATA.IPS_INPUTS` en `js/data.js` con un nuevo corte; la portada y la serie se actualizan solas al recargar.

## Módulos del monitor

| # | Módulo | Contenido |
|---|---|---|
| Portada | Índice de Presión Sanitaria | Scorecard (número 72px, nivel, barra de 5 zonas con marcador), 3 comparaciones, composición y serie del índice |
| M1 | Financiamiento y gasto | CHE % PIB 2010-2023, descomposición público/privado, comparativa de países 2023, presupuesto MINSAL 2019-2026 |
| M2 | Aseguramiento y segmentación | Previsión CASEN 2017-2024, deciles de ingreso, beneficiarios isapre, tramos FONASA |
| M3 | Listas de espera | Medianas CNE/IQ 2021-2025, volumen de registros, GES retrasadas, fallecidos en lista (con advertencia de no-causalidad) |
| M4 | Carga de enfermedad y salud mental | Causas de muerte 2022, prevalencias crónicas, gradiente de calidad de vida, mortalidad prevenible/tratable |
| M5 | Gasto de bolsillo y protección financiera | Gasto catastrófico 2006-2016, dificultad financiera por quintil, gasto del hogar por quintil y macrozona |
| M6 | Capital humano y capacidad | Médicos/enfermeras/camas vs OCDE, remuneración relativa, actividad hospitalaria (índice derivado) |
| M7 | Demografía y contexto | Envejecimiento a 2070, esperanza de vida vs OCDE, alzas de precio base isapre vs IPC, hitos poblacionales |
| Analítica | Tres lecturas cruzadas | (a) Territorio por Servicios de Salud (sustituto declarado del clustering), (b) panel longitudinal base 100, (c) acceso efectivo y gradiente socioeconómico |

## Filtros globales

Cuatro filtros en el sidebar (quintil de ingreso, región/macrozona, tramo FONASA, grupo etario), valor por defecto «Todos». Mecánica:

- Solo reaccionan los charts con badge **«Ajusta con filtros»** (`.chart-card-filterable`).
- Charts agregados nacionales: se aplica un **factor multiplicativo** (`MSS.FILTROS_ADJUST`) calibrado con distribuciones oficiales — documentado con JSDoc en `js/filters.js`.
- Charts desagregados por la misma dimensión: el filtro **resalta** la categoría seleccionada.
- **Chips** de filtros activos (con × individual), botón **Limpiar** deshabilitado cuando todo está en default, y **deep linking** (`?filtro=quintil:Q1&filtro=region:Norte`).

## Trazabilidad de fuentes

Toda cifra del tablero proviene de los archivos de verificación `fuentes/M1_M5_financiamiento.md`, `fuentes/M2_M3_aseguramiento_listas.md` y `fuentes/M4_M6_M7_carga_capital_demografia.md`. Fuentes primarias usadas:

- **OCDE** — *Panorama de la salud 2025 (Health at a Glance)*, nota país Chile, 13-11-2025 (gasto %PIB y PPA, dotación, mortalidad prevenible/tratable, esperanza de vida, suicidio, obesidad autoreportada).
- **Banco Mundial — WDI / OMS GHED** (API, serie actualizada 13-jul-2026): CHE % PIB 2010-2023, descomposición público/privado/OOP, comparativa de países.
- **BCN** — API Presupuesto de la Nación (fuente DIPRES), partida 16 MINSAL 2019-2026.
- **MDSF Observatorio Social** — `Salud_Casen_2024.xlsx` (enero 2026): previsión nacional y por decil, tasa de atención y problemas de acceso.
- **MINSAL** — Informes **Glosa 06** IV trimestre 2024 (31-01-2025) e IV trimestre 2025 (10-02-2026): listas de espera No GES, medianas, GES retrasadas, fallecidos en lista, tramos FONASA, territorio, especialidades.
- **BCN Asesoría Técnica Parlamentaria** — *Medición y reportes de la Lista de Espera No GES* (abr-2025) y *Tiempos de espera* (ago-2024): medianas dic-2023/jun-2024, meta <200 días, vacíos SIGTE.
- **INE** — Estadísticas Vitales 2022/provisional 2023 (17-03-2025); **IX EPF** (oct-2023); **EEPP base 2024** (28-01-2026); boletines **IPC** dic-2025/ene-2026.
- **MINSAL/DESUC-UC** — **ENCAVI 2023-2024** (presentación 11-08-2025): crónicas, multimorbilidad, salud mental, calidad de vida por quintil, factores de riesgo.
- **MINSAL** — **ENS 2016-2017**: obesidad medida e hipertensión.
- **OMS — Global Health Observatory** (API): gasto catastrófico ODS 3.8.2 (2006/2011/2016) y «financial hardship» 2021 con gradiente por quintil.
- **Superintendencia de Salud** — Resoluciones APB SS/N°196 (2024), N°229 (2025), N°294/329 (2026); cifras de beneficiarios isapre vía prensa que cita al regulador (La Tercera 20-02-2025; Emol 04-02-2026) y vía Clínicas de Chile A.G. (dic-2025).
- **OCDE** — *Policy actions: affordable and accessible pharmaceuticals* (Chile) y **OCEC-UDP** (2021) sobre VIII EPF: composición del gasto de bolsillo (medicamentos).
- **Libertad y Desarrollo** — SIE-332 (feb-2025) y TP-1716 (nov-2025), citando datos OCDE: remuneraciones relativas.
- **INE-SERMIG** — estimación de población extranjera 2023 (30-12-2024).

## Limitaciones declaradas

1. **IPS:** ponderaciones y límites de normalización son decisiones de diseño; componentes estructurales constantes en la serie; OOP 2024-2025 = dato 2023; la serie parte en 2021 (sin mediana CNE 2019).
2. **Clustering de Servicios de Salud no factible:** solo hay conteos (14/29 SS <200 días CNE; 7 en IQ) y 7 medianas IQ publicadas; se muestra el ranking disponible en su lugar.
3. **Fallecidos en lista:** el propio MINSAL advierte que no permite establecer causalidad espera → muerte; la advertencia acompaña el gráfico.
4. **Médicos Chile (3,3/1.000) = con licencia** vs OCDE en ejercicio: la brecha real es mayor que la graficada.
5. **Beneficiarios isapre 2019** es un valor derivado (≈2,6 M dic-2024 + 786 mil perdidos) y 2024-2025 son aproximados; no se descargó el boletín estadístico oficial de la Superintendencia.
6. **Actividad hospitalaria (M6):** índice 2019=100 derivado aritméticamente de variaciones porcentuales publicadas (ene-oct de cada año).
7. **Filtros:** el factor por quintil del gasto catastrófico es un proxy (gradiente «financial hardship» 2021); el factor de tramo FONASA solo existe para el tramo B (A/C/D sin distribución publicada); el factor etario de CNE es una aproximación por sobre/sub-representación, no una mediana real por edad.
8. **Sin datos verificados (excluidos del tablero):** desglose FONASA/isapre dentro del financiamiento obligatorio, composición interna de la división Salud IX EPF por quintil, densidad regional de médicos, brecha de tratamiento en salud mental, compras a privados/telemedicina, razón de dependencia numérica, % inmigrantes sin previsión CASEN 2024, serie anual IPC-salud, deuda por causas médicas (EFH).
9. **Prevalencias (M4):** mezclan ENCAVI 2023-24 (autoreporte) y ENS 2016-17 (medición); las definiciones no son intercambiables y se rotulan en el gráfico.
10. El dashboard requiere conexión a internet en el primer render (D3 e Inter por CDN).

## Licencia

[MIT](LICENSE) © [Nombre del autor — completar].
