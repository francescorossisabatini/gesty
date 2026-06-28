import React, { useState } from "react";
import { Sidebar, T } from "../tokens.jsx";

/* Sidebar — navigazione gated. `enabled` (Set di id) decide cosa è attivo. */

export default {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
};

const Frame = ({ children }) => (
  <div style={{ height:560, display:"flex", fontFamily:T.font, background:T.bg, overflow:"hidden" }}>
    {children}
    <div style={{ flex:1, padding:32, color:T.fg3, fontSize:14 }}>area contenuto</div>
  </div>
);

// tutte le voci attive (post-import)
export const AllActive = {
  render: () => {
    const [active, setActive] = useState("overview");
    const enabled = new Set(["overview","spending","analytics","categories","income","investments","import","settings"]);
    return (
      <Frame>
        <Sidebar active={active} enabled={enabled} onNavigate={setActive} flowLabel="demo" />
      </Frame>
    );
  },
};

// stato gated pre-import: solo Overview + Import attivi
export const GatedEmpty = {
  render: () => {
    const [active, setActive] = useState("overview");
    const enabled = new Set(["overview","import"]);
    return (
      <Frame>
        <Sidebar active={active} enabled={enabled} onNavigate={setActive}
          flowLabel="importa un CSV per attivare" />
      </Frame>
    );
  },
};
