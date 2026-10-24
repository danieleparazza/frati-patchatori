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

## Flagelli e miracoli: `src/data/events/<id>.json`

`<id>` e i fatti sono in `data/events.json`. Il campo `tone` decide il registro:

- `normale`: parodia come per i santi, sugli attaccanti e sulle tecnologie.
- `sobrio` (danni seri a persone o servizi essenziali): niente battute su pazienti, utenti o vittime; ironia solo, e con misura, sugli attaccanti; la preghiera diventa una vera preghiera di riparazione.
- `lutto` (morti confermate o presunte): tono da necrologio, **nessuna parodia e nessuna preghiera** (ometti il campo); dire con precisione cosa è accertato e cosa no.

Flagello:
```json
{ "it": { "title": "", "chronicle": "", "lesson": "", "prayer": "", "remembrance": "" }, "en": { … } }
```
- **title**: "Il flagello di X" o un titolo da cronaca medievale ("La grande piaga di WannaCry"); per `lutto` un titolo sobrio ("In memoria: l'attacco a Synnovis").
- **chronicle** (*Cronaca*): 3–5 frasi, cosa è successo, quando, quanto è durato, chi ne è stato colpito.
- **lesson** (*Lezione appresa*): 1–3 frasi, cosa ha cambiato o insegnato.
- **prayer** (*Preghiera di riparazione*): breve, finisce con "Amen." (assente per `lutto`).
- **remembrance** (*Come si ricorda*): "Si ricorda …" / "Remembered by …", un gesto pratico (backup offline, MFA, piano di continuità…).
- Calamità (`noCulprit: true`): ricordare che non c'è stato attacco.

Miracolo:
```json
{ "it": { "title": "", "prodigy": "", "thaumaturge": "", "thanksgiving": "" }, "en": { … } }
```
- **title**: "Il miracolo di …"; **prodigy** (*Il prodigio*): 3–5 frasi; **thaumaturge** (*Il taumaturgo*): chi l'ha compiuto, come riconosciuto pubblicamente (persone, aziende, forze dell'ordine), con rispetto; **thanksgiving** (*Rendimento di grazie*): breve, finisce con "Amen.".

Immagini: `data/santini/f-<id>.json` per i flagelli (`frame`: `flagello`, o `flagello-grave` per `lutto`, con un emblema sobrio come un cero o un giglio) e `data/santini/m-<id>.json` per i miracoli (`frame`: `miracolo`).

## Demoni: `src/data/demons/<id>.json`

`<id>` e i fatti sono in `data/demons.json`.
```json
{ "it": { "title": "", "legend": "", "exorcism": "" }, "en": { … } }
```
- **title**: "Il demone X, <epiteto>" ("Il demone LockBit, principe dei leak site").
- **legend**: 3–5 frasi: origine, cosa fa, opere più note, e per gli esorcizzati come è stato fermato.
- **exorcism** (*Esorcismo*): 2–4 consigli pratici di difesa, in prosa, basati su `defenses`.
- Mai link a leak site o nomi di vittime private; i demoni si descrivono, non si celebrano.

Immagine: `data/santini/d-<id>.json` con `frame: "demone"`.

## Papi: `src/data/popes/<chiave>.json`

Chiavi: l'anno (`2014`), il decennio (`decade-2000`, `decade-2010`) o l'antipapa (`anti-<id>`). La cronotassi è in `data/popes.json`.
```json
{ "it": { "title": "", "encyclical": "" }, "en": { … } }
```
- **title**: "Papa Heartbleed I" (dinastie: "Papa CitrixBleed I" nel 2023, "Papa CitrixBleed II" nel 2025); "Antipapa Badlock".
- **encyclical** (*Enciclica*): si apre con un titolo latino tra virgolette (*"Heartbeat Sanguinis"*), poi 3–5 frasi su cosa quell'anno ha insegnato al mondo della sicurezza; per gli antipapi, perché l'hype ha superato l'impatto (senza deridere i ricercatori).

Immagine: `data/santini/papa-<chiave>.json` con `frame: "papa"` (`papa-2014`, `papa-decade-2000`, `papa-anti-badlock`).
