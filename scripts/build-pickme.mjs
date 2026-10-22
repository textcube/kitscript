import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../pickme/', import.meta.url);
const routes = JSON.parse(readFileSync(new URL('routes.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const cards = routes.filter(route => route.enabled).map(route => {
  const url = new URL(route.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid route URL');
  return `    <a class="pick-card" href="${escape(route.url)}" data-url="${escape(route.url)}" data-weight="${route.weight}" data-theme="${escape(route.theme)}">
      <img src="${escape(route.image)}" alt="" width="256" height="256" loading="lazy" decoding="async">
      <span class="weight-indicator" aria-hidden="true">LV.${route.weight}</span><span>${escape(route.label)}</span>
    </a>`;
}).join('\n');
const path = new URL('index.html', root);
const html = readFileSync(path, 'utf8');
const pattern = /<!-- BEGIN GENERATED CARDS -->[\s\S]*?<!-- END GENERATED CARDS -->/;
if (!pattern.test(html)) throw new Error('Missing static card markers');
const result = html.replace(pattern, `<!-- BEGIN GENERATED CARDS -->\n${cards}\n    <!-- END GENERATED CARDS -->`);
if (process.argv.includes('--check')) {
  if (result !== html) throw new Error('Run node scripts/build-pickme.mjs to update cards');
} else {
  writeFileSync(path, result);
}
console.log(`${cards.split('<a ').length - 1} static menu links: ${fileURLToPath(path)}`);
