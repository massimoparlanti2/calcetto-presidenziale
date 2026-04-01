import { S } from "../styles";

export function Header({ user, onLogout }) {
  return (
    <header style={S.header}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:24 }}>⚽</span>
        <div>
          <div style={{ fontSize:16,fontWeight:900,letterSpacing:3,color:"#b5f23d" }}>CALCETTO PRES.</div>
          <div style={{ fontSize:10,color:"#7a9e5a" }}>{user.isAdmin ? "👑 Admin" : `👤 ${user.name}`}</div>
        </div>
      </div>
      <button
        style={{ background:"transparent",border:"1px solid #3a2a2a",color:"#8a5a5a",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit" }}
        onClick={onLogout}
      >
        Esci
      </button>
    </header>
  );
}

export function Nav({ tab, setTab }) {
  const items = [
    { id:"home",    e:"🏠", l:"Home"       },
    { id:"rank",    e:"🏆", l:"Classifica" },
    { id:"games",   e:"📅", l:"Partite"    },
    { id:"players", e:"👥", l:"Giocatori"  },
    { id:"history", e:"📋", l:"Storico"    },
  ];
  return (
    <nav style={S.nav}>
      {items.map(({ id, e, l }) => (
        <button key={id} onClick={() => setTab(id)}
          style={{ ...S.navBtn, ...(tab === id ? { background:"#b5f23d18" } : {}) }}>
          <span style={{ fontSize:20 }}>{e}</span>
          <span style={{ fontSize:9,textTransform:"uppercase",letterSpacing:0.5,color:tab===id?"#b5f23d":"#3a6a2a" }}>{l}</span>
        </button>
      ))}
    </nav>
  );
}
