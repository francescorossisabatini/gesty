import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, CAT_LABEL, NavIco, Card, EmptyState, PageHeader } from "./tokens.jsx";
import { fmtEur, fmtDate } from "./csv.js";
import {
  useStore, monthsPresent, totalShare, byCategory, txnsOfMonth,
  weeklyAvg, nameOfTopCat, incomeForMonth, netBalance,
} from "./store.jsx";

/* ============================================================
   GESTY — Glancer / Overview (47:515) + Dev Notes (79:2514)
   Tutte le cifre derivano dallo store (import CSV). Quota tua, mai gross.
   Vuoto → empty state che rimanda a Import.
   ============================================================ */

const MONTH_LABEL = (k) => {
  const [y,m] = k.split("-");
  const names = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  return `${names[+m-1]} ${y}`;
};

export default function OverviewScreen({ onNavigate }){
  const { transactions, incomes, isEmpty } = useStore();
  const months = monthsPresent(transactions);
  const [idx,setIdx] = useState(0); // 0 = mese più recente

  if(isEmpty){
    return (
      <div>
        <PageHeader title="Overview"/>
        <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
          <EmptyState
            title="Nessun dato ancora"
            body="Importa il primo export CSV da Curve: l'Overview si popola da sé."
            onImport={()=>onNavigate("import")}/>
        </div>
      </div>
    );
  }

  const month = months[idx];
  const isLatest = idx === 0;     // mese in corso (più recente) vs mese chiuso
  return (
    <div>
      <PageHeader title="Overview"
        right={months.length > 1 && <PeriodToggle months={months} idx={idx} setIdx={setIdx}/>}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
        <AnimatePresence mode="wait">
          <motion.div key={month}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:M.dur.base, ease:M.ease.out }}>
            <Hero txns={transactions} month={month} isLatest={isLatest}/>
            <Metrics txns={transactions} incomes={incomes} month={month} isLatest={isLatest} onNavigate={onNavigate}/>
          </motion.div>
        </AnimatePresence>

        <SpendBreakdown txns={transactions} month={month} onNavigate={onNavigate}/>
        <Gateway onNavigate={onNavigate}/>
      </div>
    </div>
  );
}

function PeriodToggle({ months, idx, setIdx }){
  const reduce = useReducedMotion();
  const opts = [[0,"Mese recente"],[1,"Mese precedente"]].filter(([i])=> i < months.length);
  return (
    <div style={{ display:"inline-flex", background:T.bg, borderRadius:T.r.md, padding:4, border:`1px solid ${T.border}` }}>
      {opts.map(([v,l])=>(
        <button key={v} onClick={()=>setIdx(v)}
          style={{ position:"relative", fontSize:14, fontWeight:550, padding:"7px 16px",
            borderRadius:T.r.sm, border:"none", cursor:"pointer", fontFamily:T.font,
            background:"transparent", color:idx===v?T.fg:T.fg2, zIndex:1 }}>
          {idx===v && (
            <motion.div layoutId="period-pill"
              transition={reduce?{ duration:0 }:{ duration:M.dur.instant, ease:M.ease.out }}
              style={{ position:"absolute", inset:0, borderRadius:T.r.sm, background:T.surface,
                boxShadow:"0 1px 3px rgba(26,39,51,.08)", zIndex:-1 }}/>
          )}
          <span style={{ position:"relative", zIndex:1 }}>{l}</span>
        </button>
      ))}
    </div>
  );
}

function Hero({ txns, month, isLatest }){
  const ms = txnsOfMonth(txns, month);
  const total = totalShare(ms);
  const days = new Set(ms.map(t=>t.date)).size;
  const hasShared = ms.some(t=>t.shared);
  return (
    <Card hoverable style={{ marginBottom:sp(5) }}>
      <div style={{ fontSize:14, color:T.fg3, marginBottom:sp(2) }}>
        {isLatest ? "Speso finora questo mese" : "Speso nel mese"}
      </div>
      <div style={{ fontSize:52, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.05 }}>{fmtEur(total)}</div>
      <div style={{ fontSize:14, color:T.fg2, marginTop:sp(3) }}>
        {ms.length} transazioni · {MONTH_LABEL(month)}{days?` · ${days} giorni`:""}
      </div>
      {hasShared && (
        <div style={{ display:"flex", alignItems:"center", gap:sp(2), marginTop:sp(3) }}>
          <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20,
            borderRadius:T.r.sm, background:T.bg, border:`1px solid ${T.border}`, fontSize:12, fontWeight:700, color:T.fg2 }}>½</span>
          <span style={{ fontSize:13, color:T.fg3 }}>include la tua metà delle spese condivise</span>
        </div>
      )}
    </Card>
  );
}

