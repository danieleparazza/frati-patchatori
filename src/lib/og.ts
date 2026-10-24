// Holy-card images, rendered with resvg:
// - share image (1200×630 JPEG): the card's art full-bleed on the left, kicker/title/subtitle/relations on the
//   right. Used as og:image for link previews.
// - back (SVG, 1080×1620): title, patronage, prayer and relations, like the back of a real holy card.
//   Embedded in the page for the full-screen flip viewer; PNG downloads are rasterized in the browser.
// Rendering is cached on disk by content hash (.cache/og), so unchanged images are not redrawn.
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { day, logoCredit, vuln, type Vuln } from './calendar';
import { demonBack, eventBack, popeBack, saintBack, vacantBack, type CardBack } from './cardback';
import { demonCardKey, eventCardKey, popeCardKey, type CalendarEvent, type Demon, type PopeEntry } from './extras';
import { t, type Lang } from './i18n';
import { SANTINO_FONT, card, escapeXml, santino, vacantSantino } from './santino';

// Relative to the project root: import.meta.url points into the bundle at build time.
const FONT = join(process.cwd(), 'src/assets/fonts/EBGaramond.ttf');
const CACHE = join(process.cwd(), '.cache/og');
const IPTC = 'http://cv.iptc.org/newscodes/digitalsourcetype/';
mkdirSync(CACHE, { recursive: true });

function wrap(text: string, maxChars: number, maxLines: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

const tspans = (lines: string[], x: number, lineHeight: number) => lines.map((l, i) => `<tspan x="${x}" dy="${i ? lineHeight : 0}">${escapeXml(l)}</tspan>`).join('');
const clip = (line: string, n: number) => (line.length > n ? `${line.slice(0, n - 1).replace(/\s*\S*$/, '')}…` : line);
/** Shrinks a font size so a line of `chars` characters fits where `maxChars` fit at `size`. */
const fit = (size: number, chars: number, maxChars: number) => (chars > maxChars ? Math.max(14, Math.floor((size * maxChars) / chars)) : size);
const innerOf = (svg: string) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/** Renders an SVG to JPEG with the XMP source tag, reusing the cached file when the input is unchanged. */
async function renderJpeg(svg: string, width: number, source: string) {
  const key = createHash('sha1').update(`jpg|${width}|${source}|${svg}`).digest('hex');
  const file = join(CACHE, `${key}.jpg`);
  if (existsSync(file)) {
    // Mark it as used, so the end-of-build prune (astro.config.mjs) keeps it.
    const now = new Date();
    utimesSync(file, now, now);
    return readFileSync(file);
  }
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'EB Garamond' } }).render().asPng();
  const out = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).withXmp(xmpPacket(source)).toBuffer();
  writeFileSync(file, out);
  return out;
}

const sourceFor = (generated: boolean, logo: boolean, hasText: boolean) =>
  generated && !logo ? 'trainedAlgorithmicMedia' : generated || hasText ? 'compositeWithTrainedAlgorithmicMedia' : 'algorithmicMedia';

// ---------- share image (layout A) ----------

