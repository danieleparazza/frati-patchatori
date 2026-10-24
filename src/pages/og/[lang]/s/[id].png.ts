import type { APIRoute } from 'astro';
import { allVulns } from '../../../../lib/calendar';
import { LANGS, type Lang } from '../../../../lib/i18n';
import { saintImage } from '../../../../lib/og';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => allVulns().map((v) => ({ params: { lang, id: v.id }, props: { v } })));
}

export const GET: APIRoute = ({ params, props }) =>
  new Response(new Uint8Array(saintImage(params.lang as Lang, props.v)), { headers: { 'Content-Type': 'image/png' } });
