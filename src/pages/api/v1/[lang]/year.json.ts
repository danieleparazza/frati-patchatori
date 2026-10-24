// GET api/v1/<lang>/year.json: all 366 days in one file.
import type { APIRoute } from 'astro';
import { dayInfo } from '../../../../lib/api';
import { DAYS } from '../../../../lib/calendar';
import { LANGS, type Lang } from '../../../../lib/i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(DAYS.map((d) => dayInfo(params.lang as Lang, d))), { headers: { 'Content-Type': 'application/json' } });
