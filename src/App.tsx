import { useState, useEffect, useRef } from "react"
import { Rocket, Trophy, Users, Zap, Flame } from "lucide-react"

interface Token {
  id: string; name: string; ticker: string; image: string; description: string
  price: number; priceChange: number; marketCap: number; volume: number
  holders: number; messages: Message[]; trades: Trade[]; creator: string
  createdAt: number; bondingProgress: number; replies: number
}
interface Message { user: string; text: string; time: number }
interface Trade { user: string; type: "buy" | "sell"; amount: number; price: number; time: number }
interface WalletState { connected: boolean; address: string; balance: number }

const TOKENS: Token[] = [
  { id:"1", name:"Pepe Initia", ticker:"PEPEI", image:"🐸", description:"The original meme frog, now on Initia with 100ms speed!", price:0.0000234, priceChange:142.5, marketCap:234000, volume:89000, holders:1243, bondingProgress:67, replies:89, creator:"init1fren...1234", createdAt:Date.now()-3600000, messages:[], trades:[] },
  { id:"2", name:"Wojak Finance", ticker:"WOJAK", image:"😔", description:"We're all gonna make it. Eventually.", price:0.0000089, priceChange:-12.3, marketCap:89000, volume:34000, holders:567, bondingProgress:23, replies:45, creator:"init1sad...5678", createdAt:Date.now()-7200000, messages:[], trades:[] },
  { id:"3", name:"Doge Initia", ticker:"DOGEI", image:"🐕", description:"Much fast. Very Initia. 100ms wow.", price:0.0001234, priceChange:89.2, marketCap:1234000, volume:456000, holders:4521, bondingProgress:89, replies:234, creator:"init1doge...9012", createdAt:Date.now()-1800000, messages:[], trades:[] },
  { id:"4", name:"Moon Cat", ticker:"MCAT", image:"🐱", description:"Cat go moon on Initia chain frens", price:0.0000456, priceChange:34.7, marketCap:456000, volume:123000, holders:2341, bondingProgress:45, replies:67, creator:"init1cat...3456", createdAt:Date.now()-900000, messages:[], trades:[] },
  { id:"5", name:"Bonk Initia", ticker:"BONKI", image:"🔨", description:"BONK BONK BONK on Initia. 100ms bonks.", price:0.0000012, priceChange:567.8, marketCap:12000, volume:8900, holders:234, bondingProgress:12, replies:12, creator:"init1bonk...7890", createdAt:Date.now()-300000, messages:[], trades:[] },
]

const rand = (t: Token): Token => {
  const d = (Math.random()-0.48)*0.015
  return { ...t, price: Math.max(t.price*(1+d), 0.0000001), priceChange: t.priceChange+(Math.random()-0.5)*1.5, volume: t.volume+Math.random()*500, marketCap: t.marketCap*(1+d), bondingProgress: Math.min(t.bondingProgress+Math.random()*0.05,100) }
}
const fmt = (n: number) => n>=1e6?(n/1e6).toFixed(2)+"M":n>=1000?(n/1000).toFixed(1)+"K":n.toFixed(0)
const ago = (ts: number) => { const s=Math.floor((Date.now()-ts)/1000); return s<60?s+"s":s<3600?Math.floor(s/60)+"m":Math.floor(s/3600)+"h" }
const short = (a: string) => a.slice(0,10)+"…"+a.slice(-4)

