export const S = {
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

export const CSS = `
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
