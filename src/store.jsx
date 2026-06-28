import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { loadState, saveState, clearState } from "./persist.js";

/* ============================================================
   GESTY — Store globale (transazioni importate da Curve)
   L'app parte VUOTA. I dati entrano solo via Import CSV.
   Tutte le schermate derivano le cifre dai selettori qui sotto.
   ============================================================ */

const StoreCtx = createContext(null);

export function StoreProvider({ children }){
  // carica lo stato persistito all'avvio (una sola volta)
  const initial = useRef(loadState()).current;
  const [transactions,setTransactions] = useState(initial?.transactions || []); // spese (import + manuali)
  const [points,setPoints] = useState(initial?.points || []);                   // cashback CPT (solo punti)
  const [imports,setImports] = useState(initial?.imports || []);                // storico import
  // L1: dizionario merchant→categoria che cresce dalle correzioni utente (per-merchant).
  const [merchantCategories,setMerchantCategories] = useState(initial?.merchantCategories || {});
  // split configurato per carta (last4 → 0/0.5/1). Scavalca il default del parser.
  const [cardSplits,setCardSplits] = useState(initial?.cardSplits || {});
  // entrate manuali (100% tue, mai split). { id, label, amount, recurring, month }
  const [incomes,setIncomes] = useState(initial?.incomes || []);

  // salva a ogni cambiamento (salta il primo render: nessun cambiamento reale)
  const round2 = (n)=> Math.round(n*100)/100;

  const mounted = useRef(false);
  useEffect(()=>{
    if(!mounted.current){ mounted.current = true; return; }
    saveState({ transactions, points, imports, merchantCategories, cardSplits, incomes });
  }, [transactions, points, imports, merchantCategories, cardSplits, incomes]);

  // applica il dizionario imparato (L1) a un set di transazioni:
  // se conosco la categoria del merchant, scavalca quella di Curve.
  const applyLearned = (txns) => txns.map(t => {
    const learned = merchantCategories[t.mkey];
    return learned ? { ...t, cat:learned, catOverride:true } : t;
  });

  // applica gli split configurati per carta a un batch (i nuovi import rispettano
  // ciò che hai impostato in Settings → Carte).
  const applyCardSplits = (txns) => txns.map(t => {
    const cfg = cardSplits[t.card];
    if(cfg === undefined || cfg === t.split) return t;
    return { ...t, split:cfg, shared:cfg<1, share:round2(t.gross*cfg) };
  });

  // unisce un batch parsato (i duplicati sono già scartati dal parser).
  // Stampa importId su transazioni e punti → un import si può annullare a colpo singolo.
  const mergeBatch = (batch, fileName) => {
    const importId = Date.now();
    const incoming = applyCardSplits(applyLearned(batch.transactions)).map(t=>({ ...t, importId }));
    setTransactions(prev => [...prev, ...incoming]
      .sort((a,b)=> (b.date+b.time).localeCompare(a.date+a.time)));
    if(batch.points.length) setPoints(prev => [...prev, ...batch.points.map(p=>({ ...p, importId }))]);
    setImports(prev => [{
      id: importId, fileName, when: new Date(), profile: batch.profile,
      added: batch.transactions.length, duplicates: batch.duplicates,
      skipped: batch.skipped, period: batch.period,
    }, ...prev]);
  };

  // annulla un caricamento: rimuove le sue transazioni + punti + la riga di storico.
  // (un import sbagliato — carta/file errato — si elimina senza toccare gli altri)
  const deleteImport = (importId) => {
    setTransactions(prev => prev.filter(t => t.importId !== importId));
    setPoints(prev => prev.filter(p => p.importId !== importId));
    setImports(prev => prev.filter(im => im.id !== importId));
  };

  // correzione categoria PER-MERCHANT (livello L1): impara "questo merchant = questa
  // categoria", ricategorizza TUTTE le sue transazioni e lo ricorda per i futuri import.
  const setCategory = (id, cat) => {
    const tx = transactions.find(t => t.id===id);
    if(!tx) return;
    const key = tx.mkey;
    setMerchantCategories(prev => ({ ...prev, [key]: cat }));
    setTransactions(prev => prev.map(t =>
      t.mkey===key ? { ...t, cat, catOverride:true } : t));
  };

  // dimentica la regola imparata per un merchant → torna alla categoria Curve
  const forgetMerchant = (key) => {
    setMerchantCategories(prev => { const n={...prev}; delete n[key]; return n; });
  };

  // imposta lo split di una CARTA (default per tutte le sue transazioni) — retroattivo.
  // NON tocca le transazioni con override per-riga (quelle vincono sul default carta).
  const setCardSplit = (last4, split) => {
    setCardSplits(prev => ({ ...prev, [last4]: split }));
    setTransactions(prev => prev.map(t =>
      (t.card===last4 && !t.splitOverride)
        ? { ...t, split, shared:split<1, share:round2(t.gross*split) }
        : t));
  };

  // override split per singola transazione (es. personale su carta condivisa, o viceversa).
  // ricalcola la quota tua; sopravvive ai re-import (il duplicato viene ignorato, resta questa).
  const setSplit = (id, split) =>
    setTransactions(prev => prev.map(t => t.id===id
      ? { ...t, split, shared: split<1, share: round2(t.gross*split), splitOverride:true }
      : t));

  // entrate manuali — sempre 100% tue, mai split
  const addIncome = (inc) => setIncomes(prev => [{ id: Date.now(), ...inc }, ...prev]);
  const updateIncome = (id, patch) => setIncomes(prev => prev.map(i => i.id===id ? { ...i, ...patch } : i));
  const deleteIncome = (id) => setIncomes(prev => prev.filter(i => i.id!==id));

  const reset = () => { setTransactions([]); setPoints([]); setImports([]); setMerchantCategories({}); setCardSplits({}); setIncomes([]); clearState(); };

  const value = useMemo(()=>({
    transactions, points, imports, merchantCategories, cardSplits, incomes,
    isEmpty: transactions.length === 0,
    mergeBatch, deleteImport, reset, setCategory, setSplit, forgetMerchant, setCardSplit,
    addIncome, updateIncome, deleteIncome,
  }), [transactions, points, imports, merchantCategories, cardSplits, incomes]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(){
  const ctx = useContext(StoreCtx);
  if(!ctx) throw new Error("useStore fuori da StoreProvider");
  return ctx;
}

/* ---------------- Selettori (puri, su QUOTA TUA) ----------------
   Tutto gira su your-share, mai gross (data contract). */

const monthKey = (iso) => iso?.slice(0,7);          // "2026-06"
const isSpend  = (t) => !t.refund;

// totale quota tua del periodo (mese)
export function totalShare(txns, month){
  return txns
    .filter(t => !month || monthKey(t.date) === month)
    .reduce((s,t)=> s + t.share, 0);
}

// breakdown per categoria (quota tua), ordinato desc
export function byCategory(txns, month){
  const m = {};
  txns.filter(t => !month || monthKey(t.date) === month)
    .forEach(t => { m[t.cat] = (m[t.cat]||0) + t.share; });
  return Object.entries(m)
    .map(([cat,val])=>({ cat, val }))
    .sort((a,b)=> b.val - a.val);
}

// mesi presenti nei dati (desc), es. ["2026-06","2026-05"]
export function monthsPresent(txns){
  return [...new Set(txns.map(t=>monthKey(t.date)))].sort().reverse();
}

// transazioni di un mese (già ordinate per data desc nello store)
export function txnsOfMonth(txns, month){
  return txns.filter(t => monthKey(t.date) === month);
}

// serie storica mensile per una categoria (quota tua), asc
export function monthlySeriesForCat(txns, cat){
  const m = {};
  txns.filter(t=>t.cat===cat).forEach(t=>{
    const k = monthKey(t.date);
    m[k] = (m[k]||0) + t.share;
  });
  return Object.entries(m).map(([month,val])=>({ month, val })).sort((a,b)=>a.month.localeCompare(b.month));
}

// top merchant nel periodo (quota tua). cat=null → tutte le categorie.
export function topMerchants(txns, cat, month, n=5){
  const m = {};
  txns.filter(t=> (!cat || t.cat===cat) && (!month || monthKey(t.date)===month) && !t.refund)
    .forEach(t=>{
      if(!m[t.merchant]) m[t.merchant] = { name:t.merchant, count:0, val:0, cat:t.cat };
      m[t.merchant].count++; m[t.merchant].val += t.share;
    });
  return Object.values(m).sort((a,b)=>b.val-a.val).slice(0,n);
}

// media settimanale del mese (quota tua / settimane trascorse)
export function weeklyAvg(txns, month){
  const ms = txnsOfMonth(txns, month);
  if(!ms.length) return 0;
  const days = new Set(ms.map(t=>t.date)).size;
  const weeks = Math.max(1, days/7);
  return totalShare(ms) / weeks;
}

export function nameOfTopCat(txns, month){
  const b = byCategory(txns, month);
  return b[0]?.cat || null;
}

// punti cashback totali
export function totalPoints(points){
  return points.reduce((s,p)=> s + p.pts, 0);
}

/* ---------------- Income & saldo netto (entrate 100% tue) ---------------- */

// entrate di un mese: ricorrenti (ogni mese) + una-tantum datate in quel mese
export function incomeForMonth(incomes, month){
  return incomes
    .filter(i => i.recurring || i.month === month)
    .reduce((s,i)=> s + (Number(i.amount)||0), 0);
}

// saldo netto = entrate (100% tue) − quota tua di spesa. Descrittivo, mai un verdetto.
export function netBalance(incomes, txns, month){
  return incomeForMonth(incomes, month) - totalShare(txns, month);
}

// scopre le carte presenti nei dati: una riga per ogni Card Last 4 distinta.
// split = quello configurato (se c'è) altrimenti il default osservato dalle transazioni.
export function discoverCards(transactions, cardSplits={}){
  const m = {};
  transactions.forEach(t=>{
    const k = t.card || "—";
    if(!m[k]) m[k] = { last4:t.card, name:t.cardName||"Carta", count:0, gross:0, share:0,
      defaultSplit:t.split, overrides:0 };
    m[k].count++; m[k].gross += t.gross; m[k].share += t.share;
    if(t.splitOverride) m[k].overrides++;
  });
  return Object.values(m).map(c=>({
    ...c,
    split: cardSplits[c.last4] !== undefined ? cardSplits[c.last4] : c.defaultSplit,
    configured: cardSplits[c.last4] !== undefined,
  })).sort((a,b)=> b.gross - a.gross);
}

/* ---------------- Analytics: motore a 4 bande ---------------- */

// Band 1: banda abituale di una categoria = min/max degli ultimi 3 mesi PRIMA del corrente.
// <3 mesi di storia → null ("in apprendimento", non si renderizza il confronto).
export function habitualBand(txns, cat, month){
  const prior = monthlySeriesForCat(txns, cat).filter(p=>p.month < month).slice(-3);
  if(prior.length < 3) return null;
  const vals = prior.map(p=>p.val);
  return { min:Math.min(...vals), max:Math.max(...vals),
           avg: vals.reduce((a,b)=>a+b,0)/vals.length, months:prior.length };
}

// stato vs banda: "sopra" (oltre max) / "sotto" (sotto min) / "dentro"
export function bandStatus(current, band){
  if(!band) return "learning";
  if(current > band.max) return "sopra";
  if(current < band.min) return "sotto";
  return "dentro";
}

// transazioni-spesa di una categoria nel mese (per il dot-plot di Band 2).
// cat=null → tutte le categorie.
export function categorySpend(txns, cat, month){
  return txns.filter(t => (!cat || t.cat===cat) && monthKey(t.date)===month && !t.refund && t.share>0);
}

// Euristica ricorrenza (base/fisso): merchant presente in abbastanza mesi distinti
// con importi simili. Soglia adattiva (min 2) per funzionare anche su poca storia.
// Ritorna un Set di mkey ricorrenti. È la logica più nascosta della pagina.
export function recurringMerchants(txns){
  const months = monthsPresent(txns).length;
  const need = Math.min(3, Math.max(2, months-1));
  const byKey = {};
  txns.forEach(t=>{ (byKey[t.mkey] ||= []).push(t); });
  const set = new Set();
  Object.entries(byKey).forEach(([k,arr])=>{
    const distinct = new Set(arr.map(t=>monthKey(t.date))).size;
    if(distinct < need) return;
    const amts = arr.map(t=>Math.abs(t.gross)).sort((a,b)=>a-b);
    const med = amts[Math.floor(amts.length/2)] || 0;
    const within = med>0 && amts.every(a=> Math.abs(a-med)/med <= 0.30);
    if(within) set.add(k);
  });
  return set;
}

// split fisso/variabile della quota tua di una categoria nel mese (Band 3 tab3 + Band 4)
export function fixedVariableSplit(txns, cat, month, recurring){
  let fixed=0, variable=0;
  categorySpend(txns, cat, month).forEach(t=>{
    if(recurring.has(t.mkey)) fixed += t.share; else variable += t.share;
  });
  return { fixed, variable, total: fixed+variable };
}

// distribuzione settimanale (Band 3 tab2): quota tua per settimana del mese
export function weeklyDistribution(txns, cat, month){
  const weeks = [0,0,0,0,0];
  categorySpend(txns, cat, month).forEach(t=>{
    const day = parseInt(t.date.slice(8,10),10);
    const w = Math.min(4, Math.floor((day-1)/7));
    weeks[w] += t.share;
  });
  return weeks;
}
