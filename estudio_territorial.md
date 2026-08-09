# Estudio Preliminar: Módulo Territorial — Organismos de Salud en Chile

> **Proyecto:** Monitor Salud Chile — Dashboard de Divulgación  
> **Autor:** [Usuario] + Asistencia Kimi  
> **Fecha:** 8 de agosto de 2026  
> **Versión:** 1.0 — Estudio Preliminar  

---

## 1. Resumen Ejecutivo

Este documento presenta un estudio preliminar para la incorporación de un **módulo territorial** al dashboard *Monitor Salud Chile*. El objetivo es permitir al usuario explorar la distribución geográfica de organismos de salud (CESFAM, SAR, SAPU, CECOF, COSAM, postas rurales, hospitales, etc.) cruzada con indicadores socioeconómicos, educacionales y demográficos del territorio.

El dashboard actual es **estático y sin backend**, lo cual impone restricciones técnicas que definen el alcance de las soluciones viables.

---

## 2. Inventario de Fuentes de Datos Identificadas

### 2.1 Establecimientos de Salud — DEIS / MINSAL

| Atributo | Detalle |
|----------|---------|
| **Fuente** | Departamento de Estadísticas e Información en Salud (DEIS), Ministerio de Salud de Chile |
| **URL** | `https://repositoriodeis.minsal.cl/Publicaciones/2019/Establecimientos/` |
| **Archivo referencia** | `Base_Establecimientos_ChileDEIS_MINSAL(23-01-2019).xlsx` |
| **Periodicidad** | Anual (última versión consultada: enero 2019) |
| **Cobertura** | Nacional — todos los establecimientos inscritos en DEIS |
| **Campos clave** | Nombre del establecimiento, código DEIS, tipo (CESFAM, SAR, SAPU, CECOF, COSAM, Posta Rural, Hospital, Clínica, Consultorio, etc.), región, provincia, comuna, dirección, latitud, longitud, dependencia (Servicio de Salud, Municipalidad, Privado, etc.) |

**Observación crítica:** La versión identificada corresponde a **2019**. Es necesario verificar si existe una base actualizada (2024–2025) en el nuevo portal de datos abiertos del MINSAL o en el repositorio DEIS. La falta de actualización introduce un sesgo de cobertura: establecimientos cerrados, fusionados o creados post-2019 no estarán reflejados.

**URL de consulta recomendada para actualización:**
- `https://deis.minsal.cl/datos-abiertos/` (portal de datos abiertos DEIS)
- `https://www.minsal.cl/datos-abiertos/` (portal general MINSAL)

---

### 2.2 Límites Administrativos — INE / Geodatos Abiertos

| Atributo | Detalle |
|----------|---------|
| **Fuente** | Instituto Nacional de Estadísticas (INE) — Geodatos Abiertos |
| **URL** | `https://www.ine.gob.cl/herramientas/portal-de-mapas/geodatos-abiertos` |
| **Formatos** | Shapefile (.shp), GeoJSON, KML |
| **Niveles disponibles** | Región, Provincia, Comuna, Distrito, Zona Censal |
| **Sistema de coordenadas** | WGS84 (lat/lon) y SIRGAS-Chile |

**Alternativa directa (sin registro):**
- GitHub Gist con comunas y regiones en GeoJSON: `https://gist.github.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd`
- **Limitación:** el Gist puede estar desactualizado respecto a los últimos cambios administrativos (ej. creación de la Región de Ñuble en 2018 ya debería estar reflejada, pero conviene verificar).

---

### 2.3 Indicadores Socioeconómicos — CASEN / INE

| Atributo | Detalle |
|----------|---------|
| **Fuente** | Encuesta de Caracterización Socioeconómica Nacional (CASEN), Ministerio de Desarrollo Social |
| **Nivel disponible** | Nacional, regional, **comunal** (en tabulados oficiales) |
| **URL de tabulados** | `https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen` |
| **Variables relevantes** | Nivel educacional, ingreso per cápita, pobreza multidimensional, previsión de salud (FONASA/ISAPRE), condición de discapacidad, composición del hogar |

**Observación:** El dashboard ya utiliza CASEN a nivel nacional. Los tabulados comunales permitirían el cruce territorial. La CASEN 2024 está en proceso de publicación; los tabulados comunales de la CASEN 2022 ya están disponibles.

---

