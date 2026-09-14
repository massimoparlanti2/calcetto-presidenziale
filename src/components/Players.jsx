import { useState, useRef } from "react";
import { DB } from "../lib/firebase";
import { S } from "../styles";
import { Av, Sec } from "./UI";

// ─── BACKUP PANEL ──────────────────────────────────────────────────────────────
function BackupPanel({ players, savePlayers }) {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const doExport = async () => {
    const [p, m] = await Promise.all([DB.get("cp_players", []), DB.get("cp_matches", [])]);
    const blob = new Blob(
      [JSON.stringify({ players:p, matches:m, exportedAt:new Date().toISOString() }, null, 2)],
      { type:"application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calcetto_backup_${new Date().toLocaleDateString("it-IT").replace(/\//g,"-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.players) || !Array.isArray(data.matches))
          return alert("File non valido: mancano players o matches.");
        setPreview(data);
        setMsg("");
      } catch { alert("Errore nel parsing del JSON."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      await DB.set("cp_players", preview.players);
      await DB.set("cp_matches", preview.matches);
      savePlayers(preview.players);
      setMsg(`✅ Importati ${preview.players.length} giocatori e ${preview.matches.length} partite. Ricarica la pagina.`);
      setPreview(null);
    } catch (err) {
      setMsg("❌ Errore durante l'importazione: " + err.message);
    }
    setImporting(false);
  };

  return (
    <div style={{ marginTop:16,background:"#0a100a",border:"1px solid #2d5a1e",borderRadius:12,padding:14 }}>
      <div style={{ fontWeight:800,color:"#b5f23d",fontSize:13,marginBottom:10 }}>💾 Backup & Ripristino</div>
      <button style={{ ...S.btnGreen, width:"100%", marginBottom:10, justifyContent:"center" }} onClick={doExport}>
        ⬇️ Scarica Backup JSON
      </button>
      <button style={{ ...S.btnGhost, width:"100%", justifyContent:"center" }} onClick={() => fileRef.current?.click()}>
        📂 Carica Backup JSON
      </button>
      <input ref={fileRef} type="file" accept=".json,application/json" style={{ display:"none" }} onChange={onFile} />
      {preview && (
        <div style={{ marginTop:12,background:"#0f220f",border:"1px solid #ffd54f44",borderRadius:10,padding:12 }}>
          <div style={{ color:"#ffd54f",fontWeight:800,fontSize:12,marginBottom:6 }}>⚠️ Anteprima — confermi il ripristino?</div>
          <div style={{ fontSize:12,color:"#9ab87a",marginBottom:2 }}>👥 Giocatori: <strong style={{color:"#e8f5e2"}}>{preview.players.length}</strong></div>
          <div style={{ fontSize:12,color:"#9ab87a",marginBottom:2 }}>📅 Partite: <strong style={{color:"#e8f5e2"}}>{preview.matches.length}</strong> ({preview.matches.filter(m=>m.status==="completed").length} completate)</div>
          {preview.exportedAt && <div style={{ fontSize:11,color:"#4a7a3a",marginBottom:10 }}>Esportato il {new Date(preview.exportedAt).toLocaleString("it-IT")}</div>}
          <div style={{ display:"flex",gap:8 }}>
            <button style={{ ...S.btnGreen, flex:1, justifyContent:"center", fontSize:13 }} onClick={doImport} disabled={importing}>
              {importing ? "Caricamento…" : "✅ Conferma Ripristino"}
            </button>
            <button style={{ ...S.btnGhost, flex:1, justifyContent:"center", fontSize:13 }} onClick={() => setPreview(null)}>Annulla</button>
          </div>
        </div>
      )}
      {msg && <div style={{ marginTop:10,fontSize:12,color:msg.startsWith("✅")?"#b5f23d":"#ff6b6b" }}>{msg}</div>}
      <div style={{ color:"#3a6a2a",fontSize:11,marginTop:8 }}>Il backup include giocatori, partite e statistiche.</div>
    </div>
  );
}

