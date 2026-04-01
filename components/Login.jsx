import { useState, useRef, useEffect } from "react";
import { DB } from "../lib/firebase";
import { S, CSS } from "../styles";
import { Av } from "./UI";

export function Login({ players, onLogin }) {
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
        <div style={{ marginTop:16,marginBottom:6,display:"flex",alignItems:"center",gap:10,background:"#0f220f",borderRadius:12,padding:"10px 14px",border:"1px solid #2d5a1e" }}>
          <Av>{sel === "admin" ? "A" : sel.name[0].toUpperCase()}</Av>
          <span style={{ fontWeight:800,fontSize:16 }}>{sel === "admin" ? "Amministratore" : sel.name}</span>
        </div>
        <input ref={inputRef} type="password" style={{ ...S.inp, marginTop:8 }} placeholder="Password…"
          value={pin} onChange={e => { setPin(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && tryLogin()} />
        {err && <p style={{ color:"#ff6b6b",fontSize:12,marginTop:4 }}>{err}</p>}
        {sel !== "admin" && <p style={{ color:"#3a6a2a",fontSize:11,marginTop:2 }}>Password vuota? Lascia il campo vuoto e premi Entra.</p>}
        <button style={{ ...S.btnGreen, width:"100%", marginTop:8 }} onClick={tryLogin}>Entra</button>
        <button style={{ ...S.btnGhost, width:"100%", marginTop:6 }} onClick={() => { setSel(null); setPin(""); setErr(""); }}>← Indietro</button>
      </div>
    </div>
  );

  return (
    <div style={S.loginBg}>
      <style>{CSS}</style>
      <div style={S.loginCard}>
        <div style={S.loginBall}>⚽</div>
        <div style={S.loginTitle}>CALCETTO PRES.</div>
        <div style={{ fontSize:11,letterSpacing:5,color:"#4a7a3a",marginTop:-4,marginBottom:14 }}>PRESIDENZIALE</div>
        <p style={{ color:"#7a9e5a",fontSize:14,marginBottom:8 }}>Chi sei?</p>
        {players.length === 0
          ? <p style={{ color:"#3a6a2a",fontSize:13,textAlign:"center" }}>Nessun giocatore — entra come Admin per aggiungerne.</p>
          : <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%" }}>
            {players.map(p => (
              <button key={p.id} className="hov" style={S.loginPlayerBtn} onClick={() => setSel(p)}>
                <Av>{p.name[0].toUpperCase()}</Av>
                <span style={{ fontWeight:700,fontSize:13 }}>{p.name}</span>
              </button>
            ))}
          </div>
        }
        <button style={{ ...S.btnAdmin, marginTop:12 }} onClick={() => setSel("admin")}>🔑 Admin</button>
      </div>
    </div>
  );
}
