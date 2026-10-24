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

- Astro, completamente statico, su GitHub Pages. Pagine per giorno e lingua (`/it/12-09/`, `/en/12-09/`); gli URL finiscono sempre con `/`.
- Home: santo di oggi, nel fuso orario del visitatore, nella lingua del browser (IT per browser italiani, altrimenti EN).
- **Viste del calendario**: giorno, settimana (costruita nel browser per qualsiasi settimana e anno) e mese (griglia allineata ai giorni della settimana dell'anno di chi guarda). Cambio vista e tasto "Oggi" su ogni pagina; scorciatoie ← → G/S/M T (D/W/M in inglese).
- **Scheda di ogni vulnerabilità** (`/it/santo/<id>/`, `/en/saint/<id>/`), con **santi affini**: stessa famiglia di nome (bleed, dirty, ghost…), stesso prodotto, stesso anno, stesso giorno.
- **Cerca**: testo più categorie come filtri combinabili (più famose, più pericolose, più sfruttate, più longeve, più assurde), con punteggio e posizione. Longevità (`born`) e "assurde" sono curate a mano in `data/overrides.json`.
- **Condivisione**: WhatsApp, Telegram, X, Bluesky, LinkedIn, Facebook, email, copia link, menu di condivisione nativo.
- **PNG di condivisione** (1200×630) per ogni giorno e lingua: anteprima OpenGraph e pulsante di download.
- **Feed iCalendar** per lingua (`calendar/<lang>.ics`), un evento annuale per patrono, con link per l'iscrizione su ogni pagina.
- Il 29 febbraio è un giorno normale con il suo santo.

## Prossime sezioni (decise, da fare in quest'ordine)

### 1. Feste mobili
- Patch Tuesday (secondo martedì del mese), Data Privacy Day (28/1), Safer Internet Day (febbraio), World Backup Day (31/3), World Password Day (primo giovedì di maggio), Sysadmin Day (ultimo venerdì di luglio), Programmers' Day (256° giorno), ottobre mese della sicurezza, Computer Security Day (30/11), Venerdì 13.
- Calcolate nel codice, mostrate in una fascia sopra il santo.
- Feed `.ics` separato **Ricorrenze** (feste mobili, flagelli e miracoli).

### 2. Flagelli e miracoli
- **Flagelli**: grandi attacchi e incidenti con data precisa; comprendono le calamità senza attaccante, con l'etichetta "senza colpevole" (es. CrowdStrike, 19/7/2024).
- **Miracoli**: le volte in cui è andata bene (kill switch di WannaCry, backdoor di xz).
- Campi propri. Flagelli: *Cronaca*, *Lezione appresa*, *Preghiera di riparazione*, *Come si ricorda*. Miracoli: *Il prodigio*, *Il taumaturgo*, *Rendimento di grazie*.
- Casi con conseguenze sulle persone (ospedali, emergenze): tono sobrio, niente preghiera parodistica, cornice scura.
- Nella pagina del giorno sotto il santo; immagini nello stile dei santini con cornici dedicate.
- Processo: un agente propone ~60 eventi verificati su fonti primarie, la lista si approva, poi si scrivono i testi.
- Modello dati: `data/events.json` con `{ id, type, name, date | rule, cves[], links[], description }`.

### 3. Papi
- **Papa dell'anno** (dal 1999) e **Papa del decennio** (dagli anni Duemila), periodi allineati al calendario. **Antipapi**: vulnerabilità sopravvalutate, poche e con fonti.
- Un Papa può essere anche santo. Numerazione a dinastie (*Papa CitrixBleed I*, *II*).
- Anno in corso "sede vacante" fino al 31 dicembre; decennio in corso fino alla sua fine.
- Storico: 1999–2013 proposto da un agente con fonti, dal 2014 dal punteggio di fama; approvazione manuale.
- **Conclave** dal 2026: 5 candidate col punteggio più alto + proposte della community, voto su GitHub Discussions dall'1 al 20 dicembre, "fumata bianca" il 31 con un commit.
- Pagine: cronotassi (decenni in evidenza, Antipapi a parte) e pagina per Papa (santino con tiara, enciclica, link alla scheda da santo, "cardinali" dell'anno).

### 4. Bestiario
- Pagina unica senza tab, con indice e sezioni: Demoni (per girone), Flagelli, Miracoli, Padri della Chiesa, Beati, Santi minori. Le stesse categorie sono anche filtri in Cerca.
- **Gironi**: worm, botnet, ransomware ed estorsione, wiper, spionaggio di Stato, trojan bancari e infostealer. Un girone principale per demone, altri come etichetta.
- Scheda del demone: nomi e alias, girone, prima apparizione, opere (flagelli), armi (CVE, con link ai santi), esorcismo (difese), stato (attivo / esorcizzato / dormiente).
- Fonte: MITRE ATT&CK. Niente link ai leak site né classifiche delle vittime; i demoni non stanno nel calendario.

### Trasversale
- Menu: nuove voci **Papi** e **Bestiario**.
- Collegamenti incrociati santi ↔ flagelli ↔ demoni (es. EternalBlue → WannaCry, NotPetya).
- Si scherza sugli attaccanti e sulle tecnologie, mai sulle vittime.

### Rimandato
- **Collezioni e profili utente** (stati del santino, profili pubblici, GitHub come database). Opzioni valutate: issue + GitHub Action, Gist dell'utente con OAuth, backend vero. Attenzione: "sono stato colpito" è un dato sensibile; servirebbero informativa GDPR e cancellazione.

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
