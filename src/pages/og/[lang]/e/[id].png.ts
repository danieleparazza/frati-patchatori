import type { APIRoute } from 'astro';
import { allEvents } from '../../../../lib/extras';
import { LANGS, type Lang } from '../../../../lib/i18n';
import { eventImage } from '../../../../lib/og';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => allEvents().map((e) => ({ params: { lang, id: e.id }, props: { e } })));
}

export const GET: APIRoute = ({ params, props }) =>
  new Response(new Uint8Array(eventImage(params.lang as Lang, props.e)), { headers: { 'Content-Type': 'image/png' } });
