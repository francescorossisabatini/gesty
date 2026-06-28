import React, { useState, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, CAT_LABEL, CategoryBadge, Card, EmptyState, PageHeader } from "./tokens.jsx";
import { fmtEur } from "./csv.js";
import {
  useStore, monthsPresent, byCategory, txnsOfMonth, totalShare,
  habitualBand, bandStatus, categorySpend, recurringMerchants,
  fixedVariableSplit, weeklyDistribution, topMerchants, monthlySeriesForCat,
} from "./store.jsx";

/* ============================================================
   GESTY — Analytics · motore a 4 bande (Dev Notes 73:2413, s.20)
   Data-driven (store import CSV). Voce sempre DESCRITTIVA, mai
   normativa (principio 2). Quota tua, mai gross. CPT esclusi.
   ============================================================ */

const MN = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
const monthLabel = (k)=>{ if(!k) return ""; const [y,m]=k.split("-"); return `${["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"][+m-1]} ${y}`; };
const monthShort = (k)=>{ const [,m]=k.split("-"); return MN[+m-1]; };

export default function Analytics({ onNavigate, deepLink }){
  const { transactions, isEmpty } = useStore();
  const months = monthsPresent(transactions);
  const [month,setMonth] = useState(months[0]);

  if(isEmpty){
    return (
      <div>
        <PageHeader title="Analytics"/>
        <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
          <EmptyState title="Niente da analizzare ancora" body="Importa le spese da Curve: le analisi si costruiscono dai tuoi dati."
            onImport={()=>onNavigate("import")}/>
        </div>
      </div>
    );
  }

  const recurring = useMemo(()=> recurringMerchants(transactions), [transactions]);

  // categorie del mese con stato vs banda abituale
  const cats = useMemo(()=>{
    return byCategory(transactions, month).map(({cat,val})=>{
      const band = habitualBand(transactions, cat, month);
      return { cat, val, band, status: bandStatus(val, band) };
    });
  }, [transactions, month]);

  const outOfBand = cats.filter(c=> c.status==="sopra" || c.status==="sotto")
    .sort((a,b)=> deviation(b) - deviation(a));

  return (
    <div>
      <PageHeader title="Analytics"
        meta={monthLabel(month)}
        right={months.length>1 && <PeriodPicker months={months} month={month} setMonth={setMonth}/>}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
        <Band1 cats={cats} month={month}/>
        <Band2 outOfBand={outOfBand} transactions={transactions} month={month} focusCat={deepLink?.cat}/>
        <Band3 transactions={transactions} month={month} recurring={recurring}/>
        <Band4 transactions={transactions} month={month} recurring={recurring} cats={cats}/>
      </div>
    </div>
  );
}

const deviation = (c)=>{
  if(!c.band) return 0;
  const bound = c.status==="sopra" ? c.band.max : c.band.min;
  return c.band.avg ? Math.abs(c.val - bound)/c.band.avg : 0;
};

function PeriodPicker({ months, month, setMonth }){
  return (
    <select value={month} onChange={e=>setMonth(e.target.value)}
      style={{ padding:"7px 12px", border:`1px solid ${T.border}`, borderRadius:T.r.md,
        background:T.surface, color:T.fg, fontSize:TY.body, fontFamily:T.font, cursor:"pointer" }}>
      {months.map(m=> <option key={m} value={m}>{monthLabel(m)}</option>)}
    </select>
  );
}

