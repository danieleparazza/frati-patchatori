// Public JSON API (static files under api/v1/, documented in public/api/openapi.yaml and the README).
// One shape per day; the year file is the same objects for all 366 days.
import { day, dayLabel, saint, saintTitle, type Vuln } from './calendar';
import { eventText, eventsOn, papalLine } from './extras';
import { absolute, saintPath, t, type Lang } from './i18n';

export const API_VERSION = 'v1';

function saintInfo(lang: Lang, v: Vuln) {
  const text = saint(v.id)?.[lang];
  return {
    id: v.id,
    name: v.name,
    title: saintTitle(v, lang),
    category: v.kind === 'minor' ? 'minor' : v.category,
    disclosed: v.date,
    cves: v.cves,
    cvss: v.cvss,
    kev: v.kev,
    ransomware: v.ransomware,
    vendor: v.vendor,
    product: v.product,
    author: v.author,
    canonical: v.canonical,
    links: v.links,
    papal: papalLine(v, lang).text,
    texts: text
      ? { patronage: text.patronage, hagiography: text.hagiography, prayer: text.prayer, feast: text.feast, proverb: text.proverb ?? null }
      : null,
    url: absolute(saintPath(lang, v.id)),
    image: absolute(`img/${lang}/s/${v.id}.jpg`),
  };
}

export function dayInfo(lang: Lang, mmdd: string) {
  const s = t(lang);
  const { patron, others } = day(mmdd);
  return {
    day: mmdd,
    lang,
    label: dayLabel(mmdd, lang),
    url: absolute(`${lang}/${mmdd}/`),
    image: absolute(`img/${lang}/day/${mmdd}.jpg`),
    embed: absolute(`embed/${lang}/${mmdd}/`),
    patron: patron ? saintInfo(lang, patron) : null,
    others: others.map((v) => ({ id: v.id, name: v.name, title: saintTitle(v, lang), cves: v.cves, url: absolute(saintPath(lang, v.id)) })),
    observances: eventsOn(mmdd).map((e) => ({
      id: e.id,
      type: e.type === 'miracolo' ? 'miracle' : 'scourge',
      title: eventText(e, lang)?.title ?? e.name,
      date: e.date,
      mourning: e.tone === 'lutto',
      url: absolute(`${lang}/${e.type === 'miracolo' ? s.miracleSlug : s.scourgeSlug}/${e.id}/`),
    })),
  };
}
