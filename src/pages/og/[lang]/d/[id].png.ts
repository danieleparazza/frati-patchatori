import type { APIRoute } from 'astro';
import { allDemons } from '../../../../lib/extras';
import { LANGS, type Lang } from '../../../../lib/i18n';
import { demonImage } from '../../../../lib/og';

export function getStaticPaths() {
  return LANGS.flatMap((lang) => allDemons().map((d) => ({ params: { lang, id: d.id }, props: { d } })));
}

export const GET: APIRoute = ({ params, props }) =>
  new Response(new Uint8Array(demonImage(params.lang as Lang, props.d)), { headers: { 'Content-Type': 'image/png' } });
