#!/usr/bin/env node
// Markdown summary of what a data import changed, for the review issue opened by the
// monthly update workflow. Usage: node scripts/diff-vulns.mjs <old vulns.json> <old days.json>
import { readFileSync } from 'node:fs';

const [oldVulnsPath, oldDaysPath] = process.argv.slice(2);
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const oldVulns = new Map(load(oldVulnsPath).map((v) => [v.id, v]));
const oldDays = load(oldDaysPath);
const vulns = load('src/data/vulns.json');
const days = load('src/data/days.json');
const site = 'https://fratipatchatori.it';

const added = vulns.filter((v) => !oldVulns.has(v.id));
const redated = vulns.filter((v) => oldVulns.has(v.id) && oldVulns.get(v.id).date !== v.date);
const newPatrons = Object.keys(days).filter((d) => days[d].patron !== oldDays[d]?.patron);

const line = (v) => `- [${v.name}](${site}/it/santo/${v.id}/) — ${v.date}${v.cves.length ? ' · ' + v.cves.join(', ') : ''}${v.canonical ? ` · [fonte](${v.canonical})` : ''}`;
const out = [
  `Aggiornamento automatico dei dati da Vulnerability Garden e CISA KEV.`,
  '',
  `Controlla che nomi e fonti delle nuove voci non siano offensivi o inappropriati. Se qualcosa non va, escludilo in \`data/overrides.json\` o correggilo a mano.`,
  '',
  `## Nuove voci (${added.length})`,
  ...(added.length ? added.map(line) : ['Nessuna.']),
  '',
  `## Date cambiate (${redated.length})`,
  ...(redated.length ? redated.map((v) => `- ${v.name}: ${oldVulns.get(v.id).date} → ${v.date}`) : ['Nessuna.']),
  '',
  `## Patroni cambiati (${newPatrons.length})`,
  ...(newPatrons.length ? newPatrons.map((d) => `- ${d}: ${oldDays[d]?.patron ?? '—'} → ${days[d].patron ?? '—'}`) : ['Nessuno.']),
];
console.log(out.join('\n'));