function SectionTitle({ n, title, sub }){
  return (
    <div style={{ marginBottom:sp(4) }}>
      <div style={{ display:"flex", alignItems:"center", gap:sp(2) }}>
        <span style={{ fontSize:TY.label, fontWeight:700, letterSpacing:"0.06em", color:T.brand }}>BANDA {n}</span>
      </div>
      <div style={{ fontSize:TY.h3, fontWeight:620, marginTop:2 }}>{title}</div>
      {sub && <div style={{ fontSize:TY.sm, color:T.fg3, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

/* ---- Band 1 · Cosa è cambiato vs il tuo solito ---- */
function Band1({ cats, month }){
  // ordina: fuori-banda in cima (per scostamento), poi dentro, poi in apprendimento
  const ranked = [...cats].sort((a,b)=>{
    const rank = (c)=> c.status==="learning" ? 2 : (c.status==="dentro" ? 1 : 0);
    if(rank(a)!==rank(b)) return rank(a)-rank(b);
    return deviation(b)-deviation(a);
  });
  return (
    <Card style={{ marginBottom:sp(6) }}>
      <SectionTitle n="1" title="Cosa è cambiato — vs il tuo solito"
        sub="ogni categoria contro la sua banda abituale (min–max degli ultimi 3 mesi)"/>
      <div style={{ display:"flex", flexDirection:"column", gap:sp(2) }}>
        {ranked.map(c=> <Band1Row key={c.cat} c={c}/>)}
      </div>
    </Card>
  );
}

function Band1Row({ c }){
  const out = c.status==="sopra" || c.status==="sotto";
  const learning = c.status==="learning";
  const sentence = learning
    ? "serve ancora storico — confronto disponibile con ~3 mesi"
    : c.status==="dentro" ? "in linea con il tuo solito"
    : c.status==="sopra" ? `sopra il tuo solito · banda ${fmtEur(c.band.min)}–${fmtEur(c.band.max)}`
    : `sotto il tuo solito · banda ${fmtEur(c.band.min)}–${fmtEur(c.band.max)}`;
  const arrow = c.status==="sopra" ? "⌃" : c.status==="sotto" ? "⌄" : "";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:sp(3), padding:`${sp(2)}px ${sp(3)}px`,
      borderRadius:T.r.md, background: out ? `${T.warning}10` : "transparent" }}>
      <div style={{ width:150 }}><CategoryBadge cat={c.cat}/></div>
      <div style={{ flex:1, fontSize:TY.body, color: learning?T.fg3:T.fg }}>
        {arrow && <b style={{ color:T.warning, marginRight:6 }}>{arrow}</b>}
        <b style={{ fontWeight:650 }}>{fmtEur(c.val)}</b>
        <span style={{ color: out?T.warning:T.fg3, marginLeft:8, fontSize:TY.sm }}>{sentence}</span>
      </div>
      {!learning && c.band && <BandViz val={c.val} band={c.band}/>}
    </div>
  );
}

// barretta: banda abituale (min–max) + posizione del valore corrente
function BandViz({ val, band }){
  const lo = Math.min(band.min, val), hi = Math.max(band.max, val);
  const span = hi - lo || 1;
  const pos = (x)=> `${((x-lo)/span)*100}%`;
  const out = val>band.max || val<band.min;
  return (
    <div style={{ width:160, position:"relative", height:18 }}>
      <div style={{ position:"absolute", top:8, left:0, right:0, height:2, background:T.border }}/>
      {/* banda abituale */}
      <div style={{ position:"absolute", top:6, height:6, borderRadius:3, background:`${T.fg3}55`,
        left:pos(band.min), width:`calc(${pos(band.max)} - ${pos(band.min)})` }}/>
      {/* valore corrente */}
      <div title={fmtEur(val)} style={{ position:"absolute", top:3, width:12, height:12, borderRadius:"50%",
        background: out?T.warning:T.brand, border:`2px solid ${T.surface}`, left:`calc(${pos(val)} - 6px)` }}/>
    </div>
  );
}

/* ---- Band 2 · Eccezione o pattern? ---- */
function Band2({ outOfBand, transactions, month, focusCat }){
  if(outOfBand.length===0){
    return (
      <Card style={{ marginBottom:sp(6) }}>
        <SectionTitle n="2" title="Eccezione o pattern?"
          sub="nessuna categoria fuori dalla banda abituale questo mese"/>
        <div style={{ fontSize:TY.sm, color:T.fg3 }}>Quando una categoria esce dal solito, qui vedi se è un caso isolato o un ritmo nuovo.</div>
      </Card>
    );
  }
  // metti in cima la categoria del deep-link
  const ordered = [...outOfBand].sort((a,b)=> (b.cat===focusCat?1:0)-(a.cat===focusCat?1:0));
  return (
    <Card style={{ marginBottom:sp(6) }}>
      <SectionTitle n="2" title="Eccezione o pattern?"
        sub="per ogni categoria fuori banda: un caso isolato o un ritmo nuovo?"/>
      <div style={{ display:"flex", flexDirection:"column", gap:sp(5) }}>
        {ordered.map(c=> <Band2Block key={c.cat} c={c} transactions={transactions} month={month}/>)}
      </div>
      <Footnote>Derivato dalla distribuzione delle transazioni, non un fatto osservato.</Footnote>
    </Card>
  );
}

function Band2Block({ c, transactions, month }){
  const txns = categorySpend(transactions, c.cat, month).sort((a,b)=>b.share-a.share);
  const total = txns.reduce((s,t)=>s+t.share,0);
  const max = txns[0];
  const maxPct = total? Math.round((max.share/total)*100):0;
  const exception = maxPct >= 35;
  const mean = total/(txns.length||1);
  const scaleMax = Math.max(...txns.map(t=>t.share), 1);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:sp(2), marginBottom:sp(2) }}>
        <CategoryBadge cat={c.cat}/>
        <span style={{ fontSize:TY.micro, fontWeight:700, letterSpacing:"0.04em", padding:"2px 8px", borderRadius:T.r.pill,
          background: exception?`${T.warning}1A`:`${T.fg3}1A`, color: exception?T.warning:T.fg2 }}>
          {exception?"ECCEZIONE":"PATTERN"}
        </span>
        <span style={{ fontSize:TY.sm, color:T.fg2 }}>
          {exception
            ? `1 spesa (${max.merchant}) pesa il ${maxPct}% del totale`
            : `${txns.length} spese distribuite, nessuna domina`}
        </span>
      </div>
      {/* dot-plot: ogni punto una transazione, x = importo; linea = media */}
      <div style={{ position:"relative", height:34, marginLeft:158 }}>
        <div style={{ position:"absolute", top:16, left:0, right:0, height:1, background:T.border }}/>
        <div title={`media ${fmtEur(mean)}`} style={{ position:"absolute", top:6, bottom:6, width:2, background:`${T.fg3}99`,
          left:`${(mean/scaleMax)*100}%` }}/>
        {txns.map((t,i)=>{
          const dom = t===max && exception;
          return (
            <div key={i} title={`${t.merchant} · ${fmtEur(t.share)}`}
              style={{ position:"absolute", top:11, width: dom?14:10, height: dom?14:10, borderRadius:"50%",
                background: dom?T.warning:`${T.cat[c.cat]}`, opacity: dom?1:0.7,
                border:`2px solid ${T.surface}`, left:`calc(${(t.share/scaleMax)*100}% - ${dom?7:5}px)` }}/>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Band 3 · La stessa spesa, da angoli diversi ---- */
function Band3({ transactions, month, recurring }){
  const [tab,setTab] = useState("merchant");
  const tabs = [["merchant","Per merchant"],["time","Nel tempo"],["fixed","Fisso vs scelto"]];
  return (
    <Card style={{ marginBottom:sp(6) }}>
      <SectionTitle n="3" title="La stessa spesa, da angoli diversi"
        sub="stesso totale del mese, tre lenti — l'insight nasce dal cambio di lente"/>
      <div style={{ display:"inline-flex", background:T.bg, borderRadius:T.r.md, padding:3, border:`1px solid ${T.border}`, marginBottom:sp(5) }}>
        {tabs.map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{ position:"relative", fontSize:TY.sm, fontWeight:550, padding:"6px 14px", borderRadius:T.r.sm,
              border:"none", cursor:"pointer", fontFamily:T.font, color: tab===v?T.fg:T.fg3, zIndex:1 }}>
            {tab===v && <motion.div layoutId="b3tab" transition={{ duration:M.dur.instant }}
              style={{ position:"absolute", inset:0, background:T.surface, borderRadius:T.r.sm, boxShadow:"0 1px 3px rgba(26,39,51,.08)", zIndex:-1 }}/>}
            <span style={{ position:"relative", zIndex:1 }}>{l}</span>
          </button>
        ))}
      </div>
      {tab==="merchant" && <TabMerchant transactions={transactions} month={month}/>}
      {tab==="time" && <TabTime transactions={transactions} month={month}/>}
      {tab==="fixed" && <TabFixed transactions={transactions} month={month} recurring={recurring}/>}
    </Card>
  );
}

function TabMerchant({ transactions, month }){
  const ms = topMerchants(transactions, null, month, 8);
  const max = ms[0]?.val || 1;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:sp(2) }}>
      {ms.map((m,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:sp(3) }}>
          <span style={{ width:130, fontSize:TY.body, display:"flex", alignItems:"center", gap:sp(2) }}>
            <span style={{ width:9, height:9, borderRadius:"50%", background:T.cat[m.cat], flexShrink:0 }}/>{m.name}</span>
          <span style={{ flex:1, height:22, background:T.bg, borderRadius:T.r.sm }}>
            <motion.span initial={{ width:0 }} animate={{ width:`${(m.val/max)*100}%` }}
              transition={{ duration:M.dur.slow, ease:M.ease.out, delay:i*0.03 }}
              style={{ display:"block", height:"100%", background:T.cat[m.cat], borderRadius:T.r.sm }}/>
          </span>
          <span style={{ width:48, fontSize:TY.micro, color:T.fg3, textAlign:"right" }}>{m.count}×</span>
          <span style={{ width:84, textAlign:"right", fontSize:TY.body, fontWeight:600 }}>{fmtEur(m.val)}</span>
        </div>
      ))}
    </div>
  );
}

