# CLAUDE.md — Gesty (prototipo)

Questo file è letto automaticamente da Claude Code a ogni avvio. Definisce cos'è il
progetto, i principi non negoziabili, e come lavorare. **Leggilo per intero prima di
toccare qualsiasi cosa.**

---

## Cos'è Gesty

App desktop personale di gestione spese, utente singolo (persona "Marco", Vienna).
Legge i dati di spesa da export CSV della carta Curve; supporta anche **spese manuali**
(decisione s21). Trattata con rigore professionale benché sia uno strumento personale.

Questo repository è il **prototipo React** (Vite) che dà vita al design fatto in Figma.
Non è il prodotto finale: è lo strumento per validare i flussi utente in modo interattivo.

---

## Principi di design — NON NEGOZIABILI

Valgono per ogni riga di UI. Se una scelta li viola, è sbagliata anche se "sta bene".

1. **Calmo non affollato** — densità leggibile, mai un muro di cifre.
2. **Onesto non lusinghiero** — niente verdetti, budget, lodi. Descrittivo mai normativo.
   Direzione ≠ valenza: −% non significa "bravo", +% non significa "attenzione".
3. **Esplorabile non reportabile** — ogni vista invita la domanda successiva; mai
   costringere a costruire un report per avere una risposta.
4. **Significato oltre il colore** — la direzione passa SEMPRE da segno + testo, mai
   dal colore da solo (accessibilità + principio).
5. **Headline first, depth on demand** — il numero che conta si vede subito; il
   dettaglio si apre a richiesta.
6. **Fatto vs stima sempre distinti** — storia = solido, proiezione = tratteggiato +
   etichettato. Mai confondere speso con proiettato.

Spec completa: `context/03-design-principles.md`.

---

## Regole dati che contano (data contract)

- La spesa entra **principalmente via CSV Curve** (solo spese, niente entrate/saldi).
- **Spesa manuale (s21):** l'utente può aggiungere a mano ciò che Curve non vede
  (contanti, carte non aggregate, prestiti). È l'**eccezione**, non la norma.
  - origine **marcata** in tabella (badge discreto, forma+label, mai colore da solo —
    famiglia del badge ½). Distingue "fatto-dichiarato-da-te" da "fatto-importato".
    Il punto è la **verificabilità**, non la fiducia.
  - split **scelto all'inserimento** (100% default / 50-50), categoria scelta a mano.
  - vive **fuori dal merge CSV** (re-import non la tocca, niente doppioni).
  - entra in tutte le analitiche (ricorrenza, equivalenze incluse).
- **Split = proprietà della carta:** ••8480 condivisa = 50/50; tutte le altre = 100%.
  Le entrate sono **sempre 100%** dell'utente (mai split).
- Cifre sempre su **quota tua** (your-share), mai sul lordo.
- Cashback (righe CPT) esclusi dai totali.
- Dedup: data + ora + merchant + importo + carta (Curve non ha ID univoco).

Dettagli: `context/data-contract-curve-csv.md`, `context/06-features.md`.

---

## I flussi utente (le schermate progettate)

Verificato sul Figma reale (pagina "Screens", 6 sezioni). 9 schermate uniche:
Overview (Empty + Default), Spending, Categories, Analytics (4 bande), Investments,
Income, Import, Settings.

Set di prototipi piccoli, uno per flusso (ognuno tocca le sue schermate da protagonista):
- **A — Glancer/Overview** — apri, leggi headline + curiosity card. *(fatto: src/Overview.jsx)*
- **B — Owner/esplorazione** — Anomaly → Analytics 4 bande → Spending/Categories → riga espandibile.
- **C — Planner/proiezione** — Investments ↔ Analytics, confronto scenari.
- **D — Import** — state machine empty→parsing→preview→done.
- **E — Input** — modali +entrata / +pack / +split / +spesa.

Ogni prototipo è **gated**: nella sidebar è attiva solo la schermata del flusso, il resto
disattivato con tooltip "Non in questo flusso". Rende chiaro cosa funziona.

---

## Figma (fonte di verità del design)

