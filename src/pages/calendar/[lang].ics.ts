// Subscribable iCalendar feed: one all-day, yearly event per patron saint.
import { DAYS, day, saint, saintTitle } from '../../lib/calendar';
import { LANGS, absolute, t, type Lang } from '../../lib/i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// RFC 5545: lines longer than 75 octets are folded with CRLF + space.
function fold(line: string) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (parts.length ? 74 : 75), bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--; // don't split UTF-8 sequences
    parts.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
  }
  return parts.join('\r\n ');
}

export function GET({ params }: { params: { lang: Lang } }) {
  const lang = params.lang;
  const s = t(lang);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Frati Patchatori//Lunario//' + lang.toUpperCase(),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(s.siteTitle)}`,
    `X-WR-CALDESC:${escape(s.tagline)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
  ];
  for (const d of DAYS) {
    const { patron } = day(d);
    if (!patron) continue;
    const [m, dd] = d.split('-');
    // 2024 is a leap year, so 02-29 exists; that event recurs only in leap years.
    const start = `2024${m}${dd}`;
    const end = new Date(Date.UTC(2024, Number(m) - 1, Number(dd) + 1)).toISOString().slice(0, 10).replace(/-/g, '');
    const page = absolute(`${lang}/${d}`);
    const text = saint(patron.id)?.[lang];
    const desc = [text ? `${s.patronage} ${text.patronage}` : null, patron.cves.join(', ') || null, page].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${d}-${lang}@frati-patchatori`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      'RRULE:FREQ=YEARLY',
      `SUMMARY:${escape(saintTitle(patron, lang))}`,
      `DESCRIPTION:${escape(desc)}`,
      `URL:${page}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.map(fold).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
