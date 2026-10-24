// iCalendar feed of the "Ricorrenze": movable feasts and observances (one recurring event each).
import { FEASTS, firstOccurrence } from '../../../lib/feasts';
import { LANGS, absolute, t, type Lang } from '../../../lib/i18n';
import { escapeIcs, foldIcs } from '../../../lib/ics';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

export function GET({ params }: { params: { lang: Lang } }) {
  const lang = params.lang;
  const s = t(lang);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Frati Patchatori//Ricorrenze//' + lang.toUpperCase(),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(s.feastsCalendarName)}`,
    `X-WR-CALDESC:${escapeIcs(s.feastsCalendarDesc)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P7D',
    'X-PUBLISHED-TTL:P7D',
  ];
  for (const f of FEASTS) {
    const start = firstOccurrence(f, 2024);
    // The whole-month feast (October) is one event spanning the month; the others last one day.
    const end = f.rule.kind === 'wholeMonth' ? new Date(start.getFullYear(), start.getMonth() + 1, 1) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const text = f[lang];
    lines.push(
      'BEGIN:VEVENT',
      `UID:feast-${f.id}-${lang}@frati-patchatori`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(start)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      `RRULE:${f.rrule}`,
      `SUMMARY:${escapeIcs(text.name)}`,
      `DESCRIPTION:${escapeIcs(`${text.text}\n${text.proverb}\n${absolute(`${lang}/`)}`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.map(foldIcs).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
