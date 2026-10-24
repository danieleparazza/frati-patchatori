// Share images (<id>.jpg) for the home pages, days, saints, scourges and miracles, demons and Popes.
import type { APIRoute } from 'astro';
import { DAYS, allVulns } from '../../../../lib/calendar';
import { allDemons, allEvents, allPopes } from '../../../../lib/extras';
import { LANGS, type Lang } from '../../../../lib/i18n';
import { dayImages, demonImages, eventImages, popeImages, saintImages, siteImages, type Images } from '../../../../lib/og';

type Entry = { kind: string; id: string; make: (lang: Lang) => Images };

const entries: Entry[] = [
  { kind: 'site', id: 'home', make: siteImages },
  ...DAYS.map((d) => ({ kind: 'day', id: d, make: (lang: Lang) => dayImages(lang, d) })),
  ...allVulns().map((v) => ({ kind: 's', id: v.id, make: (lang: Lang) => saintImages(lang, v) })),
  ...allEvents().map((e) => ({ kind: 'e', id: e.id, make: (lang: Lang) => eventImages(lang, e) })),
  ...allDemons().map((d) => ({ kind: 'd', id: d.id, make: (lang: Lang) => demonImages(lang, d) })),
  ...allPopes().map((p) => ({ kind: 'p', id: p.key, make: (lang: Lang) => popeImages(lang, p) })),
];

export function getStaticPaths() {
  return LANGS.flatMap((lang) =>
    entries.map((e) => ({ params: { lang, kind: e.kind, file: e.id }, props: { entry: e } })),
  );
}

export const GET: APIRoute = async ({ params, props }) => {
  const jpg = await (props.entry as Entry).make(params.lang as Lang).share();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
