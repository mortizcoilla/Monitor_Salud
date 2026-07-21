# Monitor Socioeconómico de la Salud en Chile — Verificación Módulos 1 y 5
## M1: Financiamiento y gasto · M5: Gasto de bolsillo y protección financiera

**Fecha de verificación:** sesión actual (jun-2026 aprox., según fechas de los documentos consultados).
**Regla aplicada:** solo se reportan cifras verificadas vía web en esta sesión, con cita inmediata. Lo no verificado se declara explícitamente.

---

# MÓDULO 1 — FINANCIAMIENTO Y GASTO

## M1.1 Gasto total en salud: % del PIB y per cápita PPA

**Definición/universo:** Gasto corriente en salud (current health expenditure, CHE) según metodología SHA 2011: bienes y servicios de salud consumidos en el año; excluye inversión de capital. Fuentes: OCDE (Health Statistics) y OMS GHED (replicado en World Development Indicators del Banco Mundial).

**Supuesto del brief: CONFIRMADO.**

- Chile gasta **10,5% del PIB** en salud y **USD 3.749 PPA per cápita**, vs. promedio OCDE de **9,3% del PIB** y **USD 5.967 PPA**. [Fuente: OECD — *Health at a Glance 2025: Chile* (country note), publicado 13-nov-2025, https://www.oecd.org/en/publications/2025/11/health-at-a-glance-2025-country-notes_2f94481e/chile_b440e042.html — PDF: https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/11/health-at-a-glance-2025-country-notes_2f94481e/chile_b440e042/9e89ef98-en.pdf]
- Cobertura poblacional para un set básico de servicios: **97%**. [Fuente: OECD — *Health at a Glance 2025: Chile*, 13-nov-2025, misma URL]
- ⚠ Nota de consistencia: la cifra OCDE (USD 3.749, ~2024) es más reciente que la del GHED/Banco Mundial (USD 3.337 PPA en 2023). No son contradictorias; corresponden a años distintos.

**Serie temporal GHED/Banco Mundial (indicador SH.XPD.CHEX.GD.ZS; fuente primaria: OMS GHED), consultada vía API en esta sesión** [Fuente: Banco Mundial — World Development Indicators vía API, datos OMS GHED, última actualización de la serie 13-jul-2026, https://api.worldbank.org/v2/country/CHL/indicator/SH.XPD.CHEX.GD.ZS]:

| Año | CHE % PIB | Año | CHE % PIB |
|-----|-----------|-----|-----------|
| 2010 | 6,82 | 2017 | 9,09 |
| 2011 | 6,80 | 2018 | 9,15 |
| 2012 | 7,02 | 2019 | 9,31 |
| 2013 | 7,48 | 2020 | 9,70 |
| 2014 | 7,84 | 2021 | 9,72 |
| 2015 | 8,35 | 2022 | 10,01 |
| 2016 | 8,56 | 2023 | 10,17 |

**Gasto per cápita PPA (GHED, SH.XPD.CHEX.PP.CD)** [Fuente: Banco Mundial — WDI/GHED, misma API, 13-jul-2026]: 2019: 2.384 · 2020: 2.458 · 2021: 2.829 · 2022: 3.084 · 2023: **3.337 USD PPA**. Gasto público (GGHE-D) per cápita PPA 2023: **1.722 USD** (SH.XPD.GHED.PP.CD).

**Comparación con pares (GHED/WDI, 2023)** [Fuente: Banco Mundial — WDI/GHED vía API, 13-jul-2026, https://api.worldbank.org/v2/country/{iso3}/indicator/SH.XPD.CHEX.GD.ZS]:

| País | CHE % PIB 2023 | OOP % CHE 2023 |
|------|---------------|----------------|
| Chile | 10,17 | 34,59 |
| Argentina | 10,27 | 24,47 |
| Brasil | 9,73 | 26,23 |
| Colombia | 8,16 | 14,63 |
| Costa Rica | 6,87 | 24,13 |
| México | 5,50 | 41,24 |

Lectura: Chile es, junto a Argentina, el mayor gastador relativo al PIB del grupo, y tiene el segundo OOP más alto de la región tras México.

## M1.2 Descomposición del financiamiento: público vs. privado (2010-2023)

**Definición:** GHED clasifica por fuente de financiamiento: "domestic general government health expenditure" (GGHE-D: ingresos fiscales + contribuciones obligatorias de seguros sociales/privados obligatorios) y "domestic private" (hogares, seguros voluntarios, empresas). En el caso chileno, las cotizaciones obligatorias del 7% (tanto FONASA como isapre) se contabilizan dentro del financiamiento obligatorio/público en SHA 2011.

**Serie GHED/WDI Chile** [Fuente: Banco Mundial — WDI/GHED vía API, indicadores SH.XPD.GHED.CH.ZS y SH.XPD.PVTD.CH.ZS, 13-jul-2026]:

| Año | Público % CHE | Privado % CHE | OOP % CHE |
|-----|---------------|---------------|-----------|
| 2010 | 47,10 | 52,89 | 34,47 |
| 2012 | 47,94 | 52,06 | 33,41 |
| 2014 | 47,74 | 52,26 | 34,27 |
| 2016 | 49,65 | 50,35 | 34,75 |
| 2018 | 51,24 | 48,76 | 32,70 |
| 2019 | 51,26 | 48,74 | 32,34 |
| 2020 | 56,51 | 43,49 | 29,04 |
| 2021 | 53,66 | 46,34 | 32,63 |
| 2022 | 50,88 | 49,12 | 35,60 |
| 2023 | **51,61** | **48,39** | **34,59** |

- Cobertura financiera: **59% del gasto cubierto por prepago obligatorio** (vs. 75% promedio OCDE). [Fuente: OECD — *Health at a Glance 2025: Chile*, 13-nov-2025, URL en M1.1]
- **NO VERIFICADO:** el desglose FONASA+aporte fiscal vs. cotizaciones isapre *dentro* del esquema obligatorio (GHED a nivel de esquemas HF.1.1 vs. HF.1.2 no fue accesible en esta sesión; la API GHO de la OMS solo expone agregados). Requiere descarga del GHED completo (apps.who.int/nha/database) o cuentas de salud MINSAL/DEIS.

## M1.3 Gasto de bolsillo (OOP): nivel y composición

**Supuesto del brief ("Chile de los más altos de la OCDE, ~33-38%"): PARCIALMENTE CONFIRMADO.**
- Rango verificado 2010-2023: **29,0% (2020, mínimo por efecto pandemia) a 35,6% (2022)**; 2023: **34,6%** del CHE. [Fuente: Banco Mundial — WDI/GHED, SH.XPD.OOPC.CH.ZS, 13-jul-2026]. Efectivamente entre los más altos de la OCDE (promedio OCDE del prepago obligatorio 75% implica OOP típico ~18-20%).
- **Composición — medicamentos como componente dominante:**
  - El gasto farmacéutico representa **36% del gasto de bolsillo total de los hogares chilenos** (55% si se consideran solo hogares que compran medicamentos). [Fuente: OECD — *OECD policy actions: affordable and accessible pharmaceuticals* (Chile), con datos OECD Health Statistics 2019 / CEP sobre EPF-INE, https://www.oecd.org/content/dam/oecd/en/topics/policy-sub-issues/structural-reforms/country-tailored-policy-reforms/583170-CHL_OECD_policy_actions_affordable_and_accessible_pharmaceuticals.pdf]
  - VIII EPF (INE, 2016-2017): **53,4% de los hogares** incurren en gasto en medicamentos; para quienes compran, los medicamentos son **55,3% de su gasto de bolsillo en salud**; en el agregado, medicamentos son el **38% del gasto de bolsillo total**. [Fuente: OCEC-UDP — *Diagnóstico de la Seguridad Social en el área de la Salud* (2021), citando VIII EPF INE 2018, https://ocec.udp.cl/cms/wp-content/uploads/2021/11/Informe-OCEC-5-VF.pdf]
  - **~80% del gasto en medicamentos retail se financia de bolsillo** (OCDE ~40% con recursos privados). [Fuente: CIF Chile — *Informe Mercado de Medicamentos en Chile* (oct-2025), citando Health at a Glance OECD 2019, https://cifchile.cl/wp-content/uploads/2025/10/Informe-Mercado-de-Medicamentos-en-Chile-Gasto-y-Politicas-de-Cobertura.pdf]
  - Hogares que compran medicamentos: 9,5% de su gasto total va a salud y 3,5% a medicamentos (36% del gasto en salud es medicamentos; gasto promedio $48.291/mes). [Fuente: BID — *¿Cuánto podrían ahorrar los hogares chilenos usando medicamentos genéricos?* (con EPF-INE), https://publications.iadb.org/publications/spanish/document/-Cuanto-podrian-ahorrar-y-que-ganarian-los-hogares-Chilenos-usando-medicamentos-genericos-en-vez-de-sus-equivalentes-del-marca.pdf]
- **NO VERIFICADO:** la figura específica de *Health at a Glance 2025* de desglose del OOP por tipo de servicio para Chile (el country note no la incluye; requiere el capítulo 5 del informe completo u OECD.Stat).

## M1.4 Presupuesto público de salud (partida 16, Ministerio de Salud)

**Definición/universo:** Partida 16 del Presupuesto de la Nación (MINSAL: subsecretarías, FONASA, ISP, CENABAST, Servicios de Salud). Valores en **miles de millones de CLP** (la API entrega miles de pesos; aquí convertidos a billones = 10^12 CLP). "Ley inicial" = Ley de Presupuestos aprobada; "ejecutado" = gasto devengado a diciembre.

**Serie oficial verificada vía API de la Biblioteca del Congreso Nacional (fuente de datos: DIPRES)** [Fuente: BCN — Presupuesto de la Nación, API api-presupuesto/servicio/ObtenerPartida (numeroPartida=16), consultada en esta sesión; interfaz pública: https://www.bcn.cl/presupuesto/periodo/2025/partida/16]:

| Año | Ley inicial (MM$) | Vigente dic. (MM$) | Ejecutado dic. (MM$) |
|-----|-------------------|--------------------|-----------------------|
| 2019 | 9,06 | 10,47 | 10,52 |
| 2020 | 9,99 | 12,41 | 12,30 |
| 2021 | 9,95 | 14,25 | 14,05 |
| 2022 | 11,85 | 14,63 | 14,67 |
| 2023 | 12,80 | 15,54 | 15,88 |
| 2024 | 14,68 | 16,81 | 17,21 |
| 2025 | 16,04 | 18,75 | 19,34 |
| 2026 | 17,25 | — | — |

- Crecimiento nominal del presupuesto **ley inicial** 2019→2026: **+90%** (9,06 → 17,25 billones CLP). Ejecutado 2019→2025: **+84%** (10,52 → 19,34).
- La ley 2025 de MINSAL sufrió un recorte inicial de ~$16 mil millones durante el año pese a acuerdo de exclusión de áreas estratégicas. [Fuente: Tirant Prime — "Congreso cuestiona recorte presupuestario en salud", 17-ene-2025, https://prime.tirant.com/cl/actualidad-prime/congreso-cuestiona-recorte-presupuestario-en-salud-y-exige-explicaciones/]
- **NO VERIFICADO:** evolución **real per cápita** (requiere deflactor IPC e población; no calculado en esta sesión para no introducir supuestos). Informes de ejecución DIPRES mensuales existen pero no fueron descargados (dipres.gob.cl).

---

# MÓDULO 5 — GASTO DE BOLSILLO Y PROTECCIÓN FINANCIERA

## M5.1 Gasto catastrófico (metodología OMS/Banco Mundial, ODS 3.8.2)

**Definición:** % de la población cuyo gasto de bolsillo en salud supera el 10% (o 25%) del presupuesto total del hogar (gasto o ingreso). Datos "reported" = calculados directamente de encuestas de hogares (en Chile, EPF del INE).

**Serie Chile verificada en el Global Health Observatory de la OMS** [Fuente: OMS — Global Health Observatory, indicadores FINPROTECTION_CATA_TOT_10_POP y FINPROTECTION_CATA_TOT_25_POP (base global de protección financiera OMS/Banco Mundial), consultada vía API https://ghoapi.azureedge.net en esta sesión]:

| Año (EPF) | >10% del presupuesto | >25% del presupuesto |
|-----------|----------------------|----------------------|
| 2006 | 9,19% | 1,91% |
| 2011 | 11,35% | 2,11% |
| 2016 | **14,60%** | **2,08%** |

⚠ Hallazgo clave: la incidencia al umbral del 10% **aumentó** entre 2006 y 2016 (de 9,2% a 14,6%); el umbral del 25% se mantiene ~2%.

**Nueva definición ODS 3.8.2 (2025):** la OMS/BM revisaron el indicador en 2025 hacia "financial hardship" (gasto OOP que empobrece o supera umbrales de capacidad de pago). [Fuente: P4H Network — "Revising SDG indicator 3.8.2", 15-may-2025, https://p4h.world/en/news/revising-sdg-indicator-3-8-2-a-new-approach-to-measuring-financial-protection-in-health/]. Para Chile, con la nueva definición [Fuente: OMS — GHO, indicador FINANCIALHARDSHIP_PROPORTIONOFPOP, misma API]:

- **2021: 17,38% de la población con dificultad financiera por salud** (componente "gasto grande": 6,02%; componente "empobrecimiento": 11,36%).
- Gradiente 2021 por quintil de riqueza: **Q1 (más pobre): 59,8%** · Q2: 15,1% · Q3: 5,3% · Q4: 3,4% · **Q5: 3,4%**.
- Serie total nueva definición: 1996: 18,7% · 2006: 12,6% · 2011: 14,8% · 2016: 15,9% · 2021: 17,4%.

## M5.2 Composición del gasto en salud de los hogares (EPF IX, INE)

**Definición/universo:** IX EPF (oct-2021 a sep-2022), 15.134 hogares, 79 comunas; representativa de capitales regionales y conurbaciones (urbano). División CCIF 06 "Salud"; excluye arriendo imputado. [Fuente: INE — *Informe de principales resultados IX EPF* y *Síntesis de resultados IX EPF* (oct-2023), https://www.ine.gob.cl/docs/default-source/encuesta-de-presupuestos-familiares/publicaciones-y-anuarios/ix-epf-(octubre-2021---septiembre-2022)/sintesis-de-resultados-ix-epf.pdf y .../informe-de-principales-resultados-ix-epf.pdf]

- Gasto promedio mensual del hogar: **$1.451.782**; en **salud: $115.283/mes (IC95%: 110.237–120.329), 7,9% del gasto total**. [Fuente: INE — Informe IX EPF, Tabla 15, p.52]
- Comparación VIII vs IX EPF (VIII ajustada por IPC a mar-2022): salud pasa de $109.102 a $115.283 (+$6.181; **diferencia NO estadísticamente significativa**). [Fuente: INE — Informe IX EPF, Tabla 18, p.64]
- **Participación de salud en el presupuesto por quintil de ingreso** [Fuente: INE — Síntesis IX EPF, p.10]:

| Quintil | % del presupuesto en salud |
|---------|---------------------------|
| I (menor) | 6,3% |
| II | 7,6% |
| III | 8,1% |
| IV | 8,8% |
| V (mayor) | 8,0% |

- Gasto salud promedio por macrozona: Norte $89.217 (6,7%) · Gran Santiago $129.555 (8,1%) · Centro $98.034 (7,8%) · Sur $104.693 (8,4%). [Fuente: INE — Síntesis IX EPF, pp.14-17]
- **NO VERIFICADO (parcial):** la descomposición *interna* de la división salud por quintil (medicamentos / consultas / exámenes / seguros complementarios) en la IX EPF no está en la síntesis ni el informe de resultados consultados; requiere tabulados detallados del INE. Para la VIII EPF, ver composición de medicamentos en M1.3 (38% del OOP es medicamentos).

## M5.3 Protección financiera: GES/AUGE, Ricarte Soto, CAEC, Copago Cero

- ⚠ **CORRECCIÓN:** el supuesto del brief ("¿87?") está **desactualizado**. Desde el **1-dic-2025** el GES cubre **90 problemas de salud** (Decreto GES N° 29, publicado en el Diario Oficial el 28-nov-2025), incorporando: (88) tratamiento farmacológico tras alta por cirrosis hepática, (89) tratamiento hospitalario de depresión grave en menores de 15 años, (90) cesación de tabaco en personas de 25 años y más; con inversión adicional de **$100.740 millones anuales** y mejora de canastas de 11 condiciones. [Fuentes: LeyChile/BCN — Decreto 29 MINSAL (texto oficial), https://nuevo.leychile.cl/servicios/Consulta/Exportar?radioExportar=Normas&exportar_formato=pdf&nombrearchivo=Decreto-29_16-ENE-2026 ; CruzBlanca — "Nuevas Patologías GES 2025", https://www.cruzblanca.cl/nuevas-patologias-ges-2025 ; Servicio de Salud Magallanes (oficial) — 01-dic-2025, https://www.saludmagallanes.cl/2025/12/01/chile-garantiza-90-problemas-de-salud-con-inversion-record-de-100-mil-millones-anuales/]. La cifra 87 era vigente hasta nov-2025.
- **Ley 20.850 Ricarte Soto:** sistema de protección financiera para diagnósticos y tratamientos de alto costo, para beneficiarios de **todos** los sistemas previsionales (FONASA, isapre, Dipreca, Capredena). Cobertura de **27 enfermedades** según ficha oficial ChileAtiende (última actualización visible: 23-ene-2023). [Fuente: ChileAtiende — Ficha 38873 "Ley Ricarte Soto", https://www.chileatiende.gob.cl/fichas/38873-ley-ricarte-soto]. Un decreto publicado el 13-ene-2025 amplió coberturas específicas (esclerosis múltiple con Ofatumumab; artritis reumatoide con Baricitinib y Upadacitinib, modifica Decreto N°2 de 2019). [Fuente: Hospital Clínico San Borja Arriarán — 13-ene-2025, https://hcsba.cl/sitio/2025/01/13/se-publica-decreto-que-incorpora-nuevos-tratamientos-a-la-ley-ricarte-soto/]. **NO VERIFICADO:** número total vigente 2026 de diagnósticos/tratamientos (la cifra 27 puede estar desactualizada).
- **Copago Cero FONASA: CONFIRMADO.** Desde **septiembre de 2022**, copago cero en Modalidad de Atención Institucional (red pública) para **todos los tramos (A, B, C y D)**. [Fuente: FONASA — página oficial "Tramos", https://www.fonasa.gob.cl/tramos/]
- **CAEC:** cobertura de diagnóstico para beneficiarios FONASA ante sospecha de ciertas patologías. **NO VERIFICADO en esta sesión** el detalle/número de coberturas CAEC vigente (no se consultó fuente primaria específica).

## M5.4 Deuda de hogares por causas médicas (EFH, Banco Central)

- La EFH 2024 existe y fue presentada el 30-sep-2025: 4.649 hogares encuestados (jul-2024 a ene-2025), representando 6,7 millones de hogares; representatividad nacional urbana. Resultados generales: % de hogares con alguna deuda **bajó de 66% (2017) a 51% (2024)**. [Fuente: Banco Central de Chile — "Presidenta del BCCh presenta los resultados de la EFH 2024", 30-sep-2025, https://www.bcentral.cl/contenido/-/detalle/presidenta-del-bcch-presenta-los-resultados-de-la-efh-2024 ; cifra 51% vía El Mostrador — 02-oct-2025, https://www.elmostrador.cl/el-semanal/2025/10/02/el-mensaje-de-boric-en-el-presupuesto-2026-no-hay-plata/]
- **NO VERIFICADO:** una categoría publicada de "deuda por tratamiento médico/salud" en la EFH. No se encontró en esta sesión un tabulado oficial del BCCh con el motivo/destino "salud" del endeudamiento. Requiere revisar el Documento de Resultados EFH 2024 (efhweb.cl, sitio no accesible durante la sesión) o procesar la base de datos pública. Alternativa oficial sugerida: módulo de endeudamiento de la Encuesta CASEN (MDS).

---

# RESUMEN DE NO VERIFICADOS

1. Desglose FONASA/fiscal vs. isapre dentro del financiamiento obligatorio (GHED a nivel de esquemas).
2. Figura OOP por tipo de servicio de *OECD Health at a Glance 2025* para Chile.
3. Presupuesto MINSAL en términos **reales per cápita** (requiere deflactar; series nominales sí verificadas).
4. Composición interna de la división "Salud" de la IX EPF por quintil (medicamentos/consultas/exámenes/seguros).
5. Número vigente 2026 de diagnósticos/tratamientos Ley Ricarte Soto (27 según ChileAtiende ene-2023; hubo ampliaciones 2025).
6. Detalle de coberturas CAEC.
7. Deuda por causas médicas en la EFH (categoría no encontrada en fuentes publicadas).

# CORRECCIONES APLICADAS AL BRIEF

- ⚠ CORRECCIÓN (GES): 87 → **90 problemas de salud** desde 1-dic-2025 (Decreto GES N°29).
- ⚠ MATIZ (OOP): el rango "~33-38%" es aproximado; la serie GHED 2010-2023 verificada va de **29,0% a 35,6%** (34,6% en 2023). Nunca llega a 38%.
- ⚠ MATIZ (per cápita): USD 3.749 PPA (OCDE, ~2024) vs. USD 3.337 PPA (GHED, 2023); usar la que corresponda al año de referencia y citar la fuente.
- ⚠ DATO NUEVO (catastrófico): el brief no fijaba cifra; la verificada al umbral 10% es **14,6% (2016)**, en aumento; con la nueva definición ODS 3.8.2 (2025), **17,4% (2021)**.
