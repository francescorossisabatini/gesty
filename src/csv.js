/* ============================================================
   GESTY — Parser CSV Curve (data-contract-curve-csv.md)
   14 colonne. Regole inchiodate:
   - Date ISO YYYY-MM-DD (UTC) + Time separata → display dd/mm/yyyy
   - Categoria fornita da Curve → mappata sugli 8 token (fallback "other")
   - Split per carta: ••8480 = 50/50, ogni altra = 100% (your share)
   - CPT (cashback) → NON spesa: contati a parte come punti
   - Dedup: data+ora+merchant+importo+carta (Curve non ha ID univoco)
   ============================================================ */

// mappa categoria Curve → token Gesty
const CAT_MAP = {
  "groceries":"groceries", "supermarket":"groceries", "food":"groceries",
  "food & drink":"dining", "food and drink":"dining", "restaurants":"dining",
  "eating out":"dining", "dining":"dining", "cafe":"dining", "bars":"dining",
  "transport":"transport", "transportation":"transport", "travel":"transport",
  "fuel":"transport", "taxi":"transport",
  "bills":"subscriptions", "subscriptions":"subscriptions", "utilities":"subscriptions",
  "entertainment":"subscriptions", "services":"subscriptions",
  "shopping":"shopping", "general":"shopping", "clothing":"shopping", "electronics":"shopping",
  "health":"health", "healthcare":"health", "pharmacy":"health", "wellbeing":"health", "fitness":"health",
  "rent":"housing", "housing":"housing", "home":"housing", "mortgage":"housing", "household":"housing",
  // sinonimi italiani (per CSV non-Curve con categorie in italiano)
  "spesa":"groceries", "supermercato":"groceries", "alimentari":"groceries",
  "ristoranti":"dining", "ristorante":"dining", "bar":"dining", "cibo":"dining", "cibo e bevande":"dining",
  "trasporti":"transport", "trasporto":"transport", "viaggi":"transport", "carburante":"transport",
  "abbonamenti":"subscriptions", "bollette":"subscriptions", "utenze":"subscriptions", "servizi":"subscriptions",
  "acquisti":"shopping", "abbigliamento":"shopping", "elettronica":"shopping",
  "salute":"health", "farmacia":"health", "benessere":"health",
  "casa":"housing", "affitto":"housing", "mutuo":"housing",
  "altro":"other",
};

export function mapCategory(raw){
  if(!raw) return "other";
  const key = raw.trim().toLowerCase();
  return CAT_MAP[key] || "other";
}

// split per carta (col 10, Card Last 4)
export function splitForCard(last4){
  return last4 === "8480" ? 0.5 : 1.0;
}