function TabTime({ transactions, month }){
  const weeks = weeklyDistribution(transactions, null, month);
  const max = Math.max(...weeks, 1);
  const peak = weeks.indexOf(max);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:sp(4), height:150 }}>
        {weeks.map((v,i)=>(
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8, height:"100%", justifyContent:"flex-end" }}>
            <span style={{ fontSize:TY.micro, color:T.fg2, fontWeight: i===peak?700:400 }}>{fmtEur(v)}</span>
            <motion.div initial={{ height:0 }} animate={{ height:`${(v/max)*100}%` }}
              transition={{ duration:M.dur.slow, ease:M.ease.out, delay:i*0.05 }}
              style={{ width:"100%", maxWidth:60, borderRadius:`${T.r.sm}px ${T.r.sm}px 0 0`,
                background: i===peak?T.brand:`${T.brand}55` }}/>
            <span style={{ fontSize:TY.micro, color:T.fg3 }}>sett. {i+1}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize:TY.sm, color:T.fg2, marginTop:sp(4) }}>
        Spendi di più nella <b>settimana {peak+1}</b> del mese.
      </div>
    </div>
  );
}

function TabFixed({ transactions, month, recurring }){
  const split = fixedVariableSplit(transactions, null, month, recurring);
  const pctFixed = split.total? Math.round((split.fixed/split.total)*100):0;
  return (
    <div>
      <div style={{ display:"flex", height:40, borderRadius:T.r.md, overflow:"hidden", border:`1px solid ${T.border}` }}>
        <div style={{ width:`${pctFixed}%`, background:`${T.fg3}`, display:"flex", alignItems:"center", justifyContent:"center",
          color:T.onBrand, fontSize:TY.sm, fontWeight:600 }}>{pctFixed>12 && "fisso"}</div>
        <div style={{ flex:1, background:T.brand, display:"flex", alignItems:"center", justifyContent:"center",
          color:T.onBrand, fontSize:TY.sm, fontWeight:600 }}>scelto</div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:sp(3), fontSize:TY.sm }}>
        <span><b>{fmtEur(split.fixed)}</b> <span style={{ color:T.fg3 }}>ricorrente / incomprimibile</span></span>
        <span><b>{fmtEur(split.variable)}</b> <span style={{ color:T.fg3 }}>discrezionale</span></span>
      </div>
      <Footnote>Derivato dall'euristica di ricorrenza (merchant ricorrenti su più mesi). Migliora con più storico.</Footnote>
    </div>
  );
}

