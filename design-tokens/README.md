# Gesty — Design Token Pipeline

Pipeline [Style Dictionary](https://styledictionary.com) alimentata dalle **variabili Figma reali**
di Gesty (collezioni Color + Dimensions). I valori e le descrizioni sono estratti via il Desktop
Bridge (`figma.variables.getLocalVariablesAsync()`), risolvendo gli alias ai primitivi.

## File

| File | Cosa contiene |
|------|----------------|
| `tokens.json` | token sorgente (Style Dictionary): **color** (79) · **spacing** (6) · **radius** (5) |
| `guidelines.json` | le **descrizioni** di ogni token, separate (90 voci, chiave = path del token) |
| `config.json` | configurazione Style Dictionary → 3 output |
| `build/` | output generato |

## Output (`npm run build`)

```
tokens.json  →  build/tokens.css         CSS custom properties (--color-accent-brand: #1F8C84; …)
                build/tokens.js          JavaScript ES6 exports (export const ColorAccentBrand = …)
                build/tokens.flat.json   JSON appiattito (chiave camelCase → valore)
```

## Uso

```bash
npm install     # prima volta
npm run build   # genera build/ (90 CSS vars · 90 JS exports · flat JSON)
npm run clean   # rimuove build/
```

## Ri-sincronizzare da Figma

`tokens.json` e `guidelines.json` sono uno snapshot delle variabili Figma. Quando le variabili
cambiano, vanno rigenerati leggendo di nuovo dal Desktop Bridge (Color + spacing/radius della
collezione Dimensions, alias risolti, colori in hex). Figma resta l'unica fonte di verità del design.

## Changelog dei token

Sistema che traccia le modifiche ai token a ogni sync.

```bash
npm run snapshot    # salva una baseline (snapshot.json) dei token correnti
npm run changelog   # confronta tokens.json vs snapshot → genera CHANGELOG.md + changelog.json, aggiorna lo snapshot
npm run sync        # changelog + build in un colpo (dopo un aggiornamento da Figma)
```

| File | Ruolo |
|------|-------|
| `snapshot.json` | i valori dell'ultimo sync (baseline di confronto) |
| `CHANGELOG.md` | changelog leggibile, entry più recente in cima, con `da → a` |
| `changelog.json` | storia machine-readable (added / removed / changed con before/after) |

**Flusso tipico:** rigeneri `tokens.json` da Figma → `npm run changelog` → vedi cosa è cambiato
(con valori prima/dopo) → lo snapshot si aggiorna da sé. La pagina **Design Tokens → Changelog**
in Storybook legge `changelog.json` e mostra le modifiche con swatch before/after.
```
