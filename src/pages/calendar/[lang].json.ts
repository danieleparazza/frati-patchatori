import { DAYS, day, saint, saintTitle } from '../../lib/calendar';
import { LANGS, type Lang } from '../../lib/i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

// Per-day patron summary for client-side views: t=title, y=year, k=category, x=KEV, p=patronage.
export function GET({ params }: { params: { lang: Lang } }) {
  const lang = params.lang;
  const data = Object.fromEntries(
    DAYS.map((d) => {
      const { patron, others } = day(d);
      if (!patron) return [d, null];
      return [
        d,
        { id: patron.id, t: saintTitle(patron, lang), y: patron.date.slice(0, 4), k: patron.category, x: patron.kev, p: saint(patron.id)?.[lang]?.patronage ?? null, o: others.length },
      ];
    }),
  );
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
