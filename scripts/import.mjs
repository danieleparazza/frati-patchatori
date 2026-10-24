#!/usr/bin/env node
// Builds src/data/vulns.json and src/data/days.json from:
//   - Vulnerability Garden (CC BY-SA 4.0, codeberg.org/shellsharks/vulnerability-garden)
//   - CISA Known Exploited Vulnerabilities catalog
//   - CVE records from CVEProject/cvelistV5 (CVSS, description, affected product)
//   - data/extra-vulns.json (hand-curated entries: santi minori, Padri della Chiesa)
//   - data/overrides.json (manual patron choices)
//
// Usage: node scripts/import.mjs [--offline]   (--offline reuses .cache/ without network)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache');
const VG_DIR = join(CACHE, 'vulnerability-garden');
const VG_REPO = 'https://codeberg.org/shellsharks/vulnerability-garden.git';
const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const CVE_URL = (id) => {
  const [, year, num] = id.split('-');
  const bucket = num.length <= 3 ? '0xxx' : `${num.slice(0, -3)}xxx`;
  return `https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/${year}/${bucket}/${id}.json`;
};
const OFFLINE = process.argv.includes('--offline');

mkdirSync(join(CACHE, 'cve'), { recursive: true });

// ---------- Vulnerability Garden ----------

function syncGarden() {
  if (OFFLINE) return;
  if (existsSync(VG_DIR)) execFileSync('git', ['-C', VG_DIR, 'pull', '--quiet', '--ff-only'], { stdio: 'inherit' });
  else execFileSync('git', ['clone', '--quiet', '--depth', '1', VG_REPO, VG_DIR], { stdio: 'inherit' });
}

// The front matter is not always valid YAML (unescaped quotes in titles), so pick fields by line.
function field(text, key) {
  const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  return m ? m[1].trim() : '';
}

function unquote(s) {
  if (s.length >= 2 && (s[0] === '"' || s[0] === "'") && s.at(-1) === s[0]) return s.slice(1, -1);
  return s;
}

function parseGardenFile(path) {
  const text = readFileSync(path, 'utf8').split(/^---\s*$/m)[1] ?? '';
  const date = field(text, 'date-published').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!date) return null;
  const slug = path.split('/').at(-1).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  const links = [...field(text, 'links').matchAll(/https?:\/\/[^'"\]\s]+/g)].map((m) => m[0]);
  const canonical = unquote(field(text, 'canonical-link'));
  return {
    id: slug,
    name: unquote(field(text, 'title')),
    date: `${date[1]}-${date[2]}-${date[3]}`,
    cves: [...new Set(field(text, 'cve').match(/CVE-\d{4}-\d{4,}/g) ?? [])],
    canonical: canonical || null,
    links: [...new Set(links)],
    logo: unquote(field(text, 'image')) || null,
    author: unquote(field(text, 'author')) || null,
    source: 'vulnerability-garden',
  };
}

function loadGarden() {
  const base = join(VG_DIR, '_vulns');
  const entries = [];
  for (const year of readdirSync(base)) {
    for (const file of readdirSync(join(base, year))) {
      if (!file.endsWith('.md')) continue;
      const entry = parseGardenFile(join(base, year, file));
      if (entry) entries.push(entry);
      else console.warn(`skip (no date-published): ${year}/${file}`);
    }
  }
  return entries;
}

// ---------- KEV and CVE records ----------

async function fetchJson(url, cachePath) {
  if (existsSync(cachePath) && (OFFLINE || cachePath.includes('/cve/'))) {
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }
  if (OFFLINE) return null;
  const res = await fetch(url);
  if (res.status === 404) {
    writeFileSync(cachePath, 'null');
    return null;
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const json = await res.json();
  writeFileSync(cachePath, JSON.stringify(json));
  return json;
}

async function loadKev() {
  const kev = await fetchJson(KEV_URL, join(CACHE, 'kev.json'));
  return new Map((kev?.vulnerabilities ?? []).map((v) => [v.cveID, v]));
}

function cvssScores(container) {
  return (container?.metrics ?? []).flatMap((m) =>
    ['cvssV4_0', 'cvssV3_1', 'cvssV3_0', 'cvssV2_0'].filter((k) => m[k]?.baseScore).map((k) => m[k].baseScore),
  );
}

function summarizeCve(record) {
  if (!record?.containers) return null;
  const { cna = {}, adp = [] } = record.containers;
  const scores = [...cvssScores(cna), ...adp.flatMap(cvssScores)];
  const description = (cna.descriptions ?? []).find((d) => d.lang?.startsWith('en'))?.value ?? null;
  const affected = (cna.affected ?? []).find((a) => a.product && a.product !== 'n/a');
  return {
    cvss: scores.length ? Math.max(...scores) : null,
    description,
    vendor: affected?.vendor && affected.vendor !== 'n/a' ? affected.vendor : null,
    product: affected?.product ?? null,
  };
}

async function loadCves(ids) {
  const out = new Map();
  const queue = [...ids];
  let done = 0;
  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        out.set(id, summarizeCve(await fetchJson(CVE_URL(id), join(CACHE, 'cve', `${id}.json`))));
      } catch (err) {
        console.warn(`CVE ${id}: ${err.message}`);
      }
      if (++done % 200 === 0) console.log(`  CVE records: ${done}/${ids.length}`);
    }
  }
  await Promise.all(Array.from({ length: 16 }, worker));
  return out;
}

// ---------- scoring and calendar ----------

function category(v) {
  if (Number(v.date.slice(0, 4)) < 1999) return 'padre';
  return v.cves.length ? 'santo' : 'beato';
}

