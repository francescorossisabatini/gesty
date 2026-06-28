import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, EL, CAT_LABEL, NavIco, CategoryBadge, Card, EmptyState, PageHeader } from "./tokens.jsx";
import { fmtEur, fmtDate } from "./csv.js";
import { useStore, monthsPresent, byCategory, totalShare } from "./store.jsx";

/* ============================================================
   GESTY — Spending / Default (49:622) + Dev Notes (114:3586)
   Registro esplorativo, data-driven (store import CSV).
   - Filter Bar: top-4 categorie del periodo + "+N"
   - Selection Summary sempre visibile, totale = quota tua
   - chip attiva → "vedi trend →" deep-link a Categories
   - Riga espandibile: dettaglio + correzione categoria (override)
   ============================================================ */

const ALL_CATS = ["groceries","dining","transport","subscriptions","shopping","health","housing","other"];
const monthKey = (iso) => iso?.slice(0,7);

export default function Spending({ onNavigate }){
  const { transactions, isEmpty, setCategory, setSplit } = useStore();
  const reduce = useReducedMotion();
  const months = monthsPresent(transactions);
  const [month] = useState(months[0]); // mese più recente (semplice: niente selettore qui per ora)
  const [query,setQuery] = useState("");
  const [activeCat,setActiveCat] = useState(null);
  const [openRow,setOpenRow] = useState(null);

  if(isEmpty){
    return (
      <div>
        <PageHeader title="Spending"/>
        <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
          <EmptyState title="Nessuna transazione" body="Importa un export CSV da Curve per popolare il registro."
            onImport={()=>onNavigate("import")}/>
        </div>
      </div>
    );
  }

  // top-4 categorie del periodo (ricalcolate sul mese)
  const ranked = useMemo(()=> byCategory(transactions, month).map(x=>x.cat), [transactions, month]);
  const topChips = ranked.slice(0,4);
  const moreChips = ranked.slice(4);

  const monthTxns = useMemo(()=> transactions.filter(t=> monthKey(t.date)===month), [transactions, month]);

  const rows = useMemo(()=> monthTxns.filter(t=>{
    const q = query.trim().toLowerCase();
    const okQ = !q || t.merchant.toLowerCase().includes(q) || t.merchantRaw.toLowerCase().includes(q);
    const okC = !activeCat || t.cat === activeCat;
    return okQ && okC;
  }), [monthTxns, query, activeCat]);

  const summaryTotal = totalShare(rows);
  const toggleRow = (id)=> setOpenRow(o=> o===id?null:id);

  return (
    <div>
      <PageHeader title="Spending" meta={`${transactions.length} movimenti in archivio`}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
      <FilterBar query={query} setQuery={setQuery} activeCat={activeCat} setActiveCat={setActiveCat}
        topChips={topChips} moreChips={moreChips}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:`${sp(3)}px 0`, borderBottom:`1px solid ${T.border}`, marginBottom:sp(2) }}>
        <div style={{ display:"flex", alignItems:"center", gap:sp(2), fontSize:14, color:T.fg2 }}>
          <span>{rows.length} transazioni · {monthLabel(month)}</span>
          {activeCat && <>
            <span style={{ color:T.fg3 }}>·</span>
            <motion.span onClick={()=>onNavigate("categories",{ cat:activeCat })}
              whileHover={reduce?{}:{ x:2 }}
              style={{ color:T.brand, fontWeight:600, cursor:"pointer" }}>vedi trend →</motion.span>
          </>}
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:sp(2) }}>
          <span style={{ fontSize:18, fontWeight:680 }}>{fmtEur(summaryTotal)}</span>
          <span style={{ fontSize:12, color:T.fg3 }}>quota tua</span>
        </div>
      </div>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.r.lg, overflow:"hidden" }}>
        <TableHeader/>
        {rows.map((t,i)=>(
          <Row key={t.id} t={t} zebra={i%2===1}
            open={openRow===t.id} onToggle={()=>toggleRow(t.id)}
            onBadge={()=>setActiveCat(t.cat)}
            onCorrect={(c)=>setCategory(t.id,c)}
            onSplit={(s)=>setSplit(t.id,s)}/>
        ))}
        {rows.length===0 && <div style={{ padding:sp(8), textAlign:"center", color:T.fg3, fontSize:14 }}>Nessuna transazione per questo filtro.</div>}
      </div>
      </div>
    </div>
  );
}

function monthLabel(k){
  if(!k) return "";
  const [y,m] = k.split("-");
  const names=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
  return `${names[+m-1]} ${y}`;
}

