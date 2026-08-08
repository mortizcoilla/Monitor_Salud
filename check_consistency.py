#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verificación de consistencia HTML/JS."""

import pathlib, re

ROOT = pathlib.Path(r'C:/Workspace/Monitor_Salud')

html = (ROOT/'index.html').read_text(encoding='utf-8')
js = (ROOT/'js'/'main.js').read_text(encoding='utf-8')
core = (ROOT/'js'/'core.js').read_text(encoding='utf-8')
modules = (ROOT/'js'/'modules.js').read_text(encoding='utf-8')

# Extraer todos los IDs del HTML
ids = set(re.findall(r'id="([^"]+)"', html))

# IDs referenciados en JS via getElementById
js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js + core + modules))
js_ids.update(re.findall(r'getElementById\("([^"]+)"\)', js + core + modules))

faltantes = js_ids - ids
if faltantes:
    print('IDs referenciados en JS pero NO encontrados en HTML:')
    for i in sorted(faltantes):
        print('  -', i)
else:
    print('Todos los IDs referenciados en JS existen en HTML.')

# Verificar que los SVGs de charts existan
chart_ids = [m for m in ids if m.startswith('chart-')]
print(f'\nCharts encontrados en HTML: {len(chart_ids)}')

# Verificar estructura básica del HTML
if '<!DOCTYPE html>' in html and '</html>' in html:
    print('Estructura HTML válida: OK')
else:
    print('ERROR: Estructura HTML inválida')

# Verificar que no haya tags sin cerrar comunes
for tag in ['section', 'div', 'article']:
    abre = html.count(f'<{tag}')
    cierra = html.count(f'</{tag}>')
    if abre != cierra:
        print(f'AVISO: <{tag}> abre {abre} veces, cierra {cierra} veces')
    else:
        print(f'<{tag}>: balanceado ({abre})')

print('\nVerificación completa.')