### 2.4 Población — Proyecciones INE

| Atributo | Detalle |
|----------|---------|
| **Fuente** | INE — Proyecciones y Estimaciones de Población |
| **URL** | `https://www.ine.gob.cl/estadisticas/sociales/demografia-y-vitales/proyecciones-de-poblacion` |
| **Nivel** | Nacional, regional, provincial, comunal |
| **Variables** | Población total, por sexo, por grupo etario |

---

### 2.5 Índice de Privación — Índice de Vulnerabilidad Local (IVL)

| Atributo | Detalle |
|----------|---------|
| **Fuente** | Ministerio de Desarrollo Social / Subsecretaría de Evaluación Social |
| **Descripción** | Índice que caracteriza la vulnerabilidad socioeconómica a nivel comunal basado en variables censales |
| **Uso potencial** | Colorear el mapa comunal por nivel de vulnerabilidad y superponer establecimientos de salud |

---

## 3. Arquitectura Técnica Propuesta

Dado que el dashboard es **estático, sin backend ni base de datos propia**, se proponen tres opciones de implementación, ordenadas por complejidad creciente:

---

### Opción A: Mapas Estáticos Exportados desde QGIS (PNG/SVG embebidos)

**Descripción:** Se utiliza QGIS como herramienta de preparación de datos y diseño cartográfico. Los mapas se exportan como imágenes estáticas (PNG de alta resolución o SVG) y se embeben directamente en el dashboard HTML.

**Flujo de trabajo:**
```
Base DEIS (XLSX)
       ↓
  Importar a QGIS (como capa de puntos CSV/GeoJSON)
       ↓
  Shapefile INE de comunas (capa base poligonal)
       ↓
  Simbología por tipo de establecimiento
  Colores por región o nivel de vulnerabilidad
       ↓
  Layout de impresión en QGIS
       ↓
  Exportar PNG/SVG → embeber en dashboard
```

**Ventajas:**
- Máxima calidad visual cartográfica.
- Control total sobre el diseño (tipografías, leyendas, escalas).
- No requiere librerías JavaScript de mapeo ni aumenta el peso del bundle.
- El dashboard sigue siendo 100% estático.

**Desventajas:**
- Mapas no interactivos (sin zoom, sin hover, sin clic).
- Cualquier cambio de datos requiere reabrir QGIS, reexportar y redeployar.
- No permite al usuario filtrar "en caliente" (ej. "mostrar solo CESFAM").

**Complejidad:** ⭐⭐ (Baja)  
**Recomendación:** Ideal para una **primera versión (MVP)** rápida y visualmente impactante.

---

### Opción B: Mapas Interactivos con D3.js + GeoJSON (Web Nativo)

**Descripción:** Se prepara un archivo GeoJSON limpio (límites comunales + puntos de establecimientos) y se renderiza directamente en el navegador usando D3.js, una librería de visualización que soporta mapas vectoriales.

**Flujo de trabajo:**
```
Shapefile INE → convertir a GeoJSON (comunas)
Base DEIS → convertir a GeoJSON (puntos)
       ↓
  Fusionar en un único GeoJSON o mantener separados
       ↓
  D3.js lee GeoJSON, proyecta coordenadas,
  dibuja SVG interactivo en el DOM
       ↓
  Hover: muestra nombre, tipo, comuna
  Click: filtra o despliega panel lateral
```

**Ventajas:**
- Totalmente interactivo (zoom, pan, hover, tooltips, filtros dinámicos).
- No depende de servicios externos (Google Maps, Mapbox, etc.).
- Los datos viajan con el dashboard (offline-friendly).
- Permite filtros en caliente: "mostrar solo hospitales", "colorear por región", etc.

**Desventajas:**
- El archivo GeoJSON de comunas de Chile pesa aproximadamente **2–5 MB** (dependiendo de la simplificación). Esto puede afectar el tiempo de carga inicial.
- Requiere aprendizaje de D3.js (curva de aprendizaje pronunciada).
- El renderizado de ~5.000+ puntos en SVG puede ralentizar navegadores antiguos o móviles de gama baja.

**Mitigación de peso:**
- Simplificar geometrías del GeoJSON con `mapshaper` o `ogr2ogr`.
- Usar tiling o carga progresiva no es viable sin backend, pero sí se puede simplificar geometrías al ~10–20% sin pérdida visual apreciable.

