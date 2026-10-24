# Guida ai contenuti

Come si scrivono santi, santini e le altre voci del lunario. Gli esempi migliori sono i santi di gennaio in `src/data/saints/` e `data/santini/`.

## Principi

- **I fatti sono veri.** Date, CVE, prodotti, ricercatori e conseguenze si verificano su fonti primarie (advisory del vendor, post o paper dei ricercatori, NVD, CISA). Se non sei sicuro di un fatto, cercalo online; se resta incerto, non scriverlo o attenualo ("secondo i ricercatori…").
- **La parodia è sui bug, sulle tecnologie e sugli attaccanti, mai sulle vittime** né sulle persone che hanno scoperto o corretto il problema.
- **Niente contenuti offensivi** verso religioni, gruppi o persone reali. La cornice religiosa è affettuosa, da lunario popolare.
- L'inglese è un **adattamento**, non una traduzione parola per parola: i proverbi in particolare vanno riscritti perché suonino naturali.

## Testi di un santo: `src/data/saints/<id>.json`

`<id>` è l'id della vulnerabilità in `src/data/vulns.json`.

```json
{
  "it": { "title": "", "patronage": "", "hagiography": "", "prayer": "", "feast": "", "proverb": "" },
  "en": { "title": "", "patronage": "", "hagiography": "", "prayer": "", "feast": "", "proverb": "" }
}
```

- **title**: "San X, <epiteto>" (it) / "Saint X, <epithet>" (en). Per i beati (senza CVE) "Beato X" / "Blessed X"; per i Padri della Chiesa (prima del 1999) va bene "San X, Padre della Chiesa" o un epiteto. Davanti a vocale: "Sant'X".
- **patronage**: completa la frase "Patrono …" (it, comincia con *di/dei/delle…*) e "Patron of …" (en, senza "of"). Due o tre categorie, l'ultima ironica.
- **hagiography**: 2–4 frasi, la storia vera raccontata come una leggenda: quando, chi l'ha scoperto, cosa permetteva, perché è famoso.
- **prayer**: invocazione breve, che finisce con "Amen."
- **feast**: "Si festeggia …" / "Celebrated by …": la mitigazione vera (patch, versione, configurazione) più una battuta.
- **proverb**: in stile lunario. **Omettilo per i santi minori** (`"kind": "minor"` in vulns.json).

Lunghezza: come gennaio, circa 120–180 parole per lingua in totale.

## Santino: `data/santini/<id>.json`

```json
{ "label": "Nome breve", "motto": "MOTTO LATINO", "niche": ["#top", "#bottom"], "accent": "#ribbon", "emblem": "<frammento SVG>" }
```

- **label**: nome breve della vulnerabilità (≤ 18 caratteri se possibile).
- **motto**: gioco di parole in latino maccheronico, in maiuscolo, ≤ 26 caratteri ("SUDO ERGO SUM", "JNDI DELENDA EST").
- **niche**: due colori scuri o medi per il gradiente della nicchia; **accent**: colore del nastro (scuro, il testo è crema).
- **emblem**: l'"attributo iconografico" del santo, un frammento SVG centrato su (150,180), dentro circa x 90–210, y 115–250. Solo forme (path, rect, circle, ellipse, line, polygon) e testo con `font-family="'EB Garamond', Georgia, serif"`: niente emoji, immagini esterne o altri font, perché il santino viene reso anche da resvg. Il centro della nicchia è scuro: usa colori chiari o contorni chiari (`#fbf3dd`, `#d9ad55`, `#bfc9d1`) perché l'emblema si veda.
- **frame** (opzionale): `santo` (default), `papa`, `demone`, `flagello`, `flagello-grave`, `miracolo`.
- Dopo aver scritto il file: `node scripts/build-santini.mjs <id>` genera `src/data/santini/<id>.svg` (con i metadati AI già inclusi).

## Correzioni ai dati: `data/overrides.json`

- `patrons`: patrono scelto a mano per un giorno.
- `dates`: data di divulgazione corretta quando Vulnerability Garden sbaglia.
- `born`: anno di introduzione del difetto, solo se ben documentato (classifica "più longeve").
- `absurd`: vulnerabilità assurde o curiose (classifica "più assurde").
- `exclude`: voci da nascondere.

Poi `npm run import -- --offline` rigenera `src/data/`.