function FilterBar({ query, setQuery, activeCat, setActiveCat, topChips, moreChips }){
  const [showMore,setShowMore]=useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:sp(2), marginBottom:sp(4), flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, width:280, padding:"8px 12px",
        background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.r.md }}>
        <span style={{ color:T.fg3, display:"flex" }}><NavIco.search/></span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca transazioni…"
          style={{ border:"none", outline:"none", flex:1, fontSize:14, color:T.fg, background:"transparent", fontFamily:T.font }}/>
      </div>
      {topChips.map(c=>(
        <Chip key={c} cat={c} active={activeCat===c} onClick={()=>setActiveCat(activeCat===c?null:c)}/>
      ))}
      {moreChips.length>0 && (
        <div style={{ position:"relative" }}>
          <button onClick={()=>setShowMore(s=>!s)}
            style={{ padding:"7px 13px", borderRadius:T.r.pill, border:`1px solid ${T.border}`,
              background:T.surface, color:T.fg2, fontSize:13.5, fontWeight:550, cursor:"pointer", fontFamily:T.font }}>
            + {moreChips.length}
          </button>
          <AnimatePresence>
            {showMore && (
              <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                transition={{ duration:M.dur.fast, ease:M.ease.out }}
                style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:10,
                  background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.r.md,
                  boxShadow:EL.pop, padding:6, display:"flex", flexDirection:"column", gap:4 }}>
                {moreChips.map(c=>(
                  <Chip key={c} cat={c} active={activeCat===c} onClick={()=>{ setActiveCat(activeCat===c?null:c); setShowMore(false); }}/>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Chip({ cat, active, onClick }){
  const reduce = useReducedMotion();
  return (
    <motion.button onClick={onClick} whileHover={reduce?{}:{ y:-1 }}
      transition={{ duration:M.dur.fast, ease:M.ease.out }}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"7px 13px",
        borderRadius:T.r.pill, border:`1px solid ${active?T.cat[cat]:T.border}`,
        background:active?T.cat[cat]:T.surface, color:active?T.onBrand:T.fg2,
        fontSize:13.5, fontWeight:550, cursor:"pointer", fontFamily:T.font,
        transition:"background .15s, border-color .15s, color .15s", whiteSpace:"nowrap" }}>
      <span style={{ width:8, height:8, borderRadius:"50%", background:active?T.onBrand:T.cat[cat] }}/>
      {CAT_LABEL[cat]}
    </motion.button>
  );
}

function TableHeader(){
  const cols=[["Data",120],["Descrizione",1],["Categoria",150],["Carta",90],["Importo",120]];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:sp(3), padding:`${sp(3)}px ${sp(5)}px`,
      borderBottom:`1px solid ${T.border}`, background:T.bg }}>
      {cols.map(([label,w],i)=>(
        <div key={i} style={{ width:w===1?undefined:w, flex:w===1?1:undefined,
          textAlign:label==="Importo"?"right":"left", fontSize:12, fontWeight:600, color:T.fg3,
          letterSpacing:"0.02em", display:"flex", justifyContent:label==="Importo"?"flex-end":"flex-start" }}>{label}</div>
      ))}
      <div style={{ width:24 }}/>
    </div>
  );
}

