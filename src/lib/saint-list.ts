// Client-side helpers for the search page.

/** One entry of /search-index/<lang>.json (see src/pages/search-index/[lang].json.ts for the fields). */
export type IndexEntry = {
  u: string;
  n: string;
  q: string;
  c: string | null;
  d: string | null;
  y: string;
  k: 'santo' | 'beato' | 'padre' | 'flagello' | 'miracolo' | 'demone';
  s?: boolean;
  f: number;
  v?: number | null;
  x?: boolean;
  r?: boolean;
  l?: number | null;
  a?: boolean;
  m?: boolean;
};

/** Localized strings and paths, passed from the page in a data-config attribute. */
export type ListConfig = {
  lang: 'it' | 'en';
  base: string;
  months: string[];
  patronLabel: string;
  kinds: Record<string, string>;
};

export function readConfig<T>(el: HTMLElement): T {
  return JSON.parse(el.dataset.config!);
}

export async function loadIndex(base: string, lang: string): Promise<IndexEntry[]> {
  return fetch(`${base}search-index/${lang}.json`).then((r) => r.json());
}

export const byFame = (a: IndexEntry, b: IndexEntry) => b.f - a.f;

/** A result row: title linking to its page, optional score, then day/year, kind and first CVE. */
export function saintListItem(cfg: ListConfig, v: IndexEntry, score?: string) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `${cfg.base}${v.u}/`;
  a.textContent = v.n;
  li.append(a);
  if (score) {
    const sc = document.createElement('span');
    sc.className = 'score';
    sc.textContent = score;
    li.append(sc);
  }
  let when = v.y;
  if (v.d) {
    const [m, d] = v.d.split('-').map(Number);
    when = `${cfg.lang === 'it' ? `${d} ${cfg.months[m - 1]}` : `${cfg.months[m - 1]} ${d}`} ${v.y}`;
  }
  const kind = ['flagello', 'miracolo', 'demone'].includes(v.k) ? cfg.kinds[v.k] : null;
  const meta = document.createElement('span');
  meta.className = 'meta';
  meta.textContent = [when, kind, v.s ? cfg.patronLabel : null, v.c].filter(Boolean).join(' · ');
  li.append(meta);
  return li;
}

export function listConfig(s: { months: readonly string[]; patron: string; scourge: string; miracle: string; demon: string }, lang: 'it' | 'en', base: string): ListConfig {
  return { lang, base, months: [...s.months], patronLabel: s.patron, kinds: { flagello: s.scourge, miracolo: s.miracle, demone: s.demon } };
}