// Rough "fame" of a vulnerability: how likely people are to recognize it.
function fame(v) {
  let s = 0;
  if (v.logo) s += 4;
  if (v.links.some((l) => l.includes('wikipedia.org'))) s += 4;
  if (v.kev) s += 3;
  if (v.cvss >= 9) s += 2;
  else if (v.cvss >= 7) s += 1;
  if (v.cves.length) s += 1;
  s += Math.min(v.links.length, 6) * 0.5;
  s += (2026 - Number(v.date.slice(0, 4))) * 0.05; // older survivors are more legendary
  return Math.round(s * 100) / 100;
}

function allDays() {
  const days = [];
  for (let m = 1; m <= 12; m++) {
    const len = new Date(2024, m, 0).getDate(); // leap year: includes 02-29
    for (let d = 1; d <= len; d++) days.push(`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return days;
}

function uniqueIds(entries) {
  const seen = new Map();
  for (const e of entries) {
    const n = seen.get(e.id) ?? 0;
    seen.set(e.id, n + 1);
    if (n) e.id = `${e.id}-${n + 1}`;
  }
}

// ---------- main ----------

syncGarden();
const extra = JSON.parse(readFileSync(join(ROOT, 'data', 'extra-vulns.json'), 'utf8'));
const overrides = JSON.parse(readFileSync(join(ROOT, 'data', 'overrides.json'), 'utf8'));

const excluded = new Set(overrides.exclude ?? []); // entries hidden by hand (e.g. inappropriate names)
const vulns = [...loadGarden(), ...extra.map((e) => ({ links: [], cves: [], logo: null, author: null, canonical: null, ...e, source: 'manual' }))].filter(
  (v) => !excluded.has(v.id),
);
uniqueIds(vulns);
console.log(`entries: ${vulns.length}`);

const kev = await loadKev();
const cveIds = [...new Set([...vulns.flatMap((v) => v.cves), ...Object.values(overrides.addCves ?? {}).flat()])];
console.log(`fetching ${cveIds.length} CVE records (cached in .cache/cve)…`);
const cves = await loadCves(cveIds);

for (const v of vulns) {
  if (overrides.dates?.[v.id]) v.date = overrides.dates[v.id];
  if (overrides.removeCves?.[v.id]) v.cves = v.cves.filter((c) => !overrides.removeCves[v.id].includes(c));
  if (overrides.addCves?.[v.id]) v.cves = [...new Set([...v.cves, ...overrides.addCves[v.id]])];
  const infos = v.cves.map((id) => cves.get(id)).filter(Boolean);
  const kevHits = v.cves.map((id) => kev.get(id)).filter(Boolean);
  const scores = infos.map((i) => i.cvss).filter((x) => x != null);
  v.cvss = scores.length ? Math.max(...scores) : null;
  v.kev = kevHits.length > 0;
  v.ransomware = kevHits.some((k) => k.knownRansomwareCampaignUse === 'Known');
  v.born = overrides.born?.[v.id] ?? null;
  v.absurd = overrides.absurd?.includes(v.id) ?? false;
  v.vendor = infos.find((i) => i.vendor)?.vendor ?? kevHits[0]?.vendorProject ?? null;
  v.product = infos.find((i) => i.product)?.product ?? kevHits[0]?.product ?? null;
  v.description = infos.find((i) => i.description)?.description ?? v.description ?? null;
  v.day = v.date.slice(5);
  v.category = category(v);
  v.fame = fame(v);
}
vulns.sort((a, b) => b.fame - a.fame || a.date.localeCompare(b.date));

const byId = new Map(vulns.map((v) => [v.id, v]));
// Patrons are stable: keep the current one unless overridden; only vacant days get one automatically.
const daysPath = join(ROOT, 'src', 'data', 'days.json');
const previous = existsSync(daysPath) ? JSON.parse(readFileSync(daysPath, 'utf8')) : {};
const days = {};
for (const day of allDays()) {
  const candidates = vulns.filter((v) => v.day === day).map((v) => v.id);
  const kept = previous[day]?.patron && candidates.includes(previous[day].patron) ? previous[day].patron : null;
  let patron = overrides.patrons?.[day] ?? kept ?? candidates[0] ?? null;
  if (patron && !byId.has(patron)) {
    console.warn(`override ${day} → unknown id "${patron}", ignored`);
    patron = candidates[0] ?? null;
  }
  days[day] = { patron, others: candidates.filter((id) => id !== patron) };
}

const fields = ['id', 'kind', 'name', 'date', 'day', 'category', 'cves', 'cvss', 'kev', 'ransomware', 'born', 'absurd', 'vendor', 'product', 'description', 'canonical', 'links', 'logo', 'author', 'fame', 'source'];
const slim = vulns.map((v) => Object.fromEntries(fields.map((f) => [f, v[f]])));
mkdirSync(join(ROOT, 'src', 'data'), { recursive: true });
writeFileSync(join(ROOT, 'src', 'data', 'vulns.json'), JSON.stringify(slim, null, 1) + '\n');
writeFileSync(join(ROOT, 'src', 'data', 'days.json'), JSON.stringify(days, null, 1) + '\n');

const empty = Object.entries(days).filter(([, d]) => !d.patron).map(([day]) => day);
const count = (c) => vulns.filter((v) => v.category === c).length;
console.log(`days with a patron: ${366 - empty.length}/366`);
console.log(`empty days (need a santo minore): ${empty.join(', ') || 'none'}`);
console.log(`santi: ${count('santo')}, beati: ${count('beato')}, padri: ${count('padre')}, in KEV: ${vulns.filter((v) => v.kev).length}`);