function Metrics({ txns, incomes, month, isLatest, onNavigate }){
  const ms = txnsOfMonth(txns, month);
  const topCat = nameOfTopCat(txns, month);
  const cells = [
    { label:"Media settimanale", val: fmtEur(weeklyAvg(txns, month)) },
    { label:"Categoria top", val: topCat ? CAT_LABEL[topCat] : "—", cat: topCat, isCat:true },
    { label:"Transazioni", val: String(ms.length) },
  ];
  const hasIncome = incomes.length > 0;
  const net = netBalance(incomes, txns, month);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:sp(4), marginBottom:sp(5) }}>
      {cells.map((m,i)=>(
        <Card key={i} hoverable style={{ padding:sp(5) }}>
          <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(2) }}>{m.label}</div>
          {m.isCat
            ? <div style={{ display:"flex", alignItems:"center", gap:sp(2) }}>
                {m.cat && <span style={{ width:10, height:10, borderRadius:"50%", background:T.cat[m.cat] }}/>}
                <span style={{ fontSize:22, fontWeight:650 }}>{m.val}</span></div>
            : <div style={{ fontSize:24, fontWeight:680 }}>{m.val}</div>}
        </Card>
      ))}
      {/* Saldo netto — live con le entrate. A metà mese (mese in corso) è ingannevole → nascosto. */}
      <Card hoverable style={{ padding:sp(5) }}>
        <div style={{ fontSize:13, color:T.fg3 }}>Saldo netto</div>
        {!hasIncome ? (
          <div style={{ fontSize:12.5, color:T.fg3, marginTop:sp(2), lineHeight:1.4 }}>
            <span onClick={()=>onNavigate("income")} style={{ color:T.brand, cursor:"pointer", fontWeight:600 }}>Aggiungi entrate →</span><br/>non sono nel CSV
          </div>
        ) : isLatest ? (
          <div style={{ fontSize:12.5, color:T.fg3, marginTop:sp(2), lineHeight:1.4 }}>
            Disponibile a mese chiuso — a metà mese è ingannevolmente positivo
          </div>
        ) : <>
          <div style={{ fontSize:24, fontWeight:680, color: net>=0?T.success:T.fg }}>{net>=0?"+":"−"}{fmtEur(Math.abs(net))}</div>
          <div style={{ fontSize:11, color:T.fg3, marginTop:2 }}>entrate − quota tua</div>
        </>}
      </Card>
    </div>
  );
}

function SpendBreakdown({ txns, month, onNavigate }){
  const cats = byCategory(txns, month).slice(0,5);
  const max = cats[0]?.val || 1;
  return (
    <Card hoverable style={{ marginBottom:sp(5) }}>
      <div style={{ fontSize:18, fontWeight:620, marginBottom:2 }}>Dove sono andati i soldi</div>
      <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(5) }}>{MONTH_LABEL(month)} · top {cats.length} categorie · la tua quota</div>
      {cats.map((s,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:sp(3), padding:"7px 0" }}>
          <span style={{ width:130, fontSize:14, display:"flex", alignItems:"center", gap:sp(2) }}>
            <span style={{ width:9, height:9, borderRadius:"50%", background:T.cat[s.cat] }}/>{CAT_LABEL[s.cat]}</span>
          <span style={{ flex:1, height:24, background:T.bg, borderRadius:T.r.sm }}>
            <motion.span initial={{ width:0 }} animate={{ width:`${(s.val/max)*100}%` }}
              transition={{ duration:M.dur.slow, ease:M.ease.out, delay:i*0.04 }}
              style={{ display:"block", height:"100%", background:T.cat[s.cat], borderRadius:T.r.sm }}/>
          </span>
          <span style={{ width:84, textAlign:"right", fontSize:14, fontWeight:600 }}>{fmtEur(s.val)}</span>
        </div>
      ))}
    </Card>
  );
}

function Gateway({ onNavigate }){
  const reduce = useReducedMotion();
  return (
    <motion.button onClick={()=>onNavigate("analytics")}
      whileHover={reduce?{}:{ boxShadow:`0 0 0 3px ${T.brand}22` }}
      whileTap={reduce?{}:{ scale:0.98 }}
      transition={{ duration:M.dur.fast, ease:M.ease.out }}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:`10px ${sp(4)}px`,
        background:"transparent", color:T.brand, border:`1px solid ${T.brand}`, borderRadius:T.r.md,
        fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>
      Vedi analisi →
    </motion.button>
  );
}
