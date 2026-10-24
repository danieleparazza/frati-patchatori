import type { APIRoute } from 'astro';
import { DAYS } from '../../../lib/calendar';
import { LANGS, type Lang } from '../../../lib/i18n';
import { shareImage } from '../../../lib/og';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => DAYS.map((d) => ({ params: { lang, day: d } })));
}

export const GET: APIRoute = ({ params }) =>
  new Response(new Uint8Array(shareImage(params.lang as Lang, params.day as string)), { headers: { 'Content-Type': 'image/png' } });
