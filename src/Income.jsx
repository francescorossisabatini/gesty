import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T, M, sp, TY, Card, PageHeader } from "./tokens.jsx";
import { fmtEur, parseAmount } from "./csv.js";
import { useStore, monthsPresent, incomeForMonth, netBalance, totalShare } from "./store.jsx";

/* ============================================================
   GESTY — Income (64:1200) · entrate manuali
   L'entrata è SEMPRE 100% tua — nessuna carta, nessuno split,
   nessun lordo, nessun badge ½ (data contract). Saldo netto =
   entrate − quota tua di spesa. Descrittivo, mai un verdetto.
   ============================================================ */

const MN = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const monthLabel = (k)=>{ if(!k) return ""; const [y,m]=k.split("-"); return `${MN[+m-1]} ${y}`; };
const thisMonth = ()=> new Date().toISOString().slice(0,7);

export default function Income({ onNavigate }){
  const { transactions, incomes, addIncome, updateIncome, deleteIncome } = useStore();
  const months = monthsPresent(transactions);
  const month = months[0] || thisMonth();
  const [form,setForm] = useState(null); // null | {} (nuova) | {id,...} (modifica)

  const inc = incomeForMonth(incomes, month);
  const spend = totalShare(transactions, month);
  const net = inc - spend;

  const recurring = incomes.filter(i=>i.recurring);
  const oneOff = incomes.filter(i=>!i.recurring).sort((a,b)=> (b.month||"").localeCompare(a.month||""));

  return (
    <div>
      <PageHeader title="Income" meta={`${monthLabel(month)}`}
        right={<button onClick={()=>setForm({})} style={btnPrimary}>+ Aggiungi entrata</button>}/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>

        {/* Saldo netto del mese */}
        <NetBalanceCard income={inc} spend={spend} net={net} month={month} hasIncome={incomes.length>0}/>

        {/* Form aggiunta/modifica */}
        <AnimatePresence>
          {form && <IncomeForm initial={form} months={months} month={month}
            onSave={(data)=>{ form.id ? updateIncome(form.id, data) : addIncome(data); setForm(null); }}
            onCancel={()=>setForm(null)}/>}
        </AnimatePresence>

        {/* Liste */}
        {incomes.length===0 && !form && (
          <Card style={{ textAlign:"center", padding:sp(8), marginTop:sp(5) }}>
            <div style={{ fontSize:TY.h3, fontWeight:620, marginBottom:sp(2) }}>Nessuna entrata</div>
            <div style={{ fontSize:TY.body, color:T.fg2, marginBottom:sp(5) }}>
              Le entrate non sono nel CSV di Curve: aggiungile a mano. Sono sempre 100% tue.
            </div>
            <button onClick={()=>setForm({})} style={btnPrimary}>+ Aggiungi entrata</button>
          </Card>
        )}

        {recurring.length>0 && (
          <Section title="Ricorrenti" sub="contano ogni mese">
            {recurring.map(i=> <IncomeRow key={i.id} inc={i} onEdit={()=>setForm(i)} onDelete={()=>deleteIncome(i.id)}/>)}
          </Section>
        )}
        {oneOff.length>0 && (
          <Section title="Una tantum" sub="contano solo nel loro mese">
            {oneOff.map(i=> <IncomeRow key={i.id} inc={i} showMonth onEdit={()=>setForm(i)} onDelete={()=>deleteIncome(i.id)}/>)}
          </Section>
        )}
      </div>
    </div>
  );
}

function NetBalanceCard({ income, spend, net, month, hasIncome }){
  // negativo resta NEUTRO, mai rosso (data contract: Net Balance non è un budget)
  const positive = net >= 0;
  return (
    <Card style={{ marginBottom:sp(5) }}>
      <div style={{ fontSize:TY.sm, color:T.fg3, marginBottom:sp(2) }}>Saldo netto · {monthLabel(month)}</div>
      {hasIncome ? <>
        <div style={{ fontSize:TY.display, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1,
          color: positive ? T.success : T.fg }}>
          {net>=0?"+":"−"}{fmtEur(Math.abs(net))}
        </div>
        <div style={{ fontSize:TY.body, color:T.fg2, marginTop:sp(3) }}>
          Entrate {fmtEur(income)} <span style={{ color:T.fg3 }}>(100% tue)</span> − quota tua di spesa {fmtEur(spend)}
        </div>
        {net<0 && <div style={{ fontSize:TY.sm, color:T.fg3, marginTop:sp(2) }}>
          Hai speso più di quanto registrato in entrata questo mese. È una descrizione, non un giudizio.
        </div>}
      </> : (
        <div style={{ fontSize:TY.body, color:T.fg3, marginTop:sp(2) }}>
          Aggiungi un'entrata per vedere il saldo netto (entrate − quota tua di spesa: {fmtEur(spend)} spesi finora).
        </div>
      )}
    </Card>
  );
}

