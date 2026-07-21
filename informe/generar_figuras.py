# -*- coding: utf-8 -*-
"""
Figuras del Monitor Socioeconómico de la Salud en Chile.
Todas las cifras provienen de los archivos de verificación de fuentes primarias
(C:/Workspace/Monitor_Salud/fuentes/*.md). Paleta sobria: azules, grises, acento ámbar/rojo.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figuras")
os.makedirs(OUT, exist_ok=True)

AZUL = "#1f4e79"
AZUL_MED = "#2e75b6"
AZUL_CLARO = "#9dc3e6"
GRIS = "#7f7f7f"
GRIS_CLARO = "#d9d9d9"
AMBAR = "#e8a33d"
ROJO = "#c00000"

plt.rcParams.update({
    "font.size": 10,
    "axes.titlesize": 12,
    "axes.titleweight": "bold",
    "axes.edgecolor": GRIS,
    "axes.grid": True,
    "grid.color": "#e6e6e6",
    "grid.linewidth": 0.7,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
})

def pie(fig, texto):
    fig.text(0.01, 0.01, texto, fontsize=7.5, color=GRIS, ha="left", va="bottom", wrap=True)

# ---------------------------------------------------------------------------
# FIG 1 — Gasto en salud % PIB: serie Chile 2010-2023 + comparación pares 2023
# ---------------------------------------------------------------------------
anios = list(range(2010, 2024))
che_pib = [6.82, 6.80, 7.02, 7.48, 7.84, 8.35, 8.56, 9.09, 9.15, 9.31, 9.70, 9.72, 10.01, 10.17]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.4), gridspec_kw={"width_ratios": [3, 2]})
ax1.plot(anios, che_pib, color=AZUL, marker="o", lw=2.2, ms=4.5, label="Chile (CHE % PIB)")
ax1.axhline(9.3, color=AMBAR, ls="--", lw=1.6, label="Promedio OCDE: 9,3% (2024)")
ax1.fill_between(anios, che_pib, color=AZUL_CLARO, alpha=0.25)
ax1.set_title("Gasto corriente en salud, % del PIB (2010-2023)")
ax1.set_ylabel("% del PIB")
ax1.set_xticks(anios)
ax1.set_xticklabels(anios, rotation=45)
ax1.set_ylim(6, 11)
ax1.legend(loc="upper left", fontsize=8.5, frameon=False)
ax1.annotate("10,17", (2023, 10.17), textcoords="offset points", xytext=(6, 6),
             fontsize=9, color=AZUL, fontweight="bold")

paises = ["Chile", "Argentina", "Brasil", "Colombia", "Costa\nRica", "México"]
che = [10.17, 10.27, 9.73, 8.16, 6.87, 5.50]
oop = [34.59, 24.47, 26.23, 14.63, 24.13, 41.24]
x = np.arange(len(paises))
b1 = ax2.bar(x - 0.2, che, width=0.4, color=AZUL_MED, label="CHE % PIB 2023")
b2 = ax2.bar(x + 0.2, oop, width=0.4, color=AMBAR, label="OOP % CHE 2023")
ax2.bar_label(b1, fmt="%.1f", fontsize=7.5, padding=2)
ax2.bar_label(b2, fmt="%.1f", fontsize=7.5, padding=2)
ax2.set_title("Chile vs pares regionales (2023)")
ax2.set_xticks(x)
ax2.set_xticklabels(paises, fontsize=8)
ax2.set_ylim(0, 48)
ax2.legend(fontsize=8, frameon=False)

fig.suptitle("Figura 1. Evolución del gasto en salud y comparación regional", fontsize=13, fontweight="bold", y=0.99)
fig.tight_layout(rect=[0, 0.05, 1, 0.95])
pie(fig, "Fuente: Banco Mundial — World Development Indicators / OMS GHED (indicadores SH.XPD.CHEX.GD.ZS y SH.XPD.OOPC.CH.ZS), serie actualizada 13-jul-2026; "
         "línea OCDE: OECD — Health at a Glance 2025: Chile, 13-nov-2025. https://api.worldbank.org/v2/country/CHL/indicator/SH.XPD.CHEX.GD.ZS")
fig.savefig(os.path.join(OUT, "fig1_gasto_pib_serie.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 2 — Descomposición del financiamiento: público / privado / OOP 2010-2023
# ---------------------------------------------------------------------------
anios2 = [2010, 2012, 2014, 2016, 2018, 2019, 2020, 2021, 2022, 2023]
pub = [47.10, 47.94, 47.74, 49.65, 51.24, 51.26, 56.51, 53.66, 50.88, 51.61]
priv = [52.89, 52.06, 52.26, 50.35, 48.76, 48.74, 43.49, 46.34, 49.12, 48.39]
oop2 = [34.47, 33.41, 34.27, 34.75, 32.70, 32.34, 29.04, 32.63, 35.60, 34.59]

fig, ax = plt.subplots(figsize=(9.5, 4.8))
ax.bar(anios2, pub, color=AZUL, label="Financiamiento público/obligatorio (% CHE)")
ax.bar(anios2, priv, bottom=pub, color=GRIS_CLARO, edgecolor=GRIS, lw=0.4, label="Financiamiento privado (% CHE)")
ax.plot(anios2, oop2, color=ROJO, marker="o", ms=5, lw=2, label="Gasto de bolsillo OOP (% CHE)")
for xi, yi in zip(anios2, oop2):
    ax.annotate(f"{yi:.1f}", (xi, yi), textcoords="offset points", xytext=(0, 9),
                ha="center", fontsize=7.8, color=ROJO)
ax.set_ylim(0, 110)
ax.set_ylabel("% del gasto corriente en salud (CHE)")
ax.set_xticks(anios2)
ax.set_title("Figura 2. Descomposición del financiamiento del gasto en salud, Chile 2010-2023")
ax.legend(loc="lower right", fontsize=8.5, frameon=True, framealpha=0.9)
fig.tight_layout(rect=[0, 0.06, 1, 1])
pie(fig, "Fuente: Banco Mundial — WDI/OMS GHED, indicadores SH.XPD.GHED.CH.ZS, SH.XPD.PVTD.CH.ZS y SH.XPD.OOPC.CH.ZS, consulta 13-jul-2026. "
         "Las cotizaciones obligatorias (7%) de FONASA e isapres se contabilizan dentro del financiamiento obligatorio/público según SHA 2011.")
fig.savefig(os.path.join(OUT, "fig2_descomposicion_financiamiento.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 3 — Previsión de salud por decil de ingreso autónomo (CASEN 2024)
# ---------------------------------------------------------------------------
deciles = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
fonasa = [95.4, 95.3, 94.1, 93.0, 91.2, 87.5, 82.8, 74.3, 57.4, 27.1]
isapre = [1.7, 1.1, 2.1, 2.8, 4.4, 7.6, 12.2, 20.1, 38.1, 69.4]
ninguno = [2.1, 2.5, 2.4, 2.5, 2.1, 2.1, 1.9, 1.6, 1.0, 0.8]

fig, ax = plt.subplots(figsize=(9.5, 5))
x = np.arange(len(deciles))
ax.bar(x, fonasa, color=AZUL, label="FONASA (sistema público)")
ax.bar(x, isapre, bottom=fonasa, color=AMBAR, label="Isapre")
ax.bar(x, ninguno, bottom=[f + i for f, i in zip(fonasa, isapre)], color=GRIS, label="Ninguno / particular")
for i, (f, is_) in enumerate(zip(fonasa, isapre)):
    ax.text(i, f / 2, f"{f:.1f}", ha="center", va="center", color="white", fontsize=8, fontweight="bold")
    if is_ >= 7:
        ax.text(i, f + is_ / 2, f"{is_:.1f}", ha="center", va="center", color="#5c4400", fontsize=8, fontweight="bold")
ax.set_xticks(x)
ax.set_xticklabels(deciles)
ax.set_xlabel("Decil de ingreso autónomo (I = más pobre, X = más rico)")
ax.set_ylabel("% de la población del decil")
ax.set_ylim(0, 108)
ax.set_title("Figura 3. Previsión de salud declarada por decil de ingreso, Chile 2024")
ax.legend(loc="upper center", ncol=3, fontsize=9, frameon=False)
fig.tight_layout(rect=[0, 0.06, 1, 1])
pie(fig, "Fuente: MDSF, Observatorio Social — Salud_Casen_2024.xlsx, Tabla 7 (distribución según decil de ingreso autónomo), publicado enero 2026. "
         "Previsión declarada por jefe de hogar. https://observatorio.ministeriodesarrollosocial.gob.cl/storage/docs/casen/2024/Salud_Casen_2024.xlsx")
fig.savefig(os.path.join(OUT, "fig3_prevision_decil_casen2024.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 4 — Listas de espera: medianas CNE/IQ y garantías GES retrasadas
# ---------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.4))
etiq = ["2021", "dic-2023", "jun-2024", "dic-2024", "dic-2025"]
cne = [547, 240, 255, 263, 226]
iq = [661, np.nan, 305, 294, 251]
x = np.arange(len(etiq))
ax1.plot(x, cne, color=AZUL, marker="o", lw=2.2, label="Consulta nueva de especialidad (CNE)")
ax1.plot(x, iq, color=ROJO, marker="s", lw=2.2, label="Intervención quirúrgica (IQ)")
ax1.axhline(200, color=AMBAR, ls="--", lw=1.6, label="Meta MINSAL: < 200 días (2026)")
for xi, yi in zip(x, cne):
    ax1.annotate(f"{yi:.0f}", (xi, yi), textcoords="offset points", xytext=(0, 8), ha="center", fontsize=8, color=AZUL)
for xi, yi in zip(x, iq):
    if not np.isnan(yi):
        ax1.annotate(f"{yi:.0f}", (xi, yi), textcoords="offset points", xytext=(0, -14), ha="center", fontsize=8, color=ROJO)
ax1.set_xticks(x)
ax1.set_xticklabels(etiq, fontsize=8.5)
ax1.set_ylabel("Mediana de espera (días)")
ax1.set_title("Mediana de espera No GES (red pública)")
ax1.legend(fontsize=8, frameon=False)
ax1.set_ylim(0, 750)

anios_ges = [2021, 2022, 2023, 2024, 2025]
ges = [54333, 61191, 70440, 77107, 78594]
bars = ax2.bar(anios_ges, ges, color=[AZUL_MED, AZUL_MED, AZUL_MED, AZUL_MED, ROJO])
ax2.bar_label(bars, fmt="{:,.0f}".format, fontsize=8, padding=2)
ax2.set_title("Garantías GES retrasadas (cierre de cada año)")
ax2.set_ylabel("Garantías de oportunidad retrasadas")
ax2.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, p: f"{v:,.0f}"))
ax2.set_ylim(0, 90000)
ax2.set_xticks(anios_ges)

fig.suptitle("Figura 4. Listas de espera en la red pública: tiempos y garantías incumplidas", fontsize=13, fontweight="bold", y=0.99)
fig.tight_layout(rect=[0, 0.05, 1, 0.95])
pie(fig, "Fuente: MINSAL — Informe Glosa 06, IV trimestre 2024 (Oficio CP N°2169/2025) e Informe Glosa 06, IV trimestre 2025 (Tablas 1 y 9, corte 31-12-2025, publicado 10-02-2026); "
         "BCN ATP, ago-2024 (medianas 2023 / jun-2024). https://www.minsal.cl/wp-content/uploads/2026/02/Glosa-06-LE-IV-trimestre.pdf")
fig.savefig(os.path.join(OUT, "fig4_listas_espera.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 5 — Capital humano y capacidad: Chile vs OCDE
# ---------------------------------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(11, 3.8))
datos = [
    ("Médicos (por 1.000 hab.)", 3.3, 3.9, "Chile: licenciados* / OCDE: en ejercicio"),
    ("Enfermeras en ejercicio (por 1.000 hab.)", 4.4, 9.2, ""),
    ("Camas hospitalarias (por 1.000 hab.)", 1.9, 4.2, "Promedio OCDE: 2023"),
]
for ax, (titulo, chile, ocde, nota) in zip(axes, datos):
    bars = ax.bar(["Chile", "Promedio\nOCDE"], [chile, ocde], color=[AZUL, GRIS_CLARO], edgecolor=[AZUL, GRIS], width=0.55)
    ax.bar_label(bars, fmt="%.1f", fontsize=10, fontweight="bold", padding=3)
    ax.set_title(titulo, fontsize=10)
    ax.set_ylim(0, max(chile, ocde) * 1.28)
    if nota:
        ax.text(0.5, -0.22, nota, transform=ax.transAxes, ha="center", fontsize=7.5, color=GRIS)
fig.suptitle("Figura 5. Dotación de capital humano y camas: Chile vs promedio OCDE", fontsize=13, fontweight="bold", y=1.0)
fig.tight_layout(rect=[0, 0.08, 1, 0.96])
pie(fig, "Fuente: OCDE — Panorama de la salud 2025 (Health at a Glance 2025), nota país Chile, 13-11-2025; promedio OCDE camas: capítulo «Hospital beds and occupancy». "
         "* La cifra chilena de médicos (3,3) cuenta licencias y sobrestima el stock efectivo: la brecha real frente al 3,9 OCDE (en ejercicio) es mayor. "
         "https://www.oecd.org/es/publications/panorama-de-la-salud-2025_5345f1bd-es/chile_9be8a790-es.html")
fig.savefig(os.path.join(OUT, "fig5_capital_humano_ocde.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 6 — Protección financiera: gasto catastrófico y dificultad financiera
# ---------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.4))
anios_cat = [2006, 2011, 2016]
cat10 = [9.19, 11.35, 14.60]
cat25 = [1.91, 2.11, 2.08]
ax1.plot(anios_cat, cat10, color=ROJO, marker="o", lw=2.2, ms=6, label="OOP > 10% del presupuesto del hogar")
ax1.plot(anios_cat, cat25, color=AZUL, marker="s", lw=2.2, ms=6, label="OOP > 25% del presupuesto del hogar")
for xi, yi in zip(anios_cat, cat10):
    ax1.annotate(f"{yi:.1f}%", (xi, yi), textcoords="offset points", xytext=(0, 9), ha="center", fontsize=9, color=ROJO)
for xi, yi in zip(anios_cat, cat25):
    ax1.annotate(f"{yi:.1f}%", (xi, yi), textcoords="offset points", xytext=(0, -15), ha="center", fontsize=9, color=AZUL)
ax1.set_title("Gasto catastrófico en salud (ODS 3.8.2 clásico)")
ax1.set_ylabel("% de la población")
ax1.set_xticks(anios_cat)
ax1.set_ylim(0, 18)
ax1.legend(fontsize=8, frameon=False)

quint = ["Q1\n(más pobre)", "Q2", "Q3", "Q4", "Q5\n(más rico)"]
hard = [59.8, 15.1, 5.3, 3.4, 3.4]
bars = ax2.bar(quint, hard, color=[ROJO, AMBAR, AZUL_MED, AZUL_MED, AZUL])
ax2.bar_label(bars, fmt="%.1f%%", fontsize=9, fontweight="bold", padding=2)
ax2.set_title("Dificultad financiera por salud, 2021 (nueva def. ODS 3.8.2)")
ax2.set_ylabel("% de la población del quintil")
ax2.set_ylim(0, 70)

fig.suptitle("Figura 6. Protección financiera: gasto catastrófico y dificultad financiera por quintil", fontsize=13, fontweight="bold", y=0.99)
fig.tight_layout(rect=[0, 0.05, 1, 0.95])
pie(fig, "Fuente: OMS — Global Health Observatory, indicadores FINPROTECTION_CATA_TOT_10_POP, FINPROTECTION_CATA_TOT_25_POP (base OMS/Banco Mundial, calculada sobre EPF-INE) "
         "y FINANCIALHARDSHIP_PROPORTIONOFPOP (nueva definición ODS 3.8.2, 2025), consulta vía https://ghoapi.azureedge.net")
fig.savefig(os.path.join(OUT, "fig6_proteccion_financiera.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------------------
# FIG 7 — Gradiente socioeconómico: presupuesto en salud por quintil (EPF IX)
#         y calidad de vida por quintil (ENCAVI 2023-2024)
# ---------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.2))
quint5 = ["I", "II", "III", "IV", "V"]
epf = [6.3, 7.6, 8.1, 8.8, 8.0]
bars = ax1.bar(quint5, epf, color=AZUL_MED)
bars[3].set_color(AZUL)
ax1.bar_label(bars, fmt="%.1f%%", fontsize=9, padding=2)
ax1.axhline(7.9, color=AMBAR, ls="--", lw=1.6, label="Promedio nacional: 7,9%")
ax1.set_title("Participación de salud en el presupuesto\ndel hogar por quintil de ingreso (EPF IX)")
ax1.set_xlabel("Quintil de ingreso (I = menor)")
ax1.set_ylabel("% del gasto total del hogar")
ax1.set_ylim(0, 10.5)
ax1.legend(fontsize=8, frameon=False)

labels2 = ["Quintil 1\n(más pobre)", "Nacional", "Quintil 5\n(más rico)"]
vals2 = [63.3, 68.5, 89.2]
bars2 = ax2.bar(labels2, vals2, color=[ROJO, GRIS, AZUL], width=0.55)
ax2.bar_label(bars2, fmt="%.1f%%", fontsize=10, fontweight="bold", padding=3)
ax2.set_title("Calidad de vida «buena o muy buena»\n(ENCAVI 2023-2024)")
ax2.set_ylabel("% de la población")
ax2.set_ylim(0, 100)

fig.suptitle("Figura 7. Gradiente socioeconómico de la salud en los hogares", fontsize=13, fontweight="bold", y=0.99)
fig.tight_layout(rect=[0, 0.05, 1, 0.95])
pie(fig, "Fuentes: INE — Síntesis de resultados IX EPF (oct-2023), p.10 (quintiles) y Tabla 15 (promedio nacional); "
         "ENCAVI 2023-2024 (MINSAL/DESUC-UC, presentación oficial 11-08-2025, vía Radio Cooperativa 12-08-2025). "
         "https://www.ine.gob.cl/docs/default-source/encuesta-de-presupuestos-familiares/")
fig.savefig(os.path.join(OUT, "fig7_gradiente_socioeconomico.png"), dpi=160, bbox_inches="tight")
plt.close(fig)

print("Figuras generadas en:", OUT)
for f in sorted(os.listdir(OUT)):
    print(" -", f, os.path.getsize(os.path.join(OUT, f)), "bytes")
