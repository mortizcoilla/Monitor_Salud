/* Test de filtros: aplica los 4 filtros y verifica el redibujado de los charts filterables. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: 'file:///' + root.replace(/\\/g, '/') + '/index.html',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
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

dom.window.addEventListener('load', () => {
  setTimeout(() => {
    const w = dom.window;
    const errs = [];
    const orig = w.console.error;
    w.console.error = (...a) => { errs.push(a.join(' ')); orig(...a); };

    w.MSS.filters.setFilter('quintil', 'Q1');
    w.MSS.filters.setFilter('edad', '65+');
    w.MSS.filters.setFilter('tramo', 'B');
    w.MSS.filters.setFilter('region', 'Norte');

    const ids = ['chart-m2-2', 'chart-m3-1', 'chart-m3-3', 'chart-m4-3', 'chart-m5-1',
      'chart-m5-2', 'chart-m5-3', 'chart-m5-4', 'chart-a-4'];
    let vacios = 0;
    ids.forEach((id) => {
      const n = w.document.getElementById(id).querySelectorAll('*').length;
      if (!n) vacios++;
      console.log((n ? 'OK    ' : 'VACÍO ') + '#' + id + ' (' + n + ' nodos)');
    });
    console.log('---');
    console.log('errores en redibujado: ' + errs.length);
    errs.forEach((e) => console.log('  · ' + e));
    console.log('vacíos tras filtros: ' + vacios);
    process.exit(errs.length || vacios ? 1 : 0);
  }, 500);
});
