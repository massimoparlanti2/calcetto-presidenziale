import { SC, SL } from "../lib/utils";
import { CSS, S } from "../styles";

export function Av({ children, sm }) {
  return (
    <div style={{ width:sm?28:36,height:sm?28:36,borderRadius:"50%",background:"linear-gradient(135deg,#2d5a1e,#b5f23d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sm?12:16,fontWeight:900,color:"#0a160a",flexShrink:0 }}>
      {children}
    </div>
  );
}

export function Badge({ status }) {
  return (
    <span style={{ fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:6,letterSpacing:0.5,textTransform:"uppercase",background:SC[status]+"30",color:SC[status] }}>
      {SL[status]}
    </span>
  );
}

export function MiniTeam({ color, name, members }) {
  return (
    <div style={{ textAlign:"center",minWidth:90 }}>
      <div style={{ color,fontWeight:800,fontSize:12,marginBottom:3 }}>{name}</div>
      {members.map((n, i) => <div key={i} style={{ fontSize:11,color:"#7a9e5a" }}>{n}</div>)}
    </div>
  );
}

export function Sec({ children }) {
  return (
    <div style={{ fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:6 }}>
      {children}
    </div>
  );
}

export function Lbl({ children }) {
  return (
    <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:12,color:"#7a9e5a",marginBottom:10,letterSpacing:0.5 }}>
      {children}
    </label>
  );
}

export function Loader() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a160a" }}>
      <style>{CSS}</style>
      <div className="spin" style={{ width:40,height:40,border:"3px solid #1e3a1e",borderTop:"3px solid #b5f23d",borderRadius:"50%" }} />
    </div>
  );
}

export function ScoreInput({ label, color, val, set }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ color,fontWeight:800,fontSize:11,marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <button style={S.scBtn} onClick={() => set(v => Math.max(0, v - 1))}>−</button>
        <span style={{ fontSize:38,fontWeight:900,minWidth:40,textAlign:"center" }}>{val}</span>
        <button style={S.scBtn} onClick={() => set(v => v + 1)}>+</button>
      </div>
    </div>
  );
}
