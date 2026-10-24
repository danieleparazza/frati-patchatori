# Lunario dei Frati Patchatori — design

*The Patching Friars' Almanac.* Un calendario dei santi parodistico: ogni giorno dell'anno ha come "santo" una vulnerabilità famosa.

Repo: `danieleparazza/frati-patchatori` · Hosting: GitHub Pages.
Pubblico: colleghi (Slack) e community infosec. Ricerca preliminare: non esiste nulla di equivalente.

## Dati

- **Fonte principale**: [Vulnerability Garden](https://vulnerability.garden) by Shellsharks (CC BY-SA 4.0), ~1.286 vulnerabilità con nome, campo `date-published` sempre presente. Mappate per data di disclosure (MM-DD) coprono 349/366 giorni.
  - `vulns.json` non è JSON valido: leggere il front matter YAML di `_vulns/<anno>/*.md` dal repo upstream (codeberg.org/shellsharks/vulnerability-garden).
  - ~172 date coincidono con `date-added` → possibilmente approssimative.
  - Il campo `image` (316 voci) è un logo senza licenza registrata.
- **Santo patrono fisso** per giorno: scelto con un punteggio di fama (CVSS, presenza in CISA KEV, logo, n° link) + override manuali. Gli altri candidati vanno in "Si ricordano anche…" (solo nome + link, niente testi parodistici).
- **Santi minori**: per i giorni scoperti, CVE curiose/assurde reali, sempre con link NVD come prova.
- **Beati**: vulnerabilità con nome ma senza CVE ("non ancora canonizzate dal MITRE").
- **Padri della Chiesa**: vulnerabilità storiche pre-CVE (es. Morris Worm, 2 novembre).
- **Aggiornamento**: GitHub Action mensile che aggiunge nuove voci da Vulnerability Garden e KEV a "Si ricordano anche…". I patroni cambiano solo a mano.
- Rotazione annuale dei patroni: rimandata (possibile evoluzione: solennità fisse + rotazione per gli altri).

## Contenuti

Generati una volta in sessione con AI e committati nel repo (rivedibili a mano), a blocchi mensili.

Per ogni patrono, IT + EN (EN adattato, non tradotto letteralmente):
- titolo ("San Heartbleed, vergine e martire")
- patronato
- agiografia (2–3 righe)
- preghiera / giaculatoria
- come si festeggia
- proverbio del giorno (non per i santi minori)

Più un **box tecnico serio**: CVE-ID, CVSS, prodotto, link NVD.

**Santini**: SVG unico per ogni patrono generato con AI; logo ufficiale solo dove la licenza è esplicita.

## Sito

- Astro, completamente statico; pagine per giorno e lingua (`/it/12-09`, `/en/12-09`).
- Home: santo di oggi, nel fuso orario del visitatore, nella lingua del browser (IT per browser italiani, altrimenti EN).
- Navigazione giorni, permalink, vista mese, ricerca client-side.
- PNG del santino generati al build: anteprima OpenGraph (Slack/social) + pulsante download.
- Il 29 febbraio è un giorno normale con il suo santo.

## Trasparenza AI (AI Act art. 50)

- Etichetta visibile "🤖 Immagine e testi generati con AI" sotto ogni santino.
- Pagina "Info" + footer: cosa è generato (santini, agiografie, preghiere, proverbi), cosa è dato reale (CVE, date, CVSS, link), con quale modello.
- Metadati IPTC `DigitalSourceType = trainedAlgorithmicMedia`: `<metadata>` negli SVG, XMP/IPTC nei PNG. Niente firma C2PA.

## Licenze

- Niente uso commerciale, dove la licenza delle fonti lo permette.
- Codice: PolyForm Noncommercial 1.0.0 (source-available, non "open source" secondo la definizione OSI).
- Testi parodistici, santini e immagini di condivisione: CC BY-NC-SA 4.0.
- Dati delle vulnerabilità (vulns.json, days.json, data/overrides.json, data/extra-vulns.json): CC BY-SA 4.0, obbligatorio perché derivati da Vulnerability Garden (ShareAlike non permette di aggiungere il vincolo non commerciale).
- Le versioni fino al commit 7e8f4a6 restano MIT + CC BY-SA 4.0.
- Loghi di terzi: restano sotto la propria licenza, elencati a parte.
