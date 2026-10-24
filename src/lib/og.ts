// Share images (1200×630 PNG), the "complete holy card": card on the left, kicker, title and subtitle on
// the right. Used as og:image for previews, for the download button and for the full-screen view.
import { Resvg } from '@resvg/resvg-js';
import { crc32 } from 'node:zlib';
import { join } from 'node:path';
import { day, dayLabel, formatDate, logoCredit, saint, saintTitle, type Vuln } from './calendar';
import { demonCardKey, demonText, eventCardKey, eventText, popeCardKey, popeText, type CalendarEvent, type Demon, type PopeEntry } from './extras';
import { t, type Lang } from './i18n';
import { SANTINO_FONT, card, escapeXml, santino, vacantSantino } from './santino';

// Relative to the project root: import.meta.url points into the bundle at build time.
const FONT = join(process.cwd(), 'src/assets/fonts/EBGaramond.ttf');
const IPTC = 'http://cv.iptc.org/newscodes/digitalsourcetype/';

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

function tspans(lines: string[], x: number, lineHeight: number) {
  return lines.map((l, i) => `<tspan x="${x}" dy="${i ? lineHeight : 0}">${escapeXml(l)}</tspan>`).join('');
}

type ShareParts = { kicker: string; title: string; subtitle: string; cardSvg: string; source: string; footer: string; titleColor?: string };

