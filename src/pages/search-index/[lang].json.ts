import { allVulns, day, saintTitle } from '../../lib/calendar';
import { allDemons, allEvents, demonText, eventText } from '../../lib/extras';
import { LANGS, saintPath, t, type Lang } from '../../lib/i18n';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

// Search index per language. u=path, n=display title, q=extra search text, c=first CVE, d=MM-DD, y=year,
// k=category (santo|beato|padre|flagello|miracolo|demone), s=patron, f=fame, v=CVSS, x=KEV, r=ransomware,
// l=years alive before disclosure, a=absurd, m=minor saint.
export function GET({ params }: { params: { lang: Lang } }) {
  const lang = params.lang;
  const s = t(lang);
  const saints = allVulns().map((v) => ({
    u: saintPath(lang, v.id),
    n: saintTitle(v, lang),
    q: [v.name, ...v.cves, v.vendor, v.product].filter(Boolean).join(' '),
    c: v.cves[0] ?? null,
    d: v.day,
    y: v.date.slice(0, 4),
    k: v.category,
    s: day(v.day).patron?.id === v.id,
    f: v.fame,
    v: v.cvss,
    x: v.kev,
    r: v.ransomware,
    l: v.born ? Number(v.date.slice(0, 4)) - v.born : null,
    a: v.absurd,
    m: v.kind === 'minor',
  }));
  const events = allEvents().map((e) => ({
    u: `${lang}/${e.type === 'miracolo' ? s.miracleSlug : s.scourgeSlug}/${e.id}`,
    n: eventText(e, lang)?.title ?? e.name,
    q: [e.name, ...e.cves, ...e.malware, ...e.people].join(' '),
    c: e.cves[0] ?? null,
    d: e.date.slice(5),
    y: e.date.slice(0, 4),
    k: e.type,
    f: 0,
  }));
  const demons = allDemons().map((d) => ({
    u: `${lang}/${s.demonSlug}/${d.id}`,
    n: demonText(d, lang)?.title ?? d.name,
    q: [d.name, ...d.aliases, ...d.cves, d.primary].join(' '),
    c: null,
    d: null,
    y: String(d.firstSeen.year),
    k: 'demone',
    f: 0,
  }));
  return new Response(JSON.stringify([...saints, ...events, ...demons]), { headers: { 'Content-Type': 'application/json' } });
}
