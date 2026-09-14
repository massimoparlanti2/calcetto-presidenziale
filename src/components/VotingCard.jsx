import { useState, useEffect } from "react";
import { DB } from "../lib/firebase";
import { S } from "../styles";
import { Sec } from "./UI";

export function VotingCard({ match, pn, user, getMatches, saveMatches }) {
  const [votes, setVotes] = useState({});
  const [myGoals, setMyGoals] = useState(0);
  const [myAssists, setMyAssists] = useState(0);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [votersCount, setVotersCount] = useState(0);
  const allIds = [...(match.team1 || []), ...(match.team2 || [])];

  useEffect(() => {
    (async () => {
      const existing = await DB.get(`cp_votes_${match.id}`, {});
      setVotersCount(Object.keys(existing).length);
      if (user.id !== "admin" && existing[user.id]) {
        setDone(true);
        setMyGoals(existing[user.id].goals || 0);
        setMyAssists(existing[user.id].assists || 0);
        setVotes(existing[user.id].votes || {});
      }
      setReady(true);
    })();
  }, [match.id, user.id]);

  const submitPlayer = async () => {
    const others = allIds.filter(id => id !== user.id);
    for (const id of others) { if (!votes[id]) return alert(`Vota ${pn(id)} prima!`); }
    const existing = await DB.get(`cp_votes_${match.id}`, {});
    existing[user.id] = { goals: myGoals, assists: myAssists, votes };
    await DB.set(`cp_votes_${match.id}`, existing);
    setDone(true);
    setVotersCount(Object.keys(existing).length);
  };

  const closeVoting = async () => {
    const allVotes = await DB.get(`cp_votes_${match.id}`, {});
    const finalStats = {};
    for (const pid of allIds) {
      const g = allVotes[pid]?.goals || 0;
      const a = allVotes[pid]?.assists || 0;
      const vs = Object.entries(allVotes)
        .filter(([vid]) => vid !== pid)
        .map(([, v]) => v.votes?.[pid])
        .filter(v => v != null);
      const avg = vs.length ? vs.reduce((x, y) => x + y, 0) / vs.length : 0;
      finalStats[pid] = { goals: g, assists: a, voto: avg };
    }
    const current = getMatches();
    await saveMatches(current.map(m => m.id === match.id ? { ...m, status: "completed", stats: finalStats } : m));
  };

  if (!ready) return null;

  if (user.id !== "admin" && done) return (
    <div style={{ ...S.votingCard, textAlign:"center", padding:20 }}>
      <div style={{ fontSize:30 }}>✅</div>
      <div style={{ color:"#b5f23d",fontWeight:800,fontSize:15 }}>Voto inviato!</div>
      <div style={{ color:"#4a7a3a",fontSize:12,marginTop:4 }}>{votersCount} / {allIds.length} giocatori hanno votato</div>
    </div>
  );

  return (
    <div style={S.votingCard}>
      <div style={{ fontWeight:900,fontSize:14,color:"#ffd54f",marginBottom:2 }}>📊 Votazioni in corso</div>
      <div style={{ color:"#9ab87a",fontSize:13,marginBottom:12 }}>
        {pn(match.cap1)} <span style={{ color:"#b5f23d",fontWeight:900 }}>{match.score1}:{match.score2}</span> {pn(match.cap2)}
        <span style={{ color:"#3a6a2a",fontSize:11,marginLeft:8 }}>({votersCount}/{allIds.length} votato)</span>
      </div>

      {user.id !== "admin" && (
        <>
          <Sec>I tuoi goal e assist</Sec>
          <div style={{ display:"flex",gap:20,marginBottom:14,alignItems:"center" }}>
            {[["⚽ Goal", myGoals, setMyGoals], ["🅰️ Assist", myAssists, setMyAssists]].map(([label, val, setter]) => (
              <div key={label} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <span style={{ fontSize:12,color:"#7a9e5a" }}>{label}</span>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <button style={S.scBtn} onClick={() => setter(v => Math.max(0, v-1))}>−</button>
                  <span style={{ fontWeight:900,fontSize:22,minWidth:24,textAlign:"center" }}>{val}</span>
                  <button style={S.scBtn} onClick={() => setter(v => v+1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <Sec>Vota i tuoi compagni (1–5)</Sec>
          {allIds.filter(id => id !== user.id).map(pid => (
            <div key={pid} style={{ marginBottom:10 }}>
              <div style={{ fontSize:13,fontWeight:700,marginBottom:4 }}>{pn(pid)}</div>
              <div style={{ display:"flex",gap:3 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setVotes(v => ({ ...v, [pid]: n }))}
                    style={{ flex:1,height:30,borderRadius:6,border:"none",cursor:"pointer",fontWeight:800,fontSize:11,transition:"all 0.1s",
                      background:(votes[pid]||0)>=n?"#b5f23d":"#1a3a1a",
                      color:(votes[pid]||0)>=n?"#0a160a":"#4a7a3a" }}>
                    {n}
                  </button>
                ))}
              </div>
              {votes[pid] && <div style={{ textAlign:"right",color:"#b5f23d",fontSize:11,marginTop:2 }}>⭐ {votes[pid]}/10</div>}
            </div>
          ))}
          <button style={{ ...S.btnGreen, width:"100%", marginTop:4 }} onClick={submitPlayer}>✅ Invia Voto</button>
        </>
      )}

      {user.isAdmin && (
        <>
          <div style={{ color:"#7a9e5a",fontSize:13,marginBottom:12 }}>
            Aspetta che tutti i giocatori votino, poi chiudi le votazioni per salvare i risultati.
          </div>
          <button style={{ ...S.btnGreen, width:"100%" }} onClick={closeVoting}>🏆 Chiudi Votazioni & Salva</button>
        </>
      )}
    </div>
  );
}
