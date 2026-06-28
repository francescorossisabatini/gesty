/* ============================================================
   GESTY — Persistenza locale (astratta)
   Oggi: localStorage (sincrono, funziona in browser e in WebView2/Tauri).
   Domani: stesso contratto su SQLite nativo (tauri-plugin-sql) senza
   toccare lo store o la UI. I dati NON lasciano mai la macchina.
   ============================================================ */

const KEY = "gesty.v1";

// forma serializzata: { transactions, points, imports, merchantCategories }
export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const data = JSON.parse(raw);
    // re-idrata le date degli import (salvate come stringa ISO)
    if(Array.isArray(data.imports)){
      data.imports = data.imports.map(im => ({ ...im, when: new Date(im.when) }));
    }
    return data;
  }catch(e){
    console.warn("[gesty] stato corrotto, riparto vuoto:", e);
    return null;
  }
}

export function saveState(state){
  try{
    localStorage.setItem(KEY, JSON.stringify({
      transactions: state.transactions,
      points: state.points,
      imports: state.imports,
      merchantCategories: state.merchantCategories || {},
      cardSplits: state.cardSplits || {},
      incomes: state.incomes || [],
    }));
  }catch(e){
    console.error("[gesty] salvataggio fallito:", e);
  }
}

export function clearState(){
  try{ localStorage.removeItem(KEY); }catch(e){}
}

// dove vivono i dati (per mostrarlo all'utente — trasparenza)
export function storageLabel(){
  return "salvati su questo dispositivo (localStorage)";
}
