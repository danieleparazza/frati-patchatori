#!/usr/bin/env node
// Builds src/data/santini/<id>.svg from data/santini/<id>.json: a shared frame (niche, halo, rays,
// name ribbon, Latin motto) around each emblem, plus IPTC metadata marking the card as AI-generated.
// Only shapes and EB Garamond: the cards are also rendered by resvg for the share images.
//
// Definition: { label, motto, niche: [top, bottom], accent, emblem (SVG fragment), frame? }
// frame: "santo" (default) | "papa" | "demone" | "flagello" | "flagello-grave" | "miracolo".
// Emblems are drawn around the halo centre (150,180), roughly inside x 90–210, y 115–250.
//
// Usage: node scripts/build-santini.mjs [id ...]
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'data', 'santini');
const OUT = join(ROOT, 'src', 'data', 'santini');
const FONT = "'EB Garamond', Georgia, serif";
// Official logos (CC0) replace the drawn emblem on the cards of these ids.
const LOGOS = JSON.parse(readFileSync(join(ROOT, 'data', 'logos.json'), 'utf8'));
const VULNS = new Map(JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'vulns.json'), 'utf8')).map((v) => [v.id, v]));

const esc = (s) => s.replace(/[<>&"']/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', '"': 'quot', "'": 'apos' }[c]};`);

// Colours and decorations per frame.
const FRAMES = {
  santo: { card: '#fbf3dd', border: '#b8892b', ray: '#e8c45c', glow: ['#f5d77a', '#fff3c4'], motto: '#7a6656', rays: 16 },
  papa: { card: '#fdf6e3', border: '#b8892b', ray: '#f1d27a', glow: ['#f5d77a', '#fffbe6'], motto: '#7a6656', rays: 24 },
  demone: { card: '#1c1214', border: '#a8321e', ray: '#c0392b', glow: ['#c0392b', '#ff7b54'], motto: '#d9a38f', rays: 0 },
  flagello: { card: '#ece7dd', border: '#5a5248', ray: '#9a9086', glow: ['#9a9086', '#d8d0c4'], motto: '#5a5248', rays: 8 },
  'flagello-grave': { card: '#efede8', border: '#1e1e1e', ray: '#000000', glow: ['#777777', '#bbbbbb'], motto: '#3a3a3a', rays: 0 },
  miracolo: { card: '#fffdf3', border: '#d4a017', ray: '#f7d24a', glow: ['#ffe680', '#ffffff'], motto: '#8a6d1f', rays: 32 },
};

function metadata(id, label, logo) {
  const source = logo ? 'compositeWithTrainedAlgorithmicMedia' : 'trainedAlgorithmicMedia';
  const desc = logo
    ? `Holy card for ${esc(id)}: official logo by ${esc(logo.author ?? 'its authors')} (${esc(logo.license)}), frame generated with AI (Claude, Anthropic).`
    : `Holy card for ${esc(id)}, generated with AI (Claude, Anthropic) for the Lunario dei Frati Patchatori.`;
  return `<metadata><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/${source}"><dc:title>${esc(label)}</dc:title><dc:description>${desc}</dc:description><dc:rights>CC BY-NC-SA 4.0${logo ? `; logo ${esc(logo.license)}` : ''}</dc:rights></rdf:Description></rdf:RDF></x:xmpmeta></metadata>`;
}

function logoEmblem(logo) {
  const data = readFileSync(join(ROOT, 'src', 'assets', 'logos', logo.file)).toString('base64');
  const type = logo.file.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  // Some logo files draw outside their own box or carry wide margins: clip to the disc, zoom via "scale".
  const z = logo.scale ?? 1;
  const size = 92 * z;
  return `<defs><clipPath id="logo-clip-${logo.file.replace(/\W/g, '')}"><circle cx="150" cy="182" r="60"/></clipPath></defs><circle cx="150" cy="182" r="62" fill="#fbf3dd" stroke="#d9ad55" stroke-width="2"/><image href="data:${type};base64,${data}" x="${150 - size / 2}" y="${182 - size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" clip-path="url(#logo-clip-${logo.file.replace(/\W/g, '')})"/>`;
}

function rays(n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    const outer = i % 2 ? 104 : 116;
    const [x1, y1, x2, y2] = [150 + Math.cos(a) * 78, 180 + Math.sin(a) * 78, 150 + Math.cos(a) * outer, 180 + Math.sin(a) * outer];
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('');
}

// Extra decorations drawn over the frame.
const flames = `<g fill="#e4572e">${Array.from({ length: 9 }, (_, i) => {
  const x = 30 + i * 30;
  return `<path d="M${x - 11} 34 Q${x - 7} 16 ${x} 6 Q${x + 2} 20 ${x + 11} 34 Z"/>`;
}).join('')}</g><g fill="#f4a261">${Array.from({ length: 9 }, (_, i) => {
  const x = 30 + i * 30;
  return `<path d="M${x - 5} 34 Q${x - 3} 24 ${x} 18 Q${x + 2} 25 ${x + 5} 34 Z"/>`;
}).join('')}</g>`;

const tiara = `<g transform="translate(150 58) scale(0.85)">
  <path d="M-26 22 C-26 -2 -14 -22 0 -26 C14 -22 26 -2 26 22 Z" fill="#fdf6e3" stroke="#b8892b" stroke-width="2"/>
  <rect x="-28" y="16" width="56" height="7" rx="2" fill="#d4a017"/>
  <rect x="-24" y="4" width="48" height="5" rx="2" fill="#d4a017"/>
  <rect x="-18" y="-8" width="36" height="5" rx="2" fill="#d4a017"/>
  <circle cy="-28" r="4" fill="#d4a017"/><path d="M0 -36 V-30 M-3 -33 H3" stroke="#d4a017" stroke-width="2"/>
</g>`;

function card(id, def) {
  const logo = LOGOS[id];
  const f = FRAMES[def.frame ?? 'santo'];
  if (!f) throw new Error(`${id}: unknown frame ${def.frame}`);
  const p = `s-${id}`;
  const fontSize = def.label.length > 16 ? 17 : 20;
  const grave = def.frame === 'flagello-grave';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" role="img" aria-label="${esc(def.label)}">
${metadata(id, def.label, logo)}
<defs>
  <radialGradient id="${p}-halo"><stop offset="0%" stop-color="${f.glow[0]}" stop-opacity="0.18"/><stop offset="60%" stop-color="${f.glow[0]}" stop-opacity="0.3"/><stop offset="72%" stop-color="${f.glow[1]}" stop-opacity="0.75"/><stop offset="100%" stop-color="${f.glow[0]}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}-niche" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${def.niche[0]}"/><stop offset="100%" stop-color="${def.niche[1]}"/></linearGradient>
</defs>
<rect width="300" height="450" rx="14" fill="${f.card}"/>
<rect x="10" y="10" width="280" height="430" rx="10" fill="none" stroke="${f.border}" stroke-width="${grave ? 8 : 4}"/>
<rect x="20" y="20" width="260" height="410" rx="6" fill="none" stroke="${f.border}" stroke-width="1"/>
<g fill="${f.border}"><circle cx="20" cy="20" r="4"/><circle cx="280" cy="20" r="4"/><circle cx="20" cy="430" r="4"/><circle cx="280" cy="430" r="4"/></g>
<path d="M38 330 V125 A112 112 0 0 1 262 125 V330 Z" fill="url(#${p}-niche)" stroke="${f.border}" stroke-width="2"/>
${grave ? '' : `<circle cx="150" cy="180" r="112" fill="url(#${p}-halo)"/>`}
${f.rays ? `<g stroke="${f.ray}" stroke-width="2.5" stroke-linecap="round" opacity="0.85">${rays(f.rays)}</g>` : ''}
<circle cx="150" cy="180" r="76" fill="none" stroke="${f.ray}" stroke-width="2"/>
<g>${logo ? logoEmblem(logo) : def.emblem}</g>
${def.frame === 'demone' ? flames : ''}
${def.frame === 'papa' ? tiara : ''}
<path d="M28 340 h244 l-14 22 l14 22 h-244 l14 -22 z" fill="${def.accent}"/>
<text x="150" y="${fontSize > 17 ? 369 : 368}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" fill="#fbf3dd">${esc(def.label)}</text>
<text x="150" y="414" text-anchor="middle" font-family="${FONT}" font-size="13" letter-spacing="1.5" fill="${f.motto}">${esc(def.motto)}</text>
</svg>
`;
}

const only = new Set(process.argv.slice(2));
mkdirSync(OUT, { recursive: true });
let n = 0;
const defs = new Map(readdirSync(SRC).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), join(SRC, f)]));
// Logo cards don't need a hand-written definition: default label and motto.
for (const id of Object.keys(LOGOS).filter((k) => !k.startsWith('$') && !defs.has(k))) defs.set(id, null);
for (const [id, path] of [...defs].sort()) {
  if (only.size && !only.has(id)) continue;
  const def = path ? JSON.parse(readFileSync(path, 'utf8')) : { label: VULNS.get(id)?.name ?? id, motto: 'IMAGO OFFICIALIS', niche: ['#2a2a3a', '#545470'], accent: '#45455e', emblem: '' };
  writeFileSync(join(OUT, `${id}.svg`), card(id, def));
  n++;
}
console.log(`${n} santini written to src/data/santini/`);