/* ---- Band 4 · E se spostassi parte di [categoria]? ---- */
function Band4({ transactions, month, recurring, cats }){
  // scegli la categoria con più parte variabile (la leva più reale)
  const candidate = useMemo(()=>{
    let best=null, bestVar=-1;
    cats.forEach(({cat})=>{
      const s = fixedVariableSplit(transactions, cat, month, recurring);
      if(s.variable > bestVar){ bestVar = s.variable; best = cat; }
    });
    return best;
  }, [cats, transactions, month, recurring]);

  const split = fixedVariableSplit(transactions, candidate, month, recurring);
  const [moved,setMoved] = useState(0); // quanto della parte variabile sposti
  const reduce = useReducedMotion();

  // equivalenze dai dati reali: cene tenute (media transazione Ristoranti), % di un'altra categoria
  const eq = useMemo(()=> equivalences(transactions, month, candidate, moved), [transactions, month, candidate, moved]);

  if(!candidate || split.total===0){
    return (
      <Card style={{ marginBottom:sp(6) }}>
        <SectionTitle n="4" title="E se spostassi parte di una categoria?"/>
        <div style={{ fontSize:TY.sm, color:T.fg3 }}>Serve una categoria con spesa discrezionale per simulare uno spostamento.</div>
      </Card>
    );
  }

  const newTotal = split.total - moved;
  return (
    <Card style={{ marginBottom:sp(6) }}>
      <SectionTitle n={"4"} title={<>E se spostassi parte di <span style={{ color:T.cat[candidate] }}>{CAT_LABEL[candidate]}</span>?</>}
        sub="la barra parte dalla spesa reale; sposti solo la parte discrezionale (il fisso resta)"/>

      {/* barra fisso | variabile-rimasto | spostato */}
      <StackBar fixed={split.fixed} variable={split.variable-moved} moved={moved} cat={candidate}/>

      <div style={{ fontSize:TY.h3, fontWeight:650, margin:`${sp(4)}px 0 ${sp(2)}px` }}>
        {fmtEur(split.total)} <span style={{ color:T.fg3, fontWeight:400 }}>→</span> {fmtEur(newTotal)}
        {moved>0 && <span style={{ fontSize:TY.sm, color:T.fg3, fontWeight:400, marginLeft:8 }}>se sposti {fmtEur(moved)}</span>}
      </div>

      <input type="range" min={0} max={Math.round(split.variable)} step={1} value={moved}
        onChange={e=>setMoved(+e.target.value)}
        style={{ width:"100%", accentColor:T.brand, marginBottom:sp(2) }}/>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:TY.micro, color:T.fg3, marginBottom:sp(5) }}>
        <span>sposta nulla</span><span>parte discrezionale max {fmtEur(split.variable)}</span>
      </div>

      {moved>0 && (
        <motion.div initial={reduce?{}:{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
          style={{ background:T.bg, borderRadius:T.r.md, padding:sp(4) }}>
          <div style={{ fontSize:TY.micro, fontWeight:700, letterSpacing:"0.05em", color:T.fg3, marginBottom:sp(3) }}>DOVE VIVREBBERO QUEI {fmtEur(moved)}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:sp(2) }}>
            {eq.map((e,i)=> (
              <div key={i} style={{ fontSize:TY.body, color:T.fg2 }}>≈ <b style={{ color:T.fg }}>{e}</b></div>
            ))}
          </div>
        </motion.div>
      )}
      <Footnote>What-if descrittivo: nessun "dovresti", nessun tetto. Equivalenze solo dal presente, sui tuoi dati reali.</Footnote>
    </Card>
  );
}

