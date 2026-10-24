// Client-side helpers shared by the search and rankings pages.

/** One entry of /search-index.json (see src/pages/search-index.json.ts for the field meanings). */
export type IndexEntry = {
  i: string;
  n: string;
  c: string[];
  p: string;
  d: string;
  y: string;
  k: 'santo' | 'beato' | 'padre';
  s: boolean;
  f: number;
  v: number | null;
  x: boolean;
  r: boolean;
  l: number | null;
  a: boolean;
};

/** Localized strings and paths, passed from the page in a data-config attribute. */
export type ListConfig = {
  lang: 'it' | 'en';
  base: string;
  months: string[];
  labels: Record<IndexEntry['k'], string>;
  patronLabel: string;
  saintSlug: string;
};

export function readConfig<T>(el: HTMLElement): T {
  return JSON.parse(el.dataset.config!);
}

export async function loadIndex(base: string): Promise<IndexEntry[]> {
  return fetch(`${base}search-index.json`).then((r) => r.json());
}

export const byFame = (a: IndexEntry, b: IndexEntry) => b.f - a.f;

/** A result row: saint title linking to its page, optional score, day and first CVE. */
export function saintListItem(cfg: ListConfig, v: IndexEntry, score?: string) {
  const [m, d] = v.d.split('-').map(Number);
  const day = cfg.lang === 'it' ? `${d} ${cfg.months[m - 1]}` : `${cfg.months[m - 1]} ${d}`;
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `${cfg.base}${cfg.lang}/${cfg.saintSlug}/${v.i}/`;
  a.textContent = cfg.labels[v.k].replace('X', v.n);
  li.append(a);
  if (score) {
    const sc = document.createElement('span');
    sc.className = 'score';
    sc.textContent = score;
    li.append(sc);
  }
  const meta = document.createElement('span');
  meta.className = 'meta';
  meta.textContent = `${day} ${v.y}${v.s ? ' · ' + cfg.patronLabel : ''}${v.c.length ? ' · ' + v.c[0] : ''}`;
  li.append(meta);
  return li;
}

export function listConfig(s: { months: readonly string[]; titleSanto: (n: string) => string; titleBeato: (n: string) => string; titlePadre: (n: string) => string; patron: string; saintSlug: string }, lang: 'it' | 'en', base: string): ListConfig {
  return {
    lang,
    base,
    months: [...s.months],
    labels: { santo: s.titleSanto('X'), beato: s.titleBeato('X'), padre: s.titlePadre('X') },
    patronLabel: s.patron,
    saintSlug: s.saintSlug,
  };
}
