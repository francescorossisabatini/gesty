import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import figma from "../design-tokens/tokens.json";

/* ============================================================
   GESTY — Token condivisi + Sidebar + icone
   T è DERIVATO dai token Figma (design-tokens/tokens.json): un sync
   da Figma (npm run sync nel pacchetto design-tokens) rigenera il JSON
   e l'app si aggiorna a caldo. NON inventare colori: usa solo T.
   ============================================================ */

const c = figma.color, rad = figma.radius;
const px = (v) => parseInt(v, 10);

export const T = {
  bg: c.background.page.value,
  surface: c.background.card.value,
  fg: c.foreground.primary.value,
  fg2: c.foreground.secondary.value,
  fg3: c.foreground.tertiary.value,
  fgDis: c.foreground.disabled.value,
  onBrand: c.foreground["on-brand"].value,
  border: c.border.subtle.value,
  borderHover: c.border.default.value,
  focus: c.border.focus.value,
  brand: c.accent.brand.value,
  brandSubtle: c.background["brand-subtle"].value,
  estimate: c.accent.estimate.value,
  warning: c.accent.warning.value,
  warningSubtle: c.background["warning-subtle"].value,
  success: c.accent.success.value,
  successSubtle: c.background["success-subtle"].value,
  cat: {
    dining: c.accent["category-dining"].value,
    groceries: c.accent["category-groceries"].value,
    transport: c.accent["category-transport"].value,
    subscriptions: c.accent["category-subscriptions"].value,
    shopping: c.accent["category-shopping"].value,
    health: c.accent["category-health"].value,
    housing: c.accent["category-housing"].value,
    other: c.accent["category-other"].value,
  },
  r: { sm: px(rad.small.value), md: px(rad.medium.value), lg: px(rad.large.value), pill: px(rad.pill.value) },
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// motion tokens (08-motion-spec.md)
export const M = {
  dur:{ instant:.1, fast:.15, base:.2, moderate:.26, slow:.4 },
  ease:{ out:[0.4,0,0.2,1], in:[0.4,0,1,1], decelerate:[0.22,0.8,0.2,1] },
};

export const sp=(n)=>({1:4,2:8,3:12,4:16,5:20,6:24,8:32,10:40}[n]||n);

// scala elevazione (una sola fonte; hover sale di un livello)
export const EL = {
  sm:  "0 1px 2px rgba(26,39,51,.06)",
  md:  "0 2px 8px rgba(26,39,51,.08)",
  lg:  "0 6px 20px rgba(26,39,51,.10)",
  pop: "0 12px 32px rgba(26,39,51,.16)",   // menu/popover: profondità maggiore
};

// scala tipografica (Minor Third 1.2). Headings + dati; il resto sono ruoli UI.
export const TY = {
  display: 48,   // cifre-vetrina (hero, totale categoria)
  h1: 30,        // titolo di pagina
  h2: 22,        // metriche / valori
  h3: 17,        // titolo sezione
  body: 14,      // testo corrente
  sm: 13,        // supporto
  micro: 12,     // didascalie
  label: 11,     // kicker/etichette maiuscole (+letter-spacing)
};

// label italiane categoria (allineate a Filter Chip / Category Badge s.16)
export const CAT_LABEL = {
  groceries:"Spesa", dining:"Ristoranti", transport:"Trasporti", subscriptions:"Abbonamenti",
  shopping:"Acquisti", health:"Salute", housing:"Casa", other:"Altro",
};

export const NavIco = {
  layout:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg>,
  receipt:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M5 3h10v14l-2.5-1.5L10 17l-2.5-1.5L5 17z"/><path d="M8 7h4M8 10h4"/></svg>,
  donut:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2.5"/><path d="M10 3v4.5"/></svg>,
  tag:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M4 4h6l6 6-6 6-6-6z"/><circle cx="7.5" cy="7.5" r="1"/></svg>,
  coin:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="10" cy="10" r="7"/><path d="M10 6v8M7.8 8.3h3a1.7 1.7 0 010 3.4H7.6"/></svg>,
  trending:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 14l4-4 3 3 6-7"/><path d="M13 3h3v3"/></svg>,
  upload:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M10 3v9M6.5 6.5L10 3l3.5 3.5M4 15h12"/></svg>,
  settings:(p)=><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4"/></svg>,
  search:(p)=><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="9" cy="9" r="6"/><path d="M14 14l3 3"/></svg>,
  calendar:(p)=><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v3M13 2v3"/></svg>,
  chevron:(p)=><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M5 8l5 5 5-5"/></svg>,
  arrowUpRight:(p)=><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 14L14 6M7 6h7v7"/></svg>,
};

// icone categoria (badge)
export const CatIco = {
  groceries:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="7" cy="17" r="1"/><circle cx="14" cy="17" r="1"/><path d="M2 3h2l2 10h9l2-7H5"/></svg>,
  dining:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M5 2v6a2 2 0 002 2v8M5 2v4M7 2v4M14 2c-1.5 0-2 2-2 4s.5 3 2 3v9"/></svg>,
  transport:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="4" y="3" width="12" height="11" rx="2"/><path d="M4 10h12M7 17l1-3M13 17l-1-3"/><circle cx="7.5" cy="11.5" r=".6"/><circle cx="12.5" cy="11.5" r=".6"/></svg>,
  subscriptions:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M4 8a6 6 0 0110-3l2 2M16 12a6 6 0 01-10 3l-2-2M16 3v4h-4M4 17v-4h4"/></svg>,
  shopping:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M5 6h10l-1 11H6zM7 6a3 3 0 016 0"/></svg>,
  health:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M2 10h4l2-5 3 10 2-5h5"/></svg>,
  housing:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 9l7-6 7 6M5 8v9h10V8"/></svg>,
  other:(p)=><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="5" cy="10" r="1.3"/><circle cx="10" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/></svg>,
};

// le voci della sidebar (id, label, icona)
export const NAV_ITEMS = [
  ["overview","Overview","layout"],["spending","Spending","receipt"],
  ["analytics","Analytics","donut"],["categories","Categories","tag"],
  ["income","Income","coin"],["investments","Investments","trending"],
  ["import","Import","upload"],
];

/* Sidebar riusabile.
   - active: id schermata corrente
   - enabled: Set di id navigabili (gating del flusso)
   - onNavigate: (id) => void
   - flowLabel: testo tooltip per le voci disattivate */
export function Sidebar({ active, enabled, onNavigate, flowLabel }){
  const isOn = (id) => enabled.has(id);
  const Item = ({ id, label, ico, isSettings }) => {
    const Icon = NavIco[ico];
    const on = isOn(id);
    const cur = active === id;
    return (
      <button key={id} type="button"
        onClick={on ? ()=>onNavigate(id) : undefined}
        aria-disabled={!on}
        aria-current={cur ? "page" : undefined}
        title={on ? "" : `Non in questo flusso (${flowLabel})`}
        style={{ display:"flex", alignItems:"center", gap:sp(3), padding:`10px ${sp(3)}px`,
          borderRadius:T.r.md, cursor:on?"pointer":"not-allowed",
          background: cur ? `${T.brand}14` : "transparent",
          color: on ? (cur?T.brand:T.fg2) : T.fgDis,
          fontWeight: cur?600:500, fontSize:14, opacity:on?1:0.55,
          border:"none", width:"100%", textAlign:"left", fontFamily:T.font,
          transition:"background .15s, color .15s" }}>
        <span style={{ color: on ? (cur?T.brand:T.fg3) : T.fgDis, display:"flex" }}><Icon/></span>{label}
      </button>
    );
  };
  return (
    <aside style={{ width:256, flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`,
      padding:`${sp(5)}px ${sp(4)}px`, display:"flex", flexDirection:"column", gap:4,
      height:"100vh", position:"sticky", top:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:`${sp(2)}px ${sp(3)}px`, marginBottom:sp(4) }}>
        <div style={{ width:24, height:24, borderRadius:T.r.sm, background:T.brand, color:T.onBrand,
          display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15 }}>G</div>
        <span style={{ fontWeight:700, fontSize:18, letterSpacing:"-0.01em" }}>esty</span>
      </div>
      {NAV_ITEMS.map(([id,label,ico])=> <Item key={id} id={id} label={label} ico={ico}/>)}
      <div style={{ flex:1 }}/>
      <div style={{ height:1, background:T.border, margin:`${sp(2)}px 0` }}/>
      <Item id="settings" label="Settings" ico="settings" isSettings/>
    </aside>
  );
}

// Card con hover translateY -2px + shadow (motion spec #24)
export function Card({ children, style, hoverable=false, onClick }){
  const reduce = useReducedMotion();
  const base = { background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:T.r.lg, padding:sp(6), ...style };
  if (!hoverable && !onClick) return <div style={base} onClick={onClick}>{children}</div>;
  return (
    <motion.div onClick={onClick}
      whileHover={reduce ? {} : { y:-2, boxShadow:EL.lg, borderColor:T.borderHover }}
      transition={{ duration:M.dur.base, ease:M.ease.out }}
      style={base}>
      {children}
    </motion.div>
  );
}

/* Header di pagina condiviso — un solo pattern per tutte le schermate.
   title a sinistra; meta (testo freschezza) e right (controlli) a destra.
   Diventa sticky in cima all'area di scroll, con sottile separazione su scroll. */
export function PageHeader({ title, meta, right }){
  return (
    <header style={{ position:"sticky", top:0, zIndex:20,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:`${sp(5)}px ${sp(8)}px`, marginBottom:sp(2),
      background:`${T.bg}E6`, backdropFilter:"blur(8px)",
      borderBottom:`1px solid ${T.border}` }}>
      <h1 style={{ fontSize:TY.h1, fontWeight:650, letterSpacing:"-0.02em", margin:0 }}>{title}</h1>
      <div style={{ display:"flex", alignItems:"center", gap:sp(4) }}>
        {meta && <span style={{ fontSize:TY.sm, color:T.fg3 }}>{meta}</span>}
        {right}
      </div>
    </header>
  );
}

// Empty state (nessun dato importato) — pattern "Overview / Empty" (49:1197)
export function EmptyState({ title, body, onImport }){
  const reduce = useReducedMotion();
  return (
    <div style={{ display:"flex", justifyContent:"center", paddingTop:sp(10) }}>
      <div style={{ maxWidth:440, textAlign:"center", background:T.surface,
        border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:sp(8) }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:T.brandSubtle, color:T.brand,
          display:"flex", alignItems:"center", justifyContent:"center", margin:`0 auto ${sp(4)}px` }}>
          <NavIco.upload/>
        </div>
        <div style={{ fontSize:18, fontWeight:650, marginBottom:sp(2) }}>{title}</div>
        <div style={{ fontSize:14, color:T.fg2, lineHeight:1.5, marginBottom:sp(5) }}>{body}</div>
        <motion.button onClick={onImport}
          whileHover={reduce?{}:{ y:-1, boxShadow:"0 4px 14px rgba(31,138,112,.25)" }}
          whileTap={reduce?{}:{ scale:0.98 }}
          transition={{ duration:M.dur.fast, ease:M.ease.out }}
          style={{ padding:`10px ${sp(5)}px`, background:T.brand, color:T.onBrand, border:"none",
            borderRadius:T.r.md, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>
          Vai a Import
        </motion.button>
      </div>
    </div>
  );
}

// Category badge (icona + label, mai colore da solo — principio 5)
export function CategoryBadge({ cat }){
  const Icon = CatIco[cat] || CatIco.other;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 9px 3px 7px",
      borderRadius:T.r.pill, background:`${T.cat[cat]}14`, color:T.cat[cat],
      fontSize:12.5, fontWeight:600, whiteSpace:"nowrap" }}>
      <Icon/>{CAT_LABEL[cat]}
    </span>
  );
}