function IncomeForm({ initial, months, month, onSave, onCancel }){
  const reduce = useReducedMotion();
  const [recurring,setRecurring] = useState(initial.recurring ?? true);
  const [label,setLabel] = useState(initial.label || "");
  const [amount,setAmount] = useState(initial.amount!=null ? String(initial.amount).replace(".",",") : "");
  const [m,setM] = useState(initial.month || month || thisMonth());
  const amt = parseAmount(amount);
  const valid = label.trim() && !isNaN(amt) && amt>0;

  const save = ()=> valid && onSave({ label:label.trim(), amount:Math.round(amt*100)/100, recurring, month: recurring?undefined:m });

  return (
    <motion.div initial={reduce?{}:{ opacity:0, height:0 }} animate={reduce?{}:{ opacity:1, height:"auto" }} exit={reduce?{}:{ opacity:0, height:0 }}
      transition={{ duration:M.dur.base, ease:M.ease.out }} style={{ overflow:"hidden" }}>
      <Card style={{ marginBottom:sp(5) }}>
        <div style={{ fontSize:TY.h3, fontWeight:620, marginBottom:sp(4) }}>{initial.id?"Modifica entrata":"Nuova entrata"}</div>

        {/* tipo: ricorrente / una tantum (due opzioni, no carta/split — è 100% tua) */}
        <div style={{ display:"flex", gap:sp(3), marginBottom:sp(4) }}>
          {[[true,"Ricorrente","ogni mese (stipendio, affitto incassato…)"],[false,"Una tantum","solo in un mese (bonus, rimborso…)"]].map(([v,t,d])=>(
            <button key={String(v)} onClick={()=>setRecurring(v)}
              style={{ flex:1, textAlign:"left", padding:sp(4), borderRadius:T.r.md, cursor:"pointer", fontFamily:T.font,
                border:`1.5px solid ${recurring===v?T.brand:T.border}`, background: recurring===v?T.brandSubtle:T.surface }}>
              <div style={{ fontSize:TY.body, fontWeight:650, color: recurring===v?T.brand:T.fg }}>{t}</div>
              <div style={{ fontSize:TY.micro, color:T.fg3, marginTop:2 }}>{d}</div>
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:sp(4), flexWrap:"wrap", marginBottom:sp(5) }}>
          <Field label="Descrizione" wide>
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="es. Stipendio" style={inputStyle}/>
          </Field>
          <Field label="Importo (€)">
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1.900,00" inputMode="decimal" style={{ ...inputStyle, width:140 }}/>
          </Field>
          {!recurring && (
            <Field label="Mese">
              <input type="month" value={m} onChange={e=>setM(e.target.value)} style={{ ...inputStyle, width:170 }}/>
            </Field>
          )}
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:sp(3) }}>
          <button onClick={onCancel} style={btnGhost}>Annulla</button>
          <button onClick={save} disabled={!valid} style={{ ...btnPrimary, opacity:valid?1:0.5, cursor:valid?"pointer":"not-allowed" }}>
            {initial.id?"Salva":"Aggiungi"}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

function IncomeRow({ inc, showMonth, onEdit, onDelete }){
  const reduce = useReducedMotion();
  const [confirm,setConfirm] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:sp(4),
      padding:`${sp(3)}px ${sp(4)}px`, borderBottom:`1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize:TY.body, fontWeight:600 }}>{inc.label}</div>
        {showMonth && <div style={{ fontSize:TY.micro, color:T.fg3 }}>{monthLabel(inc.month)}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:sp(4) }}>
        <span style={{ fontSize:TY.h3, fontWeight:680, color:T.success }}>+{fmtEur(inc.amount)}</span>
        {!confirm ? (
          <div style={{ display:"flex", gap:6 }}>
            <IconBtn onClick={onEdit} title="Modifica">
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 13l9-9 3 3-9 9H4z"/></svg>
            </IconBtn>
            <IconBtn onClick={()=>setConfirm(true)} title="Elimina">
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9h5.6l.7-9"/></svg>
            </IconBtn>
          </div>
        ) : (
          <motion.div initial={reduce?{}:{ opacity:0 }} animate={{ opacity:1 }} style={{ display:"flex", gap:6 }}>
            <button onClick={onDelete} style={{ padding:"5px 10px", borderRadius:T.r.sm, border:"none", background:T.warning, color:T.onBrand, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>Elimina</button>
            <button onClick={()=>setConfirm(false)} style={{ padding:"5px 10px", borderRadius:T.r.sm, border:`1px solid ${T.border}`, background:"transparent", color:T.fg2, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>No</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Section({ title, sub, children }){
  return (
    <div style={{ marginTop:sp(5) }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:sp(2), marginBottom:sp(3) }}>
        <span style={{ fontSize:TY.h3, fontWeight:620 }}>{title}</span>
        <span style={{ fontSize:TY.sm, color:T.fg3 }}>{sub}</span>
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>{children}</Card>
    </div>
  );
}

function Field({ label, children, wide }){
  return (
    <div style={{ flex: wide?1:undefined, minWidth: wide?220:undefined }}>
      <div style={{ fontSize:TY.micro, fontWeight:600, color:T.fg3, marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

function IconBtn({ children, onClick, title }){
  return (
    <button onClick={onClick} title={title}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", width:30, height:30,
        borderRadius:T.r.sm, border:`1px solid ${T.border}`, background:"transparent", color:T.fg3, cursor:"pointer" }}>
      {children}
    </button>
  );
}

const inputStyle = { padding:"9px 12px", border:`1px solid ${T.border}`, borderRadius:T.r.md,
  fontSize:TY.body, fontFamily:T.font, color:T.fg, outline:"none", width:"100%", boxSizing:"border-box" };
const btnPrimary = { padding:"9px 16px", background:T.brand, color:T.onBrand, border:"none",
  borderRadius:T.r.md, fontSize:TY.body, fontWeight:600, cursor:"pointer", fontFamily:T.font };
const btnGhost = { padding:"9px 16px", background:"transparent", color:T.fg2, border:`1px solid ${T.border}`,
  borderRadius:T.r.md, fontSize:TY.body, fontWeight:600, cursor:"pointer", fontFamily:T.font };