/** Composes a 1200×630 share image: holy card on the left, kicker, title and subtitle on the right. */
function compose({ kicker, title, subtitle, cardSvg, source, footer, titleColor = '#9e1b1b' }: ShareParts) {
  // Long kickers (e.g. Bestiary circle names) shrink to fit the 700px text column.
  const kickerSize = kicker.length > 24 ? Math.max(22, Math.floor((44 * 24) / kicker.length)) : 44;
  // Long titles get a smaller size and a third line instead of being cut.
  const long = title.length > 48;
  const [titleSize, titleLead] = long ? [50, 58] : [64, 72];
  const titleLines = wrap(title, long ? 31 : 24, long ? 3 : 2);
  const subtitleY = 235 + (titleLines.length - 1) * titleLead + (long ? 70 : 95);
  const inner = cardSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6efe0"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#b8892b" stroke-width="3"/>
  <rect x="34" y="34" width="1132" height="562" fill="none" stroke="#b8892b" stroke-width="1"/>
  <svg x="80" y="75" width="320" height="480" viewBox="0 0 300 450">${inner}</svg>
  <g font-family="${SANTINO_FONT}">
    <text x="460" y="150" font-size="${kickerSize}" fill="#7a6656" letter-spacing="2">${escapeXml(kicker.toUpperCase())}</text>
    <text x="460" y="235" font-size="${titleSize}" fill="${titleColor}">${tspans(titleLines, 460, titleLead)}</text>
    <text x="460" y="${subtitleY}" font-size="30" fill="#2b1d14">${tspans(wrap(subtitle, 44, long ? 2 : 3), 460, 40)}</text>
    <text x="460" y="545" font-size="28" fill="#b8892b" font-variant="small-caps">${escapeXml(footer)}</text>
  </g>
</svg>`;
  const png = new Resvg(svg, { font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'EB Garamond' } }).render().asPng();
  return withXmp(Buffer.from(png), source);
}

const sourceFor = (generated: boolean, logo: boolean, hasText: boolean) =>
  generated && !logo ? 'trainedAlgorithmicMedia' : generated || hasText ? 'compositeWithTrainedAlgorithmicMedia' : 'algorithmicMedia';

function firstSentence(text: string) {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

/** Share image of a saint (the day's patron or any other). */
export function saintImage(lang: Lang, v: Vuln, kicker = dayLabel(v.day, lang)) {
  const s = t(lang);
  const text = saint(v.id)?.[lang];
  const card = santino(v);
  const subtitle = text ? `${s.patronage} ${text.patronage}` : v.cves.join(' · ') || v.date.slice(0, 4);
  return compose({ kicker, title: saintTitle(v, lang), subtitle, cardSvg: card.svg, footer: s.siteTitle, source: sourceFor(card.generated, !!logoCredit(v.id), !!text) });
}

/** Share image of a day: its patron, or the vacant card. */
export function shareImage(lang: Lang, mmdd: string) {
  const s = t(lang);
  const { patron } = day(mmdd);
  if (patron) return saintImage(lang, patron, dayLabel(mmdd, lang));
  return compose({ kicker: dayLabel(mmdd, lang), title: s.vacant, subtitle: s.vacantText, cardSvg: vacantSantino(s.vacant), footer: s.siteTitle, source: 'algorithmicMedia' });
}

export function eventImage(lang: Lang, e: CalendarEvent) {
  const s = t(lang);
  const text = eventText(e, lang);
  const c = card(eventCardKey(e), e.name, e.type, e.date.slice(0, 4));
  const kind = e.type === 'miracolo' ? s.miracle : s.scourge;
  const body = text ? firstSentence(text.chronicle ?? text.prodigy ?? e.summary) : firstSentence(e.summary);
  return compose({ kicker: `${kind} · ${formatDate(e.date, lang)}`, title: text?.title ?? e.name, subtitle: body, cardSvg: c.svg, footer: s.siteTitle, source: sourceFor(c.generated, false, !!text), titleColor: e.tone === 'lutto' ? '#2b1d14' : undefined });
}

export function demonImage(lang: Lang, d: Demon) {
  const s = t(lang);
  const text = demonText(d, lang);
  const c = card(demonCardKey(d), d.name, 'demone', String(d.firstSeen.year));
  return compose({ kicker: s.circles[d.primary], title: text?.title ?? d.name, subtitle: firstSentence(text?.legend ?? d.summary), cardSvg: c.svg, footer: `${s.bestiary} · ${s.siteTitle}`, source: sourceFor(c.generated, false, !!text) });
}

export function popeImage(lang: Lang, p: PopeEntry) {
  const s = t(lang);
  const text = popeText(p.key, lang);
  const c = card(popeCardKey(p.key), p.vuln.name, 'papa', p.kind === 'year' ? p.key : p.label);
  const kicker = p.kind === 'year' ? s.popeOf(p.key) : p.kind === 'decade' ? s.popeOfDecade(p.label) : s.antipope;
  const title = text?.title ?? `${p.kind === 'anti' ? s.antipope : s.pope} ${p.vuln.name}`;
  const subtitle = text ? firstSentence(text.encyclical.replace(/^[«"“][^»"”]*[»"”]\.?\s*/, '')) : (p.why ?? '');
  return compose({ kicker, title, subtitle, cardSvg: c.svg, footer: `${s.popes} · ${s.siteTitle}`, source: sourceFor(c.generated, false, !!text) });
}

/** Inserts an XMP packet (iTXt chunk) with the IPTC digital source type right after the PNG header chunk. */
function withXmp(png: Buffer, source: string) {
  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" Iptc4xmpExt:DigitalSourceType="${IPTC}${source}" xmpRights:WebStatement="https://creativecommons.org/licenses/by-nc-sa/4.0/"><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">CC BY-NC-SA 4.0</rdf:li></rdf:Alt></dc:rights></rdf:Description></rdf:RDF></x:xmpmeta>`;
  const data = Buffer.concat([Buffer.from('XML:com.adobe.xmp\0\0\0\0\0', 'latin1'), Buffer.from(xmp, 'utf8')]);
  const type = Buffer.from('iTXt', 'latin1');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([type, data])), 8 + data.length);
  const ihdrEnd = 8 + 12 + png.readUInt32BE(8); // signature + IHDR (length, type, data, crc)
  return Buffer.concat([png.subarray(0, ihdrEnd), chunk, png.subarray(ihdrEnd)]);
}
