import React from "react";
import changelog from "../../design-tokens/changelog.json";

/* ============================================================
   Pagina Changelog dei design token.
   Legge design-tokens/changelog.json (generato da `npm run changelog`)
   e mostra le modifiche con swatch before/after.
   ============================================================ */

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const mono = "'SF Mono', ui-monospace, 'Cascadia Code', Consolas, monospace";

const isColor = (v) => typeof v === "string" && /^(#|rgba?\()/i.test(v);
const isRadius = (token) => token.startsWith("radius.");

// rappresentazione visiva di un singolo valore (swatch colore, box radius, barra spacing, o testo)
function ValueChip({ token, value, dim = false }) {
  if (isColor(value)) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
        <span style={{ width:26, height:26, borderRadius:6, background:value,
          border:"1px solid #C2CCD6", flexShrink:0, opacity: dim?0.55:1 }}/>
        <code style={{ fontFamily:mono, fontSize:12, color: dim?"#94A1AE":"#262E36",
          textDecoration: dim?"line-through":"none", textTransform:"uppercase" }}>{value}</code>
      </span>
    );
  }
  if (typeof value === "string" && value.endsWith("px") && isRadius(token)) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
        <span style={{ width:26, height:26, background:"#ECF7F6", border:"1.5px solid #1F8C84",
          borderRadius: parseInt(value, 10), flexShrink:0, opacity: dim?0.55:1 }}/>
        <code style={{ fontFamily:mono, fontSize:12, color: dim?"#94A1AE":"#262E36" }}>{value}</code>
      </span>
    );
  }
  // spacing o altro → barra/testo
  if (typeof value === "string" && value.endsWith("px")) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
        <span style={{ height:8, width: Math.min(parseInt(value,10), 80), background:"#1F8C84",
          borderRadius:2, opacity: dim?0.55:1 }}/>
        <code style={{ fontFamily:mono, fontSize:12, color: dim?"#94A1AE":"#262E36" }}>{value}</code>
      </span>
    );
  }
  return <code style={{ fontFamily:mono, fontSize:12 }}>{String(value)}</code>;
}

const Badge = ({ n, label, color }) => n > 0 ? (
  <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600,
    color, background:`${color}1A`, borderRadius:999, padding:"3px 10px" }}>
    {n} {label}
  </span>
) : null;

function ChangedRow({ c }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 0",
      borderBottom:"1px solid #ECF1F5" }}>
      <code style={{ fontFamily:mono, fontSize:12.5, fontWeight:600, width:300, flexShrink:0, wordBreak:"break-all" }}>{c.token}</code>
      <ValueChip token={c.token} value={c.from} dim />
      <span style={{ color:"#94A1AE", fontSize:16 }}>→</span>
      <ValueChip token={c.token} value={c.to} />
    </div>
  );
}

function SimpleRow({ token, value, kind }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 0", borderBottom:"1px solid #ECF1F5" }}>
      <code style={{ fontFamily:mono, fontSize:12.5, fontWeight:600, width:300, flexShrink:0, wordBreak:"break-all" }}>{token}</code>
      <ValueChip token={token} value={value} dim={kind==="removed"} />
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <>
      <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase",
        color, margin:"18px 0 4px" }}>{title}</div>
      {children}
    </>
  );
}

function Entry({ e }) {
  return (
    <div style={{ background:"#FFFFFF", border:"1px solid #DCE3EB", borderRadius:12, padding:24, marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <h2 style={{ fontSize:18, fontWeight:650, margin:0 }}>{e.date}{e.baseline ? " · baseline" : ""}</h2>
        <Badge n={e.summary.changed} label="modificati" color="#9A6B12" />
        <Badge n={e.summary.added} label="aggiunti" color="#2F8F4E" />
        <Badge n={e.summary.removed} label="rimossi" color="#B3261E" />
      </div>
      {e.changed.length > 0 && (
        <Section title="Modificati · before → after" color="#9A6B12">
          {e.changed.map(c => <ChangedRow key={c.token} c={c} />)}
        </Section>
      )}
      {e.added.length > 0 && !e.baseline && (
        <Section title="Aggiunti" color="#2F8F4E">
          {e.added.map(a => <SimpleRow key={a.token} token={a.token} value={a.value} kind="added" />)}
        </Section>
      )}
      {e.baseline && (
        <div style={{ fontSize:13, color:"#6B7884", marginTop:8 }}>
          {e.added.length} token tracciati da questo punto in poi.
        </div>
      )}
      {e.removed.length > 0 && (
        <Section title="Rimossi" color="#B3261E">
          {e.removed.map(r => <SimpleRow key={r.token} token={r.token} value={r.value} kind="removed" />)}
        </Section>
      )}
    </div>
  );
}

export const Changelog = () => {
  const entries = changelog.entries || [];
  return (
    <div style={{ fontFamily:font, color:"#262E36", padding:32, background:"#F6F8FA", minHeight:"100vh" }}>
      <h1 style={{ fontSize:28, fontWeight:650, letterSpacing:"-0.02em", margin:"0 0 4px" }}>Changelog dei token</h1>
      <p style={{ fontSize:14, color:"#6B7884", margin:"0 0 24px" }}>
        Modifiche ai design token a ogni sync da Figma · generato da <code style={{ fontFamily:mono }}>npm run changelog</code>
      </p>
      {entries.length === 0 ? (
        <div style={{ background:"#FFFFFF", border:"1px solid #DCE3EB", borderRadius:12, padding:32, textAlign:"center", color:"#6B7884" }}>
          Nessuna modifica registrata. Esegui <code style={{ fontFamily:mono }}>npm run changelog</code> dopo un sync da Figma.
        </div>
      ) : entries.map((e, i) => <Entry key={i} e={e} />)}
    </div>
  );
};

export default {
  title: "Design Tokens/Changelog",
  parameters: { layout: "fullscreen" },
};
