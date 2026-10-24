// Scourges and miracles (data/events.json), Bestiary demons (data/demons.json) and Popes (data/popes.json),
// with the cross-links between them and the saints.
import eventsData from '../../data/events.json';
import demonsData from '../../data/demons.json';
import popesData from '../../data/popes.json';
import { allVulns, vuln, type Vuln } from './calendar';
import type { Lang } from './i18n';

export type Tone = 'normale' | 'sobrio' | 'lutto';

export type CalendarEvent = {
  id: string;
  type: 'flagello' | 'miracolo';
  noCulprit: boolean;
  name: string;
  date: string;
  dateMeaning: string;
  summary: string;
  cves: string[];
  malware: string[];
  people: string[];
  sources: string[];
  confidence: string;
  tone: Tone;
};

export type Circle = 'worm' | 'botnet' | 'ransomware' | 'wiper' | 'spionaggio' | 'banking';

export type Demon = {
  id: string;
  name: string;
  aliases: string[];
  primary: Circle;
  secondary: Circle[];
  firstSeen: { year: number; approx?: boolean };
  status: 'active' | 'exorcised' | 'dormant';
  exorcism?: { operation?: string; date?: string; agencies?: string[] | string; note?: string };
  cves: string[];
  relatedEvents: string[];
  defenses: string[];
  attackId: string | null;
  summary: string;
  sources: string[];
};

export type ScourgeText = { title: string; chronicle: string; lesson: string; prayer?: string; remembrance: string };
export type MiracleText = { title: string; prodigy: string; thaumaturge: string; thanksgiving: string };
export type DemonText = { title: string; legend: string; exorcism: string };
export type PopeText = { title: string; encyclical: string };
type Texts<T> = Partial<Record<Lang, T>>;

const events = (eventsData as { events: CalendarEvent[] }).events;
const demons = (demonsData as { demons: Demon[] }).demons;
const popes = popesData as {
  years: { year: number; pope: string; cardinals: string[]; why: string | null }[];
  decades: { decade: number; pope: string; runnerUp: string }[];
  antipopes: { id: string; why: string; sources: string[] }[];
};

const eventTexts = import.meta.glob<Texts<ScourgeText & MiracleText>>('../data/events/*.json', { eager: true, import: 'default' });
const demonTexts = import.meta.glob<Texts<DemonText>>('../data/demons/*.json', { eager: true, import: 'default' });
const popeTexts = import.meta.glob<Texts<PopeText>>('../data/popes/*.json', { eager: true, import: 'default' });

export const CIRCLES: Circle[] = ['worm', 'botnet', 'ransomware', 'wiper', 'spionaggio', 'banking'];

// ---------- events ----------

export const allEvents = () => events;
export const event = (id: string) => events.find((e) => e.id === id)!;
export const eventsOn = (mmdd: string) => events.filter((e) => e.date.slice(5) === mmdd);
export const eventText = (e: CalendarEvent, lang: Lang) => eventTexts[`../data/events/${e.id}.json`]?.[lang];
export const eventCardKey = (e: CalendarEvent) => `${e.type === 'miracolo' ? 'm' : 'f'}-${e.id}`;

// ---------- demons ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const allDemons = () => demons;
export const demon = (id: string) => demons.find((d) => d.id === id)!;
export const demonText = (d: Demon, lang: Lang) => demonTexts[`../data/demons/${d.id}.json`]?.[lang];
export const demonCardKey = (d: Demon) => `d-${d.id}`;
export const demonsByCircle = (c: Circle) => demons.filter((d) => d.primary === c);

function demonMatches(d: Demon, name: string) {
  const n = norm(name);
  return [d.name, ...d.aliases].some((a) => {
    const m = norm(a);
    return m.length > 2 && (n === m || n.includes(m) || m.includes(n));
  });
}

// ---------- cross-links ----------

const vulnsByCve = new Map<string, Vuln[]>();
for (const v of allVulns()) for (const c of v.cves) vulnsByCve.set(c, [...(vulnsByCve.get(c) ?? []), v]);

const uniq = <T extends { id: string }>(xs: T[]) => [...new Map(xs.map((x) => [x.id, x])).values()];

export const vulnsForCves = (cves: string[]) => uniq(cves.flatMap((c) => vulnsByCve.get(c) ?? []));
export const eventsForVuln = (v: Vuln) => events.filter((e) => e.cves.some((c) => v.cves.includes(c)));
export const demonsForVuln = (v: Vuln) => demons.filter((d) => d.cves.some((c) => v.cves.includes(c)));
export const demonsForEvent = (e: CalendarEvent) => demons.filter((d) => e.malware.some((m) => demonMatches(d, m)) || demonMatches(d, e.name));
export const eventsForDemon = (d: Demon) => events.filter((e) => demonsForEvent(e).some((x) => x.id === d.id));

// ---------- popes ----------

export type PopeEntry = { key: string; kind: 'year' | 'decade' | 'anti'; label: string; vuln: Vuln; cardinals: (Vuln | string)[]; why?: string | null };

const asVuln = (id: string) => allVulns().find((v) => v.id === id);

export function allPopes(): PopeEntry[] {
  return [
    ...popes.years.map((y) => ({
      key: String(y.year),
      kind: 'year' as const,
      label: String(y.year),
      vuln: vuln(y.pope),
      cardinals: y.cardinals.map((c) => asVuln(c) ?? c),
      why: y.why,
    })),
    ...popes.decades.map((d) => ({ key: `decade-${d.decade}`, kind: 'decade' as const, label: `${d.decade}s`, vuln: vuln(d.pope), cardinals: [asVuln(d.runnerUp) ?? d.runnerUp] })),
    ...popes.antipopes.map((a) => ({ key: `anti-${a.id}`, kind: 'anti' as const, label: a.id, vuln: vuln(a.id), cardinals: [], why: a.why })),
  ];
}

export const popeText = (key: string, lang: Lang) => popeTexts[`../data/popes/${key}.json`]?.[lang];
export const popesForVuln = (v: Vuln) => allPopes().filter((p) => p.vuln.id === v.id);
export const popeCardKey = (key: string) => `papa-${key}`;
