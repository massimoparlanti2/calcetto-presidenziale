import { useState, useEffect, useRef } from "react";
import { DB } from "./lib/firebase";
import { S, CSS } from "./styles";
import { Loader } from "./components/UI";
import { Login } from "./components/Login";
import { Header, Nav } from "./components/Layout";
import { Home } from "./components/Home";
import { Rank } from "./components/Rank";
import { Games } from "./components/Games";
import { Players } from "./components/Players";
import { History } from "./components/History";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const matchesRef = useRef([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");

  const refresh = async () => {
    const [p, m] = await Promise.all([DB.get("cp_players", []), DB.get("cp_matches", [])]);
    setPlayers(p);
    setMatches(m);
    matchesRef.current = m;
  };

  useEffect(() => { refresh().then(() => setLoading(false)); }, []);

  const savePlayers = async (p) => { await DB.set("cp_players", p); setPlayers(p); };

  const saveMatches = async (m) => {
    matchesRef.current = m;
    await DB.set("cp_matches", m);
    setMatches(m);
  };

  // Legge sempre dal ref — mai stale closure
  const getMatches = () => matchesRef.current;

  if (loading) return <Loader />;
  if (!user) return <Login players={players} onLogin={setUser} />;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <Header user={user} onLogout={() => { setUser(null); setTab("home"); }} />
      <main style={S.main}>
        {tab === "home"    && <Home    players={players} matches={matches} getMatches={getMatches} user={user} saveMatches={saveMatches} refresh={refresh} setTab={setTab} />}
        {tab === "rank"    && <Rank    players={players} matches={matches} />}
        {tab === "games"   && <Games   players={players} matches={matches} getMatches={getMatches} user={user} saveMatches={saveMatches} setTab={setTab} />}
        {tab === "players" && <Players players={players} savePlayers={savePlayers} user={user} />}
        {tab === "history" && <History players={players} matches={matches} getMatches={getMatches} user={user} saveMatches={saveMatches} refresh={refresh} />}
      </main>
      <Nav tab={tab} setTab={setTab} />
    </div>
  );
}