**Complejidad:** ⭐⭐⭐⭐ (Alta)  
**Recomendación:** Ideal para la **versión definitiva** si se busca interactividad y exploración por parte del usuario.

---

### Opción C: Híbrida — QGIS para Preparación, D3.js para Renderizado

**Descripción:** Combina lo mejor de ambos mundos. QGIS se usa como herramienta de ETL (extracción, transformación y carga) para limpiar, validar, georreferenciar y simplificar los datos; luego se exportan a GeoJSON limpio que D3.js renderiza.

**Flujo de trabajo:**
```
QGIS (procesamiento)
  ├── Cargar shapefile INE de comunas
  ├── Simplificar geometrías (reduce ~70% peso)
  ├── Cargar base DEIS, validar coordenadas
  ├── Eliminar duplicados o registros sin lat/lon
  ├── Asignar código comunal INE a cada establecimiento
  └── Exportar: comunas_simplificado.geojson + establecimientos.geojson

D3.js (renderizado)
  ├── Cargar ambos GeoJSON
  ├── Dibujar mapa base (comunas)
  ├── Superponer puntos (establecimientos)
  ├── Aplicar estilos por tipo
  └── Interacciones (hover, filtros, leyenda)
```

**Ventajas:**
- Datos limpios y validados gracias a QGIS.
- Mapa interactivo en el navegador.
- GeoJSON optimizado para web (tamaño reducido).
- El proceso de preparación en QGIS es reproducible: si salen datos nuevos, se reemplaza el archivo y se reexporta.

**Desventajas:**
- Requiere ambas herramientas (QGIS + D3.js).
- Mayor tiempo de setup inicial.

**Complejidad:** ⭐⭐⭐ (Media-Alta)  
**Recomendación:** **Opción recomendada** como arquitectura final. Permite iterar rápidamente sobre los datos manteniendo la interactividad.

---

## 4. Cruces Socioeconómicos y Analíticos Posibles

### 4.1 Cruces Directos (datos disponibles)

| Cruz | Fuente 1 | Fuente 2 | Pregunta que responde |
|------|----------|----------|----------------------|
| Densidad de establecimientos / 10.000 hab. | DEIS (n° establecimientos por comuna) | INE Proyecciones (población comunal) | ¿Qué comunas tienen más o menos cobertura de salud relativa a su población? |
| Tipo de establecimiento vs. vulnerabilidad comunal | DEIS (tipo) | IVL / CASEN comunal | ¿Las comunas más vulnerables dependen más de postas rurales y CESFAM, mientras que las de mayor ingreso tienen más clínicas privadas? |
| Previsión de salud vs. oferta | CASEN (% FONASA/ISAPRE por comuna) | DEIS (establecimientos públicos vs. privados por comuna) | ¿Existe coherencia entre la previsión predominante y la oferta de establecimientos? |
| Nivel educacional vs. acceso | CASEN (% educación universitaria por comuna) | DEIS (distancia promedio al establecimiento más cercano) | ¿Las comunas con menor escolaridad tienen peor acceso físico a la salud? |
| Ingreso vs. tipo de atención | CASEN (ingreso mediano comunal) | DEIS (SAPU/SAR disponibles) | ¿Las comunas de menores ingresos tienen más SAPU (atención de urgencia ambulatoria) proporcionalmente? |

### 4.2 Indicadores Derivados Sugeridos

1. **Índice de Oferta Relativa (IOR):**  
   $$IOR_c = \frac{E_c}{P_c} \times 10.000$$  
   Donde $E_c$ = n° de establecimientos en comuna $c$, $P_c$ = población de comuna $c$.

2. **Índice de Concentración de la Red Pública:**  
   $$ICRP_c = \frac{E_{público,c}}{E_{total,c}} \times 100$$  
   Porcentaje de establecimientos públicos sobre el total en la comuna.

3. **Índice de Complejidad Promedio:**  
   Asignar un puntaje de complejidad a cada tipo (ej. Hospital=5, CESFAM=3, Posta Rural=1) y calcular el promedio ponderado por comuna.

4. **Distancia Media al Establecimiento más Cercano:**  
   Requiere cálculo de distancias geodésicas desde el centroide de cada zona densamente poblada al establecimiento más cercano. QGIS permite hacerlo con la herramienta *Distancia al hub más cercano*.

