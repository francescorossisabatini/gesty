import React, { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, CAT_LABEL, CategoryBadge, Card, EmptyState, PageHeader } from "./tokens.jsx";
import { fmtEur } from "./csv.js";
import {
  useStore, monthsPresent, byCategory, txnsOfMonth,
  monthlySeriesForCat, topMerchants,
} from "./store.jsx";

/* ============================================================
   GESTY — Categories / Default (70:1886) + Dev Notes (70:2253)
   Una-categoria-alla-volta, data-driven. Andamento = SOLO storico
   fattuale (nessuna proiezione: quella vive in Analytics). Quota tua.
   ============================================================ */

const monthKey = (iso)=> iso?.slice(0,7);
const MN = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
const monthShort = (k)=>{ const [,m]=k.split("-"); return MN[+m-1]; };

export default function Categories({ onNavigate, deepLink }){
  const { transactions, isEmpty } = useStore();
  const months = monthsPresent(transactions);
  const month = months[0];

  // categorie presenti nel mese, ordinate per spesa
  const present = useMemo(()=> byCategory(transactions, month).map(x=>x.cat), [transactions, month]);
  const [cat,setCat] = useState(deepLink?.cat || present[0] || "dining");

  if(isEmpty){
    return (
      <div>
        <PageHeader title="Categories"/>
        <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
          <EmptyState title="Nessuna categoria" body="Le categorie compaiono quando importi le spese da Curve."
            onImport={()=>onNavigate("import")}/>
        </div>
      </div>
    );
  }

  // metriche della categoria attiva sul mese corrente (quota tua)
  const monthTxns = txnsOfMonth(transactions, month).filter(t=>t.cat===cat);
  const total = monthTxns.reduce((s,t)=>s+t.share,0);
  const count = monthTxns.length;
  const avg = count ? total/count : 0;
  const monthTotalAll = txnsOfMonth(transactions, month).reduce((s,t)=>s+t.share,0);
  const shareMonth = monthTotalAll ? Math.round((total/monthTotalAll)*100) : 0;

  // serie storica + confronto vs banda abituale (mesi precedenti)
  const series = monthlySeriesForCat(transactions, cat);
  const prior = series.filter(p=>p.month !== month).map(p=>p.val);
  const norm = prior.length ? prior.reduce((a,b)=>a+b,0)/prior.length : null;
  const vsNorm = norm ? Math.round(((total-norm)/norm)*100) : null;
  const dir = vsNorm===null ? null : vsNorm>3 ? "up" : vsNorm<-3 ? "down" : "flat";

  const merchants = topMerchants(transactions, cat, month, 5);

  return (
    <div>
      <PageHeader title="Categories" meta={`${transactions.length} movimenti in archivio`}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
      <div style={{ display:"flex", gap:8, marginBottom:sp(6), flexWrap:"wrap" }}>
        {present.map(c=> <CatChip key={c} cat={c} active={cat===c} onClick={()=>setCat(c)}/>)}
      </div>

      <motion.div key={cat} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:M.dur.base, ease:M.ease.out }}>

        <Card hoverable style={{ marginBottom:sp(5) }}>
          <div style={{ display:"flex", alignItems:"center", gap:sp(3), marginBottom:sp(3) }}>
            <CategoryBadge cat={cat}/>
            <span style={{ fontSize:13, color:T.fg3 }}>{monthLabel(month)} · la tua quota</span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:sp(4), flexWrap:"wrap" }}>
            <span style={{ fontSize:48, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1 }}>{fmtEur(total)}</span>
            {dir && (
              <span style={{ fontSize:15, fontWeight:600,
                color: dir==="up"?T.warning : dir==="down"?T.success : T.fg3 }}>
                {dir==="up"?"⌃":dir==="down"?"⌄":"="} {Math.abs(vsNorm)}%{" "}
                <span style={{ color:T.fg3, fontWeight:400 }}>{vsNorm>=0?"sopra":"sotto"} il tuo solito</span>
              </span>
            )}
            {!dir && <span style={{ fontSize:13, color:T.fg3 }}>storia troppo breve per un confronto</span>}
          </div>
        </Card>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:sp(4), marginBottom:sp(5) }}>
          <Card hoverable style={{ padding:sp(5) }}>
            <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(2) }}>Scontrino medio</div>
            <div style={{ fontSize:24, fontWeight:680 }}>{fmtEur(avg)}</div>
          </Card>
          <Card hoverable style={{ padding:sp(5) }}>
            <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(2) }}>Quota sul mese</div>
            <div style={{ fontSize:24, fontWeight:680 }}>{shareMonth}%</div>
          </Card>
        </div>

        <Card hoverable style={{ marginBottom:sp(5) }}>
          <div style={{ fontSize:18, fontWeight:620, marginBottom:2 }}>Andamento</div>
          <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(5) }}>quota tua per mese · solo storico</div>
          {series.length>1
            ? <HistoryBars series={series} cat={cat} month={month}/>
            : <div style={{ fontSize:13.5, color:T.fg3, padding:`${sp(4)}px 0` }}>Un solo mese di dati: l'andamento compare con più storico.</div>}
        </Card>

        <Card hoverable style={{ marginBottom:sp(5) }}>
          <div style={{ fontSize:18, fontWeight:620, marginBottom:2 }}>Top merchant</div>
          <div style={{ fontSize:13, color:T.fg3, marginBottom:sp(4) }}>per quota tua · {monthLabel(month)}</div>
          {merchants.map((m,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 0", borderBottom: i<merchants.length-1?`1px solid ${T.border}`:"none" }}>
              <span style={{ fontSize:14, fontWeight:550 }}>{m.name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:sp(4) }}>
                <span style={{ fontSize:13, color:T.fg3 }}>{m.count} {m.count===1?"volta":"volte"}</span>
                <span style={{ fontSize:14, fontWeight:600, width:90, textAlign:"right" }}>{fmtEur(m.val)}</span>
              </div>
            </div>
          ))}
        </Card>
      </motion.div>
      </div>
    </div>
  );
}

