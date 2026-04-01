import { useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { S } from "../styles";
import { Badge, MiniTeam, ScoreInput } from "./UI";
import { DraftPanel } from "./DraftPanel";

export function UpcomingCard({ match, pn, user, players, getMatches, saveMatches, refresh }) {
  const [scoreForm, setScoreForm] = useState(false);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const cd = useCountdown(match.scheduledDate);

  const startDraft = async () => {
    const current = getMatches();
    await saveMatches(current.map(m => m.id === match.id ? { ...m, status:"draft", draftTurn:0 } : m));
  };

  const openVoting = async () => {
    const current = getMatches();
    await saveMatches(current.map(m => m.id === match.id ? { ...m, status:"voting", score1:s1, score2:s2 } : m));
  };

  return (
    <div style={S.cdCard}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <span style={{ fontSize:10,color:"#7a9e5a",letterSpacing:3,textTransform:"uppercase" }}>{cd ? "⏱ Prossima" : "📅 In programma"}</span>
        <Badge status={match.status} />
      </div>
      <div style={{ color:"#b5f23d",fontWeight:700,fontSize:13,marginBottom:10 }}>
        {new Date(match.scheduledDate).toLocaleDateString("it-IT",{weekday:"long",day:"2-digit",month:"long"})} — {new Date(match.scheduledDate).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}
      </div>
      {cd && (
        <div style={{ display:"flex",justifyContent:"center",gap:10,marginBottom:12 }}>
          {[["d",cd.d],["h",cd.h],["m",cd.m],["s",cd.s]].map(([l,v]) => (
            <div key={l} style={S.cdUnit}>
              <span style={S.cdNum}>{String(v).padStart(2,"0")}</span>
              <span style={S.cdLbl}>{l}</span>
            </div>
          ))}
        </div>
      )}
      {match.team1?.length > 1 && match.status !== "draft" && (
        <div style={{ display:"flex",justifyContent:"space-around",borderTop:"1px solid #1e3a1e",paddingTop:10,marginTop:6 }}>
          <MiniTeam color="#4fc3f7" name={pn(match.cap1)} members={match.team1.map(pn)} />
          <span style={{ color:"#3a6a2a",fontWeight:900,alignSelf:"center" }}>VS</span>
          <MiniTeam color="#ff8a65" name={pn(match.cap2)} members={match.team2.map(pn)} />
        </div>
      )}
      {match.status === "draft" && (
        <DraftPanel match={match} players={players} pn={pn} user={user} getMatches={getMatches} saveMatches={saveMatches} refresh={refresh} />
      )}
      {user.isAdmin && match.status === "scheduled" && (
        <button style={{ ...S.btnGreen, width:"100%", marginTop:12 }} onClick={startDraft}>🏀 Inizia Draft ABBA</button>
      )}
      {user.isAdmin && match.status === "ready" && !scoreForm && (
        <button style={{ ...S.btnGreen, width:"100%", marginTop:12 }} onClick={() => setScoreForm(true)}>📊 Partita finita — Inserisci Risultato</button>
      )}
      {user.isAdmin && scoreForm && (
        <div style={{ marginTop:12,background:"#081808",borderRadius:12,padding:12,border:"1px solid #1e3a1e" }}>
          <div style={{ color:"#b5f23d",fontWeight:800,fontSize:13,marginBottom:10,textAlign:"center" }}>Risultato Finale</div>
          <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:20 }}>
            <ScoreInput label={pn(match.cap1)} color="#4fc3f7" val={s1} set={setS1} />
            <span style={{ color:"#4a7a3a",fontWeight:900,fontSize:18 }}>:</span>
            <ScoreInput label={pn(match.cap2)} color="#ff8a65" val={s2} set={setS2} />
          </div>
          <button style={{ ...S.btnGreen, width:"100%", marginTop:12 }} onClick={openVoting}>✅ Conferma e Apri Votazioni</button>
          <button style={{ ...S.btnGhost, width:"100%", marginTop:6 }} onClick={() => setScoreForm(false)}>Annulla</button>
        </div>
      )}
    </div>
  );
}
