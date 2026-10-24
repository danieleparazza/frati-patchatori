# Lunario dei Frati Patchatori

*The Patching Friars' Almanac* — un calendario dei santi in cui ogni giorno è dedicato a una vulnerabilità famosa, nel giorno in cui è stata divulgata.

Design e decisioni: [docs/DESIGN.md](docs/DESIGN.md).

## Sviluppo

```bash
npm install
npm run import   # aggiorna src/data/ da Vulnerability Garden, CISA KEV e cvelistV5
npm run dev
```

- `data/overrides.json`: patrono scelto a mano per un giorno (`"MM-DD": "id"`).
- `data/extra-vulns.json`: voci aggiunte a mano (santi minori, Padri della Chiesa).
- `src/data/saints/<id>.json`: testi parodistici IT/EN di un santo.
- `src/data/santini/<id>.svg`: santino del santo.

## Licenze

Uso non commerciale. Codice: [PolyForm Noncommercial 1.0.0](LICENSES/PolyForm-Noncommercial-1.0.0.md). Testi parodistici e santini: CC BY-NC-SA 4.0. Dati delle vulnerabilità: CC BY-SA 4.0, perché derivati da [Vulnerability Garden](https://vulnerability.garden) di Shellsharks. Dettagli in [LICENSE](LICENSE).

Santini e testi parodistici sono generati con AI; i dati tecnici sono reali.
