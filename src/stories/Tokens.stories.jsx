import React from "react";
import tokens from "../../design-tokens/tokens.json";
import guidelines from "../../design-tokens/guidelines.json";

/* ============================================================
   Storie che mostrano i DESIGN TOKEN di Gesty visivamente.
   Fonte: design-tokens/tokens.json (letti dalle variabili Figma)
   + descrizioni da design-tokens/guidelines.json.
   ============================================================ */

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const mono = "'SF Mono', ui-monospace, 'Cascadia Code', Consolas, monospace";

const Wrap = ({ title, sub, children }) => (
  <div style={{ fontFamily:font, color:"#262E36", padding:32, background:"#F6F8FA", minHeight:"100vh" }}>
    <h1 style={{ fontSize:28, fontWeight:650, letterSpacing:"-0.02em", margin:"0 0 4px" }}>{title}</h1>
    <p style={{ fontSize:14, color:"#6B7884", margin:"0 0 28px" }}>{sub}</p>
    {children}
  </div>
);

const GroupTitle = ({ children }) => (
  <h2 style={{ fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
    color:"#1F8C84", margin:"28px 0 12px" }}>{children}</h2>
);

/* ---------------- Colori ---------------- */
function ColorSwatch({ cssVar, value, desc }){
  // bordo per i colori chiari, così sono visibili su sfondo chiaro
  const light = isLight(value);
  return (
    <div style={{ background:"#FFFFFF", border:"1px solid #DCE3EB", borderRadius:10, overflow:"hidden",
      display:"flex", flexDirection:"column" }}>
      <div style={{ height:64, background:value, borderBottom: light ? "1px solid #DCE3EB" : "none" }}/>
      <div style={{ padding:"10px 12px 12px" }}>
        {/* nome-variabile completo (CSS custom property) + valore hex */}
        <div style={{ fontFamily:mono, fontSize:11.5, fontWeight:600, wordBreak:"break-all" }}>{cssVar}</div>
        <div style={{ fontFamily:mono, fontSize:12, color:"#6B7884", marginTop:2, textTransform:"uppercase" }}>{value}</div>
        {desc && <div style={{ fontSize:11.5, color:"#4F5B66", marginTop:8, lineHeight:1.45 }}>{desc}</div>}
      </div>
    </div>
  );
}

function ColorGroup({ group, entries }){
  return (
    <>
      <GroupTitle>{group}</GroupTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:14 }}>
        {entries.map(e => <ColorSwatch key={e.path} {...e}/>)}
      </div>
    </>
  );
}

function flattenColors(){
  const groups = {};
  for(const group in tokens.color){
    groups[group] = Object.entries(tokens.color[group]).map(([name, tok])=>{
      const path = `color.${group}.${name}`;
      return { path, name, cssVar:`--color-${group}-${name}`, value: tok.value, desc: guidelines[path] };
    });
  }
  return groups;
}

export const Colors = () => {
  const groups = flattenColors();
  const total = Object.values(groups).reduce((n,g)=>n+g.length,0);
  return (
    <Wrap title="Colori" sub={`${total} token colore dalle variabili Figma · ogni swatch con valore e descrizione d'uso`}>
      {Object.entries(groups).map(([group, entries]) => (
        <ColorGroup key={group} group={group} entries={entries}/>
      ))}
    </Wrap>
  );
};

/* ---------------- Spacing ---------------- */
export const Spacing = () => {
  const entries = Object.entries(tokens.spacing)
    .map(([name, t]) => ({ name, value:t.value, px:parseInt(t.value,10), desc:guidelines[`spacing.${name}`] }))
    .sort((a,b)=>a.px-b.px);
  return (
    <Wrap title="Spacing" sub={`${entries.length} token di spaziatura · la barra mostra la dimensione reale`}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {entries.map(e => (
          <div key={e.name} style={{ display:"flex", alignItems:"center", gap:20, background:"#FFFFFF",
            border:"1px solid #DCE3EB", borderRadius:10, padding:"14px 18px" }}>
            <div style={{ width:170, flexShrink:0 }}>
              <div style={{ fontFamily:mono, fontSize:13, fontWeight:600 }}>{e.name}</div>
              <div style={{ fontFamily:mono, fontSize:12, color:"#6B7884" }}>{e.value}</div>
            </div>
            <div style={{ height:18, width:e.px, background:"#1F8C84", borderRadius:3, flexShrink:0 }}/>
            <div style={{ fontSize:12.5, color:"#4F5B66", lineHeight:1.45 }}>{e.desc}</div>
          </div>
        ))}
      </div>
    </Wrap>
  );
};

/* ---------------- Radius ---------------- */
export const Radius = () => {
  const entries = Object.entries(tokens.radius)
    .map(([name, t]) => ({ name, value:t.value, px:parseInt(t.value,10), desc:guidelines[`radius.${name}`] }))
    .sort((a,b)=>a.px-b.px);
  return (
    <Wrap title="Radius" sub={`${entries.length} token di arrotondamento · il riquadro mostra il raggio reale`}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
        {entries.map(e => (
          <div key={e.name} style={{ background:"#FFFFFF", border:"1px solid #DCE3EB", borderRadius:10, padding:16 }}>
            <div style={{ height:80, background:"#ECF7F6", border:"1.5px solid #1F8C84",
              borderRadius: e.px }}/>
            <div style={{ fontFamily:mono, fontSize:13, fontWeight:600, marginTop:12 }}>{e.name}</div>
            <div style={{ fontFamily:mono, fontSize:12, color:"#6B7884" }}>{e.value}</div>
            {e.desc && <div style={{ fontSize:12, color:"#4F5B66", marginTop:6, lineHeight:1.45 }}>{e.desc}</div>}
          </div>
        ))}
      </div>
    </Wrap>
  );
};

// luminanza per decidere se un colore ha bisogno del bordo
function isLight(hex){
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if(!m) return false;
  const [r,g,b] = [1,2,3].map(i=>parseInt(m[i],16));
  return (0.2126*r + 0.7152*g + 0.0722*b) > 225;
}

export default {
  title: "Design Tokens",
  parameters: { layout: "fullscreen" },
};
