# Gesty — Prototipo (Vite + React)

Prototipo dei flussi utente di Gesty, fedele al design Figma.

## Per Claude Code
Apri questa cartella con `claude` — legge `CLAUDE.md` in automatico (contesto, principi,
flussi, regole dati). I documenti di progetto completi sono in `context/`.

## Avvio
```bash
npm install
npm run dev   # apri la porta che il terminale stampa (5173/5174/...)
```

## Struttura
- `CLAUDE.md` — contesto e istruzioni per Claude Code (leggi questo per primo)
- `context/` — i documenti di progetto veri (principi, data contract, personas, motion, ecc.)
- `src/Overview.jsx` — prototipo A (Glancer/Overview)
- `src/main.jsx`, `index.html` — entry point

## Stato
Prototipo A (Overview) fatto. Prossimo: B (esplorazione + Analytics 4 bande).
