// Subscribable iCalendar feed: one all-day, yearly event per patron saint.
import { DAYS, day, saint, saintTitle } from '../../lib/calendar';
import { LANGS, absolute, t, type Lang } from '../../lib/i18n';
import { escapeIcs as escape, foldIcs as fold } from '../../lib/ics';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
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
    'REFRESH-INTERVAL;VALUE=DURATION:P7D',
    'X-PUBLISHED-TTL:P7D',
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
      // The complete holy card; Apple Calendar and Outlook show attachments, Google ignores them.
      `ATTACH;FMTTYPE=image/jpeg:${absolute(`img/${lang}/day/${d}.jpg`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.map(fold).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
