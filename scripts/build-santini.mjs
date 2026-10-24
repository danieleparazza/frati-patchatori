#!/usr/bin/env node
// Builds src/data/santini/<id>.svg from data/santini.mjs: a shared frame (niche, halo, rays,
// name ribbon, Latin motto) around each saint's emblem, plus IPTC metadata marking the card
// as AI-generated. Only shapes and EB Garamond: the cards are also rendered by resvg.
//
// Usage: node scripts/build-santini.mjs [id ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import santini from '../data/santini.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'santini');
const FONT = "'EB Garamond', Georgia, serif";

const esc = (s) => s.replace(/[<>&"']/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', '"': 'quot', "'": 'apos' }[c]};`);

function metadata(id, label) {
  return `<metadata><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"><dc:title>${esc(label)}</dc:title><dc:description>Holy card for ${esc(id)}, generated with AI (Claude, Anthropic) for the Lunario dei Frati Patchatori.</dc:description><dc:rights>CC BY-SA 4.0</dc:rights></rdf:Description></rdf:RDF></x:xmpmeta></metadata>`;
}

function rays(id) {
  return Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    const [x1, y1, x2, y2] = [150 + Math.cos(a) * 78, 180 + Math.sin(a) * 78, 150 + Math.cos(a) * (i % 2 ? 104 : 116), 180 + Math.sin(a) * (i % 2 ? 104 : 116)];
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('');
}

function card(id, { label, motto, niche, accent, emblem }) {
  const p = `s-${id}`;
  const fontSize = label.length > 16 ? 17 : 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" role="img" aria-label="${esc(label)}">
${metadata(id, label)}
<defs>
  <radialGradient id="${p}-halo"><stop offset="0%" stop-color="#f5d77a" stop-opacity="0.18"/><stop offset="60%" stop-color="#f5d77a" stop-opacity="0.3"/><stop offset="72%" stop-color="#fff3c4" stop-opacity="0.75"/><stop offset="100%" stop-color="#f5d77a" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}-niche" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${niche[0]}"/><stop offset="100%" stop-color="${niche[1]}"/></linearGradient>
</defs>
<rect width="300" height="450" rx="14" fill="#fbf3dd"/>
<rect x="10" y="10" width="280" height="430" rx="10" fill="none" stroke="#b8892b" stroke-width="4"/>
<rect x="20" y="20" width="260" height="410" rx="6" fill="none" stroke="#b8892b" stroke-width="1"/>
<g fill="#b8892b"><circle cx="20" cy="20" r="4"/><circle cx="280" cy="20" r="4"/><circle cx="20" cy="430" r="4"/><circle cx="280" cy="430" r="4"/></g>
<path d="M38 330 V125 A112 112 0 0 1 262 125 V330 Z" fill="url(#${p}-niche)" stroke="#b8892b" stroke-width="2"/>
<circle cx="150" cy="180" r="112" fill="url(#${p}-halo)"/>
<g stroke="#e8c45c" stroke-width="2.5" stroke-linecap="round" opacity="0.85">${rays(id)}</g>
<circle cx="150" cy="180" r="76" fill="none" stroke="#e8c45c" stroke-width="2"/>
<g>${emblem}</g>
<path d="M28 340 h244 l-14 22 l14 22 h-244 l14 -22 z" fill="${accent}"/>
<path d="M28 340 l14 22 l-14 22" fill="none" stroke="#00000033" stroke-width="1"/>
<text x="150" y="${fontSize > 17 ? 369 : 368}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" fill="#fbf3dd">${esc(label)}</text>
<text x="150" y="414" text-anchor="middle" font-family="${FONT}" font-size="13" letter-spacing="1.5" fill="#7a6656">${esc(motto)}</text>
</svg>
`;
}

const only = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [id, def] of Object.entries(santini)) {
  if (only.length && !only.includes(id)) continue;
  writeFileSync(join(OUT, `${id}.svg`), card(id, def));
  n++;
}
console.log(`${n} santini written to src/data/santini/`);