---

## 5. Limitaciones, Riesgos y Sesgos

### 5.1 Limitaciones de los Datos

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| Base DEIS de 2019 (posible desactualización) | Establecimientos cerrados, nuevos o reasignados no aparecen | Buscar versión 2024–2025 en datos abiertos MINSAL; documentar fecha de corte |
| Falta de población atendida por establecimiento | No se puede calcular tasa de utilización real | Usar población comunal como proxy; buscar datos de atenciones en DEIS o SISPRO |
| Coordenadas geográficas pueden tener errores de geocodificación | Puntos fuera de Chile o en el océano | Validar en QGIS: filtrar lat/lon fuera de rango [-56, -66] lon, [-18, -56] lat |
| Zonas rurales con baja densidad de establecimientos | Mapa puede parecer "vacío" en el sur y norte rural | Aclarar en la leyenda que la ausencia de puntos no implica ausencia de atención (existen postas no inscritas en DEIS) |
| CASEN comunal tiene márgenes de error muestral | Comparaciones entre comunas pequeñas pueden ser poco robustas | Usar intervalos de confianza cuando se muestren indicadores CASEN; evitar rankings absolutos |

### 5.2 Riesgos de Interpretación

1. **Ecological fallacy (falacia ecológica):** Atribuir características comunales a individuos. El dashboard debe aclarar que los datos son agregados.
2. **Confusión entre oferta y acceso:** Tener muchos establecimientos no garantiza acceso (pueden estar mal distribuidos, sin transporte, con largas listas de espera).
3. **Sesgo de reporte:** La base DEIS solo incluye establecimientos inscritos. Postas rurales informales o atención tradicional no aparecen.

---

## 6. Roadmap de Implementación

### Fase 0: Verificación y Adquisición de Datos (1–2 días)
- [ ] Verificar si existe versión actualizada de la Base de Establecimientos DEIS (2024–2025).
- [ ] Descargar shapefile de comunas del INE (o usar GeoJSON del Gist verificado).
- [ ] Descargar tabulados comunales CASEN 2022 o 2024.
- [ ] Descargar proyecciones de población INE a nivel comunal.

### Fase 1: Preparación de Datos en QGIS (2–3 días)
- [ ] Importar shapefile de comunas; verificar proyección CRS.
- [ ] Importar base DEIS como capa de puntos CSV (usando campos latitud/longitud).
- [ ] Validar geocodificación: eliminar puntos nulos, fuera de Chile, duplicados.
- [ ] Asignar código comunal INE a cada punto (unión espacial *Join attributes by location*).
- [ ] Simplificar geometría del shapefile de comunas para web (`Vector → Geometry Tools → Simplify`).
- [ ] Exportar: `comunas_simplificado.geojson` + `establecimientos.geojson`.

### Fase 2: Implementación del Mapa (3–5 días)

**Rama A (MVP — Mapa estático):**
- [ ] Diseñar layout cartográfico en QGIS (composición de impresión).
- [ ] Generar 3–4 mapas temáticos: (1) todos los establecimientos, (2) solo públicos, (3) por región, (4) superpuesto con vulnerabilidad.
- [ ] Exportar PNG en alta resolución (300 DPI).
- [ ] Embeber en dashboard con leyenda explicativa.

**Rama B (Versión interactiva — D3.js):**
- [ ] Crear página HTML del módulo territorial.
- [ ] Cargar GeoJSON de comunas con D3.js (`d3.json`).
- [ ] Cargar GeoJSON de establecimientos.
- [ ] Implementar proyección cartográfica (`d3.geoMercator` centrada en Chile).
- [ ] Dibujar polígonos comunales con color base (escala de grises o por vulnerabilidad).
- [ ] Superponer círculos por establecimiento, con radio/color según tipo.
- [ ] Implementar hover (tooltip con nombre, tipo, comuna).
- [ ] Implementar filtros dinámicos (checkboxes por tipo de establecimiento).
- [ ] Implementar leyenda interactiva.
- [ ] Optimizar rendimiento (simplificación de geometrías, lazy loading si es necesario).

### Fase 3: Integración de Indicadores y Cruces (2–3 días)
- [ ] Unir tablas CASEN/INE al GeoJSON de comunas (usando código comunal).
- [ ] Calcular indicadores derivados (IOR, ICRP, etc.).
- [ ] Permitir colorear el mapa por indicador seleccionado (ej. "colorear por % pobreza multidicional").
- [ ] Generar tabla de rankings (top 10 comunas por cada indicador).

