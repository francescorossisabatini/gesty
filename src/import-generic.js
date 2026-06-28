/* ============================================================
   GESTY — Importer generico (qualunque CSV bancario)
   Mappa le colonne per NOME d'intestazione (auto) con fallback
   manuale. Curve resta un profilo a parte (csv.js) con le sue
   regole speciali (split per carta, CPT). Qui solo colonne base:
   data · importo · merchant · categoria · carta. Tutto personale 100%.
   ============================================================ */

import { parseLine, detectDelimiter, parseAmount, toISODate, mapCategory, cleanMerchant, merchantKey } from "./csv.js";

// sinonimi d'intestazione (it + en), match per inclusione, lowercase
const SYN = {
  date:     ["date","data","giorno","valuta","value date","booking date","data operazione","data contabile","transaction date"],
  time:     ["time","ora","orario","hour"],
  amount:   ["amount","importo","valore","value","ammontare","addebito","debit","spesa","total","totale","importo (eur)","amount (eur)"],
  merchant: ["merchant","description","descrizione","payee","beneficiario","causale","esercente","negozio","dettagli","details","name","nome","controparte"],
  category: ["category","categoria","tipo","type","tag"],
  card:     ["card","carta","account","conto","last 4","ending","carta utilizzata","iban"],
};

const REQUIRED = ["date","amount","merchant"];

// riconosce un export Curve (allora si usa il parser dedicato in csv.js)
export function isCurveFormat(headers){
  const h = headers.map(x=>x.toLowerCase());
  return h.some(x=>x.includes("export format"))
      || h.some(x=>x.includes("txn amount (funding card)"))
      || h.some(x=>x.includes("card last 4"));
}

// indovina la mappa colonne dai nomi d'intestazione
export function detectColumns(headers){
  const h = headers.map(x=>x.toLowerCase().trim());
  const used = new Set();
  const map = {};
  for(const field of ["date","amount","merchant","category","card","time"]){
    let found = -1;
    for(const syn of SYN[field]){
      const idx = h.findIndex((name,i)=> !used.has(i) && name.includes(syn));
      if(idx !== -1){ found = idx; break; }
    }
    if(found !== -1){ map[field] = found; used.add(found); }
    else map[field] = null;
  }
  return map;
}

/* Analizza un CSV: profilo, intestazioni, mappa indovinata, se serve mappatura
   manuale, e qualche riga di esempio. */
export function analyzeCsv(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length) return { error:"File vuoto" };
  const delim = detectDelimiter(text);
  const headers = parseLine(lines[0], delim);
  const hasHeader = headers.some(c=>/[a-zA-Z]/.test(c)) && !looksLikeData(headers);
  if(!hasHeader){
    // niente intestazione riconoscibile → serve mappatura su colonne numerate
    return { profile:"generic", delim, headers: headers.map((_,i)=>`Colonna ${i+1}`),
      mapping:{ date:null, amount:null, merchant:null, category:null, card:null, time:null },
      needsMapping:true, sample: lines.slice(0,4).map(l=>parseLine(l,delim)), noHeader:true };
  }
  if(isCurveFormat(headers)) return { profile:"curve", delim, headers };
  const mapping = detectColumns(headers);
  const needsMapping = REQUIRED.some(f => mapping[f] === null);
  return { profile:"generic", delim, headers, mapping, needsMapping,
    sample: lines.slice(1,5).map(l=>parseLine(l,delim)), noHeader:false };
}

// euristica: la prima riga "sembra dati" (es. inizia con una data/numero)?
function looksLikeData(cells){
  return cells.length>1 && (toISODate(cells[0]) || !isNaN(parseAmount(cells[0])) || toISODate(cells[1]));
}

const keyOf = (t)=> `${t.date}|${t.time}|${t.merchantRaw}|${t.gross}|${t.card}`;

/* Parser generico con una mappa colonne esplicita.
   existing = transazioni in store (dedup). Tutto personale 100% (niente split/CPT). */
export function parseGeneric(text, mapping, existing=[], opts={}){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  const delim = opts.delim || detectDelimiter(text);
  const start = opts.noHeader ? 0 : 1;
  const existingKeys = new Set(existing.map(keyOf));
  const batchKeys = new Set();
  const transactions = [], duplicateRows = [];
  let duplicates = 0, skipped = 0, minDate = null, maxDate = null;

  for(let i=start;i<lines.length;i++){
    const f = parseLine(lines[i], delim);
    const get = (field)=> mapping[field]!=null ? (f[mapping[field]]||"") : "";

    const date = toISODate(get("date"));
    const gross = parseAmount(get("amount"));
    const merchantRaw = get("merchant").trim();
    if(!date || isNaN(gross) || !merchantRaw){ skipped++; continue; }

    const time = get("time").trim();
    const card = get("card").trim().replace(/\D/g,"").slice(-4); // tieni solo le ultime 4 cifre se presenti
    const catRaw = get("category").trim();
    const refund = gross < 0;
    const g = Math.round(gross*100)/100;

    const t = {
      id: `${date}-${time}-${merchantRaw}-${g}`.replace(/\s+/g,"_"),
      date, time, merchantRaw,
      merchant: cleanMerchant(merchantRaw),
      mkey: merchantKey(merchantRaw),
      gross: g, share: g, split: 1, shared: false, refund,
      card, cardName: card ? "" : "",
      cat: mapCategory(catRaw), catRaw,
      origin: "import",
    };

    const key = keyOf(t);
    if(existingKeys.has(key) || batchKeys.has(key)){
      duplicates++; t.dupAgainst = existingKeys.has(key)?"archivio":"stesso file"; duplicateRows.push(t); continue;
    }
    batchKeys.add(key);
    transactions.push(t);
    if(!minDate || date < minDate) minDate = date;
    if(!maxDate || date > maxDate) maxDate = date;
  }

  return { transactions, duplicateRows, points:[], duplicates, pointDuplicates:0, skipped,
    period: minDate ? { from:minDate, to:maxDate } : null };
}

export const MAP_FIELDS = [
  ["date","Data","richiesto"],
  ["amount","Importo","richiesto"],
  ["merchant","Descrizione / merchant","richiesto"],
  ["category","Categoria","opzionale"],
  ["card","Carta","opzionale"],
  ["time","Ora","opzionale"],
];
