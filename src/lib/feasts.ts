// Movable feasts and observances: recurring days computed from a rule (and the year).
// Texts are AI-generated parody (CC BY-NC-SA 4.0), like the saints'.

type Rule =
  | { kind: 'fixed'; month: number; day: number }
  /** n-th weekday of a month (n = -1 for the last); month 0 = every month. weekday: 0 = Sunday. */
  | { kind: 'nthWeekday'; month: number; n: number; weekday: number }
  | { kind: 'yearDay'; day: number }
  | { kind: 'wholeMonth'; month: number }
  /** A given weekday falling on a given day of the month, every month (Friday the 13th). */
  | { kind: 'weekdayOnDay'; day: number; weekday: number };

type FeastText = { name: string; text: string; proverb: string };

export type Feast = {
  id: string;
  rule: Rule;
  /** RRULE for the iCalendar feed (with DTSTART in the anchor year). */
  rrule: string;
  it: FeastText;
  en: FeastText;
};

export const FEASTS: Feast[] = [
  {
    id: 'patch-tuesday',
    rule: { kind: 'nthWeekday', month: 0, n: 2, weekday: 2 },
    rrule: 'FREQ=MONTHLY;BYDAY=2TU',
    it: {
      name: 'Patch Tuesday, giorno di precetto',
      text: 'Secondo martedì del mese: Microsoft distribuisce le patch e i fedeli riavviano in raccoglimento. Si sconsiglia di fissare demo nel pomeriggio.',
      proverb: 'Martedì di patch, mercoledì di rollback.',
    },
    en: {
      name: 'Patch Tuesday, Day of Obligation',
      text: 'The second Tuesday of the month: Microsoft hands out patches and the faithful reboot in silent recollection. Avoid scheduling demos in the afternoon.',
      proverb: 'Patch on Tuesday, roll back on Wednesday.',
    },
  },
  {
    id: 'data-privacy-day',
    rule: { kind: 'fixed', month: 1, day: 28 },
    rrule: 'FREQ=YEARLY',
    it: {
      name: 'Giornata della protezione dei dati',
      text: "Anniversario della Convenzione 108 del Consiglio d'Europa (1981). Si festeggia leggendo davvero un banner dei cookie, almeno uno.",
      proverb: 'Dato condiviso, dato perduto.',
    },
    en: {
      name: 'Data Privacy Day',
      text: "Marks the anniversary of the Council of Europe's Convention 108 (1981). Celebrated by actually reading a cookie banner, at least one.",
      proverb: 'Data shared is data lost.',
    },
  },
  {
    id: 'world-backup-day',
    rule: { kind: 'fixed', month: 3, day: 31 },
    rrule: 'FREQ=YEARLY',
    it: {
      name: 'Giornata mondiale del backup',
      text: "Vigilia del pesce d'aprile, non a caso: chi non ha un backup domani scoprirà lo scherzo. Si festeggia provando un ripristino, non solo un salvataggio.",
      proverb: 'Backup non provato, backup sognato.',
    },
    en: {
      name: 'World Backup Day',
      text: "The eve of April Fools' Day, not by chance: whoever has no backup will get the joke tomorrow. Celebrated by trying a restore, not just a save.",
      proverb: 'An untested backup is a dream backup.',
    },
  },
  {
    id: 'world-password-day',
    rule: { kind: 'nthWeekday', month: 5, n: 1, weekday: 4 },
    rrule: 'FREQ=YEARLY;BYMONTH=5;BYDAY=1TH',
    it: {
      name: 'Giornata mondiale della password',
      text: "Si cambia 'Password1' in 'Password2' e ci si sente più sicuri. I più devoti attivano l'autenticazione a due fattori.",
      proverb: 'Password corta, notte lunga.',
    },
    en: {
      name: 'World Password Day',
      text: "People change 'Password1' to 'Password2' and feel safer. The most devout turn on two-factor authentication.",
      proverb: 'Short password, long night.',
    },
  },
  {
    id: 'sysadmin-day',
    rule: { kind: 'nthWeekday', month: 7, n: -1, weekday: 5 },
    rrule: 'FREQ=YEARLY;BYMONTH=7;BYDAY=-1FR',
    it: {
      name: 'Giornata del sistemista',
      text: 'Festa di chi fa funzionare tutto senza che nessuno se ne accorga, finché non smette. Si porta una torta in sala server, lontano dai rack.',
      proverb: 'Se nessuno si lamenta, il sistemista sta lavorando.',
    },
    en: {
      name: 'System Administrator Appreciation Day',
      text: 'The feast of those who keep everything running unnoticed, until it stops. Bring cake to the server room, well away from the racks.',
      proverb: "If nobody's complaining, the sysadmin is working.",
    },
  },
  {
    id: 'programmers-day',
    rule: { kind: 'yearDay', day: 256 },
    rrule: 'FREQ=YEARLY;BYYEARDAY=256',
    it: {
      name: 'Giornata del programmatore',
      text: "Il 256° giorno dell'anno, perché un byte ha 256 valori. Negli anni bisestili cade il 12 settembre, e qualcuno apre un bug.",
      proverb: 'Off-by-one oggi, off-by-one sempre.',
    },
    en: {
      name: "Programmers' Day",
      text: 'The 256th day of the year, because a byte holds 256 values. In leap years it falls on 12 September, and someone files a bug.',
      proverb: 'Off by one today, off by one forever.',
    },
  },
  {
    id: 'cybersecurity-month',
    rule: { kind: 'wholeMonth', month: 10 },
    rrule: 'FREQ=YEARLY',
    it: {
      name: 'Mese della sicurezza informatica',
      text: 'Ottobre è la quaresima della sicurezza: corsi obbligatori, simulazioni di phishing e buoni propositi. Non cliccate sui link, nemmeno su quelli del corso.',
      proverb: 'Chi clicca a ottobre si pente a novembre.',
    },
    en: {
      name: 'Cybersecurity Awareness Month',
      text: "October is security Lent: mandatory training, phishing simulations and good intentions. Don't click the links, not even the training ones.",
      proverb: 'Click in October, repent in November.',
    },
  },
  {
    id: 'computer-security-day',
    rule: { kind: 'fixed', month: 11, day: 30 },
    rrule: 'FREQ=YEARLY',
    it: {
      name: 'Giornata della sicurezza informatica',
      text: 'Istituita nel 1988, poche settimane dopo il Morris Worm. Si festeggia aggiornando qualcosa che si rimandava da mesi.',
      proverb: 'Meglio una patch oggi che un incidente domani.',
    },
    en: {
      name: 'Computer Security Day',
      text: "Established in 1988, a few weeks after the Morris Worm. Celebrated by updating something you've been putting off for months.",
      proverb: 'Better a patch today than an incident tomorrow.',
    },
  },
  {
    id: 'friday-13',
    rule: { kind: 'weekdayOnDay', day: 13, weekday: 5 },
    rrule: 'FREQ=MONTHLY;BYDAY=FR;BYMONTHDAY=13',
    it: {
      name: 'Venerdì 13, giorno nefasto',
      text: "Nessun deploy in produzione, nessuna migrazione del database, nessun 'tanto è una modifica piccola'. I più superstiziosi non aprono nemmeno il ticket.",
      proverb: 'Di venere e di tredici, né si deploya né si migra.',
    },
    en: {
      name: 'Friday the 13th, Unlucky Day',
      text: "No production deploys, no database migrations, no 'it's just a small change'. The superstitious don't even open the ticket.",
      proverb: 'Friday the 13th: nothing ships, so nothing breaks.',
    },
  },
];

