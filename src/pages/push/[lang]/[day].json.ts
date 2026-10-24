// What the daily notification says: fetched by the service worker when a (payload-less) push arrives.
import type { APIRoute } from 'astro';
import { DAYS, day, dayLabel, saint, saintTitle } from '../../../lib/calendar';
import { LANGS, absolute, t, type Lang } from '../../../lib/i18n';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => DAYS.map((d) => ({ params: { lang, day: d } })));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const mmdd = params.day!;
  const s = t(lang);
  const { patron } = day(mmdd);
  const text = patron ? saint(patron.id)?.[lang] : undefined;
  const body = {
    title: patron ? saintTitle(patron, lang) : s.vacant,
    body: `${dayLabel(mmdd, lang)} · ${text ? `${s.patronage} ${text.patronage}` : s.siteTitle}`,
    url: absolute(`${lang}/${mmdd}/`),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
