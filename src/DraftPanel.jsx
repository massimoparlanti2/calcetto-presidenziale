import { useState, useEffect } from "react";
import { abbaOwner } from "../lib/utils";
import { S } from "../styles";
import { Av } from "./UI";

export function DraftPanel({ match, players, pn, user, getMatches, saveMatches }) {
  const [lm, setLm] = useState(match);
  useEffect(() => setLm(match), [JSON.stringify(match)]);

  const picked = [...(lm.team1 || []), ...(lm.team2 || [])];
  const avail = players.filter(p => !picked.includes(p.id) && p.id !== lm.cap1 && p.id !== lm.cap2);
  const turn = lm.draftTurn || 0;
  const ownIdx = abbaOwner(turn);
  const pickerName = pn(ownIdx === 0 ? lm.cap1 : lm.cap2);
  const pickerColor = ownIdx === 0 ? "#4fc3f7" : "#ff8a65";
  const isMyTurn = user.isAdmin || user.id === (ownIdx === 0 ? lm.cap1 : lm.cap2);

  const pick = async (pid) => {
    if (!isMyTurn) return;
    const t1 = ownIdx === 0 ? [...lm.team1, pid] : lm.team1;
    const t2 = ownIdx === 1 ? [...lm.team2, pid] : lm.team2;
    const next = { ...lm, team1: t1, team2: t2, draftTurn: turn + 1 };
    setLm(next);
    const current = getMatches();
    await saveMatches(current.map(m => m.id === lm.id ? next : m));
  };

  const done = async () => {
    const current = getMatches();
    await saveMatches(current.map(m => m.id === lm.id ? { ...m, status: "ready" } : m));
  };

  const nxt = [turn, turn+1, turn+2, turn+3].map(t => abbaOwner(t) === 0 ? "A" : "B").join("→");

  return (
    <div style={{ background:"#06140a",border:"1px solid #1a3a1a",borderRadius:12,padding:12,marginTop:10 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
        <div>
          <div style={{ color:"#4fc3f7",fontWeight:800,fontSize:12,marginBottom:4 }}>🔵 {pn(lm.cap1)} <span style={{fontSize:10,color:"#7a9e5a"}}>(cap)</span></div>
          {(lm.team1 || []).map(id => <div key={id} style={{ fontSize:12,color:"#9ab87a" }}>{pn(id)}{id===lm.goalie1?" 🧤":id===lm.cap1?" ©":""}</div>)}
        </div>
        <div>
          <div style={{ color:"#ff8a65",fontWeight:800,fontSize:12,marginBottom:4 }}>🟠 {pn(lm.cap2)} <span style={{fontSize:10,color:"#7a9e5a"}}>(cap)</span></div>
          {(lm.team2 || []).map(id => <div key={id} style={{ fontSize:12,color:"#9ab87a" }}>{pn(id)}{id===lm.goalie2?" 🧤":id===lm.cap2?" ©":""}</div>)}
        </div>
      </div>
      {avail.length > 0 ? (
        <>
          <div style={{ textAlign:"center",marginBottom:8 }}>
            <span style={{ color:pickerColor,fontWeight:800 }}>{pickerName}</span>
            <span style={{ color:"#7a9e5a" }}> sceglie (turno #{turn+1})</span>
            <div style={{ color:"#3a6a2a",fontSize:10,letterSpacing:1,marginTop:2 }}>ABBA: {nxt}</div>
          </div>
          {isMyTurn ? (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
              {avail.map(p => (
                <button key={p.id} className="hov" onClick={() => pick(p.id)}
                  style={{ display:"flex",alignItems:"center",gap:8,background:"#0f220f",border:`1px solid ${pickerColor}44`,borderRadius:10,padding:"10px",cursor:"pointer",color:"#e8f5e2",fontFamily:"inherit",fontWeight:700,fontSize:13 }}>
                  <Av sm>{p.name[0]}</Av>{p.name}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ color:"#3a6a2a",textAlign:"center",fontSize:13,padding:"8px 0" }}>Attendi il tuo turno…</div>
          )}
        </>
      ) : (
        user.isAdmin && <button style={{ ...S.btnGreen, width:"100%" }} onClick={done}>✅ Conferma Squadre</button>
      )}
    </div>
  );
}