function shareSvg(lang: Lang, cardSvg: string, b: CardBack) {
  const s = t(lang);
  const kickerSize = b.kicker.length > 26 ? Math.max(22, Math.floor((34 * 26) / b.kicker.length)) : 34;
  const long = b.title.length > 44;
  const [titleSize, titleLead] = long ? [46, 54] : [58, 64];
  const titleLines = wrap(b.title, long ? 30 : 24, long ? 3 : 2);
  const relations = b.relations.slice(0, 2).map((r) => clip(r, 52));
  const subtitleY = 200 + (titleLines.length - 1) * titleLead + 92;
  const bottom = relations.length ? 452 : 520;
  const subtitleLines = Math.max(1, Math.min(3, Math.floor((bottom - subtitleY) / 38) + 1));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6efe0"/>
  <svg x="0" y="0" width="470" height="630" viewBox="30 8 240 330" preserveAspectRatio="xMidYMid slice">${innerOf(cardSvg)}</svg>
  <rect x="470" y="0" width="4" height="630" fill="#b8892b"/>
  <g font-family="${SANTINO_FONT}">
    <text x="530" y="120" font-size="${kickerSize}" fill="#7a6656" letter-spacing="3">${escapeXml(b.kicker.toUpperCase())}</text>
    <text x="530" y="200" font-size="${titleSize}" fill="${b.mourning ? '#2b1d14' : '#9e1b1b'}">${tspans(titleLines, 530, titleLead)}</text>
    <text x="530" y="${subtitleY}" font-size="28" fill="#2b1d14">${tspans(wrap(b.subtitle, 46, subtitleLines), 530, 38)}</text>
    ${relations.length ? `<text x="530" y="490" font-size="23" fill="#7a1f1f">${tspans(relations, 530, 30)}</text>` : ''}
    <text x="530" y="580" font-size="${fit(24, b.footer.length + s.domain.length * 0.85 + 3, 60)}" fill="#b8892b" font-variant="small-caps">${escapeXml(b.footer)}<tspan fill="#7a6656" font-variant="normal" font-size="20">&#160;· ${escapeXml(s.domain)}</tspan></text>
  </g>
</svg>`;
}

// ---------- back (vertical) ----------

export function backSvg(lang: Lang, cardSvg: string, b: CardBack) {
  const s = t(lang);
  const italic = new Set([s.prayer, s.thanksgiving, s.reparation]);
  const title = wrap(b.title, 30, 3);
  let y = 385;
  const parts: string[] = [];
  parts.push(`<text x="540" y="${y}" font-size="54" fill="${b.mourning ? '#2b1d14' : '#9e1b1b'}">${tspans(title, 540, 62)}</text>`);
  y += (title.length - 1) * 62 + 70;
  const sub = wrap(b.subtitle, 58, 4);
  parts.push(`<text x="540" y="${y}" font-size="28" fill="#7a6656" font-style="italic">${tspans(sub, 540, 38)}</text>`);
  y += (sub.length - 1) * 38 + 95;
  for (const sec of b.sections) {
    const room = Math.floor((1330 - y) / 46);
    if (room < 3) break;
    const lines = wrap(sec.text, 50, Math.min(room - 2, 9));
    parts.push(`<text x="540" y="${y}" font-size="28" fill="#b8892b" letter-spacing="3">${escapeXml(sec.label.toUpperCase())}</text>`);
    parts.push(`<text x="540" y="${y + 52}" font-size="32" fill="#2b1d14"${italic.has(sec.label) ? ' font-style="italic"' : ''}>${tspans(lines, 540, 44)}</text>`);
    y += 52 + (lines.length - 1) * 44 + 85;
  }
  const relations = b.relations.slice(0, 4).map((r) => clip(r, 62));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1620" viewBox="0 0 1080 1620">
  <rect width="1080" height="1620" fill="#fbf3dd"/>
  <rect x="40" y="40" width="1000" height="1540" rx="18" fill="none" stroke="${b.mourning ? '#1e1e1e' : '#b8892b'}" stroke-width="${b.mourning ? 10 : 6}"/>
  <rect x="62" y="62" width="956" height="1496" rx="10" fill="none" stroke="#b8892b" stroke-width="1.5"/>
  <g fill="#b8892b"><circle cx="62" cy="62" r="7"/><circle cx="1018" cy="62" r="7"/><circle cx="62" cy="1558" r="7"/><circle cx="1018" cy="1558" r="7"/></g>
  <clipPath id="medal"><circle cx="540" cy="215" r="105"/></clipPath>
  <g clip-path="url(#medal)"><svg x="410" y="85" width="260" height="260" viewBox="74 104 152 152">${innerOf(cardSvg)}</svg></g>
  <circle cx="540" cy="215" r="105" fill="none" stroke="#b8892b" stroke-width="4"/>
  <g font-family="${SANTINO_FONT}" text-anchor="middle">
    ${parts.join('\n    ')}
    ${relations.length ? `<text x="540" y="${Math.min(y + 10, 1420 - (relations.length - 1) * 34)}" font-size="25" fill="#7a1f1f">${tspans(relations, 540, 34)}</text>` : ''}
    <text x="540" y="1478" font-size="${fit(24, b.kicker.length, 50)}" fill="#7a6656" letter-spacing="2">${escapeXml(b.kicker.toUpperCase())}</text>
    <text x="540" y="1522" font-size="${fit(26, b.footer.length + s.domain.length * 0.85 + 3, 62)}" fill="#b8892b" font-variant="small-caps">${escapeXml(b.footer)}<tspan font-variant="normal" fill="#7a6656">&#160;· ${escapeXml(s.domain)}</tspan></text>
  </g>
</svg>`;
}

