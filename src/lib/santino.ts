import { santinoSvg, type Vuln } from './calendar';

// Santini are 300×450 SVGs. They are rendered both in the browser and by resvg (for the PNGs),
// where the only font available is EB Garamond: use shapes and that font only, no emoji.
export const SANTINO_FONT = "'EB Garamond', Georgia, serif";

export function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', '"': 'quot', "'": 'apos' }[c]};`);
}

const ACCENTS = {
  santo: '#9e1b1b',
  beato: '#2f5d8a',
  padre: '#5b3a7a',
  flagello: '#4a4a4a',
  miracolo: '#b8892b',
  demone: '#7a1f1f',
  papa: '#9e1b1b',
} as const;

/** Provisional holy card drawn from a template: halo, initial, name ribbon. */
export function placeholderCard(key: string, label: string, kind: keyof typeof ACCENTS, subtitle: string) {
  const accent = ACCENTS[kind];
  const initial = [...label.replace(/[^\p{L}\p{N}]/gu, '')][0]?.toUpperCase() ?? '?';
  const name = label.length > 22 ? `${label.slice(0, 21)}…` : label;
  const halo = `halo-${key}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" role="img" aria-label="${escapeXml(label)}">
  <defs><radialGradient id="${halo}"><stop offset="55%" stop-color="#f5d77a" stop-opacity="0.9"/><stop offset="100%" stop-color="#f5d77a" stop-opacity="0"/></radialGradient></defs>
  <rect width="300" height="450" rx="14" fill="#fbf3dd"/>
  <rect x="10" y="10" width="280" height="430" rx="10" fill="none" stroke="#b8892b" stroke-width="4"/>
  <rect x="20" y="20" width="260" height="410" rx="6" fill="none" stroke="#b8892b" stroke-width="1"/>
  <circle cx="150" cy="170" r="105" fill="url(#${halo})"/>
  <circle cx="150" cy="170" r="70" fill="none" stroke="#d9ad55" stroke-width="3"/>
  <text x="150" y="200" text-anchor="middle" font-family="${SANTINO_FONT}" font-size="90" fill="${accent}">${escapeXml(initial)}</text>
  <path d="M30 340 h240 l-14 22 l14 22 h-240 l14 -22 z" fill="${accent}"/>
  <text x="150" y="369" text-anchor="middle" font-family="${SANTINO_FONT}" font-size="20" fill="#fbf3dd">${escapeXml(name)}</text>
  <text x="150" y="412" text-anchor="middle" font-family="${SANTINO_FONT}" font-size="14" fill="#7a6656">${escapeXml(subtitle)}</text>
</svg>`;
}

export function provisionalSantino(v: Vuln) {
  return placeholderCard(v.id, v.name, v.category, v.cves[0] ?? v.date.slice(0, 4));
}

/** Card by key (f-<id>, m-<id>, d-<id>, papa-<key>): the generated one if present, otherwise a placeholder. */
export function card(key: string, label: string, kind: keyof typeof ACCENTS, subtitle: string) {
  const svg = santinoSvg(key);
  return { svg: svg ?? placeholderCard(key, label, kind, subtitle), generated: !!svg };
}

/** Empty holy card for days without a patron ("sede vacante"). */
export function vacantSantino(label: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" role="img" aria-label="${escapeXml(label)}">
  <rect width="300" height="450" rx="14" fill="#fbf3dd"/>
  <rect x="10" y="10" width="280" height="430" rx="10" fill="none" stroke="#b8892b" stroke-width="4"/>
  <rect x="20" y="20" width="260" height="410" rx="6" fill="none" stroke="#b8892b" stroke-width="1" stroke-dasharray="6 6"/>
  <circle cx="150" cy="170" r="70" fill="none" stroke="#d9ad55" stroke-width="3" stroke-dasharray="10 8"/>
  <text x="150" y="200" text-anchor="middle" font-family="${SANTINO_FONT}" font-size="90" fill="#d9ad55">?</text>
  <text x="150" y="369" text-anchor="middle" font-family="${SANTINO_FONT}" font-size="20" fill="#7a6656">${escapeXml(label)}</text>
</svg>`;
}

/** The holy card for a vulnerability: the AI-generated one if present, otherwise the template. */
export function santino(v: Vuln) {
  const svg = santinoSvg(v.id);
  return { svg: svg ?? provisionalSantino(v), generated: !!svg };
}
