// Share images (1200×630 PNG): holy card on the left, day and saint on the right.
// Used as og:image for Slack/social previews and for the download button.
import { Resvg } from '@resvg/resvg-js';
import { crc32 } from 'node:zlib';
import { join } from 'node:path';
import { day, dayLabel, saint, saintTitle } from './calendar';
import { t, type Lang } from './i18n';
import { SANTINO_FONT, escapeXml, santino, vacantSantino } from './santino';

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

/** Builds the share image and says which IPTC digital source type describes it. */
export function shareImage(lang: Lang, mmdd: string) {
  const s = t(lang);
  const { patron } = day(mmdd);
  const text = patron ? saint(patron.id)?.[lang] : undefined;
  const card = patron ? santino(patron) : null;
  const title = patron ? saintTitle(patron, lang) : s.vacant;
  const subtitle = text ? `${s.patronage} ${text.patronage}` : patron?.cves.join(' · ') || (patron ? patron.date.slice(0, 4) : s.vacantText);
  const inner = (card?.svg ?? vacantSantino(s.vacant)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6efe0"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#b8892b" stroke-width="3"/>
  <rect x="34" y="34" width="1132" height="562" fill="none" stroke="#b8892b" stroke-width="1"/>
  <svg x="80" y="75" width="320" height="480" viewBox="0 0 300 450">${inner}</svg>
  <g font-family="${SANTINO_FONT}">
    <text x="460" y="150" font-size="44" fill="#7a6656" letter-spacing="2">${escapeXml(dayLabel(mmdd, lang).toUpperCase())}</text>
    <text x="460" y="235" font-size="64" fill="#9e1b1b">${tspans(wrap(title, 24, 2), 460, 72)}</text>
    <text x="460" y="${title.length > 24 ? 400 : 330}" font-size="30" fill="#2b1d14">${tspans(wrap(subtitle, 44, 3), 460, 40)}</text>
    <text x="460" y="545" font-size="28" fill="#b8892b" font-variant="small-caps">${escapeXml(s.siteTitle)}</text>
  </g>
</svg>`;

  const png = new Resvg(svg, { font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'EB Garamond' } }).render().asPng();
  const source = card?.generated ? 'trainedAlgorithmicMedia' : text ? 'compositeWithTrainedAlgorithmicMedia' : 'algorithmicMedia';
  return withXmp(Buffer.from(png), source);
}

/** Inserts an XMP packet (iTXt chunk) with the IPTC digital source type right after the PNG header chunk. */
function withXmp(png: Buffer, source: string) {
  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" Iptc4xmpExt:DigitalSourceType="${IPTC}${source}" xmpRights:WebStatement="https://creativecommons.org/licenses/by-sa/4.0/"><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">CC BY-SA 4.0</rdf:li></rdf:Alt></dc:rights></rdf:Description></rdf:RDF></x:xmpmeta>`;
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