function HistoryBars({ series, cat, month }){
  const max = Math.max(...series.map(p=>p.val), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:sp(4), height:170, paddingTop:sp(2) }}>
      {series.map((p,i)=>{
        const cur = p.month===month;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8, height:"100%", justifyContent:"flex-end" }}>
            <span style={{ fontSize:11, color:T.fg2, fontWeight:cur?700:400 }}>{fmtEur(p.val)}</span>
            <motion.div initial={{ height:0 }} animate={{ height:`${(p.val/max)*100}%` }}
              transition={{ duration:M.dur.slow, ease:M.ease.out, delay:i*0.04 }}
              style={{ width:"100%", maxWidth:56, borderRadius:`${T.r.sm}px ${T.r.sm}px 0 0`,
                background: cur?T.cat[cat]:`${T.cat[cat]}55` }}/>
            <span style={{ fontSize:11, color:T.fg3 }}>{monthShort(p.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

function CatChip({ cat, active, onClick }){
  const reduce = useReducedMotion();
  return (
    <motion.button onClick={onClick} whileHover={reduce?{}:{ y:-1 }}
      transition={{ duration:M.dur.fast, ease:M.ease.out }}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"7px 13px",
        borderRadius:T.r.pill, border:`1px solid ${active?T.cat[cat]:T.border}`,
        background:active?T.cat[cat]:T.surface, color:active?T.onBrand:T.fg2,
        fontSize:13.5, fontWeight:550, cursor:"pointer", fontFamily:T.font,
        transition:"background .15s, border-color .15s, color .15s" }}>
      <span style={{ width:8, height:8, borderRadius:"50%", background:active?T.onBrand:T.cat[cat] }}/>
      {CAT_LABEL[cat]}
    </motion.button>
  );
}

function monthLabel(k){
  if(!k) return "";
  const [y,m]=k.split("-");
  const names=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  return `${names[+m-1]} ${y}`;
}
