import { useState } from "react";
import { S } from "../styles";
import { Sec, ScoreInput } from "./UI";

// ─── EDIT MATCH FORM ───────────────────────────────────────────────────────────
function EditMatchForm({ match, getMatches, pn, saveMatches, close }) {
  const [s1, setS1] = useState(match.score1);
  const [s2, setS2] = useState(match.score2);
  const [stats, setStats] = useState(() => {
    const copy = {};
    const all = [...(match.team1||[]), ...(match.team2||[])];
    for (const id of all) copy[id] = {
      goals: match.stats?.[id]?.goals || 0,
      assists: match.stats?.[id]?.assists || 0,
      voto: match.stats?.[id]?.voto || 0,
    };
    return copy;
  });

  const setStat = (pid, field, val) =>
    setStats(s => ({ ...s, [pid]: { ...s[pid], [field]: val } }));

  const save = async () => {
    const current = getMatches();
    await saveMatches(current.map(m => m.id === match.id ? { ...m, score1:s1, score2:s2, stats } : m));
    close();
  };

  return (
    <div style={{ marginTop:12,background:"#08180a",border:"1px solid #2d5a1e",borderRadius:12,padding:14 }}>
      <div style={{ fontWeight:800,color:"#b5f23d",fontSize:14,marginBottom:12 }}>✏️ Modifica Partita</div>
      <Sec>Risultato</Sec>
      <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:16,marginBottom:14 }}>
        <ScoreInput label={pn(match.cap1)} color="#4fc3f7" val={s1} set={setS1} />
        <span style={{ color:"#4a7a3a",fontWeight:900,fontSize:18 }}>:</span>
        <ScoreInput label={pn(match.cap2)} color="#ff8a65" val={s2} set={setS2} />
      </div>
      <Sec>Statistiche Giocatori</Sec>
      <div style={{ marginTop:8 }}>
        {[
          { team:match.team1, cap:match.cap1, goalie:match.goalie1, color:"#4fc3f7" },
          { team:match.team2, cap:match.cap2, goalie:match.goalie2, color:"#ff8a65" },
        ].map(({ team, cap, goalie, color }) => (
          <div key={cap} style={{ marginBottom:10 }}>
            <div style={{ color,fontWeight:800,fontSize:12,marginBottom:6 }}>{pn(cap)}'s Team</div>
            {(team || []).map(pid => (
              <div key={pid} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <span style={{ flex:1,fontSize:13,fontWeight:700 }}>{pn(pid)}{pid===goalie?" 🧤":pid===cap?" ©":""}</span>
                {[["⚽","goals"],["🅰️","assists"],["⭐","voto"]].map(([ico,field]) => (
                  <label key={field} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontSize:12,color:"#7a9e5a" }}>
                    {ico}
                    <input type="number" min="0" max={field==="voto"?10:undefined} step={field==="voto"?0.1:1}
                      style={S.numIn} value={stats[pid]?.[field]||0}
                      onChange={e => setStat(pid, field, Math.max(0, parseFloat(e.target.value)||0))} />
                  </label>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:8,marginTop:4 }}>
        <button style={{ ...S.btnGreen, flex:1 }} onClick={save}>💾 Salva Modifiche</button>
        <button style={{ ...S.btnGhost, flex:1 }} onClick={close}>Annulla</button>
      </div>
    </div>
  );
}

// ─── HISTORY PAGE ──────────────────────────────────────────────────────────────
export function History({ players, matches, getMatches, user, saveMatches }) {
  const [editing, setEditing] = useState(null);
  const done = [...matches]
    .filter(m => m.status === "completed")
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  const pn = id => players.find(p => p.id === id)?.name || "?";

  const del = async (id) => {
    if (!window.confirm("Eliminare partita?")) return;
    const current = getMatches();
    await saveMatches(current.filter(m => m.id !== id));
  };

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>📋 Storico</h2>
      {done.length === 0 && <div style={{ color:"#3a6a2a",textAlign:"center",padding:40 }}>Nessuna partita completata.</div>}
      {done.map(m => (
        <div key={m.id} style={{ background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:14,padding:14,marginBottom:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <span style={{ fontSize:11,color:"#4a7a3a" }}>
              {new Date(m.scheduledDate).toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"long",year:"numeric"})}
            </span>
            <div style={{ display:"flex",gap:6 }}>
              {user.isAdmin && <button style={{ background:"transparent",border:"1px solid #2d5a1e",borderRadius:8,padding:"4px 8px",color:"#7a9e5a",cursor:"pointer",fontSize:12 }} onClick={() => setEditing(editing===m.id?null:m.id)}>✏️ Modifica</button>}
              {user.isAdmin && <button style={{ background:"transparent",border:"1px solid #5a1a1a",borderRadius:8,padding:"4px 8px",color:"#ff6b6b",cursor:"pointer",fontSize:12 }} onClick={() => del(m.id)}>🗑</button>}
            </div>
          </div>
          <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginBottom:10 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ color:"#4fc3f7",fontWeight:800,fontSize:11 }}>{pn(m.cap1)}</div>
              <div style={{ fontSize:34,fontWeight:900,color:"#b5f23d" }}>{m.score1}</div>
            </div>
            <span style={{ color:"#4a7a3a",fontWeight:900 }}>:</span>
            <div style={{ textAlign:"center" }}>
              <div style={{ color:"#ff8a65",fontWeight:800,fontSize:11 }}>{pn(m.cap2)}</div>
              <div style={{ fontSize:34,fontWeight:900,color:"#b5f23d" }}>{m.score2}</div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,borderTop:"1px solid #1e3a1e",paddingTop:8 }}>
            {[m.team1, m.team2].map((team, ti) => (
              <div key={ti}>
                {(team || []).map(id => {
                  const st = m.stats?.[id] || {};
                  const isGoalie = (ti===0&&id===m.goalie1)||(ti===1&&id===m.goalie2);
                  const isCap = (ti===0&&id===m.cap1)||(ti===1&&id===m.cap2);
                  return (
                    <div key={id} style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0" }}>
                      <span>{pn(id)}{isGoalie?" 🧤":isCap?" ©":""}</span>
                      <span style={{ display:"flex",gap:4,color:"#b5f23d",fontSize:11 }}>
                        {st.goals>0&&<span>⚽{st.goals}</span>}
                        {st.assists>0&&<span>🅰️{st.assists}</span>}
                        {st.voto>0&&<span>⭐{st.voto.toFixed(1)}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {editing === m.id && (
            <EditMatchForm match={m} getMatches={getMatches} pn={pn} saveMatches={saveMatches} close={() => setEditing(null)} />
          )}
        </div>
      ))}
    </div>
  );
}