- File key: `hQGAgeXPxRATvpen8gE9d2`, nome "Gesty", pagina "Screens".
- **Collegamento:** hai `figma-console` MCP disponibile (Desktop Bridge, globale). È
  l'UNICA integrazione Figma permessa — le connector ufficiali (`Figma:*`) sono vietate.
  Per leggere una schermata: verifica `figma.root.name` === "Gesty" (il bridge a volte
  si aggancia al file sbagliato), poi usa `figma_get_file_data` / `figma_execute`.
  Richiede Figma Desktop aperto sul file Gesty + plugin bridge attivo.
- **Usa il bridge PRIMA di costruire un flusso:** leggi il frame reale e i suoi Dev
  Notes, non ricostruire a memoria.
- Node-id reali delle schermate: Overview/Default `47:515`, Spending `49:622`,
  Categories `70:1886`, Analytics `55:1696`, Investments `67:1523`, Income `64:1200`,
  Settings `49:1023`, Import/Preview `53:1320`, Overview/Empty `49:1197`.
- I Dev Notes (frame accanto a ogni schermata) descrivono stati e interazioni: leggili
  prima di costruire un flusso.

**Token (232 variabili):** i valori sono già in `src/` come oggetto `T`. Colori, raggi,
spacing, durate/easing del motion. NON inventare colori: usa solo `T`.

---

## Note operative bridge Figma (evita errori noti)

- Verifica `figma.root.name` PRIMA di ogni scrittura; il bridge a volte si aggancia al
  file "Yummy Labs" (key `omzFVUv3jp3Sf75pziblwK`). Recovery: `figma_navigate` a
  `https://www.figma.com/design/hQGAgeXPxRATvpen8gE9d2/Untitled?node-id=0-1`.
- Usa le varianti **async** (`getNodeByIdAsync`, `getLocalVariablesAsync`, ecc.); le
  sync falliscono in silenzio.
- `setCurrentPageAsync()` prima di operazioni su nodi se sei su un'altra pagina.
- I **timeout sono spesso falsi negativi**: dopo un timeout, verifica con una lettura
  leggera prima di ritentare — i retry ciechi creano nodi duplicati.
- Script lunghi (>~15 nodi) vanno spezzati: struttura prima, contenuto poi.

## Motion

Da `context/08-motion-spec.md`. Regola dura: **no spring, no bounce, no overshoot**
(un'animazione che rimbalza sarebbe "lusinghiera", viola il principio 2). Solo ease-out,
durate brevi dalla scala. Sempre supporto `prefers-reduced-motion` per componente.

---

## Come lavorare (importante — impara dai nostri errori)

1. **Non costruire a memoria.** Per ogni flusso, leggi prima i file in `context/` e,
   dove serve il dettaglio visivo, le schermate Figma reali. Il prototipo monolitico
   precedente fallì perché ricostruito a memoria: aveva "dimenticato" metà del design.
2. **Mappa → decisione → costruisci.** Prima identifica i buchi/stati in chat, fai
   decidere all'utente con input brevi, POI costruisci. Niente build senza conferma.
3. **Fedeltà ai dati coerenti.** Per Analytics usa il dataset Ristoranti coerente
   (solito €126–130, giugno €256 = +100%, fisso €62 / variabile €194). NON numeri a mano
   che si contraddicono tra bande. (L'Overview Figma usa altri valori-vetrina di s11 —
   da riconciliare prima o poi.)
4. **Propaga le decisioni** ai file di `context/` quando cambiano il modello.

---

## Comandi

```bash
npm install      # prima volta
npm run dev      # avvia il dev server — APRI LA PORTA CHE STAMPA (5173 o 5174...)
npm run build    # build di verifica
```

**Nota sulle porte:** se 5173 è occupata, Vite salta a 5174 ecc. Apri SEMPRE l'URL che
il terminale stampa, non a memoria. Se la pagina è vuota/statica, controlla di essere
sulla porta giusta e guarda la console del browser (F12).

---

## Stato attuale

- Prototipo **A (Overview)** costruito in `src/Overview.jsx`, fedele a Figma `47:515` +
  Dev Notes, gated, con framer-motion. Build verificata.
- Prossimo: **B** (il cuore — esplorazione + Analytics 4 bande).
- Nodo aperto: riconciliare i valori-vetrina dell'Overview (s11) col dataset coerente
  di Analytics.