// ---------- per kind ----------

/** Share image (JPEG), back (SVG markup), and the card and texts they are made from (used by embeds). */
export type Images = { share: () => Promise<Buffer>; back: () => string; card: string; info: CardBack };

function images(lang: Lang, cardSvg: string, b: CardBack, source: string): Images {
  return {
    share: () => renderJpeg(shareSvg(lang, cardSvg, b), 1200, source),
    back: () => backSvg(lang, cardSvg, b),
    card: cardSvg,
    info: b,
  };
}

export function saintImages(lang: Lang, v: Vuln, opts: { kicker?: string; mmdd?: string } = {}) {
  const c = santino(v);
  const b = saintBack(lang, v, opts);
  return images(lang, c.svg, b, sourceFor(c.generated, !!logoCredit(v.id), b.sections.length > 0));
}

/** Cover of the whole site (home pages), with Heartbleed's card as the face of the almanac. */
export function siteImages(lang: Lang) {
  const s = t(lang);
  const c = santino(vuln('heartbleed'));
  const [subtitle, more] = s.siteBlurb.split(/(?<=\.) /);
  const b: CardBack = { kicker: s.tagline, title: s.siteTitle, subtitle, sections: [], relations: [more], footer: s.siteTitle };
  return images(lang, c.svg, b, 'compositeWithTrainedAlgorithmicMedia');
}

export function dayImages(lang: Lang, mmdd: string) {
  const { patron } = day(mmdd);
  if (patron) return saintImages(lang, patron, { mmdd });
  return images(lang, vacantSantino(t(lang).vacant), vacantBack(lang, mmdd), 'algorithmicMedia');
}

export function eventImages(lang: Lang, e: CalendarEvent) {
  const c = card(eventCardKey(e), e.name, e.type, e.date.slice(0, 4));
  const b = eventBack(lang, e);
  return images(lang, c.svg, b, sourceFor(c.generated, false, b.sections.length > 0));
}

export function demonImages(lang: Lang, d: Demon) {
  const c = card(demonCardKey(d), d.name, 'demone', String(d.firstSeen.year));
  const b = demonBack(lang, d);
  return images(lang, c.svg, b, sourceFor(c.generated, false, b.sections.length > 0));
}

export function popeImages(lang: Lang, p: PopeEntry) {
  const c = card(popeCardKey(p.key), p.vuln.name, 'papa', p.kind === 'year' ? p.key : p.label);
  const b = popeBack(lang, p);
  return images(lang, c.svg, b, sourceFor(c.generated, false, b.sections.length > 0));
}

/** XMP packet with the IPTC digital source type and the license. */
function xmpPacket(source: string) {
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" Iptc4xmpExt:DigitalSourceType="${IPTC}${source}" xmpRights:WebStatement="https://creativecommons.org/licenses/by-nc-sa/4.0/"><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">CC BY-NC-SA 4.0</rdf:li></rdf:Alt></dc:rights></rdf:Description></rdf:RDF></x:xmpmeta>`;
}