### Fase 4: Validación y Documentación (1–2 días)
- [ ] Revisión de coherencia: ¿los puntos caen dentro de sus comunas declaradas?
- [ ] Revisión de rendimiento en móvil y navegadores antiguos.
- [ ] Redactar metadatos y notas metodológicas para cada visualización.
- [ ] Documentar fuentes, fechas de corte y limitaciones.

### Fase 5: Publicación (1 día)
- [ ] Integrar módulo al dashboard principal (navegación, menú, índice).
- [ ] Deploy a GitHub Pages / Vercel.
- [ ] Pruebas finales de usabilidad.

**Estimación total de esfuerzo:**
- MVP estático: **5–7 días-hombre**
- Versión interactiva completa: **10–15 días-hombre**

---

## 7. Recomendación Estratégica

Se recomienda un enfoque **incremental**:

1. **Semana 1–2:** Implementar la **Opción A (mapas estáticos desde QGIS)** como MVP. Esto permite publicar contenido territorial de inmediato, validar la narrativa con los usuarios y generar *feedback* antes de invertir en interactividad.

2. **Semana 3–4:** Si el MVP tiene buena recepción, migrar a la **Opción C (híbrida QGIS + D3.js)**. QGIS ya estará configurado con los datos limpios; el esfuerzo adicional es el desarrollo D3.js.

3. **Post-publicación:** Evaluar agregar indicadores de accesibilidad (distancias, tiempos de traslado) si se consiguen datos de transporte público o se usa la API de OSRM (OpenStreetMap Route Machine) para cálculos de distancia.

---

## 8. Glosario

| Término | Definición |
|---------|------------|
| **CESFAM** | Centro de Salud Familiar — atención primaria de salud municipal. |
| **SAR** | Servicio de Atención Rural — atención primaria en zonas rurales dispersas. |
| **SAPU** | Servicio de Atención Primaria de Urgencia — atención de urgencia de menor complejidad. |
| **CECOF** | Centro Comunitario de Salud Familiar — modelo de atención intercultural, común en zonas con población indígena. |
| **COSAM** | Centro de Salud Mental Comunitaria — atención psicosocial ambulatoria. |
| **Posta Rural** | Establecimiento de salud básico en zonas rurales, usualmente con un paramédico o técnico. |
| **DEIS** | Departamento de Estadísticas e Información en Salud, del Ministerio de Salud. |
| **GeoJSON** | Formato estándar para codificar estructuras de datos geográficos basado en JSON. |
| **Shapefile** | Formato de datos espaciales desarrollado por Esri, compuesto por múltiples archivos (.shp, .shx, .dbf, etc.). |
| **QGIS** | Software libre de Sistemas de Información Geográfica (SIG). |
| **D3.js** | Librería de JavaScript para producir visualizaciones de datos dinámicas e interactivas en navegadores web. |
| **IVL** | Índice de Vulnerabilidad Local, elaborado por el Ministerio de Desarrollo Social. |

---

## 9. Referencias y Enlaces de Consulta

1. DEIS — Base de Establecimientos 2019: `https://repositoriodeis.minsal.cl/Publicaciones/2019/Establecimientos/Base_Establecimientos_ChileDEIS_MINSAL(23-01-2019).xlsx`
2. DEIS — Portal de Datos Abiertos: `https://deis.minsal.cl/datos-abiertos/`
3. INE — Geodatos Abiertos: `https://www.ine.gob.cl/herramientas/portal-de-mapas/geodatos-abiertos`
4. GeoJSON Comunas Chile (Gist): `https://gist.github.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd`
5. CASEN — Tabulados: `https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen`
6. INE — Proyecciones de Población: `https://www.ine.gob.cl/estadisticas/sociales/demografia-y-vitales/proyecciones-de-poblacion`
7. QGIS — Documentación oficial: `https://docs.qgis.org/`
8. D3.js — Documentación oficial: `https://d3js.org/`
9. Mapshaper — Herramienta web para simplificar GeoJSON: `https://mapshaper.org/`

---

> *Este documento es un estudio preliminar. Las URLs, disponibilidad de datos y alcances técnicos deben verificarse antes de iniciar la implementación.*
