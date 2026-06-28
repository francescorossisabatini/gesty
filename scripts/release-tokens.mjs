/* ============================================================
   GESTY — release dei design token
   Dopo che tokens.json/guidelines.json sono stati rigenerati da Figma:
   1. genera il changelog (diff vs snapshot, aggiorna lo snapshot)
   2. committa i file token
   3. pusha su GitHub → Vercel ri-deploya lo Storybook automaticamente
   Uso:  npm run tokens:release
   Niente shell-string: uso execFileSync (robusto su Windows).
   ============================================================ */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8" });

// 1. changelog (rigenera changelog.json + CHANGELOG.md, aggiorna snapshot.json)
const out = sh("node", ["design-tokens/scripts/changelog.mjs"]);
process.stdout.write(out);
if (out.includes("Nessuna modifica")) {
  console.log("→ Niente da pubblicare: token invariati.");
  process.exit(0);
}

// 2. stage dei soli file token
const files = [
  "design-tokens/tokens.json",
  "design-tokens/guidelines.json",
  "design-tokens/changelog.json",
  "design-tokens/snapshot.json",
  "design-tokens/CHANGELOG.md",
];
sh("git", ["add", ...files]);

const staged = sh("git", ["diff", "--cached", "--name-only"]).trim();
if (!staged) { console.log("→ Nessun file token da committare."); process.exit(0); }

// 3. messaggio dal changelog appena generato
const log = JSON.parse(readFileSync(join(ROOT, "design-tokens/changelog.json"), "utf8"));
const e = log.entries[0];
const subject = `chore(tokens): sync da Figma — ${e.summary.changed} modificati · ${e.summary.added} aggiunti · ${e.summary.removed} rimossi`;
const trailer = "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>";
sh("git", ["commit", "-m", subject, "-m", trailer]);

// 4. push → Vercel redeploya
sh("git", ["push", "origin", "main"]);
console.log(`✓ ${subject}`);
console.log("✓ Push su GitHub completato → Vercel ri-deploya lo Storybook.");
