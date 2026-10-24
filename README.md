# Lunario dei Frati Patchatori

*The Patching Friars' Almanac* — un calendario dei santi in cui ogni giorno è dedicato a una vulnerabilità famosa, nel giorno in cui è stata divulgata. Online su [fratipatchatori.it](https://fratipatchatori.it).

Design e decisioni: [docs/DESIGN.md](docs/DESIGN.md).

## Sviluppo

```bash
npm install
npm run import   # aggiorna src/data/ da Vulnerability Garden, CISA KEV e cvelistV5
npm run dev
```

Dati e contenuti:

- `data/overrides.json`: correzioni manuali (patroni, date, CVE, campi sbagliati della fonte, longevità, assurde, esclusioni).
- `data/extra-vulns.json`: voci aggiunte a mano (santi minori, Padri della Chiesa, Papi mancanti).
- `data/events.json`, `data/demons.json`, `data/popes.json`, `data/logos.json`: flagelli e miracoli, Bestiario, Papi, loghi CC0.
- `src/data/saints/`, `src/data/events/`, `src/data/demons/`, `src/data/popes/`: testi IT/EN.
- `data/santini/<id>.json` → `node scripts/build-santini.mjs` → `src/data/santini/<id>.svg`.

Le immagini di condivisione sono in cache in `.cache/og` (per hash del contenuto): la prima build impiega qualche minuto, le successive pochi secondi.

Come si scrivono i contenuti: [docs/CONTENT.md](docs/CONTENT.md).

## API

API pubblica in sola lettura, gratuita e senza chiave. Riferimento interattivo (Swagger): [fratipatchatori.it/api/](https://fratipatchatori.it/api/) · specifica OpenAPI: [`public/api/openapi.yaml`](public/api/openapi.yaml).

| Endpoint | Cosa restituisce |
|---|---|
| `GET https://fratipatchatori.it/api/v1/{lang}/days/{MM-DD}.json` | Un giorno: patrono, altri santi del giorno, ricorrenze |
| `GET https://fratipatchatori.it/api/v1/{lang}/year.json` | Tutti i 366 giorni (circa 800 KB) |
| `GET https://<worker>/api/v1/{lang}/today?tz=Europe/Rome` | Il giorno di oggi nel fuso indicato (predefinito Europe/Rome) |

`lang` è `it` o `en`. I file dei giorni sono statici su GitHub Pages, con CORS aperto; `today` passa dal Worker in `push/`, perché un sito statico non sa che giorno è.

```bash
curl -s https://fratipatchatori.it/api/v1/it/days/10-24.json | jq '.patron | {title, cves, cvss, kev}'
```

```json
{
  "title": "San Citrix Bleed, che perdeva i token di sessione",
  "cves": ["CVE-2023-4966"],
  "cvss": 9.4,
  "kev": true
}
```

Ogni giorno contiene `patron` (`null` nei giorni vacanti) con dati tecnici (`cves`, `cvss`, `kev`, `ransomware`, `vendor`, `product`, `author`, `canonical`) e testi parodistici (`texts`: patronato, agiografia, preghiera, festa, proverbio), più `others`, `observances` (flagelli e miracoli), il link alla pagina, l'immagine di condivisione e l'embed. Stesse licenze del sito: testi CC BY-NC-SA 4.0, dati CC BY-SA 4.0.

## App e notifiche

Il sito è una PWA installabile (manifest per lingua, service worker in `public/sw.js`, che tiene offline i prossimi sette giorni). Le notifiche giornaliere passano da un Cloudflare Worker (`push/`): conserva le iscrizioni in KV e ogni ora manda un push vuoto a chi ha le 8 del mattino; il service worker scarica il santo del giorno e mostra la notifica.

```bash
cd push
npx wrangler login
npx wrangler kv namespace create SUBS        # metti l'id in wrangler.toml
npx wrangler secret put VAPID_PRIVATE_JWK    # chiave privata VAPID in formato JWK
npx wrangler deploy                          # poi metti l'URL del Worker in src/lib/push.ts
```

## Licenze

Uso non commerciale. Codice: [PolyForm Noncommercial 1.0.0](LICENSES/PolyForm-Noncommercial-1.0.0.md). Testi parodistici e santini: CC BY-NC-SA 4.0. Dati delle vulnerabilità: CC BY-SA 4.0, perché derivati da [Vulnerability Garden](https://vulnerability.garden) di Shellsharks. Dettagli in [LICENSE](LICENSE).

Santini e testi parodistici sono generati con AI; i dati tecnici sono reali.