// ─── PLAYERS PAGE ──────────────────────────────────────────────────────────────
export function Players({ players, savePlayers, user }) {
  const [name, setName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showPinFor, setShowPinFor] = useState(null);
  const [adminPin, setAdminPin] = useState("");
  const [showAdminPin, setShowAdminPin] = useState(false);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (players.find(p => p.name.toLowerCase() === n.toLowerCase())) return alert("Già presente!");
    savePlayers([...players, { id:`${Date.now()}_${Math.random().toString(36).slice(2,5)}`, name:n }]);
    setName("");
  };

  const remove = (id) => { if (window.confirm("Rimuovere?")) savePlayers(players.filter(p => p.id !== id)); };

  const savePlayerPin = async (pid) => {
    if (!newPin) return alert("Password vuota!");
    await DB.set(`cp_pin_${pid}`, newPin);
    setNewPin(""); setShowPinFor(null);
    alert("Password aggiornata! ✅");
  };

  const saveAdminPin = async () => {
    if (adminPin.length < 3) return alert("PIN troppo corto (min 3)");
    await DB.set("cp_admin_pin", adminPin);
    setAdminPin(""); setShowAdminPin(false);
    alert("PIN Admin aggiornato! ✅");
  };

  // Vista giocatore normale: solo profilo personale
  if (!user.isAdmin) return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>👤 Il Mio Profilo</h2>
      <div style={{ background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:14,padding:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <Av>{user.name[0].toUpperCase()}</Av>
          <span style={{ fontWeight:800,fontSize:18 }}>{user.name}</span>
        </div>
        <Sec>Cambia Password</Sec>
        <div style={{ display:"flex",gap:8,marginTop:8 }}>
          <input type="password" style={{ ...S.inp, flex:1 }} placeholder="Nuova password…" value={newPin} onChange={e=>setNewPin(e.target.value)} />
          <button style={S.btnGreen} onClick={() => savePlayerPin(user.id)}>Salva</button>
        </div>
        <p style={{ color:"#3a6a2a",fontSize:11,marginTop:6 }}>Lascia vuoto per accesso senza password.</p>
      </div>
      <div style={{ marginTop:20 }}>
        <Sec>Tutti i Giocatori</Sec>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
          {players.map(p => (
            <div key={p.id} style={{ background:"#0f220f",border:`1px solid ${p.id===user.id?"#b5f23d":"#1e3a1e"}`,borderRadius:12,padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
              <Av>{p.name[0].toUpperCase()}</Av>
              <span style={{ fontWeight:700,fontSize:12 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>👥 Giocatori</h2>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        <input style={S.inp} placeholder="Nome giocatore…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <button style={S.btnGreen} onClick={add}>+ Aggiungi</button>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
        {players.map(p => (
          <div key={p.id} style={{ background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:12,padding:"10px 14px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <Av>{p.name[0].toUpperCase()}</Av>
              <span style={{ flex:1,fontWeight:700,fontSize:15 }}>{p.name}</span>
              <button style={{ background:"transparent",border:"1px solid #2d5a1e",borderRadius:8,padding:"5px 8px",color:"#7a9e5a",cursor:"pointer",fontSize:12 }}
                onClick={() => setShowPinFor(showPinFor===p.id?null:p.id)}>🔑</button>
              <button style={{ background:"transparent",border:"1px solid #5a1a1a",borderRadius:8,padding:"5px 8px",color:"#ff6b6b",cursor:"pointer" }}
                onClick={() => remove(p.id)}>🗑</button>
            </div>
            {showPinFor === p.id && (
              <div style={{ display:"flex",gap:8,marginTop:8 }}>
                <input type="password" style={{ ...S.inp, flex:1 }} placeholder="Nuova password…" value={newPin} onChange={e=>setNewPin(e.target.value)} />
                <button style={S.btnGreen} onClick={() => savePlayerPin(p.id)}>Salva</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background:"#100f0a",border:"1px solid #3a3a1a",borderRadius:12,padding:14 }}>
        <div style={{ fontWeight:800,color:"#ffd54f",fontSize:13,marginBottom:8 }}>🔑 PIN Amministratore</div>
        {!showAdminPin
          ? <button style={S.btnGhost} onClick={() => setShowAdminPin(true)}>Cambia PIN Admin</button>
          : <div style={{ display:"flex",gap:8 }}>
            <input type="password" style={{ ...S.inp, flex:1 }} placeholder="Nuovo PIN…" value={adminPin} onChange={e=>setAdminPin(e.target.value)} />
            <button style={S.btnGreen} onClick={saveAdminPin}>Salva</button>
          </div>
        }
        <div style={{ color:"#3a6a2a",fontSize:11,marginTop:6 }}>PIN default: 1234</div>
      </div>
      <BackupPanel players={players} savePlayers={savePlayers} />
    </div>
  );
}
