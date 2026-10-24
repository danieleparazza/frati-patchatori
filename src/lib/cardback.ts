// What goes on the back of a holy card (and on the right side of the share image), for every kind
// of entry. Used by the PNG renderer (src/lib/og.ts) and by the full-screen flip card on the page.
import { dayLabel, formatDate, saint, saintTitle, type Vuln } from './calendar';
import {
  demonText,
  demonsForEvent,
  demonsForVuln,
  eventText,
  eventsForDemon,
  eventsForVuln,
  eventsOn,
  papalLine,
  popeText,
  vulnsForCves,
  type CalendarEvent,
  type Demon,
  type PopeEntry,
} from './extras';
import { t, type Lang } from './i18n';

export type CardBack = {
  /** Small line above the title: day, category or Pope year. */
  kicker: string;
  title: string;
  /** Patronage or first sentence: what the share image shows under the title. */
  subtitle: string;
  /** Longer sections for the back: prayer, proverb, encyclical… */
  sections: { label: string; text: string }[];
  /** Relations: Pope, demons, scourges, commemorations. */
  relations: string[];
  /** Footer label before the domain. */
  footer: string;
  mourning?: boolean;
};

const names = (xs: string[]) => xs.join(', ');
const firstSentence = (text: string) => (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim();

export function saintBack(lang: Lang, v: Vuln, opts: { kicker?: string; mmdd?: string } = {}): CardBack {
  const s = t(lang);
  const text = saint(v.id)?.[lang];
  const demons = demonsForVuln(v).map((d) => d.name);
  const events = eventsForVuln(v).map((e) => eventText(e, lang)?.title ?? e.name);
  const today = opts.mmdd ? eventsOn(opts.mmdd).map((e) => eventText(e, lang)?.title ?? e.name) : [];
  const relations = [
    papalLine(v, lang).text,
    demons.length ? `${s.usedBy}: ${names(demons)}` : '',
    events.length ? `${s.scourgesOfSaint}: ${names(events)}` : '',
    today.length ? `${s.commemorated}: ${names(today)}` : '',
  ].filter(Boolean);
  const sections = text
    ? [
        { label: s.prayer, text: text.prayer },
        text.proverb ? { label: s.proverb, text: text.proverb } : { label: s.feast, text: text.feast },
      ]
    : v.description
      ? [{ label: s.technical, text: firstSentence(v.description) }]
      : [];
  return {
    kicker: opts.kicker ?? dayLabel(v.day, lang),
    title: saintTitle(v, lang),
    subtitle: text ? `${s.patronage} ${text.patronage}` : v.cves.join(' · ') || v.date.slice(0, 4),
    sections,
    relations,
    footer: s.siteTitle,
  };
}

export function vacantBack(lang: Lang, mmdd: string): CardBack {
  const s = t(lang);
  const today = eventsOn(mmdd).map((e) => eventText(e, lang)?.title ?? e.name);
  return { kicker: dayLabel(mmdd, lang), title: s.vacant, subtitle: s.vacantText, sections: [], relations: today.length ? [`${s.commemorated}: ${names(today)}`] : [], footer: s.siteTitle };
}

export function eventBack(lang: Lang, e: CalendarEvent): CardBack {
  const s = t(lang);
  const text = eventText(e, lang);
  const miracle = e.type === 'miracolo';
  const sections = text
    ? miracle
      ? [
          { label: s.thaumaturge, text: text.thaumaturge },
          { label: s.thanksgiving, text: text.thanksgiving },
        ]
      : [{ label: s.lesson, text: text.lesson }, ...(text.prayer ? [{ label: s.reparation, text: text.prayer }] : [{ label: s.remembrance, text: text.remembrance }])]
    : [];
  const demons = demonsForEvent(e).map((d) => d.name);
  const saints = vulnsForCves(e.cves).map((v) => v.name);
  return {
    kicker: `${miracle ? s.miracle : s.scourge} · ${formatDate(e.date, lang)}`,
    title: text?.title ?? e.name,
    subtitle: firstSentence(text?.chronicle ?? text?.prodigy ?? e.summary),
    sections,
    relations: [demons.length ? `${s.worksOf}: ${names(demons)}` : '', saints.length ? `CVE: ${names(saints)}` : ''].filter(Boolean),
    footer: s.siteTitle,
    mourning: e.tone === 'lutto',
  };
}

export function demonBack(lang: Lang, d: Demon): CardBack {
  const s = t(lang);
  const text = demonText(d, lang);
  const weapons = vulnsForCves(d.cves).map((v) => v.name);
  const works = eventsForDemon(d).map((e) => eventText(e, lang)?.title ?? e.name);
  return {
    kicker: s.circles[d.primary],
    title: text?.title ?? d.name,
    subtitle: firstSentence(text?.legend ?? d.summary),
    sections: text ? [{ label: s.exorcismTitle, text: text.exorcism }] : [],
    relations: [weapons.length ? `${s.weapons.split(' (')[0]}: ${names(weapons)}` : '', works.length ? `${s.works}: ${names(works)}` : ''].filter(Boolean),
    footer: `${s.bestiary} · ${s.siteTitle}`,
  };
}

export function popeBack(lang: Lang, p: PopeEntry): CardBack {
  const s = t(lang);
  const text = popeText(p.key, lang);
  const encyclical = text?.encyclical ?? p.why ?? '';
  return {
    kicker: p.kind === 'year' ? s.popeOf(p.key) : p.kind === 'decade' ? s.popeOfDecade(p.label) : s.antipope,
    title: text?.title ?? `${p.kind === 'anti' ? s.antipope : s.pope} ${p.vuln.name}`,
    subtitle: firstSentence(encyclical.replace(/^[«"“][^»"”]*[»"”]\.?\s*/, '')),
    sections: encyclical ? [{ label: s.encyclical, text: encyclical }] : [],
    relations: p.cardinals.length ? [`${s.cardinals}: ${names(p.cardinals.map((c) => (typeof c === 'string' ? c : c.name)))}`] : [],
    footer: `${s.popes} · ${s.siteTitle}`,
  };
}
