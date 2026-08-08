#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Agrega estilos CSS nuevos al dashboard MSS."""

import pathlib

ROOT = pathlib.Path(r'C:/Workspace/Monitor_Salud')

NEW_CSS = '''

/* ==========================================================================
   CORRECCIONES DE INMUNIZACIÓN (agosto 2026)
   ========================================================================== */

/* ---------- Contexto visible bajo el Termómetro ---------- */
.ips-context {
  margin: 12px 0 10px;
  padding: 10px 12px;
  background: rgba(14, 58, 93, .05);
  border-radius: 8px;
  border-left: 3px solid var(--azul);
}
.ips-context-line {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--gris);
}
.ips-context-line strong { color: var(--tinta); }

/* Botón "¿Cómo se calcula?" */
.ips-how-btn {
  display: inline-block;
  margin-top: 6px;
  padding: 7px 16px;
  font: 600 12px var(--fuente);
  color: var(--azul-oscuro);
  background: transparent;
  border: 1.5px solid var(--azul-oscuro);
  border-radius: 999px;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.ips-how-btn:hover { background: var(--azul-oscuro); color: #fff; }

/* ---------- Modal del Termómetro ---------- */
.ips-modal {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(14, 28, 40, .55);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  opacity: 0; pointer-events: none;
  transition: opacity .2s ease;
}
.ips-modal[open] { opacity: 1; pointer-events: auto; }
.ips-modal-content {
  background: var(--fondo-card);
  border-radius: var(--radius);
  box-shadow: 0 8px 40px rgba(14, 28, 40, .25);
  max-width: 680px; width: 100%;
  max-height: 85vh; overflow-y: auto;
  padding: 28px 32px;
}
.ips-modal-close {
  float: right;
  font-size: 26px; line-height: 1;
  background: none; border: none; color: var(--gris); cursor: pointer;
  padding: 4px; margin: -8px -8px 0 0;
}
.ips-modal h2 { margin: 0 0 12px; font-size: 22px; color: var(--azul-oscuro); }
.ips-modal h3 { margin: 18px 0 8px; font-size: 15px; color: var(--azul-oscuro); }
.ips-modal p, .ips-modal li { font-size: 13.5px; line-height: 1.6; color: var(--tinta); }
.ips-modal ol { padding-left: 20px; }
.ips-modal ol li { margin-bottom: 6px; }
.ips-modal-foot {
  margin-top: 16px; padding-top: 12px;
  border-top: 1px dashed var(--gris-borde);
  font-size: 12px; color: var(--gris);
}

/* ---------- Tabla de sensibilidad ---------- */
.ips-sensibilidad-card { grid-column: 1 / -1; }
.ips-sens-intro { margin: 0 0 12px; font-size: 13px; color: var(--gris); }
.ips-sens-table {
  width: 100%; border-collapse: collapse;
  font-size: 12.5px; margin-bottom: 10px;
}
.ips-sens-table th {
  text-align: left; padding: 8px 10px;
  background: var(--fondo); color: var(--gris);
  font-weight: 600; border-bottom: 2px solid var(--gris-borde);
}
.ips-sens-table td { padding: 8px 10px; border-bottom: 1px solid var(--gris-borde); }
.ips-sens-badge {
  display: inline-block;
  padding: 2px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; color: #fff;
}
.ips-sens-foot {
  margin: 0;
  font-size: 11.5px; font-style: italic; color: var(--gris);
}

/* ---------- Badges de fuente en M4 ---------- */
.source-legend {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin: 8px 0 4px;
}
.source-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 999px;
}
.source-encavi { background: var(--azul-palido); color: var(--azul-oscuro); }
.source-ens { background: #fdf3e0; color: var(--ambar); }

/* ---------- Advertencia en fallecidos M3 ---------- */
.chart-card-warning {
  border-color: #e8c5c5;
}
.chart-warning-banner {
  display: flex; flex-direction: column; gap: 4px;
  background: #fdf1ee;
  border: 1px solid #ecc5c5;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 12.5px;
  color: var(--tinta);
}
.chart-warning-banner strong { color: var(--rojo); }
.chart-warning-banner em { color: var(--gris); font-style: italic; }

/* ---------- Omisiones declaradas ---------- */
.omisiones p { font-size: 13.5px; line-height: 1.6; margin: 0 0 12px; }
.omisiones-list {
  list-style: none; padding: 0; margin: 0 0 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.omisiones-list li {
  padding: 10px 14px;
  background: var(--fondo);
  border-radius: 8px;
  border-left: 3px solid var(--gris);
  font-size: 13px; line-height: 1.55;
}
.omisiones-list li strong { color: var(--tinta); }
.omisiones-foot {
  font-size: 12px; color: var(--gris); font-style: italic;
}

/* ---------- Glosario ---------- */
.glosario-list { margin: 0; }
.glosario-list dt {
  font-size: 14px; font-weight: 700; color: var(--azul-oscuro);
  margin: 16px 0 4px;
}
.glosario-list dt span {
  display: inline-block;
  font-size: 11px; font-weight: 500; color: var(--gris);
  margin-left: 6px;
}
.glosario-list dd {
  margin: 0 0 8px 0;
  font-size: 13px; line-height: 1.6; color: var(--tinta);
  padding-left: 16px;
  border-left: 2px solid var(--azul-palido);
}

/* Badge de estimación modelada en filtros */
.chart-card-filterable .chart-body::before {
  content: 'Estimación modelada: el filtro aplica factores, no mide directamente';
  display: block;
  font-size: 10.5px; font-weight: 600;
  color: var(--ambar);
  background: #fdf8ec;
  padding: 5px 10px; border-radius: 6px;
  margin-bottom: 8px;
}
'''

css_path = ROOT / 'css' / 'styles.css'
css_path.write_text(css_path.read_text(encoding='utf-8') + NEW_CSS, encoding='utf-8')
print('styles.css actualizado con nuevos estilos.')
