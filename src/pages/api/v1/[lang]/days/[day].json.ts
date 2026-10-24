// GET api/v1/<lang>/days/<mmdd>.json: the day's patron, other saints and observances.
import type { APIRoute } from 'astro';
import { dayInfo } from '../../../../../lib/api';
import { DAYS } from '../../../../../lib/calendar';
import { LANGS, type Lang } from '../../../../../lib/i18n';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => DAYS.map((d) => ({ params: { lang, day: d } })));
}

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(dayInfo(params.lang as Lang, params.day!)), { headers: { 'Content-Type': 'application/json' } });