function Row({ t, zebra, open, onToggle, onBadge, onCorrect, onSplit }){
  const reduce = useReducedMotion();
  return (
    <div style={{ borderBottom:`1px solid ${T.border}`, background:zebra?T.bg:T.surface }}>
      <div role="button" aria-expanded={open} tabIndex={0} onClick={onToggle}
        onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onToggle(); } }}
        style={{ display:"flex", alignItems:"center", gap:sp(3), padding:`${sp(3)}px ${sp(5)}px`, cursor:"pointer" }}>
        <div style={{ width:120, fontSize:13.5, color:T.fg2 }}>{fmtDate(t.date)}</div>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
          <span style={{ fontSize:14, fontWeight:550, color:T.fg, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.merchant}</span>
          <SplitBadge t={t}/>
        </div>
        <div style={{ width:150 }} onClick={e=>{ e.stopPropagation(); onBadge(); }}>
          <span style={{ cursor:"pointer" }}><CategoryBadge cat={t.cat}/></span>
        </div>
        <div style={{ width:90, fontSize:13, color:T.fg2 }}>{t.card?`•• ${t.card}`:"—"}</div>
        <div style={{ width:120, textAlign:"right" }}>
          {t.split < 1 && !t.refund && <div style={{ fontSize:11, color:T.fg3 }}>di {fmtEur(t.gross)}</div>}
          <div style={{ fontSize:14, fontWeight:650, color: t.refund?T.success : t.split===0?T.fg3 : T.fg }}>{fmtEur(t.share, t.refund)}</div>
        </div>
        <motion.span animate={{ rotate:open?90:0 }} transition={{ duration:reduce?0:M.dur.base, ease:M.ease.out }}
          style={{ width:24, display:"flex", justifyContent:"center", color:T.fg3 }}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 5l5 5-5 5"/></svg>
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce?{ opacity:1 }:{ height:0, opacity:0 }}
            animate={reduce?{ opacity:1 }:{ height:"auto", opacity:1 }}
            exit={reduce?{ opacity:1 }:{ height:0, opacity:0 }}
            transition={{ duration:M.dur.base, ease:M.ease.out }} style={{ overflow:"hidden" }}>
            <RowDetail t={t} onCorrect={onCorrect} onSplit={onSplit}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RowDetail({ t, onCorrect, onSplit }){
  return (
    <div style={{ padding:`${sp(4)}px ${sp(5)}px ${sp(5)}px`, background:`${T.brand}06`, borderTop:`1px dashed ${T.border}` }}>
      <div style={{ display:"flex", gap:sp(8), marginBottom:sp(4), flexWrap:"wrap" }}>
        <Field label="Merchant (grezzo)" value={t.merchantRaw}/>
        <Field label="Data · ora" value={`${fmtDate(t.date)} · ${t.time||"—"}`}/>
        <Field label="Carta" value={`${t.card?`•• ${t.card}`:t.cardName||"—"}`}/>
        <Field label={t.shared?"Lordo · quota tua":"Importo"} value={t.shared?`${fmtEur(t.gross)} · ${fmtEur(t.share)}`:fmtEur(t.share)}/>
      </div>

      {/* split per singola transazione (override) — 3 stati */}
      <div style={{ fontSize:12, fontWeight:600, color:T.fg3, marginBottom:sp(2) }}>Quota tua</div>
      <div style={{ display:"flex", alignItems:"center", gap:sp(3), marginBottom:sp(4), flexWrap:"wrap" }}>
        <div style={{ display:"inline-flex", background:T.bg, borderRadius:T.r.md, padding:3, border:`1px solid ${T.border}` }}>
          {[[1,"Personale · 100%"],[0.5,"Condivisa · 50/50"],[0,"Non tua · 0%"]].map(([v,l])=>(
            <button key={v} onClick={()=>onSplit(v)}
              style={{ fontSize:13, fontWeight:550, padding:"6px 12px", borderRadius:T.r.sm, border:"none",
                cursor:"pointer", fontFamily:T.font,
                background: t.split===v ? T.surface : "transparent",
                color: t.split===v ? T.fg : T.fg2,
                boxShadow: t.split===v ? "0 1px 3px rgba(26,39,51,.08)" : "none" }}>{l}</button>
          ))}
        </div>
        <span style={{ fontSize:11.5, color:T.fg3 }}>
          {t.splitOverride
            ? (t.split===0 ? "interamente dell'altra persona · esclusa dai tuoi totali"
              : "impostato a mano · ricalcola la quota tua")
            : `default dalla carta ${t.card?`•• ${t.card}`:""}`}
        </span>
      </div>

      <div style={{ fontSize:12, fontWeight:600, color:T.fg3, marginBottom:sp(2) }}>
        Categoria di <b style={{ color:T.fg2 }}>{t.merchant}</b>
        {t.catOverride && <span style={{ color:T.brand, fontWeight:500 }}> · imparata da te</span>}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {ALL_CATS.map(c=> <Chip key={c} cat={c} active={t.cat===c} onClick={()=>onCorrect(c)}/>)}
      </div>
      <div style={{ fontSize:11.5, color:T.fg3, marginTop:sp(3) }}>
        Correggere la categoria la imparo per <b>tutte</b> le transazioni di “{t.merchant}” (anche nei futuri import), scavalcando quella di Curve. Lo split invece vale solo per questa riga. Reversibili, nessuna conferma.
      </div>
    </div>
  );
}

function Field({ label, value }){
  return (
    <div>
      <div style={{ fontSize:11.5, color:T.fg3, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:550, color:T.fg }}>{value}</div>
    </div>
  );
}

// badge split (forma + label, mai colore da solo). Punto teal = impostato a mano.
function SplitBadge({ t }){
  if(t.split === 1 && !t.splitOverride) return null;
  const text = t.split === 0 ? "non tua" : t.split === 0.5 ? "½ condivisa" : "personale";
  const title = t.split === 0 ? "interamente dell'altra persona — esclusa dalla tua quota"
    : t.split === 0.5 ? "metà tua (carta condivisa)" : "interamente tua";
  return (
    <span title={title} style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600,
      color:T.fg3, background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.r.sm, padding:"1px 6px", flexShrink:0 }}>
      {text}{t.splitOverride && <span title="impostato a mano" style={{ width:5, height:5, borderRadius:"50%", background:T.brand }}/>}
    </span>
  );
}
