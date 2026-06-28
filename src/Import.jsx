import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T, M, sp, NavIco, CategoryBadge, Card, PageHeader } from "./tokens.jsx";
import { parseCurveCsv, fmtEur, fmtDate } from "./csv.js";
import { analyzeCsv, parseGeneric, MAP_FIELDS } from "./import-generic.js";
import { useStore } from "./store.jsx";
import { storageLabel } from "./persist.js";

/* ============================================================
   GESTY — Import / Preview (53:1320) + Dev Notes · Import (123:3660)
   State machine: empty → parsing → preview/confirm → done → error
   Merge SOLO su "Conferma e unisci". Parsing non committa nulla.
   ============================================================ */

export default function Import({ onNavigate }){
  const { transactions, points: storePoints, imports, mergeBatch, deleteImport, reset } = useStore();
  const [state,setState] = useState("empty");   // empty | parsing | mapping | preview | done | error
  const [batch,setBatch] = useState(null);
  const [error,setError] = useState(null);
  const [doneInfo,setDoneInfo] = useState(null);
  const [showDups,setShowDups] = useState(false);
  const [drag,setDrag] = useState(false);
  const [analysis,setAnalysis] = useState(null); // { headers, mapping, sample, noHeader, profile }
  const fileRef = useRef({ name:"", text:"" });
  const inputRef = useRef(null);

  const finalize = (res, fileName, profile) => {
    if(res.error){ setError({ kind:"empty", file:fileName }); setState("error"); return; }
    if(res.transactions.length === 0 && res.duplicates === 0){
      setError({ kind:"norows", file:fileName }); setState("error"); return;
    }
    setBatch({ ...res, fileName, profile }); setState("preview");
  };

  const handleFile = (file) => {
    if(!file){ return; }
    if(!/\.csv$/i.test(file.name)){ setError({ kind:"format", file:file.name }); setState("error"); return; }
    setState("parsing");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      fileRef.current = { name:file.name, text };
      setTimeout(()=>{
        const a = analyzeCsv(text);
        if(a.error){ setError({ kind:"empty", file:file.name }); setState("error"); return; }
        if(a.profile === "curve"){
          finalize(parseCurveCsv(text, transactions, storePoints), file.name, "curve");
        } else if(a.needsMapping){
          setAnalysis(a); setState("mapping");   // chiedi la mappatura delle colonne
        } else {
          finalize(parseGeneric(text, a.mapping, transactions, { noHeader:a.noHeader, delim:a.delim }), file.name, "generic");
        }
      }, 450);
    };
    reader.onerror = ()=>{ setError({ kind:"empty", file:file.name }); setState("error"); };
    reader.readAsText(file);
  };

  const confirmMapping = (mapping) => {
    const { text, name } = fileRef.current;
    finalize(parseGeneric(text, mapping, transactions, { noHeader:analysis.noHeader, delim:analysis.delim }), name, "generic");
  };

  const confirm = () => {
    mergeBatch(batch, batch.fileName);
    setDoneInfo({ added:batch.transactions.length, duplicates:batch.duplicates, period:batch.period });
    setBatch(null); setState("done");
  };

  const cancel = () => { setBatch(null); setAnalysis(null); setState("empty"); };
  const retry  = () => { setError(null); setAnalysis(null); setState("empty"); };

  return (
    <div>
      <PageHeader title="Import"/>
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, maxWidth:1184 }}>

      {/* Dropzone (sempre in cima) */}
      {(state==="empty" || state==="error" || state==="parsing") && (
        <div
          onDragOver={e=>{ e.preventDefault(); setDrag(true); }}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{ e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={()=> state!=="parsing" && inputRef.current?.click()}
          style={{ border:`2px dashed ${drag?T.brand:T.border}`, borderRadius:T.r.lg,
            background: drag?T.brandSubtle:T.surface, padding:sp(10), textAlign:"center",
            cursor: state==="parsing"?"default":"pointer", transition:"all .15s", marginBottom:sp(6) }}>
          <input ref={inputRef} type="file" accept=".csv" style={{ display:"none" }}
            onChange={e=>handleFile(e.target.files[0])}/>
          {state==="parsing" ? <Parsing/> : <>
            <div style={{ width:48, height:48, borderRadius:"50%", background:T.brandSubtle, color:T.brand,
              display:"flex", alignItems:"center", justifyContent:"center", margin:`0 auto ${sp(3)}px` }}>
              <NavIco.upload/>
            </div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Trascina qui un export CSV</div>
            <div style={{ fontSize:13.5, color:T.fg3 }}>oppure clicca per sfogliare · Curve riconosciuto in automatico, altri CSV li mappi tu</div>
          </>}
        </div>
      )}

      {/* Mappatura colonne (CSV non-Curve non auto-riconosciuto) */}
      <AnimatePresence>
        {state==="mapping" && analysis && (
          <MappingPanel analysis={analysis} onConfirm={confirmMapping} onCancel={cancel}/>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {state==="error" && <ErrorPanel error={error} onRetry={retry}/>}
      </AnimatePresence>

      {/* Preview / confirm */}
      <AnimatePresence>
        {state==="preview" && batch && (
          <PreviewPanel batch={batch} showDups={showDups} setShowDups={setShowDups}
            onConfirm={confirm} onCancel={cancel}/>
        )}
      </AnimatePresence>

      {/* Done */}
      <AnimatePresence>
        {state==="done" && doneInfo && (
          <DonePanel info={doneInfo} onGoOverview={()=>onNavigate("overview")} onAgain={()=>setState("empty")}/>
        )}
      </AnimatePresence>

      {/* Import recenti */}
      {imports.length > 0 && state!=="preview" && (
        <div style={{ marginTop:sp(8) }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:sp(3) }}>
            <div style={{ fontSize:14, fontWeight:600, color:T.fg2 }}>Import recenti</div>
            <div style={{ display:"flex", alignItems:"center", gap:sp(3) }}>
              <span style={{ fontSize:12, color:T.fg3 }}>{transactions.length} movimenti · {storageLabel()}</span>
              <button onClick={()=>{ if(confirm("Svuotare tutto l'archivio? I dati salvati su questo dispositivo verranno cancellati.")) reset(); }}
                style={{ padding:"6px 12px", background:"transparent", color:T.fg3, border:`1px solid ${T.border}`,
                  borderRadius:T.r.sm, fontSize:12.5, fontWeight:550, cursor:"pointer", fontFamily:T.font }}>
                Svuota archivio
              </button>
            </div>
          </div>
          {imports.map(im=>(
            <ImportRow key={im.id} im={im} onDelete={()=>deleteImport(im.id)}/>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// pannello di mappatura colonne per CSV generici
function MappingPanel({ analysis, onConfirm, onCancel }){
  const reduce = useReducedMotion();
  const [map,setMap] = useState(analysis.mapping);
  const ready = ["date","amount","merchant"].every(f => map[f] !== null && map[f] !== "");
  const set = (field, idx) => setMap(m => ({ ...m, [field]: idx==="" ? null : +idx }));

  return (
    <motion.div initial={reduce?{}:{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={reduce?{}:{ opacity:0 }}
      transition={{ duration:M.dur.base, ease:M.ease.out }}>
      <Card style={{ marginBottom:sp(6) }}>
        <div style={{ fontSize:16, fontWeight:620, marginBottom:sp(2) }}>Abbina le colonne</div>
        <div style={{ fontSize:13.5, color:T.fg2, marginBottom:sp(5), maxWidth:620, lineHeight:1.5 }}>
          Questo CSV non è un export Curve: dimmi quale colonna è cosa. Ho già provato a indovinare dai nomi.
          Data, importo e descrizione sono obbligatori; categoria e carta sono utili ma opzionali.
          <br/><span style={{ color:T.fg3 }}>Per i CSV non-Curve non si applica lo split per carta: tutto conta come spesa personale (100%).</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:`${sp(3)}px ${sp(4)}px`, alignItems:"center", marginBottom:sp(5) }}>
          {MAP_FIELDS.map(([field,label,req])=>(
            <React.Fragment key={field}>
              <div style={{ fontSize:13.5, fontWeight:550 }}>
                {label} {req==="richiesto" && <span style={{ color:T.warning }}>*</span>}
              </div>
              <select value={map[field] ?? ""} onChange={e=>set(field, e.target.value)}
                style={{ padding:"8px 10px", border:`1px solid ${map[field]==null && req==="richiesto" ? T.warning : T.border}`,
                  borderRadius:T.r.md, background:T.surface, color:T.fg, fontSize:13.5, fontFamily:T.font, cursor:"pointer" }}>
                <option value="">— nessuna —</option>
                {analysis.headers.map((h,i)=> <option key={i} value={i}>{h}</option>)}
              </select>
            </React.Fragment>
          ))}
        </div>

        {/* anteprima delle prime righe con la mappa corrente */}
        <div style={{ fontSize:12, fontWeight:600, color:T.fg3, marginBottom:sp(2) }}>Anteprima</div>
        <div style={{ border:`1px solid ${T.border}`, borderRadius:T.r.sm, overflow:"hidden", marginBottom:sp(5) }}>
          <div style={{ display:"flex", gap:sp(3), padding:`8px ${sp(3)}px`, background:T.bg, fontSize:11.5, fontWeight:600, color:T.fg3 }}>
            <span style={{ width:90 }}>Data</span><span style={{ flex:1 }}>Descrizione</span>
            <span style={{ width:110 }}>Categoria</span><span style={{ width:70 }}>Carta</span><span style={{ width:90, textAlign:"right" }}>Importo</span>
          </div>
          {analysis.sample.slice(0,3).map((row,i)=>{
            const cell = (field)=> map[field]!=null ? (row[map[field]]||"") : "";
            return (
              <div key={i} style={{ display:"flex", gap:sp(3), padding:`8px ${sp(3)}px`, borderTop:`1px solid ${T.border}`, fontSize:13 }}>
                <span style={{ width:90, color:T.fg3 }}>{cell("date")||"—"}</span>
                <span style={{ flex:1 }}>{cell("merchant")||"—"}</span>
                <span style={{ width:110, color:T.fg3 }}>{cell("category")||"—"}</span>
                <span style={{ width:70, color:T.fg3 }}>{cell("card")||"—"}</span>
                <span style={{ width:90, textAlign:"right", fontWeight:600 }}>{cell("amount")||"—"}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:sp(3) }}>
          <button onClick={onCancel} style={btnGhost}>Annulla</button>
          <button onClick={()=>onConfirm(map)} disabled={!ready}
            style={{ ...btnPrimary, opacity: ready?1:0.5, cursor: ready?"pointer":"not-allowed" }}>Continua</button>
        </div>
      </Card>
    </motion.div>
  );
}

// riga storico import con eliminazione (annulla un caricamento sbagliato)
function ImportRow({ im, onDelete }){
  const reduce = useReducedMotion();
  const [confirm,setConfirm] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:`${sp(3)}px ${sp(4)}px`, background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:T.r.md, marginBottom:sp(2) }}>
      <div style={{ display:"flex", alignItems:"center", gap:sp(3), minWidth:0 }}>
        <span style={{ color:T.success, display:"flex", flexShrink:0 }}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10l4 4 8-9"/></svg>
        </span>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:550, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{im.fileName}</div>
          <div style={{ fontSize:12, color:T.fg3 }}>
            {im.added} movimenti{im.duplicates?` · ${im.duplicates} duplicati ignorati`:""}
            {im.period && ` · ${fmtDate(im.period.from)}–${fmtDate(im.period.to)}`}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:sp(3), flexShrink:0 }}>
        <span style={{ fontSize:12, color:T.fg3 }}>{im.when?.toLocaleString?.("it-IT",{ day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}</span>
        {!confirm ? (
          <button onClick={()=>setConfirm(true)} title="Annulla questo caricamento"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", width:30, height:30,
              borderRadius:T.r.sm, border:`1px solid ${T.border}`, background:"transparent",
              color:T.fg3, cursor:"pointer" }}>
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9h5.6l.7-9"/></svg>
          </button>
        ) : (
          <motion.div initial={reduce?{}:{ opacity:0, x:6 }} animate={{ opacity:1, x:0 }}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:12, color:T.fg2 }}>Eliminare {im.added} mov.?</span>
            <button onClick={onDelete} style={{ padding:"5px 10px", borderRadius:T.r.sm, border:"none",
              background:T.warning, color:T.onBrand, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>Elimina</button>
            <button onClick={()=>setConfirm(false)} style={{ padding:"5px 10px", borderRadius:T.r.sm,
              border:`1px solid ${T.border}`, background:"transparent", color:T.fg2, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>No</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Parsing(){
  return (
    <div>
      <div style={{ fontSize:14, color:T.fg2, marginBottom:sp(4) }}>Lettura del file…</div>
      {[1,2,3].map(i=>(
        <div key={i} className="shimmer" style={{ height:14, borderRadius:6, marginBottom:10,
          width: i===1?"60%":i===2?"80%":"45%", margin:"0 auto 10px" }}/>
      ))}
      <style>{`
        .shimmer{ background:linear-gradient(90deg,${T.bg} 25%,${T.border} 37%,${T.bg} 63%);
          background-size:400% 100%; animation:sh 1.5s linear infinite; }
        @keyframes sh{ 0%{ background-position:100% 0 } 100%{ background-position:-100% 0 } }
        @media (prefers-reduced-motion: reduce){ .shimmer{ animation:none; background:${T.border} } }
      `}</style>
    </div>
  );
}

function PreviewPanel({ batch, showDups, setShowDups, onConfirm, onCancel }){
  const reduce = useReducedMotion();
  const preview = batch.transactions.slice(0,4);
  const rest = batch.transactions.length - preview.length;
  return (
    <motion.div
      initial={reduce?{}:{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={reduce?{}:{ opacity:0 }}
      transition={{ duration:M.dur.base, ease:M.ease.out }}>
      <Card style={{ marginBottom:sp(4) }}>
        {/* profilo rilevato */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:sp(4),
          padding:`4px 10px`, borderRadius:T.r.pill, background:T.bg, fontSize:12, color:T.fg2 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:T.brand }}/>
          {batch.profile==="curve" ? "Riconosciuto: export Curve (split per carta + cashback applicati)"
            : "CSV generico (colonne mappate · tutto personale 100%, niente split)"}
        </div>
        {/* summary cells */}
        <div style={{ display:"flex", gap:sp(8), marginBottom:sp(5), flexWrap:"wrap" }}>
          <Cell big label="Nuove transazioni" value={batch.transactions.length}/>
          <Cell label="Duplicati ignorati" value={batch.duplicates}
            action={batch.duplicates>0 ? (showDups?"nascondi":"vedi →") : null}
            onAction={()=>setShowDups(s=>!s)}/>
          {batch.points.length>0 && <Cell label="Punti cashback (CPT)" value={`${batch.points.length} righe`}/>}
          {batch.period && <Cell label="Periodo"
            value={`${fmtDate(batch.period.from)} – ${fmtDate(batch.period.to)}`}/>}
        </div>

        {batch.points.length>0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:`${sp(2)}px ${sp(3)}px`,
            background:T.bg, borderRadius:T.r.md, marginBottom:sp(4), fontSize:13, color:T.fg2 }}>
            <span style={{ color:T.fg3 }}>ⓘ</span>
            Le righe CPT sono cashback in punti — escluse dai totali di spesa, contate solo come punti.
          </div>
        )}

        {/* preview table */}
        <div style={{ border:`1px solid ${T.border}`, borderRadius:T.r.md, overflow:"hidden" }}>
          <div style={{ display:"flex", gap:sp(3), padding:`10px ${sp(4)}px`, background:T.bg,
            fontSize:12, fontWeight:600, color:T.fg3 }}>
            <span style={{ width:100 }}>Data</span>
            <span style={{ flex:1 }}>Descrizione</span>
            <span style={{ width:140 }}>Categoria</span>
            <span style={{ width:80 }}>Carta</span>
            <span style={{ width:110, textAlign:"right" }}>Importo</span>
          </div>
          {preview.map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:sp(3), alignItems:"center",
              padding:`10px ${sp(4)}px`, borderTop:`1px solid ${T.border}`, fontSize:13.5 }}>
              <span style={{ width:100, color:T.fg2 }}>{fmtDate(t.date)}</span>
              <span style={{ flex:1, display:"flex", alignItems:"center", gap:7 }}>
                {t.merchant}
                {t.shared && <span style={{ fontSize:11, color:T.fg3, border:`1px solid ${T.border}`, borderRadius:4, padding:"0 5px" }}>½</span>}
              </span>
              <span style={{ width:140 }}><CategoryBadge cat={t.cat}/></span>
              <span style={{ width:80, color:T.fg2, fontSize:12.5 }}>•• {t.card||"—"}</span>
              <span style={{ width:110, textAlign:"right", fontWeight:600,
                color: t.refund?T.success:T.fg }}>
                {t.shared && !t.refund && <span style={{ fontSize:11, color:T.fg3, fontWeight:400 }}>di {fmtEur(t.gross)} </span>}
                {fmtEur(t.share, t.refund)}
              </span>
            </div>
          ))}
          {rest>0 && (
            <div style={{ padding:`9px ${sp(4)}px`, borderTop:`1px solid ${T.border}`,
              fontSize:13, color:T.fg3, textAlign:"center" }}>… e altre {rest} righe</div>
          )}
        </div>

        {/* dup inspector — elenco righe reali rilevate come duplicate */}
        <AnimatePresence>
          {showDups && batch.duplicates>0 && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:M.dur.base, ease:M.ease.out }} style={{ overflow:"hidden" }}>
              <div style={{ marginTop:sp(3), padding:sp(4), background:T.bg, borderRadius:T.r.md }}>
                <div style={{ fontSize:13, color:T.fg2, marginBottom:sp(3) }}>
                  Queste righe coincidono per <b>data + ora + merchant + importo + carta</b> → ignorate per non creare doppioni. Verifica che siano davvero ripetizioni.
                </div>
                <div style={{ border:`1px solid ${T.border}`, borderRadius:T.r.sm, overflow:"hidden", background:T.surface }}>
                  {batch.duplicateRows.slice(0,8).map((t,i)=>(
                    <div key={i} style={{ display:"flex", gap:sp(3), alignItems:"center",
                      padding:`8px ${sp(3)}px`, borderTop: i?`1px solid ${T.border}`:"none", fontSize:13 }}>
                      <span style={{ width:90, color:T.fg3 }}>{fmtDate(t.date)}</span>
                      <span style={{ width:54, color:T.fg3, fontSize:11.5 }}>{t.time?.slice(0,5)}</span>
                      <span style={{ flex:1, color:T.fg }}>{t.merchant}</span>
                      <span style={{ width:70, color:T.fg3, fontSize:12 }}>•• {t.card||"—"}</span>
                      <span style={{ width:80, textAlign:"right", fontWeight:600 }}>{fmtEur(t.gross)}</span>
                      <span style={{ width:88, textAlign:"right", fontSize:11, color:T.fg3 }}>già in {t.dupAgainst}</span>
                    </div>
                  ))}
                  {batch.duplicateRows.length>8 && (
                    <div style={{ padding:`7px ${sp(3)}px`, borderTop:`1px solid ${T.border}`, fontSize:12, color:T.fg3, textAlign:"center" }}>
                      … e altre {batch.duplicateRows.length-8} righe duplicate
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* actions */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:sp(3), marginTop:sp(5) }}>
          <button onClick={onCancel} style={btnGhost}>Annulla</button>
          <button onClick={onConfirm} style={btnPrimary}>Conferma e unisci</button>
        </div>
      </Card>
    </motion.div>
  );
}

function DonePanel({ info, onGoOverview, onAgain }){
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce?{}:{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
      transition={{ duration:M.dur.base, ease:M.ease.out }}>
      <Card style={{ textAlign:"center", padding:sp(8) }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:T.successSubtle, color:T.success,
          display:"flex", alignItems:"center", justifyContent:"center", margin:`0 auto ${sp(4)}px` }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5 9-10"/></svg>
        </div>
        <div style={{ fontSize:18, fontWeight:650, marginBottom:sp(2) }}>
          Uniti {info.added} movimenti{info.duplicates?` · ${info.duplicates} duplicati ignorati`:""}
        </div>
        {info.period && (
          <div style={{ fontSize:14, color:T.fg2, marginBottom:sp(5) }}>
            periodo {fmtDate(info.period.from)} – {fmtDate(info.period.to)}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"center", gap:sp(3) }}>
          <button onClick={onAgain} style={btnGhost}>Importa un altro</button>
          <button onClick={onGoOverview} style={btnPrimary}>Vai all'Overview</button>
        </div>
      </Card>
    </motion.div>
  );
}

function ErrorPanel({ error, onRetry }){
  const msg = {
    format:"Formato non riconosciuto — attese le colonne di Curve (export CSV).",
    empty:"File vuoto — non c'è nulla da leggere.",
    norows:"Nessuna riga valida trovata nel file.",
  }[error?.kind] || "Errore di lettura.";
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      transition={{ duration:M.dur.base, ease:M.ease.out }}>
      <Card style={{ borderColor:`${T.warning}55`, background:T.warningSubtle, marginBottom:sp(6) }}>
        <div style={{ display:"flex", gap:sp(3), alignItems:"flex-start" }}>
          <span style={{ color:T.warning, flexShrink:0, marginTop:2 }}>
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><path d="M10 6v5M10 13.5v.2"/></svg>
          </span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{msg}</div>
            <div style={{ fontSize:13, color:T.fg2, marginBottom:sp(4) }}>
              In Curve: <b>Account → Transactions → Export</b>, formato CSV. Poi trascina qui il file.
            </div>
            <button onClick={onRetry} style={btnPrimary}>Riprova con un altro file</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Cell({ label, value, big, action, onAction }){
  return (
    <div>
      <div style={{ fontSize:12.5, color:T.fg3, marginBottom:4 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
        <span style={{ fontSize:big?28:20, fontWeight:680 }}>{value}</span>
        {action && <span onClick={onAction} style={{ fontSize:13, color:T.brand, fontWeight:600, cursor:"pointer" }}>{action}</span>}
      </div>
    </div>
  );
}

const btnPrimary = { padding:"10px 18px", background:T.brand, color:T.onBrand, border:"none",
  borderRadius:T.r.md, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:T.font };
const btnGhost = { padding:"10px 18px", background:"transparent", color:T.fg2, border:`1px solid ${T.border}`,
  borderRadius:T.r.md, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:T.font };