// ---- CSV tokenizer (gestisce campi quotati; separatore configurabile) ----
export function parseLine(line, delim=","){
  const out = [];
  let cur = "", q = false;
  for(let i=0;i<line.length;i++){
    const c = line[i];
    if(q){
      if(c === '"'){
        if(line[i+1] === '"'){ cur += '"'; i++; }
        else q = false;
      } else cur += c;
    } else {
      if(c === '"') q = true;
      else if(c === delim){ out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map(s=>s.trim());
}

// rileva il separatore più probabile dalla prima riga (, ; o tab)
export function detectDelimiter(text){
  const first = text.split(/\r?\n/).find(l=>l.trim()) || "";
  const counts = { ",":(first.match(/,/g)||[]).length, ";":(first.match(/;/g)||[]).length, "\t":(first.match(/\t/g)||[]).length };
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][1] > 0
    ? Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0] : ",";
}

// formattazione importo EUR: 1234.5 → "€1.234,50"
export function fmtEur(n, withSign=false){
  const sign = n < 0 ? "−" : (withSign && n > 0 ? "+" : "");
  const abs = Math.abs(n);
  const s = abs.toLocaleString("it-IT", { minimumFractionDigits:2, maximumFractionDigits:2 });
  return `${sign}€${s}`;
}

// parsing importo robusto: gestisce "1.234,56" (EU), "1,234.56" (US), "8,45",
// "8.45", "-59,90", "(59.90)" (parentesi = negativo). Ritorna Number o NaN.
export function parseAmount(raw){
  if(raw == null) return NaN;
  let s = String(raw).trim();
  if(!s) return NaN;
  let neg = false;
  if(/^\(.*\)$/.test(s)){ neg = true; s = s.slice(1,-1); }     // (59,90) → negativo
  s = s.replace(/[^\d.,\-]/g, "");                              // via simboli valuta/spazi
  if(s.startsWith("-")){ neg = true; s = s.slice(1); }
  const hasDot = s.includes("."), hasComma = s.includes(",");
  if(hasDot && hasComma){
    // l'ULTIMO separatore è quello decimale
    if(s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g,"").replace(",", ".");
    else s = s.replace(/,/g,"");
  } else if(hasComma){
    // solo virgola: decimale se seguita da 1-2 cifre finali, altrimenti migliaia
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g,"");
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : (neg ? -n : n);
}

// normalizza una data a ISO YYYY-MM-DD. Accetta ISO, DD/MM/YYYY, DD.MM.YYYY,
// DD-MM-YYYY (default europeo). Ritorna ISO o "" se non riconosciuta.
export function toISODate(raw){
  if(!raw) return "";
  const s = String(raw).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);                  // ISO
  if(m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);    // DD/MM/YYYY (EU)
  if(m){
    let [,d,mo,y] = m;
    if(y.length===2) y = "20"+y;
    return `${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
  }
  return "";
}

// ISO YYYY-MM-DD → dd/mm/yyyy
export function fmtDate(iso){
  if(!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "";
  const [y,m,d] = iso.slice(0,10).split("-");
  return `${d}/${m}/${y}`;
}

const dedupKey = (t) => `${t.date}|${t.time}|${t.merchantRaw}|${t.gross}|${t.card}`;
const pointKey = (p) => `${p.date}|${p.merchant}|${p.pts}`;

/* Parsea il testo CSV Curve.
   existing = transazioni già in store (per dedup cross-import).
   existingPoints = righe CPT già in store (per dedup dei punti).
   Ritorna { transactions, points, duplicates, pointDuplicates, skipped, period } */
export function parseCurveCsv(text, existing=[], existingPoints=[]){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length) return { transactions:[], points:[], duplicates:0, skipped:0, period:null, error:"File vuoto" };

  // header detection: se la prima riga contiene "Date" o "Merchant", scartala
  let start = 0;
  const head = lines[0].toLowerCase();
  if(head.includes("date") || head.includes("merchant") || head.includes("export format")) start = 1;

  const existingKeys = new Set(existing.map(dedupKey));
  const batchKeys = new Set();
  const existingPointKeys = new Set(existingPoints.map(pointKey));
  const batchPointKeys = new Set();
  const transactions = [];
  const duplicateRows = [];   // righe rilevate come duplicate (ispezionabili in preview)
  const points = [];
  let duplicates = 0, pointDuplicates = 0, skipped = 0;
  let minDate = null, maxDate = null;

  for(let i=start;i<lines.length;i++){
    const f = parseLine(lines[i]);
    if(f.length < 6) { skipped++; continue; }

    const date     = f[1];
    const time     = f[2] || "";
    const merchantRaw = f[3] || "";
    const amountStr= (f[4] || "").replace(",", "."); // tollera virgola decimale
    const currency = (f[5] || "EUR").toUpperCase();
    const cardName = f[8] || "";
    const last4    = f[9] || "";
    const catRaw   = f[11] || "";

    const amount = parseFloat(amountStr);
    if(isNaN(amount)) { skipped++; continue; }

    // CPT / cashback → punti, mai euro (con dedup come le transazioni)
    if(currency === "CPT" || cardName.toLowerCase().includes("curve cash")){
      const p = { date, merchant:merchantRaw, pts: amount };
      const pk = pointKey(p);
      if(existingPointKeys.has(pk) || batchPointKeys.has(pk)){ pointDuplicates++; continue; }
      batchPointKeys.add(pk);
      points.push(p);
      continue;
    }
    // valute non-EUR diverse da CPT: per ora le saltiamo (foreign spend raro)
    if(currency !== "EUR"){ skipped++; continue; }

    const split = splitForCard(last4);
    const gross = Math.round(amount * 100) / 100;
    const share = Math.round(gross * split * 100) / 100;
    const refund = gross < 0;

    const t = {
      id: `${date}-${time}-${merchantRaw}-${gross}`.replace(/\s+/g,"_"),
      date, time, merchantRaw,
      merchant: cleanMerchant(merchantRaw),
      mkey: merchantKey(merchantRaw),   // chiave per il dizionario categoria (L1)
      gross, share, split,
      shared: split < 1,
      refund,
      card: last4, cardName,
      cat: mapCategory(catRaw),         // L0: categoria Curve mappata
      catRaw,
      origin: "import",
    };

    const key = dedupKey(t);
    if(existingKeys.has(key) || batchKeys.has(key)){
      duplicates++;
      t.dupAgainst = existingKeys.has(key) ? "archivio" : "stesso file";
      duplicateRows.push(t);
      continue;
    }
    batchKeys.add(key);
    transactions.push(t);

    if(!minDate || date < minDate) minDate = date;
    if(!maxDate || date > maxDate) maxDate = date;
  }

  return {
    transactions, duplicateRows, points, duplicates, pointDuplicates, skipped,
    period: minDate ? { from:minDate, to:maxDate } : null,
  };
}

// pulizia merchant per display (toglie code numeriche di terminale)
export function cleanMerchant(raw){
  if(!raw) return "—";
  return raw
    .replace(/\s+(At|AT)\s+\d+.*$/,"")   // "Cafe+co At 311175" → "Cafe+co"
    .replace(/\s+\d{4,}.*$/,"")           // "Billa 0042 Wien" → "Billa"
    .replace(/\.(com|net|at|it)\b.*$/i,"")// "Netflix.com 8829" → "Netflix"
    .trim() || raw;
}

// chiave normalizzata per matchare lo stesso merchant tra transazioni diverse.
// Usa il TOKEN-RADICE del brand (prima parola significativa) così le varianti di
// location/terminale collassano: "Normal Wien 4471" e "Normal At 998211" → "normal",
// "Cafe+co At 311175" → "cafe+co". È la chiave del dizionario categoria (L1) che
// cresce dalle correzioni. Euristica: prima parola; se troppo corta (<4), prendi
// anche la seconda (es. "Bar Rossi" resta distinto da "Bar Centrale").
export function merchantKey(raw){
  const clean = cleanMerchant(raw).toLowerCase().replace(/[^\p{L}\p{N}+&. ]/gu," ").replace(/\s+/g," ").trim();
  if(!clean) return "";
  const tokens = clean.split(" ");
  const first = tokens[0];
  if(first.length < 4 && tokens[1]) return `${first} ${tokens[1]}`;
  return first;
}
