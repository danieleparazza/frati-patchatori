// Sitemap of the readable pages in both languages, linked from robots.txt. Embeds, API files and images are left out.
import type { APIRoute } from 'astro';
import { DAYS, MONTHS, allVulns } from '../lib/calendar';
import { allDemons, allEvents, allPopes } from '../lib/extras';
import { LANGS, absolute, saintPath, t } from '../lib/i18n';

export const GET: APIRoute = () => {
  const paths = LANGS.flatMap((lang) => {
    const s = t(lang);
    return [
      `${lang}/`,
      `${lang}/${s.searchSlug}/`,
      `${lang}/${s.popesSlug}/`,
      `${lang}/${s.bestiarySlug}/`,
      `${lang}/${s.infoSlug}/`,
      `${lang}/${s.weekSlug}/`,
      ...MONTHS.map((m) => `${lang}/${s.monthSlug}/${m}/`),
      ...DAYS.map((d) => `${lang}/${d}/`),
      ...allVulns().map((v) => `${saintPath(lang, v.id)}/`),
      ...allEvents().map((e) => `${lang}/${e.type === 'miracolo' ? s.miracleSlug : s.scourgeSlug}/${e.id}/`),
      ...allDemons().map((d) => `${lang}/${s.demonSlug}/${d.id}/`),
      ...allPopes().map((p) => `${lang}/${s.popeSlug}/${p.key}/`),
    ];
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', 'api/', ...paths].map((p) => `  <url><loc>${absolute(p)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
