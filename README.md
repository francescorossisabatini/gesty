# Gesty — Design System & Storybook

Il **design system** del progetto Gesty: i design token (sincronizzati da Figma
tramite Style Dictionary) e i componenti React, documentati in **Storybook**.

> Questo repository contiene **solo il design system e lo Storybook** — non
> l'applicazione Gesty (schermate, logica, desktop), che resta privata.

## Contenuto

| Cartella | Cosa |
|----------|------|
| `design-tokens/` | pipeline Style Dictionary: token letti da Figma → CSS / JS / flat JSON, con sistema di changelog |
| `src/tokens.jsx` | componenti React del design system (Card, CategoryBadge, Sidebar, PageHeader, EmptyState) + token derivati da Figma |
| `src/stories/` | storie Storybook: **Design Tokens** (colori, spacing, radius, changelog) e **Components** |
| `.storybook/` | configurazione Storybook (React + Vite) |

## Sviluppo

```bash
npm install
npm run storybook         # Storybook in locale su http://localhost:6006
npm run build-storybook   # build statica → storybook-static/
```

## Design token

```bash
cd design-tokens
npm install
npm run build       # genera CSS custom properties · JS ES6 · flat JSON da tokens.json
npm run changelog   # diff vs snapshot → CHANGELOG.md + changelog.json (before/after)
```

I token sono letti dalle variabili Figma (collezioni Color + Dimensions) e vivono in
`design-tokens/tokens.json`; le descrizioni d'uso in `guidelines.json`.

## Deploy

Storybook è deployato su **Vercel** (build `npm run build-storybook`, output
`storybook-static/`). Ogni push su `main` ri-deploya automaticamente.
