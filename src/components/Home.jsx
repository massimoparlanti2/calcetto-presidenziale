import { S } from "../styles";
import { Sec } from "./UI";
import { UpcomingCard } from "./UpcomingCard";
import { VotingCard } from "./VotingCard";
import { fmt } from "../lib/utils";

export function Home({ players, matches, getMatches, user, saveMatches, refresh, setTab }) {
  const pn = id => players.find(p => p.id === id)?.name || "?";

  const upcoming = [...matches]
    .filter(m => ["scheduled","draft","ready"].includes(m.status))
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0];

  const voting = matches.find(m => m.status === "voting");

  const recent = [...matches]
    .filter(m => m.status === "completed")
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
    .slice(0, 3);

  return (
    <div style={S.page}>
      {upcoming && (
        <UpcomingCard
          match={upcoming} pn={pn} user={user} players={players}
          getMatches={getMatches} saveMatches={saveMatches} refresh={refresh}
        />
      )}
      {voting && (
        <VotingCard
          match={voting} pn={pn} user={user} players={players}
          getMatches={getMatches} saveMatches={saveMatches} refresh={refresh}
        />
      )}
      {!upcoming && !voting && (
        <div style={{ textAlign:"center", padding:"50px 16px" }}>
          <div style={{ fontSize:52 }}>⚽</div>
          <div style={{ fontSize:20,fontWeight:900,color:"#b5f23d",letterSpacing:3,marginTop:10 }}>NESSUNA PARTITA</div>
          <div style={{ color:"#4a7a3a",fontSize:13,marginTop:6 }}>
            {user.isAdmin ? 'Vai su "Partite" per crearne una!' : "L'admin programmerà la prossima partita."}
          </div>
        </div>
      )}
      {recent.length > 0 && (
        <div style={{ marginTop:20 }}>
          <Sec>Ultime Partite</Sec>
          {recent.map(m => (
            <div key={m.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:10,padding:"10px 14px",marginBottom:8 }}>
              <span style={{ color:"#4fc3f7",fontWeight:700,fontSize:13 }}>{pn(m.cap1)}</span>
              <span style={{ fontWeight:900,color:"#b5f23d",fontSize:18 }}>{m.score1}:{m.score2}</span>
              <span style={{ color:"#ff8a65",fontWeight:700,fontSize:13 }}>{pn(m.cap2)}</span>
              <span style={{ color:"#3a6a2a",fontSize:11 }}>{fmt(m.scheduledDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
