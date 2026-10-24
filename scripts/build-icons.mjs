// App icons for the PWA and iOS home screen, drawn from the favicon's halo-and-padlock-cross mark:
// public/icons/icon-<size>.png (mark on a parchment square), maskable-512.png (mark inside the 80% safe
// zone) and apple-touch-icon.png (180, no transparency). Run: node scripts/build-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const mark = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8').replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/** The mark (32×32 viewBox) scaled to `scale` of the icon, centred on a parchment background. */
function icon(scale) {
  const size = 32 * scale;
  const offset = (32 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fbf3dd"/><g transform="translate(${offset} ${offset}) scale(${scale})">${mark}</g></svg>`;
}

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
for (const size of [192, 512]) writeFileSync(join(ROOT, `public/icons/icon-${size}.png`), png(icon(0.8), size));
writeFileSync(join(ROOT, 'public/icons/maskable-512.png'), png(icon(0.62), 512));
writeFileSync(join(ROOT, 'public/icons/apple-touch-icon.png'), png(icon(0.74), 180));
console.log('icons written to public/icons/');
