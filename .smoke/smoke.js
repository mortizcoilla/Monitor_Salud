/* Smoke test: carga index.html en jsdom y verifica render + rotulación de todos los SVG. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const virtualConsole = new VirtualConsole();
const consoleErrors = [];
virtualConsole.on('jsdomError', (e) => consoleErrors.push('jsdomError: ' + (e && e.message)));
virtualConsole.on('error', (m) => consoleErrors.push('console.error: ' + m));

const dom = new JSDOM(html, {
  url: 'file:///' + root.replace(/\\/g, '/') + '/index.html',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.matchMedia = function (q) {
      return { matches: false, media: q, addEventListener: function () {}, removeEventListener: function () {} };
    };
    if (window.SVGElement && !window.SVGElement.prototype.getComputedTextLength) {
      window.SVGElement.prototype.getComputedTextLength = function () {
        return (this.textContent || '').length * 6.5;
      };
    }
  }
});

const { window } = dom;

window.addEventListener('load', () => {
  setTimeout(() => {
    const doc = window.document;
    const svgs = Array.from(doc.querySelectorAll('svg[id^="chart"], svg#ips-serie-svg'));
    let vacios = 0, sinEje = 0, sinRef = 0;
    const erroresRender = Array.from(doc.querySelectorAll('.mss-error-note'));

    svgs.forEach((svg) => {
      const hijos = svg.querySelectorAll('*').length;
      const axisTitles = svg.querySelectorAll('.axis-title').length;
      if (hijos === 0) vacios++;
      if (axisTitles === 0) { sinEje++; console.log('SIN TÍTULO DE EJE: #' + svg.id); }
      if (hijos === 0) console.log('VACÍO: #' + svg.id);
    });

    // Verificar píldoras de referencia donde deben existir
    ['chart-m1-1', 'chart-m3-1', 'chart-m5-3', 'chart-m6-2', 'chart-m6-3', 'chart-m7-3', 'chart-a-2'].forEach((id) => {
      const svg = doc.getElementById(id);
      const pill = svg && svg.querySelector('rect[rx="9"]');
      if (!pill) { sinRef++; console.log('SIN PÍLDORA DE REFERENCIA: #' + id); }
    });

    // Etiquetas de punto en la serie IPS
    const ipsLabels = doc.getElementById('ips-serie-svg').querySelectorAll('text[class^="pl-"]').length;

    console.log('---');
    console.log('SVG revisados: ' + svgs.length + ' | vacíos: ' + vacios + ' | sin título de eje: ' + sinEje + ' | refs sin píldora: ' + sinRef);
    console.log('Etiquetas en serie IPS: ' + ipsLabels);
    console.log('Notas de error: ' + erroresRender.length);
    erroresRender.forEach((n) => console.log('  · ' + n.textContent.slice(0, 130)));
    console.log('Errores de consola: ' + consoleErrors.length);
    consoleErrors.slice(0, 10).forEach((e) => console.log('  · ' + e));
    process.exit(vacios || sinEje || sinRef || erroresRender.length || consoleErrors.length || ipsLabels < 4 ? 1 : 0);
  }, 500);
});