function nthWeekday(year: number, month: number, n: number, weekday: number) {
  if (n > 0) {
    const first = new Date(year, month - 1, 1).getDay();
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  }
  const lastDay = new Date(year, month, 0);
  return lastDay.getDate() - ((lastDay.getDay() - weekday + 7) % 7);
}

/** Does the feast fall on this date? */
export function fallsOn(feast: Feast, date: Date) {
  const r = feast.rule;
  const [y, m, d] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  switch (r.kind) {
    case 'fixed':
      return m === r.month && d === r.day;
    case 'nthWeekday':
      return (r.month === 0 || r.month === m) && d === nthWeekday(y, m, r.n, r.weekday);
    case 'yearDay':
      return Math.round((date.getTime() - new Date(y, 0, 1).getTime()) / 86400000) + 1 === r.day;
    case 'wholeMonth':
      return m === r.month;
    case 'weekdayOnDay':
      return d === r.day && date.getDay() === r.weekday;
  }
}

export function feastsOn(date: Date) {
  return FEASTS.filter((f) => fallsOn(f, date));
}

/** First date (YYYYMMDD) on or after Jan 1 of `year` matching the rule, used as DTSTART in the feed. */
export function firstOccurrence(feast: Feast, year: number) {
  for (let i = 0; i < 400; i++) {
    const date = new Date(year, 0, 1 + i);
    if (fallsOn(feast, date)) return date;
  }
  throw new Error(`no occurrence for ${feast.id}`);
}
