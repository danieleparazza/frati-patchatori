# Lunario dei Frati Patchatori

*The Patching Friars' Almanac* — un calendario dei santi in cui ogni giorno è dedicato a una vulnerabilità famosa, nel giorno in cui è stata divulgata.

Design e decisioni: [docs/DESIGN.md](docs/DESIGN.md).

## Sviluppo

```bash
npm install
npm run import   # aggiorna src/data/ da Vulnerability Garden, CISA KEV e cvelistV5
npm run dev
```

Dati e contenuti:

- `data/overrides.json`: correzioni manuali (patroni, date, CVE, longevità, assurde, esclusioni).
- `data/extra-vulns.json`: voci aggiunte a mano (santi minori, Padri della Chiesa, Papi mancanti).
- `data/events.json`, `data/demons.json`, `data/popes.json`, `data/logos.json`: flagelli e miracoli, Bestiario, Papi, loghi CC0.
- `src/data/saints/`, `src/data/events/`, `src/data/demons/`, `src/data/popes/`: testi IT/EN.
- `data/santini/<id>.json` → `node scripts/build-santini.mjs` → `src/data/santini/<id>.svg`.

Come si scrivono i contenuti: [docs/CONTENT.md](docs/CONTENT.md).

## Licenze

Uso non commerciale. Codice: [PolyForm Noncommercial 1.0.0](LICENSES/PolyForm-Noncommercial-1.0.0.md). Testi parodistici e santini: CC BY-NC-SA 4.0. Dati delle vulnerabilità: CC BY-SA 4.0, perché derivati da [Vulnerability Garden](https://vulnerability.garden) di Shellsharks. Dettagli in [LICENSE](LICENSE).

Santini e testi parodistici sono generati con AI; i dati tecnici sono reali.