export default function App() {
  const [page, setPage] = useState<"feed"|"launch"|"token"|"board">("feed")
  const [tokens, setTokens] = useState<Token[]>(TOKENS)
  const [sel, setSel] = useState<Token|null>(null)
  const [wallet, setWallet] = useState<WalletState>({ connected:false, address:"", balance:0 })
  const [filter, setFilter] = useState<"hot"|"new"|"grad">("hot")
  const [amt, setAmt] = useState("0.1")
  const [chat, setChat] = useState("")
  const [notif, setNotif] = useState("")
  const [modal, setModal] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [form, setForm] = useState({ name:"", ticker:"", desc:"", prompt:"", img:"" })
  const [genImg, setGenImg] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => { setTokens(p=>p.map(rand)); setSel(p=>p?rand(p):null) }, 800)
    return ()=>clearInterval(t)
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0,chatRef.current.scrollHeight) }, [sel?.messages])

  const toast = (m: string) => { setNotif(m); setTimeout(()=>setNotif(""),3000) }

  async function socialLogin(p: string) {
    setModal(false)
    await new Promise(r=>setTimeout(r,600))
    const addr = "init1"+Math.random().toString(36).slice(2,12)+"x"
    setWallet({ connected:true, address:addr, balance:+(Math.random()*500+50).toFixed(2) })
    toast("Connected via "+p)
  }

  async function genImage() {
    if(!form.prompt) return
    setGenImg(true)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(form.prompt+" meme coin crypto")}&width=400&height=400&nologo=true`
    setForm(f=>({...f,img:url}))
    setGenImg(false)
  }

  async function launch() {
    if(!form.name||!form.ticker){toast("Fill name and ticker");return}
    setLaunching(true)
    await new Promise(r=>setTimeout(r,1200))
    const t: Token = { id:Date.now().toString(), name:form.name, ticker:form.ticker.toUpperCase(), image:form.img||"🚀", description:form.desc||"New meme on Initia", price:0.0000001, priceChange:0, marketCap:1000, volume:0, holders:1, bondingProgress:0.5, replies:0, creator:wallet.address||"anon", createdAt:Date.now(), messages:[], trades:[] }
    setTokens(p=>[t,...p])
    setLaunching(false)
    setForm({name:"",ticker:"",desc:"",prompt:"",img:""})
    toast("🚀 $"+t.ticker+" launched!")
    setPage("feed")
  }

  function trade(type: "buy"|"sell") {
    if(!sel) return
    const a = parseFloat(amt)||0.1
    const tr: Trade = { user:short(wallet.address||"init1anon...demo"), type, amount:a, price:sel.price, time:Date.now() }
    setSel(p=>p?{...p,trades:[tr,...p.trades.slice(0,19)],holders:p.holders+(type==="buy"?1:0),volume:p.volume+a*1000}:null)
    setWallet(w=>({...w,balance:+(w.balance+(type==="sell"?a*8:-a*8)).toFixed(2)}))
    toast((type==="buy"?"Bought":"Sold")+" "+a+" INIT of $"+sel.ticker)
  }

  function sendChat() {
    if(!chat.trim()||!sel) return
    const m: Message = { user:short(wallet.address||"init1anon...demo"), text:chat, time:Date.now() }
    setSel(p=>p?{...p,messages:[...p.messages,m],replies:p.replies+1}:null)
    setChat("")
  }

  const sorted = [...tokens].sort((a,b)=>filter==="new"?b.createdAt-a.createdAt:filter==="grad"?b.bondingProgress-a.bondingProgress:b.volume-a.volume)

  // ─── STYLES ───────────────────────────────────────────────────
  const C = {
    page: { minHeight:"100vh", background:"var(--bg)", paddingBottom:"64px" } as React.CSSProperties,
    header: { background:"rgba(8,12,20,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 16px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 },
    logo: { display:"flex", alignItems:"center", gap:"8px" },
    pill: (c:string,bg:string) => ({ background:bg, border:`1px solid ${c}40`, borderRadius:"4px", padding:"2px 7px", fontSize:"10px", fontWeight:700, color:c, letterSpacing:"0.5px", fontFamily:"var(--mono)" }),
    btn: (v:"g"|"r"|"ghost"|"dim") => ({
      background: v==="g"?"linear-gradient(135deg,#00ff88,#00cc6a)":v==="r"?"linear-gradient(135deg,#ff3366,#cc0033)":v==="ghost"?"transparent":"var(--bg2)",
      border: v==="ghost"?"1px solid var(--border2)":v==="dim"?"1px solid var(--border)":"none",
      borderRadius:"6px", color: v==="g"||v==="r"?"#000":"var(--text)", padding:"9px 16px", cursor:"pointer", fontWeight:700, fontSize:"12px", letterSpacing:"0.3px", fontFamily:"var(--sans)"
    }),
    card: { background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:"8px", padding:"14px", marginBottom:"6px" } as React.CSSProperties,
    input: { background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"6px", padding:"10px 13px", color:"var(--text)", fontSize:"13px", width:"100%", outline:"none", boxSizing:"border-box" as const, fontFamily:"var(--sans)" },
    nav: { position:"fixed" as const, bottom:0, left:0, right:0, background:"rgba(8,12,20,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid var(--border)", display:"flex", zIndex:100, height:"56px" },
    navBtn: (a:boolean) => ({ flex:1, background:"none", border:"none", color:a?"var(--green)":"var(--text3)", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:"3px", fontSize:"9px", fontWeight:a?700:500, letterSpacing:"0.5px", textTransform:"uppercase" as const }),
    mono: { fontFamily:"var(--mono)" } as React.CSSProperties,
  }

  return (
    <div style={C.page}>

      {/* ── MODAL ── */}
      {modal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div style={{ background:"var(--bg1)",border:"1px solid var(--border2)",borderRadius:"16px",padding:"32px 24px",width:"100%",maxWidth:"360px" }}>
            <div style={{ textAlign:"center",marginBottom:"28px" }}>
              <div style={{ fontSize:"11px",letterSpacing:"3px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"12px" }}>CONNECT WALLET</div>
              <div style={{ fontSize:"22px",fontWeight:700,color:"var(--text)" }}>Enter FrenBlitz</div>
              <div style={{ color:"var(--text3)",fontSize:"12px",marginTop:"6px" }}>Self-custodial · Non-custodial · Your keys</div>
            </div>
            {[{n:"Twitter / X",i:"𝕏",c:"#1d9bf0"},{n:"Google",i:"G",c:"#ea4335"},{n:"Discord",i:"⚡",c:"#5865f2"},{n:"Keplr",i:"🔑",c:"var(--green)"}].map(p=>(
              <button key={p.n} onClick={()=>socialLogin(p.n)} style={{ width:"100%",background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:"8px",padding:"13px 16px",color:"var(--text)",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",fontSize:"13px",fontWeight:600,marginBottom:"8px",fontFamily:"var(--sans)" }}>
                <span style={{ fontSize:"16px",width:"24px",textAlign:"center",color:p.c }}>{p.i}</span>
                Continue with {p.n}
              </button>
            ))}
            <button onClick={()=>setModal(false)} style={{ background:"none",border:"none",color:"var(--text3)",cursor:"pointer",width:"100%",marginTop:"8px",fontSize:"12px",fontFamily:"var(--sans)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {notif && (
        <div style={{ position:"fixed",top:"60px",left:"50%",transform:"translateX(-50%)",background:"var(--bg2)",border:"1px solid var(--green)40",borderRadius:"6px",padding:"8px 18px",zIndex:200,color:"var(--green)",fontWeight:600,fontSize:"12px",whiteSpace:"nowrap",fontFamily:"var(--mono)",letterSpacing:"0.3px" }}>
          {notif}
        </div>
      )}

      {/* ══════════════════ FEED ══════════════════ */}
      {page==="feed" && <>
        <div style={C.header}>
          <div style={C.logo}>
            <Zap size={16} color="var(--green)" />
            <span style={{ fontWeight:800,fontSize:"17px",letterSpacing:"-0.5px",color:"var(--text)" }}>FREN<span style={{ color:"var(--green)" }}>BLITZ</span></span>
            <span style={C.pill("var(--green)","rgba(0,255,136,0.08)")}>100MS</span>
          </div>
          <button style={C.btn(wallet.connected?"dim":"ghost")} onClick={()=>!wallet.connected&&setModal(true)}>
            {wallet.connected ? <span style={C.mono}>{short(wallet.address)}</span> : "Connect"}
          </button>
        </div>

        {/* Ticker bar */}
        <div style={{ background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"8px 16px",display:"flex",gap:"16px",overflowX:"auto",scrollbarWidth:"none" }}>
          {tokens.slice(0,5).map(t=>(
            <div key={t.id} style={{ display:"flex",alignItems:"center",gap:"6px",flexShrink:0,cursor:"pointer" }} onClick={()=>{setSel(t);setPage("token")}}>
              <span style={{ fontSize:"11px",fontWeight:700,color:"var(--text2)",fontFamily:"var(--mono)" }}>${t.ticker}</span>
              <span style={{ fontSize:"11px",fontWeight:700,color:t.priceChange>=0?"var(--green)":"var(--red)",fontFamily:"var(--mono)" }}>{t.priceChange>=0?"+":""}{t.priceChange.toFixed(1)}%</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex",gap:"6px",padding:"12px 16px 8px" }}>
          {(["hot","new","grad"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?"var(--bg3)":"transparent",border:`1px solid ${filter===f?"var(--border2)":"var(--border)"}`,borderRadius:"5px",padding:"5px 12px",color:filter===f?"var(--text)":"var(--text3)",cursor:"pointer",fontSize:"11px",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",fontFamily:"var(--sans)" }}>
              {f==="hot"?"🔥 Hot":f==="new"?"✦ New":"🎓 Grad"}
            </button>
          ))}
          <span style={{ marginLeft:"auto",fontSize:"11px",color:"var(--text3)",alignSelf:"center",fontFamily:"var(--mono)" }}>{tokens.length} coins</span>
        </div>

        {/* List */}
        <div style={{ padding:"0 12px" }}>
          {sorted.map((t,idx)=>(
            <div key={t.id} onClick={()=>{setSel(t);setPage("token")}} style={{ ...C.card,cursor:"pointer",position:"relative",overflow:"hidden" }}>
              {/* Glow on hot */}
              {t.priceChange>100&&<div style={{ position:"absolute",top:0,right:0,width:"3px",height:"100%",background:"linear-gradient(180deg,var(--green),transparent)" }}/>}
              <div style={{ display:"flex",gap:"12px",alignItems:"flex-start" }}>
                <div style={{ fontSize:"32px",lineHeight:1,flexShrink:0 }}>
                  {t.image.startsWith("http")?<img src={t.image} style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>:t.image}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px" }}>
                    <span style={{ fontWeight:700,fontSize:"14px",color:"var(--text)" }}>{t.name}</span>
                    <span style={C.pill("var(--text3)","transparent")}>${t.ticker}</span>
                    {t.priceChange>100&&<span style={C.pill("var(--green)","rgba(0,255,136,0.08)")}>🔥 HOT</span>}
                    {t.bondingProgress>80&&<span style={C.pill("var(--gold)","rgba(255,170,0,0.08)")}>⚡ SOON</span>}
                  </div>
                  <div style={{ color:"var(--text3)",fontSize:"11px",marginBottom:"8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.description}</div>
                  <div style={{ display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center" }}>
                    <span style={{ fontSize:"12px",color:t.priceChange>=0?"var(--green)":"var(--red)",fontWeight:700,fontFamily:"var(--mono)" }}>{t.priceChange>=0?"▲":"▼"}{Math.abs(t.priceChange).toFixed(1)}%</span>
                    <span style={{ fontSize:"11px",color:"var(--text3)",fontFamily:"var(--mono)" }}>MC ${fmt(t.marketCap)}</span>
                    <span style={{ fontSize:"11px",color:"var(--text3)",fontFamily:"var(--mono)" }}>V ${fmt(t.volume)}</span>
                    <span style={{ fontSize:"11px",color:"var(--text3)" }}>👥{fmt(t.holders)}</span>
                    <span style={{ fontSize:"11px",color:"var(--text3)" }}>💬{t.replies}</span>
                  </div>
                  <div style={{ marginTop:"8px" }}>
                    <div style={{ background:"var(--bg3)",borderRadius:"2px",height:"3px" }}>
                      <div style={{ background:t.bondingProgress>80?"linear-gradient(90deg,var(--gold),var(--red))":"linear-gradient(90deg,var(--green),var(--blue))",height:"3px",borderRadius:"2px",width:t.bondingProgress+"%",transition:"width 1s" }}/>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:"2px" }}>
                      <span style={{ fontSize:"10px",color:"var(--text3)" }}>bonding</span>
                      <span style={{ fontSize:"10px",color:t.bondingProgress>80?"var(--gold)":"var(--text3)",fontFamily:"var(--mono)" }}>{t.bondingProgress.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <div style={{ fontSize:"12px",fontWeight:700,color:"var(--text)",fontFamily:"var(--mono)" }}>${t.price.toFixed(8)}</div>
                  <div style={{ fontSize:"10px",color:"var(--text3)",marginTop:"4px",fontFamily:"var(--mono)" }}>{ago(t.createdAt)}</div>
                  <div style={{ fontSize:"10px",color:"var(--text3)",marginTop:"2px" }}>#{idx+1}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ══════════════════ TOKEN ══════════════════ */}
      {page==="token"&&sel&&<>
        <div style={C.header}>
          <button onClick={()=>setPage("feed")} style={{ background:"none",border:"none",color:"var(--text2)",cursor:"pointer",fontSize:"18px",padding:"4px 8px" }}>←</button>
          <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
            <span style={{ fontSize:"20px" }}>{sel.image.startsWith("http")?<img src={sel.image} style={{ width:24,height:24,borderRadius:4 }}/>:sel.image}</span>
            <span style={{ fontWeight:700,fontFamily:"var(--mono)",fontSize:"14px" }}>$ {sel.ticker}</span>
          </div>
          <span style={{ fontSize:"13px",fontWeight:700,color:sel.priceChange>=0?"var(--green)":"var(--red)",fontFamily:"var(--mono)" }}>{sel.priceChange>=0?"+":""}{sel.priceChange.toFixed(2)}%</span>
        </div>

        <div style={{ padding:"12px" }}>
          {/* Price */}
          <div style={C.card}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px" }}>
              <div>
                <div style={{ fontSize:"10px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"4px" }}>Price</div>
                <div style={{ fontSize:"24px",fontWeight:700,fontFamily:"var(--mono)",color:"var(--text)" }}>${sel.price.toFixed(8)}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"10px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"4px" }}>Mkt Cap</div>
                <div style={{ fontSize:"16px",fontWeight:700,fontFamily:"var(--mono)",color:"var(--text)" }}>${fmt(sel.marketCap)}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:"16px",marginBottom:"12px" }}>
              <div><div style={{ fontSize:"10px",color:"var(--text3)",marginBottom:"2px" }}>VOLUME</div><div style={{ fontSize:"13px",fontWeight:600,fontFamily:"var(--mono)" }}>${fmt(sel.volume)}</div></div>
              <div><div style={{ fontSize:"10px",color:"var(--text3)",marginBottom:"2px" }}>HOLDERS</div><div style={{ fontSize:"13px",fontWeight:600,fontFamily:"var(--mono)" }}>{fmt(sel.holders)}</div></div>
              <div><div style={{ fontSize:"10px",color:"var(--text3)",marginBottom:"2px" }}>CREATED</div><div style={{ fontSize:"13px",fontWeight:600,fontFamily:"var(--mono)" }}>{ago(sel.createdAt)}</div></div>
            </div>
            {/* Bonding */}
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--text3)",marginBottom:"4px",letterSpacing:"1px",textTransform:"uppercase" }}>
                <span>Bonding Curve</span>
                <span style={{ color:sel.bondingProgress>80?"var(--gold)":"var(--green)",fontFamily:"var(--mono)" }}>{sel.bondingProgress.toFixed(1)}%</span>
              </div>
              <div style={{ background:"var(--bg3)",borderRadius:"3px",height:"6px" }}>
                <div style={{ background:sel.bondingProgress>80?"linear-gradient(90deg,var(--gold),var(--red))":"linear-gradient(90deg,var(--green),var(--blue))",height:"6px",borderRadius:"3px",width:sel.bondingProgress+"%",transition:"width 0.8s" }}/>
              </div>
              <div style={{ fontSize:"10px",color:"var(--text3)",marginTop:"4px" }}>Reaches 100% → graduates to DEX listing</div>
            </div>
          </div>

          {/* Trade */}
          <div style={C.card}>
            <div style={{ fontSize:"11px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"12px" }}>Trade · 100ms Settlement</div>
            <input value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount (INIT)" style={{ ...C.input,marginBottom:"10px",fontFamily:"var(--mono)" }}/>
            <div style={{ display:"flex",gap:"6px",marginBottom:"10px" }}>
              {["0.1","0.5","1","5","10"].map(v=>(
                <button key={v} onClick={()=>setAmt(v)} style={{ flex:1,background:amt===v?"var(--bg3)":"var(--bg2)",border:`1px solid ${amt===v?"var(--border2)":"var(--border)"}`,borderRadius:"5px",color:amt===v?"var(--text)":"var(--text3)",padding:"6px 0",cursor:"pointer",fontSize:"11px",fontFamily:"var(--mono)" }}>{v}</button>
              ))}
            </div>
            <div style={{ display:"flex",gap:"8px" }}>
              <button style={{ ...C.btn("g"),flex:1,padding:"12px",fontSize:"13px",letterSpacing:"0.5px" }} onClick={()=>{ if(!wallet.connected){setModal(true);return}; trade("buy") }}>▲ BUY</button>
              <button style={{ ...C.btn("r"),flex:1,padding:"12px",fontSize:"13px",letterSpacing:"0.5px" }} onClick={()=>{ if(!wallet.connected){setModal(true);return}; trade("sell") }}>▼ SELL</button>
            </div>
            {wallet.connected&&<div style={{ textAlign:"center",fontSize:"11px",color:"var(--text3)",marginTop:"8px",fontFamily:"var(--mono)" }}>Balance: {wallet.balance} INIT</div>}
          </div>

          {/* Trades */}
          {sel.trades.length>0&&(
            <div style={C.card}>
              <div style={{ fontSize:"11px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"10px" }}>Live Trades</div>
              {sel.trades.slice(0,6).map((tr,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--border)",fontSize:"11px",fontFamily:"var(--mono)" }}>
                  <span style={{ color:tr.type==="buy"?"var(--green)":"var(--red)",fontWeight:700 }}>{tr.type==="buy"?"▲ BUY":"▼ SELL"}</span>
                  <span style={{ color:"var(--text2)" }}>{tr.user}</span>
                  <span style={{ color:"var(--text)" }}>{tr.amount} INIT</span>
                  <span style={{ color:"var(--text3)" }}>{ago(tr.time)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          <div style={C.card}>
            <div style={{ fontSize:"11px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"10px" }}>Chat · {sel.replies} msgs</div>
            <div ref={chatRef} style={{ height:"140px",overflowY:"auto",marginBottom:"10px",display:"flex",flexDirection:"column",gap:"5px" }}>
              {sel.messages.length===0&&<div style={{ color:"var(--text3)",fontSize:"12px",textAlign:"center",paddingTop:"40px" }}>No messages yet. Say something fren.</div>}
              {sel.messages.map((m,i)=>(
                <div key={i} style={{ background:"var(--bg2)",borderRadius:"5px",padding:"6px 10px" }}>
                  <span style={{ color:"var(--green)",fontSize:"10px",fontWeight:700,fontFamily:"var(--mono)" }}>{m.user} </span>
                  <span style={{ color:"var(--text)",fontSize:"12px" }}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:"8px" }}>
              <input value={chat} onChange={e=>setChat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="gm frens..." style={{ ...C.input,flex:1 }}/>
              <button style={C.btn("ghost")} onClick={sendChat}>Send</button>
            </div>
          </div>
        </div>
      </>}

      {/* ══════════════════ LAUNCH ══════════════════ */}
      {page==="launch"&&<>
        <div style={C.header}>
          <span style={{ fontWeight:800,fontSize:"15px",letterSpacing:"1px",textTransform:"uppercase" }}>Launch Coin</span>
          {wallet.connected&&<span style={{ fontSize:"11px",color:"var(--text3)",fontFamily:"var(--mono)" }}>{wallet.balance} INIT</span>}
        </div>
        <div style={{ padding:"12px" }}>
          <div style={C.card}>
            {[{l:"Name *",k:"name",ph:"Pepe Initia"},{l:"Ticker *",k:"ticker",ph:"PEPEI"},{l:"Description",k:"desc",ph:"Why will this moon?"}].map(f=>(
              <div key={f.k} style={{ marginBottom:"12px" }}>
                <div style={{ fontSize:"10px",letterSpacing:"1.5px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"5px" }}>{f.l}</div>
                <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:f.k==="ticker"?e.target.value.toUpperCase():e.target.value}))} placeholder={f.ph} style={C.input}/>
              </div>
            ))}

            <div style={{ marginBottom:"16px" }}>
              <div style={{ fontSize:"10px",letterSpacing:"1.5px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"5px" }}>AI Meme Image</div>
              <div style={{ display:"flex",gap:"8px",marginBottom:"8px" }}>
                <input value={form.prompt} onChange={e=>setForm(f=>({...f,prompt:e.target.value}))} placeholder="Describe your meme..." style={{ ...C.input,flex:1 }}/>
                <button style={{ ...C.btn("ghost"),whiteSpace:"nowrap" }} onClick={genImage}>{genImg?"…":"Generate"}</button>
              </div>
              {form.img&&<img src={form.img} style={{ width:"100%",borderRadius:"8px",maxHeight:"180px",objectFit:"cover",border:"1px solid var(--border)" }}/>}
            </div>

            <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"6px",padding:"12px",marginBottom:"14px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"12px" }}>
                <span style={{ color:"var(--text3)" }}>Launch fee</span>
                <span style={{ fontFamily:"var(--mono)",fontWeight:700 }}>0.02 INIT</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"11px",marginTop:"4px" }}>
                <span style={{ color:"var(--text3)" }}>Trade fee</span>
                <span style={{ fontFamily:"var(--mono)",color:"var(--green)" }}>1%</span>
              </div>
            </div>

            <button style={{ ...C.btn("g"),width:"100%",padding:"14px",fontSize:"14px",letterSpacing:"1px",textTransform:"uppercase" }} onClick={()=>{ if(!wallet.connected){setModal(true);return}; launch() }}>
              {launching?"Launching…":"🚀 Launch Token"}
            </button>
          </div>
        </div>
      </>}

      {/* ══════════════════ LEADERBOARD ══════════════════ */}
      {page==="board"&&<>
        <div style={C.header}>
          <span style={{ fontWeight:800,fontSize:"15px",letterSpacing:"1px",textTransform:"uppercase" }}>Leaderboard</span>
        </div>
        <div style={{ padding:"12px" }}>
          <div style={C.card}>
            <div style={{ fontSize:"11px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"12px" }}>Top Gainers 24h</div>
            {[...tokens].sort((a,b)=>b.priceChange-a.priceChange).map((t,i)=>(
              <div key={t.id} onClick={()=>{setSel(t);setPage("token")}} style={{ display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:"1px solid var(--border)",cursor:"pointer" }}>
                <span style={{ fontSize:"12px",width:"20px",fontFamily:"var(--mono)",fontWeight:700,color:i===0?"var(--gold)":i===1?"#c0c0c0":i===2?"#cd7f32":"var(--text3)" }}>#{i+1}</span>
                <span style={{ fontSize:"22px" }}>{t.image.startsWith("http")?<img src={t.image} style={{ width:24,height:24,borderRadius:4 }}/>:t.image}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:"13px" }}>{t.name}</div>
                  <div style={{ fontSize:"10px",color:"var(--text3)",fontFamily:"var(--mono)" }}>MC ${fmt(t.marketCap)}</div>
                </div>
                <span style={{ color:t.priceChange>=0?"var(--green)":"var(--red)",fontWeight:700,fontSize:"13px",fontFamily:"var(--mono)" }}>{t.priceChange>=0?"+":""}{t.priceChange.toFixed(1)}%</span>
              </div>
            ))}
          </div>

          <div style={C.card}>
            <div style={{ fontSize:"11px",letterSpacing:"2px",color:"var(--text3)",textTransform:"uppercase",marginBottom:"12px" }}>Platform Stats</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px" }}>
              {[
                {l:"Total Volume",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume,0))},
                {l:"Coins Launched",v:tokens.length.toString()},
                {l:"Total Holders",v:fmt(tokens.reduce((s,t)=>s+t.holders,0))},
                {l:"Fees Earned",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume*0.01,0))},
              ].map(s=>(
                <div key={s.l} style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"6px",padding:"12px",textAlign:"center" }}>
                  <div style={{ fontSize:"18px",fontWeight:700,fontFamily:"var(--mono)",color:"var(--text)" }}>{s.v}</div>
                  <div style={{ fontSize:"10px",color:"var(--text3)",marginTop:"3px",letterSpacing:"0.5px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>}

      {/* ══════════════════ NAV ══════════════════ */}
      <nav style={C.nav}>
        {[
          {id:"feed",label:"FEED",icon:<Flame size={16}/>},
          {id:"launch",label:"LAUNCH",icon:<Rocket size={16}/>},
          {id:"board",label:"TOP",icon:<Trophy size={16}/>},
          {id:"wallet",label:wallet.connected?"WALLET":"LOGIN",icon:<Users size={16}/>},
        ].map(n=>(
          <button key={n.id} style={C.navBtn(page===n.id)} onClick={()=>{ if(n.id==="wallet"){wallet.connected?null:setModal(true)}else{setPage(n.id as any)} }}>
            {n.icon}<span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
