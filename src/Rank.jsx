import { useState } from "react";
import { S } from "../styles";

export function Rank({ players, matches }) {
  const [expanded, setExpanded] = useState(null);

  // Calcola stats cumulative per ogni giocatore
  const stats = players.map(p => {
    let goals = 0, assists = 0, votoSum = 0, votoCount = 0;
    let partite = 0, wins = 0, draws = 0, losses = 0;
    const history = [];

    const completed = [...matches]
      .filter(m => m.status === "completed")
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    for (const m of completed) {
      const in1 = (m.team1 || []).includes(p.id);
      const in2 = (m.team2 || []).includes(p.id);
      if (!in1 && !in2) continue;

      partite++;
      const s = m.stats?.[p.id] || {};
      const mg = s.goals || 0;
      const ma = s.assists || 0;
      const mv = s.voto || 0;

      goals += mg;
      assists += ma;
      if (mv) { votoSum += mv; votoCount++; }

      const won  = (in1 && m.score1 > m.score2) || (in2 && m.score2 > m.score1);
      const draw = m.score1 === m.score2;
      const lost = !won && !draw;

      if (won)  wins++;
      if (draw) draws++;
      if (lost) losses++;

      // Punti partita: G×3 + A×1 + V×0.5 + Win×2 + Draw×1
      const matchPts = mg * 3 + ma * 1 + mv * 0.5 + (won ? 2 : draw ? 1 : 0);

      history.push({
        date: m.scheduledDate,
        goals: mg, assists: ma, voto: mv,
        result: won ? "W" : draw ? "D" : "L",
        score: `${m.score1}:${m.score2}`,
        cap1: m.cap1, cap2: m.cap2,
        pts: matchPts,
      });
    }

    const vm = votoCount ? votoSum / votoCount : 0;
    const pts = history.reduce((sum, h) => sum + h.pts, 0);

    return { ...p, goals, assists, vm, partite, wins, draws, losses, pts, history };
  }).sort((a, b) => b.pts - a.pts);

  const pn = id => players.find(p => p.id === id)?.name || "?";
  const resultColor = r => r === "W" ? "#b5f23d" : r === "D" ? "#ffd54f" : "#ff6b6b";

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>🏆 Classifica</h2>

      {/* Legenda formula */}
      <div style={{ background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:10,padding:"8px 12px",marginBottom:14,fontSize:11,color:"#4a7a3a",lineHeight:1.8 }}>
        <span style={{ color:"#7a9e5a",fontWeight:800,letterSpacing:1 }}>FORMULA PUNTI</span><br/>
        ⚽ Goal ×3 &nbsp;·&nbsp; 🅰️ Assist ×1 &nbsp;·&nbsp; ⭐ Voto ×0.5 &nbsp;·&nbsp; 🏆 Vittoria +2 &nbsp;·&nbsp; 🤝 Pareggio +1
      </div>

      {players.length === 0 ? (
        <div style={{ color:"#3a6a2a",textAlign:"center",padding:40 }}>Aggiungi giocatori prima!</div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {stats.map((s, i) => (
            <div key={s.id}>
              {/* Riga principale */}
              <div
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                style={{ background: i===0?"#1e3010":i===1?"#182810":i===2?"#152510":"#0f1e0f", border:`1px solid ${i===0?"#b5f23d44":i===1?"#8a8a4444":i===2?"#8a6a2a44":"#1e3a1e"}`, borderRadius: expanded===s.id?"12px 12px 0 0":12, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, userSelect:"none" }}
              >
                {/* Posizione */}
                <div style={{ width:28,textAlign:"center",fontSize:16,flexShrink:0 }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"#3a6a2a",fontWeight:900,fontSize:13}}>{i+1}</span>}
                </div>

                {/* Nome */}
                <div style={{ flex:1,fontWeight:800,fontSize:14 }}>{s.name}</div>

                {/* Stats inline */}
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  <StatPill icon="⚽" val={s.goals} />
                  <StatPill icon="🅰️" val={s.assists} />
                  <StatPill icon="⭐" val={s.vm > 0 ? s.vm.toFixed(1) : "—"} />
                </div>

                {/* Punteggio totale */}
                <div style={{ background:"#b5f23d",color:"#0a160a",borderRadius:8,padding:"4px 10px",fontWeight:900,fontSize:15,minWidth:46,textAlign:"center",flexShrink:0 }}>
                  {s.pts.toFixed(1)}
                </div>

                {/* Espandi */}
                <div style={{ color:"#3a6a2a",fontSize:12,flexShrink:0 }}>{expanded===s.id?"▲":"▼"}</div>
              </div>

              {/* Dettaglio espanso */}
              {expanded === s.id && (
                <div style={{ background:"#080f08",border:"1px solid #1e3a1e",borderTop:"none",borderRadius:"0 0 12px 12px",padding:12 }}>

                  {/* Riepilogo W/D/L */}
                  <div style={{ display:"flex",gap:8,marginBottom:12,justifyContent:"center" }}>
                    {[["🏆","Vinte",s.wins,"#b5f23d"],["🤝","Pari",s.draws,"#ffd54f"],["💀","Perse",s.losses,"#ff6b6b"],["📅","Partite",s.partite,"#7a9e5a"]].map(([ico,lbl,val,col])=>(
                      <div key={lbl} style={{ flex:1,background:"#0f1e0f",border:`1px solid ${col}33`,borderRadius:10,padding:"8px 4px",textAlign:"center" }}>
                        <div style={{ fontSize:18 }}>{ico}</div>
                        <div style={{ fontWeight:900,fontSize:16,color:col }}>{val}</div>
                        <div style={{ fontSize:9,color:"#4a7a3a",letterSpacing:1,textTransform:"uppercase" }}>{lbl}</div>
                      </div>
                    ))}
                  </div>

                  {/* Storico partite */}
                  {s.history.length > 0 && (
                    <>
                      <div style={{ fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:6 }}>Storico Partite</div>
                      <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                        {s.history.map((h, hi) => (
                          <div key={hi} style={{ display:"flex",alignItems:"center",gap:8,background:"#0c180c",borderRadius:8,padding:"6px 10px",fontSize:12 }}>
                            {/* Risultato */}
                            <div style={{ width:20,height:20,borderRadius:4,background:resultColor(h.result)+"22",color:resultColor(h.result),fontWeight:900,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{h.result}</div>
                            {/* Data */}
                            <div style={{ color:"#4a7a3a",fontSize:10,minWidth:50 }}>
                              {new Date(h.date).toLocaleDateString("it-IT",{day:"2-digit",month:"short"})}
                            </div>
                            {/* Squadre */}
                            <div style={{ flex:1,color:"#7a9e5a",fontSize:11 }}>
                              <span style={{color:"#4fc3f7"}}>{pn(h.cap1)}</span> <span style={{color:"#3a6a2a"}}>{h.score}</span> <span style={{color:"#ff8a65"}}>{pn(h.cap2)}</span>
                            </div>
                            {/* Stats personali */}
                            <div style={{ display:"flex",gap:6,color:"#b5f23d",fontSize:11 }}>
                              {h.goals>0&&<span>⚽{h.goals}</span>}
                              {h.assists>0&&<span>🅰️{h.assists}</span>}
                              {h.voto>0&&<span>⭐{h.voto.toFixed(1)}</span>}
                            </div>
                            {/* Punti partita */}
                            <div style={{ background:"#1a3a1a",color:"#b5f23d",borderRadius:6,padding:"2px 7px",fontWeight:900,fontSize:11,flexShrink:0 }}>
                              +{h.pts.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon, val }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:3,background:"#1a3a1a",borderRadius:6,padding:"3px 7px",fontSize:12 }}>
      <span>{icon}</span>
      <span style={{ fontWeight:700,color:"#e8f5e2" }}>{val}</span>
    </div>
  );
}