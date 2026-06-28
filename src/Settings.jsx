import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, EL, Card, EmptyState, PageHeader } from "./tokens.jsx";
import { fmtEur } from "./csv.js";
import { useStore, discoverCards, totalPoints } from "./store.jsx";

/* ============================================================
   GESTY — Settings · Carte (data contract: card→split)
   Scopre le carte dai dati importati. Lo split è una proprietà
   della carta: ••8480 condivisa 50/50, le altre personali 100%.
   Cambiarlo RICALCOLA retroattivamente la quota tua → conferma.
   ============================================================ */

const SPLIT_OPTS = [[1,"Personale","100% tua"],[0.5,"Condivisa","50/50"],[0,"Non tua","0% — esclusa"]];

export default function Settings({ onNavigate }){
  const { transactions, points, cardSplits, isEmpty, setCardSplit } = useStore();
  const [confirm,setConfirm] = useState(null); // { last4, split, affected }

  if(isEmpty){
    return (
      <div>
        <PageHeader title="Settings"/>
        <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>
          <EmptyState title="Nessuna carta ancora" body="Le carte si scoprono dai movimenti importati da Curve."
            onImport={()=>onNavigate("import")}/>
        </div>
      </div>
    );
  }

  const cards = useMemo(()=> discoverCards(transactions, cardSplits), [transactions, cardSplits]);
  const pts = totalPoints(points);

  const askChange = (card, split) => {
    if(split === card.split) return;
    const affected = transactions.filter(t => t.card===card.last4 && !t.splitOverride).length;
    setConfirm({ last4:card.last4, name:card.name, split, affected, from:card.split });
  };
  const apply = () => { setCardSplit(confirm.last4, confirm.split); setConfirm(null); };

  return (
    <div>
      <PageHeader title="Settings" meta={`${cards.length} carte · ${transactions.length} movimenti`}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>

        <div style={{ fontSize:TY.h3, fontWeight:620, marginBottom:sp(2) }}>Carte</div>
        <div style={{ fontSize:TY.sm, color:T.fg3, marginBottom:sp(5), maxWidth:620, lineHeight:1.5 }}>
          Lo split è una proprietà della carta, applicato a ogni import. Cambiarlo ricalcola
          retroattivamente la tua quota su tutti i movimenti di quella carta (gli override su singole
          righe restano). Le carte nuove partono <b>personali</b> — mai assumere condivisa.
        </div>

        <Card style={{ padding:0, overflow:"hidden" }}>
          {cards.map((c,i)=>(
            <CardRow key={c.last4||i} card={c} last={i===cards.length-1} onChange={askChange}/>
          ))}
        </Card>

        {/* cashback / punti, separati — non è spesa, non divisibile */}
        {pts>0 && (
          <Card style={{ marginTop:sp(4), display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:TY.body, fontWeight:600 }}>Curve Cash · cashback</div>
              <div style={{ fontSize:TY.sm, color:T.fg3 }}>punti guadagnati — esclusi dai totali, non divisibili</div>
            </div>
            <div style={{ fontSize:TY.h3, fontWeight:680, color:T.brand }}>{pts} <span style={{ fontSize:TY.sm, color:T.fg3, fontWeight:400 }}>pt</span></div>
          </Card>
        )}
      </div>

      {/* modale conferma ricalcolo retroattivo */}
      <AnimatePresence>
        {confirm && <ConfirmModal info={confirm} onCancel={()=>setConfirm(null)} onApply={apply}/>}
      </AnimatePresence>
    </div>
  );
}

function CardRow({ card, last, onChange }){
  const label = card.split===0.5 ? "Condivisa 50/50" : card.split===0 ? "Non tua" : "Personale";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:sp(4),
      padding:`${sp(4)}px ${sp(5)}px`, borderBottom: last?"none":`1px solid ${T.border}` }}>
      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:sp(2) }}>
          <span style={{ fontSize:TY.body, fontWeight:600 }}>{card.name}</span>
          <span style={{ fontSize:TY.sm, color:T.fg3 }}>•• {card.last4||"—"}</span>
          {card.configured && <span title="split impostato a mano" style={{ width:6, height:6, borderRadius:"50%", background:T.brand }}/>}
        </div>
        <div style={{ fontSize:TY.micro, color:T.fg3, marginTop:2 }}>
          {card.count} movimenti · lordo {fmtEur(card.gross)} · quota tua {fmtEur(card.share)}
          {card.overrides>0 && ` · ${card.overrides} con split a mano`}
        </div>
      </div>
      <div style={{ display:"inline-flex", background:T.bg, borderRadius:T.r.md, padding:3, border:`1px solid ${T.border}`, flexShrink:0 }}>
        {SPLIT_OPTS.map(([v,short])=>(
          <button key={v} onClick={()=>onChange(card, v)}
            style={{ fontSize:TY.sm, fontWeight:550, padding:"6px 12px", borderRadius:T.r.sm, border:"none",
              cursor:"pointer", fontFamily:T.font,
              background: card.split===v ? T.surface : "transparent",
              color: card.split===v ? T.fg : T.fg2,
              boxShadow: card.split===v ? "0 1px 3px rgba(26,39,51,.08)" : "none" }}>{short}</button>
        ))}
      </div>
    </div>
  );
}

function ConfirmModal({ info, onCancel, onApply }){
  const reduce = useReducedMotion();
  const splitLabel = (s)=> s===0.5?"Condivisa 50/50":s===0?"Non tua (0%)":"Personale (100%)";
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:M.dur.base, ease:"linear" }}
      onClick={onCancel}
      style={{ position:"fixed", inset:0, background:"rgba(26,39,51,.45)", display:"flex",
        alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(2px)" }}>
      <motion.div onClick={e=>e.stopPropagation()}
        initial={reduce?{}:{ scale:0.96, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={reduce?{}:{ scale:0.98, opacity:0 }}
        transition={{ duration:M.dur.slow, ease:M.ease.out }}
        style={{ width:480, maxWidth:"90vw", background:T.surface, borderRadius:T.r.lg,
          boxShadow:EL.pop, padding:sp(6) }}>
        <div style={{ fontSize:TY.h3, fontWeight:650, marginBottom:sp(3) }}>Ricalcolo retroattivo</div>
        <div style={{ fontSize:TY.body, color:T.fg2, lineHeight:1.55, marginBottom:sp(4) }}>
          <b>{info.name} •• {info.last4}</b> passa da <b>{splitLabel(info.from)}</b> a <b>{splitLabel(info.split)}</b>.
          <br/>Questo ricalcola la tua quota su <b>{info.affected} movimenti</b> di questa carta — e con essa
          totali, categorie, andamenti e analisi. Gli eventuali split impostati a mano su singole righe restano.
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:sp(3) }}>
          <button onClick={onCancel} style={btnGhost}>Annulla</button>
          <button onClick={onApply} style={btnPrimary}>Applica</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const btnPrimary = { padding:"10px 18px", background:T.brand, color:T.onBrand, border:"none",
  borderRadius:T.r.md, fontSize:TY.body, fontWeight:600, cursor:"pointer", fontFamily:T.font };
const btnGhost = { padding:"10px 18px", background:"transparent", color:T.fg2, border:`1px solid ${T.border}`,
  borderRadius:T.r.md, fontSize:TY.body, fontWeight:600, cursor:"pointer", fontFamily:T.font };
