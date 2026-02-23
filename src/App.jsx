import { useState, useEffect, useRef } from "react";

// ─── DB ───────────────────────────────────────────────────────────────────────
const DB = {
  async get(key, fb = null) {
    try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : fb; }
    catch { return fb; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
  },
};

// ABBA draft: turn % 4 → [A,B,B,A]
const abbaOwner = (t) => [0, 1, 1, 0][t % 4];

// Countdown
function useCountdown(iso) {
  const calc = () => {
    if (!iso) return null;
    const d = new Date(iso) - Date.now();
    if (d <= 0) return null;
    const s = Math.floor(d / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [iso]);
  return t;
}

const SL = { scheduled: "Programmata", draft: "Draft 🏀", ready: "Pronta ✅", voting: "Votazioni 📊", completed: "Completata 🏆" };
const SC = { scheduled: "#7a9e5a", draft: "#ffd54f", ready: "#4fc3f7", voting: "#ff8a65", completed: "#b5f23d" };

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");

  const refresh = async () => {
    const [p, m] = await Promise.all([DB.get("cp_players", []), DB.get("cp_matches", [])]);
    setPlayers(p); setMatches(m);
  };

  useEffect(() => { refresh().then(() => setLoading(false)); }, []);

  const savePlayers = async (p) => { await DB.set("cp_players", p); setPlayers(p); };

  if (loading) return <Loader />;
  if (!user) return <Login players={players} onLogin={setUser} />;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <Header user={user} onLogout={() => { setUser(null); setTab("home"); }} />
      <main style={S.main}>
        {tab === "home"    && <Home    players={players} matches={matches} user={user} refresh={refresh} setTab={setTab} />}
        {tab === "rank"    && <Rank    players={players} matches={matches} />}
        {tab === "games"   && <Games   players={players} matches={matches} user={user} refresh={refresh} setTab={setTab} />}
        {tab === "players" && <Players players={players} savePlayers={savePlayers} user={user} />}
        {tab === "history" && <History players={players} matches={matches} user={user} refresh={refresh} />}
      </main>
      <Nav tab={tab} setTab={setTab} />
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ players, onLogin }) {
  const [sel, setSel] = useState(null); // null | playerObj | "admin"
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { if (sel) setTimeout(() => inputRef.current?.focus(), 80); }, [sel]);

  const tryLogin = async () => {
    if (sel === "admin") {
      const stored = await DB.get("cp_admin_pin", "1234");
      if (pin === stored) onLogin({ id: "admin", name: "Admin", isAdmin: true });
      else { setErr("PIN errato ❌"); setPin(""); }
    } else {
      const stored = await DB.get(`cp_pin_${sel.id}`, "");
      if (stored === "" || pin === stored) onLogin({ ...sel, isAdmin: false });
      else { setErr("Password errata ❌"); setPin(""); }
    }
  };

  if (sel) return (
    <div style={S.loginBg}>
      <style>{CSS}</style>
      <div style={S.loginCard}>
        <div style={S.loginBall}>⚽</div>
        <div style={S.loginTitle}>CALCETTO PRES.</div>
        <div style={{ marginTop: 16, marginBottom: 6, display: "flex", alignItems: "center", gap: 10, background: "#0f220f", borderRadius: 12, padding: "10px 14px", border: "1px solid #2d5a1e" }}>
          <Av>{sel === "admin" ? "A" : sel.name[0].toUpperCase()}</Av>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{sel === "admin" ? "Amministratore" : sel.name}</span>
        </div>
        <input ref={inputRef} type="password" style={{ ...S.inp, marginTop: 8 }} placeholder="Password…"
          value={pin} onChange={e => { setPin(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && tryLogin()} />
        {err && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>{err}</p>}
        {sel !== "admin" && <p style={{ color: "#3a6a2a", fontSize: 11, marginTop: 2 }}>Password vuota? Lascia il campo vuoto e premi Entra.</p>}
        <button style={{ ...S.btnGreen, width: "100%", marginTop: 8 }} onClick={tryLogin}>Entra</button>
        <button style={{ ...S.btnGhost, width: "100%", marginTop: 6 }} onClick={() => { setSel(null); setPin(""); setErr(""); }}>← Indietro</button>
      </div>
    </div>
  );

  return (
    <div style={S.loginBg}>
      <style>{CSS}</style>
      <div style={S.loginCard}>
        <div style={S.loginBall}>⚽</div>
        <div style={S.loginTitle}>CALCETTO PRES.</div>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#4a7a3a", marginTop: -4, marginBottom: 14 }}>PRESIDENZIALE</div>
        <p style={{ color: "#7a9e5a", fontSize: 14, marginBottom: 8 }}>Chi sei?</p>
        {players.length === 0
          ? <p style={{ color: "#3a6a2a", fontSize: 13, textAlign: "center" }}>Nessun giocatore — entra come Admin per aggiungerne.</p>
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
            {players.map(p => (
              <button key={p.id} className="hov" style={S.loginPlayerBtn} onClick={() => setSel(p)}>
                <Av>{p.name[0].toUpperCase()}</Av>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
              </button>
            ))}
          </div>
        }
        <button style={{ ...S.btnAdmin, marginTop: 12 }} onClick={() => setSel("admin")}>🔑 Admin</button>
      </div>
    </div>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────────
function Header({ user, onLogout }) {
  return (
    <header style={S.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>⚽</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 3, color: "#b5f23d" }}>CALCETTO PRES.</div>
          <div style={{ fontSize: 10, color: "#7a9e5a" }}>{user.isAdmin ? "👑 Admin" : `👤 ${user.name}`}</div>
        </div>
      </div>
      <button style={{ background: "transparent", border: "1px solid #3a2a2a", color: "#8a5a5a", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }} onClick={onLogout}>Esci</button>
    </header>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────────
function Home({ players, matches, user, refresh, setTab }) {
  const pn = id => players.find(p => p.id === id)?.name || "?";
  const upcoming = [...matches].filter(m => ["scheduled","draft","ready"].includes(m.status)).sort((a,b) => new Date(a.scheduledDate)-new Date(b.scheduledDate))[0];
  const voting = matches.find(m => m.status === "voting");
  const recent = [...matches].filter(m => m.status === "completed").sort((a,b) => new Date(b.scheduledDate)-new Date(a.scheduledDate)).slice(0,3);

  return (
    <div style={S.page}>
      {upcoming && <UpcomingCard match={upcoming} pn={pn} user={user} players={players} refresh={refresh} />}
      {voting   && <VotingCard   match={voting}   pn={pn} user={user} players={players} refresh={refresh} />}
      {!upcoming && !voting && (
        <div style={{ textAlign: "center", padding: "50px 16px" }}>
          <div style={{ fontSize: 52 }}>⚽</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#b5f23d", letterSpacing: 3, marginTop: 10 }}>NESSUNA PARTITA</div>
          <div style={{ color: "#4a7a3a", fontSize: 13, marginTop: 6 }}>{user.isAdmin ? 'Vai su "Partite" per crearne una!' : "L'admin programmerà la prossima partita."}</div>
        </div>
      )}
      {recent.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Sec>Ultime Partite</Sec>
          {recent.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f220f", border: "1px solid #1e3a1e", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ color: "#4fc3f7", fontWeight: 700, fontSize: 13 }}>{pn(m.cap1)}</span>
              <span style={{ fontWeight: 900, color: "#b5f23d", fontSize: 18 }}>{m.score1}:{m.score2}</span>
              <span style={{ color: "#ff8a65", fontWeight: 700, fontSize: 13 }}>{pn(m.cap2)}</span>
              <span style={{ color: "#3a6a2a", fontSize: 11 }}>{fmt(m.scheduledDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── UPCOMING CARD ─────────────────────────────────────────────────────────────
function UpcomingCard({ match, pn, user, players, refresh }) {
  const [scoreForm, setScoreForm] = useState(false);
  const [s1, setS1] = useState(0); const [s2, setS2] = useState(0);
  const cd = useCountdown(match.scheduledDate);

  const startDraft = async () => {
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id === match.id ? { ...m, status: "draft", draftTurn: 0 } : m));
    refresh();
  };

  const openVoting = async () => {
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id === match.id ? { ...m, status: "voting", score1: s1, score2: s2 } : m));
    refresh();
  };

  return (
    <div style={S.cdCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#7a9e5a", letterSpacing: 3, textTransform: "uppercase" }}>{cd ? "⏱ Prossima" : "📅 In programma"}</span>
        <Badge status={match.status} />
      </div>
      <div style={{ color: "#b5f23d", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
        {new Date(match.scheduledDate).toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "long" })} — {new Date(match.scheduledDate).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
      </div>
      {cd && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          {[["d",cd.d],["h",cd.h],["m",cd.m],["s",cd.s]].map(([l,v]) => (
            <div key={l} style={S.cdUnit}>
              <span style={S.cdNum}>{String(v).padStart(2,"0")}</span>
              <span style={S.cdLbl}>{l}</span>
            </div>
          ))}
        </div>
      )}
      {match.team1?.length > 1 && match.status !== "draft" && (
        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #1e3a1e", paddingTop: 10, marginTop: 6 }}>
          <MiniTeam color="#4fc3f7" name={pn(match.cap1)} members={match.team1.map(pn)} />
          <span style={{ color: "#3a6a2a", fontWeight: 900, alignSelf: "center" }}>VS</span>
          <MiniTeam color="#ff8a65" name={pn(match.cap2)} members={match.team2.map(pn)} />
        </div>
      )}
      {match.status === "draft" && <DraftPanel match={match} players={players} pn={pn} user={user} refresh={refresh} />}
      {user.isAdmin && match.status === "scheduled" && (
        <button style={{ ...S.btnGreen, width: "100%", marginTop: 12 }} onClick={startDraft}>🏀 Inizia Draft ABBA</button>
      )}
      {user.isAdmin && match.status === "ready" && !scoreForm && (
        <button style={{ ...S.btnGreen, width: "100%", marginTop: 12 }} onClick={() => setScoreForm(true)}>📊 Partita finita — Inserisci Risultato</button>
      )}
      {user.isAdmin && scoreForm && (
        <div style={{ marginTop: 12, background: "#081808", borderRadius: 12, padding: 12, border: "1px solid #1e3a1e" }}>
          <div style={{ color: "#b5f23d", fontWeight: 800, fontSize: 13, marginBottom: 10, textAlign: "center" }}>Risultato Finale</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
            <ScoreInput label={pn(match.cap1)} color="#4fc3f7" val={s1} set={setS1} />
            <span style={{ color: "#4a7a3a", fontWeight: 900, fontSize: 18 }}>:</span>
            <ScoreInput label={pn(match.cap2)} color="#ff8a65" val={s2} set={setS2} />
          </div>
          <button style={{ ...S.btnGreen, width: "100%", marginTop: 12 }} onClick={openVoting}>✅ Conferma e Apri Votazioni</button>
          <button style={{ ...S.btnGhost, width: "100%", marginTop: 6 }} onClick={() => setScoreForm(false)}>Annulla</button>
        </div>
      )}
    </div>
  );
}

function ScoreInput({ label, color, val, set }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color, fontWeight: 800, fontSize: 11, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={S.scBtn} onClick={() => set(v => Math.max(0, v - 1))}>−</button>
        <span style={{ fontSize: 38, fontWeight: 900, minWidth: 40, textAlign: "center" }}>{val}</span>
        <button style={S.scBtn} onClick={() => set(v => v + 1)}>+</button>
      </div>
    </div>
  );
}

// ─── DRAFT PANEL ───────────────────────────────────────────────────────────────
function DraftPanel({ match, players, pn, user, refresh }) {
  const [lm, setLm] = useState(match);
  useEffect(() => setLm(match), [JSON.stringify(match)]);

  const picked = [...(lm.team1||[]), ...(lm.team2||[])];
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
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id === lm.id ? next : m));
    refresh();
  };

  const done = async () => {
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id === lm.id ? { ...m, status: "ready" } : m));
    refresh();
  };

  const nxt = [turn,turn+1,turn+2,turn+3].map(t => abbaOwner(t)===0?"A":"B").join("→");

  return (
    <div style={{ background: "#06140a", border: "1px solid #1a3a1a", borderRadius: 12, padding: 12, marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ color: "#4fc3f7", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>🔵 {pn(lm.cap1)}</div>
          {(lm.team1||[]).map(id => <div key={id} style={{ fontSize: 12, color: "#9ab87a" }}>{pn(id)}</div>)}
        </div>
        <div>
          <div style={{ color: "#ff8a65", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>🟠 {pn(lm.cap2)}</div>
          {(lm.team2||[]).map(id => <div key={id} style={{ fontSize: 12, color: "#9ab87a" }}>{pn(id)}</div>)}
        </div>
      </div>
      {avail.length > 0 ? (
        <>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ color: pickerColor, fontWeight: 800 }}>{pickerName}</span>
            <span style={{ color: "#7a9e5a" }}> sceglie (turno #{turn+1})</span>
            <div style={{ color: "#3a6a2a", fontSize: 10, letterSpacing: 1, marginTop: 2 }}>ABBA: {nxt}</div>
          </div>
          {isMyTurn ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {avail.map(p => (
                <button key={p.id} className="hov" onClick={() => pick(p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f220f", border: `1px solid ${pickerColor}44`, borderRadius: 10, padding: "10px", cursor: "pointer", color: "#e8f5e2", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                  <Av sm>{p.name[0]}</Av>{p.name}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ color: "#3a6a2a", textAlign: "center", fontSize: 13, padding: "8px 0" }}>Attendi il tuo turno…</div>
          )}
        </>
      ) : (
        user.isAdmin && <button style={{ ...S.btnGreen, width: "100%" }} onClick={done}>✅ Conferma Squadre</button>
      )}
    </div>
  );
}

// ─── VOTING CARD ───────────────────────────────────────────────────────────────
function VotingCard({ match, pn, user, players, refresh }) {
  // Each player submits: own goals, own assists, + votes for all others
  // Admin just closes voting
  const [votes, setVotes] = useState({});       // { [otherId]: 1-10 }
  const [myGoals, setMyGoals] = useState(0);
  const [myAssists, setMyAssists] = useState(0);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [votersCount, setVotersCount] = useState(0);
  const allIds = [...(match.team1||[]), ...(match.team2||[])];

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
      const vs = Object.entries(allVotes).filter(([vid]) => vid !== pid).map(([, v]) => v.votes?.[pid]).filter(v => v != null);
      const avg = vs.length ? vs.reduce((x, y) => x + y, 0) / vs.length : 0;
      finalStats[pid] = { goals: g, assists: a, voto: avg };
    }
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id === match.id ? { ...m, status: "completed", stats: finalStats } : m));
    refresh();
  };

  if (!ready) return null;

  if (user.id !== "admin" && done) return (
    <div style={{ ...S.votingCard, textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 30 }}>✅</div>
      <div style={{ color: "#b5f23d", fontWeight: 800, fontSize: 15 }}>Voto inviato!</div>
      <div style={{ color: "#4a7a3a", fontSize: 12, marginTop: 4 }}>{votersCount} / {allIds.length} giocatori hanno votato</div>
    </div>
  );

  return (
    <div style={S.votingCard}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "#ffd54f", marginBottom: 2 }}>📊 Votazioni in corso</div>
      <div style={{ color: "#9ab87a", fontSize: 13, marginBottom: 12 }}>
        {pn(match.cap1)} <span style={{ color: "#b5f23d", fontWeight: 900 }}>{match.score1}:{match.score2}</span> {pn(match.cap2)}
        <span style={{ color: "#3a6a2a", fontSize: 11, marginLeft: 8 }}>({votersCount}/{allIds.length} votato)</span>
      </div>

      {user.id !== "admin" && (
        <>
          {/* Own stats */}
          <Sec>I tuoi goal e assist</Sec>
          <div style={{ display: "flex", gap: 20, marginBottom: 14, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#7a9e5a" }}>⚽ Goal</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={S.scBtn} onClick={() => setMyGoals(v => Math.max(0, v-1))}>−</button>
                <span style={{ fontWeight: 900, fontSize: 22, minWidth: 24, textAlign: "center" }}>{myGoals}</span>
                <button style={S.scBtn} onClick={() => setMyGoals(v => v+1)}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#7a9e5a" }}>🅰️ Assist</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={S.scBtn} onClick={() => setMyAssists(v => Math.max(0, v-1))}>−</button>
                <span style={{ fontWeight: 900, fontSize: 22, minWidth: 24, textAlign: "center" }}>{myAssists}</span>
                <button style={S.scBtn} onClick={() => setMyAssists(v => v+1)}>+</button>
              </div>
            </div>
          </div>

          {/* Vote others */}
          <Sec>Vota i tuoi compagni (1–5)</Sec>
          {allIds.filter(id => id !== user.id).map(pid => (
            <div key={pid} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{pn(pid)}</div>
              <div style={{ display: "flex", gap: 3 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setVotes(v => ({ ...v, [pid]: n }))}
                    style={{ flex: 1, height: 30, borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 11, transition: "all 0.1s",
                      background: (votes[pid]||0) >= n ? "#b5f23d" : "#1a3a1a",
                      color: (votes[pid]||0) >= n ? "#0a160a" : "#4a7a3a" }}>
                    {n}
                  </button>
                ))}
              </div>
              {votes[pid] && <div style={{ textAlign: "right", color: "#b5f23d", fontSize: 11, marginTop: 2 }}>⭐ {votes[pid]}/10</div>}
            </div>
          ))}
          <button style={{ ...S.btnGreen, width: "100%", marginTop: 4 }} onClick={submitPlayer}>✅ Invia Voto</button>
        </>
      )}

      {user.isAdmin && (
        <>
          <div style={{ color: "#7a9e5a", fontSize: 13, marginBottom: 12 }}>
            Aspetta che tutti i giocatori votino, poi chiudi le votazioni per salvare i risultati.
          </div>
          <div style={{ marginBottom: 12 }}>
            {allIds.map(pid => {
              const hasVoted = false; // we'd need to async-check but keep it simple
              return null;
            })}
          </div>
          <button style={{ ...S.btnGreen, width: "100%" }} onClick={closeVoting}>🏆 Chiudi Votazioni & Salva</button>
        </>
      )}
    </div>
  );
}

// ─── GAMES (Partite) ───────────────────────────────────────────────────────────
function Games({ players, matches, user, refresh, setTab }) {
  const [form, setForm] = useState({ date: "", time: "", cap1: "", cap2: "" });
  const [show, setShow] = useState(false);
  const pn = id => players.find(p => p.id === id)?.name || "?";

  const create = async () => {
    if (!form.date || !form.time) return alert("Inserisci data e ora!");
    if (!form.cap1 || !form.cap2) return alert("Scegli entrambi i capitani!");
    if (form.cap1 === form.cap2) return alert("I capitani devono essere diversi!");
    const m = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      scheduledDate: new Date(`${form.date}T${form.time}`).toISOString(),
      cap1: form.cap1, cap2: form.cap2,
      team1: [form.cap1], team2: [form.cap2],
      status: "scheduled", draftTurn: 0,
      score1: 0, score2: 0, stats: {},
    };
    // Read fresh from DB, append, write back
    const all = await DB.get("cp_matches", []);
    const updated = [...all, m];
    await DB.set("cp_matches", updated);
    setForm({ date: "", time: "", cap1: "", cap2: "" });
    setShow(false);
    await refresh();
    setTab("home");
  };

  const upcoming = [...matches]
    .filter(m => ["scheduled","draft","ready","voting"].includes(m.status))
    .sort((a,b) => new Date(a.scheduledDate)-new Date(b.scheduledDate));

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>📅 Partite</h2>
      {user.isAdmin && !show && (
        <button style={{ ...S.btnGreen, marginBottom: 16 }} onClick={() => setShow(true)}>+ Nuova Partita</button>
      )}
      {show && (
        <div style={{ background: "#0f220f", border: "1px solid #2d5a1e", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 900, color: "#b5f23d", fontSize: 16, marginBottom: 12 }}>⚽ Nuova Partita</div>
          <Lbl>Data <input type="date" style={S.inp} value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></Lbl>
          <Lbl>Ora  <input type="time" style={S.inp} value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} /></Lbl>
          <Lbl>Capitano 🔵
            <select style={S.inp} value={form.cap1} onChange={e => setForm(f=>({...f,cap1:e.target.value}))}>
              <option value="">— scegli —</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <Lbl>Capitano 🟠
            <select style={S.inp} value={form.cap2} onChange={e => setForm(f=>({...f,cap2:e.target.value}))}>
              <option value="">— scegli —</option>
              {players.filter(p=>p.id!==form.cap1).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Lbl>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button style={{ ...S.btnGreen, flex: 1 }} onClick={create}>Crea ✓</button>
            <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => { setShow(false); setForm({ date:"",time:"",cap1:"",cap2:"" }); }}>Annulla</button>
          </div>
        </div>
      )}
      {upcoming.length === 0 && !show && (
        <div style={{ color: "#3a6a2a", textAlign: "center", padding: 40, fontSize: 14 }}>
          {user.isAdmin ? "Crea la prima partita!" : "Nessuna partita programmata."}
        </div>
      )}
      {upcoming.map(m => (
        <div key={m.id} style={{ background: "#0f220f", border: "1px solid #1e3a1e", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#4a7a3a" }}>{new Date(m.scheduledDate).toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"short"})} {new Date(m.scheduledDate).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</span>
            <Badge status={m.status} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, fontWeight: 700, fontSize: 14 }}>
            <span style={{ color: "#4fc3f7" }}>{pn(m.cap1)}</span>
            <span style={{ color: "#3a6a2a" }}>VS</span>
            <span style={{ color: "#ff8a65" }}>{pn(m.cap2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RANK ──────────────────────────────────────────────────────────────────────
function Rank({ players, matches }) {
  const stats = players.map(p => {
    let g=0,a=0,vs=0,vc=0,pt=0,w=0;
    for (const m of matches) {
      if (m.status!=="completed") continue;
      const in1=(m.team1||[]).includes(p.id), in2=(m.team2||[]).includes(p.id);
      if (!in1&&!in2) continue;
      pt++; if ((in1&&m.score1>m.score2)||(in2&&m.score2>m.score1)) w++;
      const s=m.stats?.[p.id]||{};
      g+=s.goals||0; a+=s.assists||0;
      if (s.voto){vs+=s.voto;vc++;}
    }
    const vm=vc?vs/vc:0;
    return { ...p, goals:g, assists:a, vm, partite:pt, wins:w, pts:g*3+a+vm*0.5+w*2 };
  }).sort((a,b)=>b.pts-a.pts);

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>🏆 Classifica</h2>
      <div style={{ fontSize: 11, color: "#3a6a2a", marginBottom: 10, fontStyle: "italic" }}>PTS = ⚽×3 + 🅰️×1 + ⭐×0.5 + Vittoria×2</div>
      {players.length === 0
        ? <div style={{ color: "#3a6a2a", textAlign: "center", padding: 40 }}>Aggiungi giocatori prima!</div>
        : <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1e3a1e" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#0f220f" }}>
            <thead><tr>
              {["#","Nome","PTS","⚽","🅰️","⭐","🏆","P"].map((h,i)=>(
                <th key={h} style={{ padding:"9px 5px",background:"#1a3d1a",color:"#7a9e5a",fontSize:10,textTransform:"uppercase",letterSpacing:1,textAlign:i===1?"left":"center" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {stats.map((s,i)=>(
                <tr key={s.id} style={{ borderBottom:"1px solid #1a3a1a",background:i===0?"#243412":i===1?"#1a2a10":i===2?"#16220e":"transparent" }}>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:14 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"#3a6a2a"}}>{i+1}</span>}</td>
                  <td style={{ padding:"9px 5px",fontWeight:700,fontSize:13 }}>{s.name}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:"#b5f23d",fontWeight:900,fontSize:15 }}>{s.pts.toFixed(1)}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:13 }}>{s.goals}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:13 }}>{s.assists}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:13 }}>{s.vm>0?s.vm.toFixed(1):"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:13 }}>{s.wins}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",fontSize:13 }}>{s.partite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

// ─── PLAYERS ───────────────────────────────────────────────────────────────────
function Players({ players, savePlayers, user }) {
  const [name, setName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showPinFor, setShowPinFor] = useState(null); // playerId or "admin"
  const [adminPin, setAdminPin] = useState("");
  const [showAdminPin, setShowAdminPin] = useState(false);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (players.find(p => p.name.toLowerCase()===n.toLowerCase())) return alert("Già presente!");
    savePlayers([...players, { id: `${Date.now()}_${Math.random().toString(36).slice(2,5)}`, name: n }]);
    setName("");
  };

  const remove = (id) => { if (window.confirm("Rimuovere?")) savePlayers(players.filter(p=>p.id!==id)); };

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

  // Non-admin: can only change own password
  if (!user.isAdmin) return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>👤 Il Mio Profilo</h2>
      <div style={{ background: "#0f220f", border: "1px solid #1e3a1e", borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Av>{user.name[0].toUpperCase()}</Av>
          <span style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</span>
        </div>
        <Sec>Cambia Password</Sec>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input type="password" style={{ ...S.inp, flex: 1 }} placeholder="Nuova password…" value={newPin} onChange={e=>setNewPin(e.target.value)} />
          <button style={S.btnGreen} onClick={() => savePlayerPin(user.id)}>Salva</button>
        </div>
        <p style={{ color: "#3a6a2a", fontSize: 11, marginTop: 6 }}>Lascia vuoto per accesso senza password.</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <Sec>Tutti i Giocatori</Sec>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {players.map(p=>(
            <div key={p.id} style={{ background: "#0f220f", border: `1px solid ${p.id===user.id?"#b5f23d":"#1e3a1e"}`, borderRadius: 12, padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Av>{p.name[0].toUpperCase()}</Av>
              <span style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>👥 Giocatori</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input style={S.inp} placeholder="Nome giocatore…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <button style={S.btnGreen} onClick={add}>+ Aggiungi</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {players.map(p=>(
          <div key={p.id} style={{ background: "#0f220f", border: "1px solid #1e3a1e", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Av>{p.name[0].toUpperCase()}</Av>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{p.name}</span>
              <button style={{ background: "transparent", border: "1px solid #2d5a1e", borderRadius: 8, padding: "5px 8px", color: "#7a9e5a", cursor: "pointer", fontSize: 12 }}
                onClick={() => setShowPinFor(showPinFor===p.id?null:p.id)}>🔑</button>
              <button style={{ background: "transparent", border: "1px solid #5a1a1a", borderRadius: 8, padding: "5px 8px", color: "#ff6b6b", cursor: "pointer" }}
                onClick={()=>remove(p.id)}>🗑</button>
            </div>
            {showPinFor===p.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input type="password" style={{ ...S.inp, flex: 1 }} placeholder="Nuova password…" value={newPin} onChange={e=>setNewPin(e.target.value)} />
                <button style={S.btnGreen} onClick={()=>savePlayerPin(p.id)}>Salva</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: "#100f0a", border: "1px solid #3a3a1a", borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 800, color: "#ffd54f", fontSize: 13, marginBottom: 8 }}>🔑 PIN Amministratore</div>
        {!showAdminPin
          ? <button style={S.btnGhost} onClick={()=>setShowAdminPin(true)}>Cambia PIN Admin</button>
          : <div style={{ display: "flex", gap: 8 }}>
            <input type="password" style={{ ...S.inp, flex: 1 }} placeholder="Nuovo PIN…" value={adminPin} onChange={e=>setAdminPin(e.target.value)} />
            <button style={S.btnGreen} onClick={saveAdminPin}>Salva</button>
          </div>
        }
        <div style={{ color: "#3a6a2a", fontSize: 11, marginTop: 6 }}>PIN default: 1234</div>
      </div>
    </div>
  );
}

// ─── HISTORY ───────────────────────────────────────────────────────────────────
function History({ players, matches, user, refresh }) {
  const [editing, setEditing] = useState(null); // match id
  const done = [...matches].filter(m=>m.status==="completed").sort((a,b)=>new Date(b.scheduledDate)-new Date(a.scheduledDate));
  const pn = id => players.find(p=>p.id===id)?.name||"?";

  const del = async (id) => {
    if (!window.confirm("Eliminare partita?")) return;
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.filter(m=>m.id!==id));
    refresh();
  };

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>📋 Storico</h2>
      {done.length===0 && <div style={{ color:"#3a6a2a",textAlign:"center",padding:40 }}>Nessuna partita completata.</div>}
      {done.map(m=>(
        <div key={m.id} style={{ background:"#0f220f",border:"1px solid #1e3a1e",borderRadius:14,padding:14,marginBottom:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <span style={{ fontSize:11,color:"#4a7a3a" }}>{new Date(m.scheduledDate).toLocaleDateString("it-IT",{weekday:"short",day:"2-digit",month:"long",year:"numeric"})}</span>
            <div style={{ display:"flex",gap:6 }}>
              {user.isAdmin && <button style={{ background:"transparent",border:"1px solid #2d5a1e",borderRadius:8,padding:"4px 8px",color:"#7a9e5a",cursor:"pointer",fontSize:12 }} onClick={()=>setEditing(editing===m.id?null:m.id)}>✏️ Modifica</button>}
              {user.isAdmin && <button style={{ background:"transparent",border:"1px solid #5a1a1a",borderRadius:8,padding:"4px 8px",color:"#ff6b6b",cursor:"pointer",fontSize:12 }} onClick={()=>del(m.id)}>🗑</button>}
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
            {[m.team1,m.team2].map((team,ti)=>(
              <div key={ti}>
                {(team||[]).map(id=>{
                  const st=m.stats?.[id]||{};
                  return (
                    <div key={id} style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0" }}>
                      <span>{pn(id)}</span>
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
          {editing===m.id && <EditMatchForm match={m} players={players} pn={pn} refresh={refresh} close={()=>setEditing(null)} />}
        </div>
      ))}
    </div>
  );
}

// ─── EDIT MATCH FORM ───────────────────────────────────────────────────────────
function EditMatchForm({ match, pn, refresh, close }) {
  const [s1, setS1] = useState(match.score1);
  const [s2, setS2] = useState(match.score2);
  const [stats, setStats] = useState(() => {
    const copy = {};
    const all = [...(match.team1||[]), ...(match.team2||[])];
    for (const id of all) copy[id] = { goals: match.stats?.[id]?.goals||0, assists: match.stats?.[id]?.assists||0, voto: match.stats?.[id]?.voto||0 };
    return copy;
  });
  const allIds = [...(match.team1||[]), ...(match.team2||[])];

  const setStat = (pid, field, val) => setStats(s => ({ ...s, [pid]: { ...s[pid], [field]: val } }));

  const save = async () => {
    const all = await DB.get("cp_matches", []);
    await DB.set("cp_matches", all.map(m => m.id===match.id ? { ...m, score1:s1, score2:s2, stats } : m));
    await refresh();
    close();
  };

  return (
    <div style={{ marginTop: 12, background: "#08180a", border: "1px solid #2d5a1e", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 800, color: "#b5f23d", fontSize: 14, marginBottom: 12 }}>✏️ Modifica Partita</div>
      <Sec>Risultato</Sec>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <ScoreInput label={pn(match.cap1)} color="#4fc3f7" val={s1} set={setS1} />
        <span style={{ color:"#4a7a3a",fontWeight:900,fontSize:18 }}>:</span>
        <ScoreInput label={pn(match.cap2)} color="#ff8a65" val={s2} set={setS2} />
      </div>
      <Sec>Statistiche Giocatori</Sec>
      <div style={{ marginTop: 8 }}>
        {[{ team: match.team1, cap: match.cap1, color: "#4fc3f7" }, { team: match.team2, cap: match.cap2, color: "#ff8a65" }].map(({ team, cap, color }) => (
          <div key={cap} style={{ marginBottom: 10 }}>
            <div style={{ color, fontWeight: 800, fontSize: 12, marginBottom: 6 }}>{pn(cap)}'s Team</div>
            {(team||[]).map(pid => (
              <div key={pid} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <span style={{ flex:1,fontSize:13,fontWeight:700 }}>{pn(pid)}</span>
                {[["⚽","goals"],["🅰️","assists"],["⭐","voto"]].map(([ico,field])=>(
                  <label key={field} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontSize:12,color:"#7a9e5a" }}>
                    {ico}
                    <input type="number" min="0" max={field==="voto"?10:undefined} step={field==="voto"?0.1:1}
                      style={S.numIn} value={stats[pid]?.[field]||0}
                      onChange={e=>setStat(pid,field,Math.max(0,parseFloat(e.target.value)||0))} />
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

// ─── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ tab, setTab }) {
  const items = [
    { id:"home",   e:"🏠", l:"Home"      },
    { id:"rank",   e:"🏆", l:"Classifica"},
    { id:"games",  e:"📅", l:"Partite"   },
    { id:"players",e:"👥", l:"Giocatori" },
    { id:"history",e:"📋", l:"Storico"   },
  ];
  return (
    <nav style={S.nav}>
      {items.map(({ id, e, l }) => (
        <button key={id} onClick={() => setTab(id)} style={{ ...S.navBtn, ...(tab===id?{background:"#b5f23d18"}:{}) }}>
          <span style={{ fontSize: 20 }}>{e}</span>
          <span style={{ fontSize:9,textTransform:"uppercase",letterSpacing:0.5,color:tab===id?"#b5f23d":"#3a6a2a" }}>{l}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── SMALL COMPONENTS ──────────────────────────────────────────────────────────
function Av({ children, sm }) {
  return <div style={{ width:sm?28:36,height:sm?28:36,borderRadius:"50%",background:"linear-gradient(135deg,#2d5a1e,#b5f23d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sm?12:16,fontWeight:900,color:"#0a160a",flexShrink:0 }}>{children}</div>;
}
function Badge({ status }) {
  return <span style={{ fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:6,letterSpacing:0.5,textTransform:"uppercase",background:SC[status]+"30",color:SC[status] }}>{SL[status]}</span>;
}
function MiniTeam({ color, name, members }) {
  return <div style={{ textAlign:"center",minWidth:90 }}>
    <div style={{ color,fontWeight:800,fontSize:12,marginBottom:3 }}>{name}</div>
    {members.map((n,i)=><div key={i} style={{ fontSize:11,color:"#7a9e5a" }}>{n}</div>)}
  </div>;
}
function Sec({ children }) {
  return <div style={{ fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:6 }}>{children}</div>;
}
function Lbl({ children }) {
  return <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:12,color:"#7a9e5a",marginBottom:10,letterSpacing:0.5 }}>{children}</label>;
}
function Loader() {
  return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a160a" }}>
    <style>{CSS}</style>
    <div className="spin" style={{ width:40,height:40,border:"3px solid #1e3a1e",borderTop:"3px solid #b5f23d",borderRadius:"50%" }} />
  </div>;
}
const fmt = iso => new Date(iso).toLocaleDateString("it-IT",{day:"2-digit",month:"short"});

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  root:      { display:"flex",flexDirection:"column",minHeight:"100vh",background:"#0a160a",color:"#e8f5e2",fontFamily:"'Barlow Condensed',sans-serif",maxWidth:500,margin:"0 auto" },
  main:      { flex:1,overflowY:"auto",paddingBottom:80 },
  page:      { padding:"18px 14px" },
  pageTitle: { fontSize:22,fontWeight:900,letterSpacing:3,textTransform:"uppercase",color:"#b5f23d",marginBottom:16 },
  loginBg:   { display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"radial-gradient(ellipse at 40% 30%,#0f2d0f,#0a160a 70%)" },
  loginCard: { background:"#0d1e0d",border:"1px solid #2d5a1e",borderRadius:20,padding:"32px 22px",maxWidth:360,width:"92%",display:"flex",flexDirection:"column",gap:10,alignItems:"center" },
  loginBall: { fontSize:54,filter:"drop-shadow(0 0 16px #b5f23d66)" },
  loginTitle:{ fontSize:28,fontWeight:900,letterSpacing:5,color:"#b5f23d" },
  loginPlayerBtn:{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"#0f220f",border:"1px solid #2d5a1e",borderRadius:12,padding:"14px 8px",cursor:"pointer",color:"#e8f5e2",fontFamily:"inherit" },
  btnAdmin:  { background:"transparent",border:"1px solid #3a5a2a",color:"#6a9a5a",borderRadius:10,padding:"10px 18px",cursor:"pointer",fontSize:13,fontFamily:"inherit" },
  header:    { background:"linear-gradient(135deg,#0d2d0d,#1a4a0f)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #b5f23d22" },
  nav:       { position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:"#060e06",borderTop:"1px solid #1a3a1a",display:"flex",justifyContent:"space-around",padding:"6px 0 10px",zIndex:100 },
  navBtn:    { display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,minWidth:48 },
  cdCard:    { background:"linear-gradient(135deg,#0f2d0f,#192e10)",border:"1px solid #2d5a1e",borderRadius:16,padding:16,marginBottom:16 },
  cdUnit:    { display:"flex",flexDirection:"column",alignItems:"center",background:"#081808",border:"1px solid #2a4a1a",borderRadius:10,padding:"7px 10px",minWidth:50 },
  cdNum:     { fontSize:26,fontWeight:900,color:"#b5f23d",lineHeight:1 },
  cdLbl:     { fontSize:9,color:"#4a7a3a",letterSpacing:1,textTransform:"uppercase" },
  votingCard:{ background:"#1a1a0a",border:"1px solid #3d3d1a",borderRadius:14,padding:14,marginBottom:16 },
  scBtn:     { width:34,height:34,borderRadius:"50%",background:"#1a3a1a",border:"1px solid #2d5a1e",color:"#b5f23d",fontSize:20,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit" },
  numIn:     { width:50,background:"#1a3a1a",border:"1px solid #2d5a1e",borderRadius:8,padding:"5px 4px",color:"#e8f5e2",fontSize:14,textAlign:"center",outline:"none",fontFamily:"inherit" },
  inp:       { background:"#0a160a",border:"1px solid #2d5a1e",borderRadius:10,padding:"10px 12px",color:"#e8f5e2",fontSize:14,outline:"none",fontFamily:"inherit",width:"100%" },
  btnGreen:  { display:"inline-flex",alignItems:"center",gap:6,background:"#b5f23d",color:"#0a160a",border:"none",borderRadius:10,padding:"11px 16px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.5 },
  btnGhost:  { background:"transparent",border:"1px solid #2d5a1e",color:"#7a9e5a",borderRadius:10,padding:"10px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  .hov:hover { opacity: 0.82; transform: scale(1.02); transition: all 0.15s; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #2d5a1e; border-radius: 2px; }
`;
