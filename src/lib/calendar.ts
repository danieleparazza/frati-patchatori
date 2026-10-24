import vulnsData from '../data/vulns.json';
import daysData from '../data/days.json';
import { t, type Lang } from './i18n';

export type Vuln = {
  id: string;
  name: string;
  date: string;
  day: string;
  category: 'santo' | 'beato' | 'padre';
  cves: string[];
  cvss: number | null;
  kev: boolean;
  ransomware: boolean;
  /** Year the flaw was introduced, when documented. */
  born: number | null;
  absurd: boolean;
  vendor: string | null;
  product: string | null;
  description: string | null;
  canonical: string | null;
  links: string[];
  logo: string | null;
  author: string | null;
  fame: number;
  source: string;
};

export type SaintText = {
  title: string;
  patronage: string;
  hagiography: string;
  prayer: string;
  feast: string;
  proverb?: string;
};

export type Saint = Partial<Record<Lang, SaintText>> & { santino?: string };

const vulns = vulnsData as Vuln[];
const days = daysData as Record<string, { patron: string | null; others: string[] }>;
const byId = new Map(vulns.map((v) => [v.id, v]));

// Hand-written content lives in src/data/saints/<id>.json; santini in src/data/santini/<id>.svg.
const saints = import.meta.glob<Saint>('../data/saints/*.json', { eager: true, import: 'default' });
const santini = import.meta.glob<string>('../data/santini/*.svg', { eager: true, query: '?raw', import: 'default' });

export const DAYS = Object.keys(days);

export function vuln(id: string) {
  const v = byId.get(id);
  if (!v) throw new Error(`unknown vulnerability id: ${id}`);
  return v;
}

export function day(mmdd: string) {
  const d = days[mmdd];
  return { patron: d.patron ? vuln(d.patron) : null, others: d.others.map(vuln) };
}

export function saint(id: string): Saint | undefined {
  return saints[`../data/saints/${id}.json`];
}

export function santinoSvg(id: string): string | undefined {
  return santini[`../data/santini/${id}.svg`];
}

export function neighbours(mmdd: string) {
  const i = DAYS.indexOf(mmdd);
  return { prev: DAYS[(i - 1 + DAYS.length) % DAYS.length], next: DAYS[(i + 1) % DAYS.length] };
}

export function dayLabel(mmdd: string, lang: Lang) {
  const [m, d] = mmdd.split('-').map(Number);
  const s = t(lang);
  return s.dayLabel(d, s.months[m - 1]);
}

export function saintTitle(v: Vuln, lang: Lang) {
  const custom = saint(v.id)?.[lang]?.title;
  if (custom) return custom;
  const s = t(lang);
  return v.category === 'beato' ? s.titleBeato(v.name) : v.category === 'padre' ? s.titlePadre(v.name) : s.titleSanto(v.name);
}

export function formatDate(iso: string, lang: Lang) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${dayLabel(`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, lang)} ${y}`;
}

export function monthDays(mm: string) {
  return DAYS.filter((d) => d.startsWith(`${mm}-`));
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

export function allVulns() {
  return vulns;
}

// ---------- related saints ----------

// Name stems that make a "family" (Heartbleed, CitrixBleed, MongoBleed… → bleed).
const FAMILY_STEMS = ['bleed', 'dirty', 'ghost', 'pwn', 'spectre', 'poodle', 'zombie', 'potato', 'hammer', 'nightmare', 'jack', 'shell', 'scape', 'leak', 'load', 'cow', 'smash', 'storm', 'blue', 'door'];

// CVE product names are inconsistent ("Windows 10 Version 1809", "Linux kernel"): group the common ones.
const PRODUCT_GROUPS: [RegExp, string][] = [
  [/^windows|microsoft windows/i, 'Windows'],
  [/exchange/i, 'Microsoft Exchange'],
  [/^(linux|kernel|linux kernel)$/i, 'Linux kernel'],
  [/processor|cpu|epyc|xeon|core i/i, 'CPU'],
  [/^(ios|ipados|ios and ipados)/i, 'iOS'],
  [/^macos|os x/i, 'macOS'],
  [/^android/i, 'Android'],
  [/chrom/i, 'Chrome'],
  [/openssl/i, 'OpenSSL'],
  [/apache http/i, 'Apache HTTP Server'],
  [/^(adc|netscaler)|citrix/i, 'Citrix NetScaler'],
  [/glibc|gnu c library/i, 'glibc'],
  [/sudo/i, 'sudo'],
];

export function family(v: Vuln) {
  const name = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return FAMILY_STEMS.find((stem) => name.includes(stem)) ?? null;
}

export function productGroup(v: Vuln) {
  if (!v.product) return null;
  return PRODUCT_GROUPS.find(([re]) => re.test(v.product!))?.[1] ?? v.product;
}

/** Saints related to `v`, most famous first; each saint appears in one group only. */
export function related(v: Vuln, limit = 8) {
  const seen = new Set([v.id]);
  const pick = (match: (o: Vuln) => boolean) => {
    const items = vulns.filter((o) => !seen.has(o.id) && match(o)).slice(0, limit); // vulns is sorted by fame
    items.forEach((o) => seen.add(o.id));
    return items;
  };
  const fam = family(v);
  const prod = productGroup(v);
  const year = v.date.slice(0, 4);
  return {
    family: fam ? { stem: fam, items: pick((o) => family(o) === fam) } : null,
    product: prod ? { name: prod, items: pick((o) => productGroup(o) === prod) } : null,
    year: { year, items: pick((o) => o.date.startsWith(year)) },
  };
}
