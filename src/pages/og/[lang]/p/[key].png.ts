import type { APIRoute } from 'astro';
import { allPopes } from '../../../../lib/extras';
import { LANGS, type Lang } from '../../../../lib/i18n';
import { popeImage } from '../../../../lib/og';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => allPopes().map((p) => ({ params: { lang, key: p.key }, props: { p } })));
}

export const GET: APIRoute = ({ params, props }) =>
  new Response(new Uint8Array(popeImage(params.lang as Lang, props.p)), { headers: { 'Content-Type': 'image/png' } });
