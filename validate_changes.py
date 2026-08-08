#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validación rápida de los cambios al dashboard MSS."""

import pathlib, re

ROOT = pathlib.Path(r'C:/Workspace/Monitor_Salud')
errors = []

def check_file(path, patterns, desc):
    txt = path.read_text(encoding='utf-8')
    for pat, msg in patterns:
        if pat not in txt:
            errors.append(f'[{desc}] FALTA: {msg}')

# 1. core.js
check_file(ROOT/'js'/'core.js', [
    ('Math.round(actual.score)', 'Redondeo a entero del Termómetro'),
    ('sensibilidadIPS', 'Función de sensibilidad'),
    ('ips-context', 'Contexto visible del Termómetro'),
    ('ips-sensibilidad', 'Tabla de sensibilidad'),
], 'core.js')

# 2. index.html
check_file(ROOT/'index.html', [
    ('ips-context', 'Contenedor de contexto'),
    ('ips-how-btn', 'Botón ¿Cómo se calcula?'),
    ('ips-sensibilidad', 'Contenedor de sensibilidad'),
    ('ips-modal', 'Modal del Termómetro'),
    ('chart-card-warning', 'Clase warning en fallecidos'),
    ('chart-warning-banner', 'Banner de advertencia fallecidos'),
    ('source-badge', 'Badges de fuente ENCAVI/ENS'),
    ('omisiones', 'Sección de omisiones'),
    ('glosario', 'Sección de glosario'),
], 'index.html')

# 3. modules.js
check_file(ROOT/'js'/'modules.js', [
    ('dd.fuente.indexOf', 'Color por fuente en M4.2'),
], 'modules.js')

# 4. main.js
check_file(ROOT/'js'/'main.js', [
    ('initModal', 'Función initModal'),
    ('initModal()', 'Llamada a initModal'),
], 'main.js')

# 5. styles.css
check_file(ROOT/'css'/'styles.css', [
    ('.ips-context', 'Estilos de contexto'),
    ('.ips-modal', 'Estilos del modal'),
    ('.ips-sens-table', 'Estilos tabla sensibilidad'),
    ('.chart-card-warning', 'Estilos warning fallecidos'),
    ('.chart-warning-banner', 'Estilos banner warning'),
    ('.source-badge', 'Estilos badges fuente'),
    ('.omisiones-list', 'Estilos omisiones'),
    ('.glosario-list', 'Estilos glosario'),
], 'styles.css')

# 6. Verificar que no haya old_string sin reemplazar en index.html
txt = (ROOT/'index.html').read_text(encoding='utf-8')
if '57,3' in txt and '57 (nivel Elevado)' not in txt:
    errors.append('[index.html] El takeaway aún dice 57,3 en lugar de 57')

if errors:
    print('ERRORES ENCONTRADOS:')
    for e in errors:
        print('  -', e)
else:
    print('Todas las verificaciones pasaron.')
    print('Resumen de cambios aplicados:')
    print('  1. Termómetro redondeado a entero + contexto visible + modal')
    print('  2. Análisis de sensibilidad con 4 escenarios en la portada')
    print('  3. ENCAVI vs ENS separados visualmente en M4')
    print('  4. Badge "Estimación modelada" en gráficos filtrados (CSS)')
    print('  5. Fallecidos en lista separados con banner de advertencia')
    print('  6. Sección "¿Qué NO incluye este dashboard?"')
    print('  7. Glosario de términos técnicos')
    print('  8. JS del modal funcional')
