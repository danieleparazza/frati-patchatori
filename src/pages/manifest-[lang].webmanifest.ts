// Web app manifest per language: installing from an Italian page opens the Italian calendar, and so on.
import type { APIRoute } from 'astro';
import { LANGS, t, url, type Lang } from '../lib/i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const s = t(lang);
  const manifest = {
    id: url(`${lang}/`),
    name: s.siteTitle,
    short_name: lang === 'it' ? 'Frati Patchatori' : 'Patching Friars',
    description: s.siteBlurb,
    lang,
    start_url: url(`${lang}/`),
    scope: url(''),
    display: 'standalone',
    background_color: '#f6efe0',
    theme_color: '#9e1b1b',
    icons: [
      { src: url('icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: url('icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
      { src: url('icons/maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
