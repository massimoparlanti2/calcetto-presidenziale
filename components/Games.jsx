import { useState } from "react";
import { S } from "../styles";
import { Lbl, Badge } from "./UI";

export function Games({ players, matches, getMatches, user, saveMatches, setTab }) {
  const [form, setForm] = useState({ date:"", time:"", cap1:"", cap2:"", goalie1:"", goalie2:"" });
  const [show, setShow] = useState(false);
  const pn = id => players.find(p => p.id === id)?.name || "?";

  const create = async () => {
    if (!form.date || !form.time) return alert("Inserisci data e ora!");
    if (!form.cap1 || !form.cap2) return alert("Scegli entrambi i capitani!");
    if (form.cap1 === form.cap2) return alert("I capitani devono essere diversi!");
    if (!form.goalie1 || !form.goalie2) return alert("Scegli entrambi i portieri!");
    if (form.goalie1 === form.goalie2) return alert("I portieri devono essere diversi!");
    const taken = [form.cap1, form.cap2];
    if (taken.includes(form.goalie1) || taken.includes(form.goalie2)) return alert("Un portiere non può essere anche capitano!");
    const m = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      scheduledDate: new Date(`${form.date}T${form.time}`).toISOString(),
      cap1: form.cap1, cap2: form.cap2,
      goalie1: form.goalie1, goalie2: form.goalie2,
      team1: [form.cap1, form.goalie1], team2: [form.cap2, form.goalie2],
      status: "scheduled", draftTurn: 0,
      score1: 0, score2: 0, stats: {},
    };
    const current = getMatches();
    await saveMatches([...current, m]);
    setForm({ date:"", time:"", cap1:"", cap2:"", goalie1:"", goalie2:"" });
    setShow(false);
    setTab("home");
  };

  const upcoming = [...matches]
    .filter(m => ["scheduled","draft","ready","voting"].includes(m.status))
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>📅 Partite</h2>
      {user.isAdmin && !show && (
        <button style={{ ...S.btnGreen, marginBottom:16 }} onClick={() => setShow(true)}>+ Nuova Partita</button>
      )}
      {show && (
        <div style={{ background:"#0f220f",border:"1px solid #2d5a1e",borderRadius:14,padding:16,marginBottom:16 }}>
          <div style={{ fontWeight:900,color:"#b5f23d",fontSize:16,marginBottom:12 }}>⚽ Nuova Partita</div>
          <Lbl>Data <input type="date" style={S.inp} value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></Lbl>
          <Lbl>Ora  <input type="time" style={S.inp} value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} /></Lbl>
          <Lbl>Capitano 🔵
            <select style={S.inp} value={form.cap1} onChange={e => setForm(f=>({...f,cap1:e.target.value,goalie1:""}))}>
              <option value="">— scegli —</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <Lbl>Portiere 🧤🔵
            <select style={S.inp} value={form.goalie1} onChange={e => setForm(f=>({...f,goalie1:e.target.value}))}>
              <option value="">— scegli —</option>
              {players.filter(p=>p.id!==form.cap1&&p.id!==form.cap2&&p.id!==form.goalie2).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <Lbl>Capitano 🟠
            <select style={S.inp} value={form.cap2} onChange={e => setForm(f=>({...f,cap2:e.target.value,goalie2:""}))}>
              <option value="">— scegli —</option>
              {players.filter(p=>p.id!==form.cap1).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <Lbl>Portiere 🧤🟠
            <select style={S.inp} value={form.goalie2} onChange={e => setForm(f=>({...f,goalie2:e.target.value}))}>
              <option value="">— scegli —</option>
              {players.filter(p=>p.id!==form.cap2&&p.id!==form.cap1&&p.id!==form.goalie1).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <div style={{ display:"flex",gap:8,marginTop:4 }}>
            <button style={{ ...S.btnGreen, flex:1 }} onClick={create}>Crea ✓</button>
            <button style={{ ...S.btnGhost, flex:1 }} onClick={() => { setShow(false); setForm({ date:"",time:"",cap1:"",cap2:"",goalie1:"",goalie2:"" }); }}>Annulla</button>
          </div>
        </div>
      )}
      {upcoming.length === 0 && !show && (
        <div style={{ color:"#3a6a2a",textAlign:"center",padding:40,fontSize:14 }}>
          {user.isAdmin ? "Crea la prima partita!" : "Nessuna partita programmata."}
        </div>
      )}
      {upcoming.map(m => (
        <div key={m.id} style={{ background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:12,padding:"12px 14px",marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
            <span style={{ fontSize:11,color:"#4a7a3a" }}>
              {new Date(m.scheduledDate).toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"short"})} {new Date(m.scheduledDate).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}
            </span>
            <Badge status={m.status} />
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:16,fontWeight:700,fontSize:14 }}>
            <span style={{ color:"#4fc3f7" }}>{pn(m.cap1)}</span>
            <span style={{ color:"#3a6a2a" }}>VS</span>
            <span style={{ color:"#ff8a65" }}>{pn(m.cap2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
