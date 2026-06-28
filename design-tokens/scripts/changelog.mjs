/* ============================================================
   GESTY design tokens — sistema di changelog
   1. snapshot dei token correnti (snapshot.json)
   2. confronto vecchio vs nuovo a ogni sync
   3. changelog leggibile (CHANGELOG.md) + machine-readable (changelog.json)
   4. la pagina Storybook legge changelog.json e mostra gli swatch
   Uso:  node scripts/changelog.mjs           (confronta + aggiorna)
         node scripts/changelog.mjs --snapshot (solo baseline, nessun diff)
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (f) => join(ROOT, f);

const TOKENS    = p("tokens.json");
const SNAPSHOT  = p("snapshot.json");
const LOG_JSON  = p("changelog.json");
const LOG_MD    = p("CHANGELOG.md");

// appiattisce tokens.json → { "color.background.page": "#F6F8FA", ... }
function flatten(node, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && "value" in v) out[key] = v.value;
    else if (v && typeof v === "object") flatten(v, key, out);
  }
  return out;
}

function diff(prev, curr) {
  const added = [], removed = [], changed = [];
  for (const k of Object.keys(curr)) {
    if (!(k in prev)) added.push({ token: k, value: curr[k] });
    else if (prev[k] !== curr[k]) changed.push({ token: k, from: prev[k], to: curr[k] });
  }
  for (const k of Object.keys(prev)) if (!(k in curr)) removed.push({ token: k, value: prev[k] });
  return { added, removed, changed };
}

function mdEntry(entry) {
  const lines = [`## ${entry.date}${entry.baseline ? " — Baseline iniziale" : ""}`];
  const s = entry.summary;
  lines.push(`_${s.added} aggiunti · ${s.removed} rimossi · ${s.changed} modificati_\n`);
  if (entry.changed.length) {
    lines.push("### Modificati");
    entry.changed.forEach(c => lines.push(`- \`${c.token}\`: ${c.from} → ${c.to}`));
    lines.push("");
  }
  if (entry.added.length && !entry.baseline) {
    lines.push("### Aggiunti");
    entry.added.forEach(a => lines.push(`- \`${a.token}\`: ${a.value}`));
    lines.push("");
  }
  if (entry.removed.length) {
    lines.push("### Rimossi");
    entry.removed.forEach(r => lines.push(`- \`${r.token}\`: ${r.value} _(era)_`));
    lines.push("");
  }
  if (entry.baseline) lines.push(`${entry.added.length} token tracciati da ora in poi.\n`);
  return lines.join("\n");
}

// ---- main ----
const curr = flatten(JSON.parse(readFileSync(TOKENS, "utf8")));
const hasPrev = existsSync(SNAPSHOT);
const prev = hasPrev ? JSON.parse(readFileSync(SNAPSHOT, "utf8")) : {};
const onlySnapshot = process.argv.includes("--snapshot");

const d = diff(prev, curr);
const baseline = !hasPrev;
const nChanges = d.added.length + d.removed.length + d.changed.length;

if (onlySnapshot) {
  writeFileSync(SNAPSHOT, JSON.stringify(curr, null, 2) + "\n");
  console.log(`✓ Snapshot baseline salvato: ${Object.keys(curr).length} token.`);
  process.exit(0);
}

if (!baseline && nChanges === 0) {
  console.log("✓ Nessuna modifica dall'ultimo snapshot. Changelog invariato.");
  process.exit(0);
}

const entry = {
  date: new Date().toISOString().slice(0, 10),
  generatedAt: new Date().toISOString(),
  baseline,
  summary: { added: d.added.length, removed: d.removed.length, changed: d.changed.length },
  added: d.added, removed: d.removed, changed: d.changed,
};

// changelog.json — storia, più recente in cima
const log = existsSync(LOG_JSON) ? JSON.parse(readFileSync(LOG_JSON, "utf8")) : { entries: [] };
log.entries.unshift(entry);
log.generated = entry.generatedAt;
writeFileSync(LOG_JSON, JSON.stringify(log, null, 2) + "\n");

// CHANGELOG.md — entry più recente in cima, sotto l'header
const header = "# Changelog — Design Tokens\n\nGenerato da `npm run changelog` confrontando `tokens.json` con lo snapshot precedente.\n";
let body = "";
if (existsSync(LOG_MD)) {
  const existing = readFileSync(LOG_MD, "utf8");
  const idx = existing.indexOf("\n## ");
  body = idx === -1 ? "" : existing.slice(idx + 1);
}
writeFileSync(LOG_MD, `${header}\n${mdEntry(entry)}\n${body}`);

// aggiorna lo snapshot
writeFileSync(SNAPSHOT, JSON.stringify(curr, null, 2) + "\n");

console.log(baseline
  ? `✓ Baseline creata: ${d.added.length} token. CHANGELOG.md + changelog.json generati.`
  : `✓ Sync: ${d.added.length} aggiunti · ${d.removed.length} rimossi · ${d.changed.length} modificati. Changelog aggiornato.`);