function StackBar({ fixed, variable, moved, cat }){
  const total = fixed + variable + moved || 1;
  const w = (x)=> `${(x/total)*100}%`;
  return (
    <div style={{ display:"flex", height:44, borderRadius:T.r.md, overflow:"hidden", border:`1px solid ${T.border}` }}>
      <div style={{ width:w(fixed), background:`${T.fg3}`, display:"flex", alignItems:"center", justifyContent:"center", color:T.onBrand, fontSize:TY.micro, fontWeight:600 }}>{fixed/total>0.1 && "fisso"}</div>
      <div style={{ width:w(variable), background:T.cat[cat], display:"flex", alignItems:"center", justifyContent:"center", color:T.onBrand, fontSize:TY.micro, fontWeight:600 }}>{variable/total>0.1 && "resta"}</div>
      {moved>0 && <div style={{ width:w(moved), background:`${T.cat[cat]}40`, borderLeft:`2px dashed ${T.surface}`,
        display:"flex", alignItems:"center", justifyContent:"center", color:T.fg2, fontSize:TY.micro, fontWeight:600 }}>spostati</div>}
    </div>
  );
}

// equivalenze concrete dai dati reali (presente, mai proiezioni)
function equivalences(transactions, month, candidate, moved){
  if(moved<=0) return [];
  const out = [];
  // cene fuori: media transazione Ristoranti reale
  const dining = categorySpend(transactions, "dining", month);
  if(dining.length){
    const avg = dining.reduce((s,t)=>s+t.share,0)/dining.length;
    if(avg>0) out.push(`${Math.round(moved/avg)} cene fuori (media tua ${fmtEur(avg)})`);
  }
  // mesi di un merchant ricorrente reale (es. abbonamento)
  const subs = topMerchants(transactions, "subscriptions", month, 1)[0];
  if(subs && subs.val>0) out.push(`${(moved/subs.val).toFixed(1)} mesi di ${subs.name}`);
  // % di un'altra categoria reale (Trasporti)
  const tr = byCategory(transactions, month).find(c=>c.cat==="transport");
  if(tr && tr.val>0) out.push(`il ${Math.round((moved/tr.val)*100)}% dei tuoi Trasporti del mese`);
  return out.length? out : [`${fmtEur(moved)} liberi questo mese`];
}

function Footnote({ children }){
  return <div style={{ fontSize:TY.micro, color:T.fg3, marginTop:sp(4), fontStyle:"italic" }}>{children}</div>;
}
