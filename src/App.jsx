import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T, M, sp, Sidebar } from "./tokens.jsx";
import { StoreProvider, useStore } from "./store.jsx";
import OverviewScreen from "./Overview.jsx";
import Spending from "./Spending.jsx";
import Categories from "./Categories.jsx";
import Analytics from "./Analytics.jsx";
import Import from "./Import.jsx";
import Income from "./Income.jsx";
import Settings from "./Settings.jsx";

/* ============================================================
   GESTY — Shell (data-driven)
   L'app parte VUOTA. Gating data-driven (Dev Notes · Import):
   - pre-import: solo Overview + Import attivi
   - dopo il primo import: si attivano Spending · Analytics · Categories
   Income/Investments/Settings restano gated (non ancora in codice).
   ============================================================ */

const SCREENS = {
  overview:   OverviewScreen,
  spending:   Spending,
  categories: Categories,
  analytics:  Analytics,
  import:     Import,
  income:     Income,
  settings:   Settings,
};

const BUILT = ["overview","spending","analytics","categories","income","import","settings"];

function Shell(){
  const { isEmpty } = useStore();
  const [screen,setScreen] = useState("overview");
  const [deepLink,setDeepLink] = useState(null);

  // gating data-driven: vuoto → solo overview+import; con dati → tutte le costruite
  const enabled = new Set(isEmpty ? ["overview","import"] : BUILT);

  const navigate = (id, params=null) => {
    if(!enabled.has(id)) return;
    setScreen(id);
    setDeepLink(params);
  };

  // se sei su una schermata che il gating disattiva (es. dopo un reset), torna a overview
  const current = enabled.has(screen) ? screen : "overview";
  const Screen = SCREENS[current];

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg, fontFamily:T.font, color:T.fg, WebkitFontSmoothing:"antialiased" }}>
      <Sidebar active={current} enabled={enabled} onNavigate={navigate}
        flowLabel={isEmpty ? "importa un CSV per attivare" : "non ancora in codice"}/>
      {/* area contenuto: scroll proprio, indipendente dalla sidebar fissa */}
      <div style={{ flex:1, minWidth:0, height:"100vh", overflowY:"auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:M.dur.base, ease:M.ease.out }}>
            <Screen onNavigate={navigate} deepLink={deepLink}/>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <StoreProvider>
      <Shell/>
    </StoreProvider>
  );
}
