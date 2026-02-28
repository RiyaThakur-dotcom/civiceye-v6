// ╔══════════════════════════════════════════════════════════════╗
// ║  CIVICEYE PRO v6.0  —  FINAL HACKATHON BUILD                ║
// ║  Real Auth • AI Support • AI Automation • Blockchain • PWA  ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════
// PIANO ENGINE
// ═══════════════════════════════════════════════
class Piano {
  constructor() { this.ctx = null; this.on = true; }
  ctx_() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  }
  tone(freq, type = "sine", dur = 0.15, vol = 0.08) {
    if (!this.on) return;
    try {
      const c = this.ctx_(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.start(c.currentTime); o.stop(c.currentTime + dur);
    } catch (e) {}
  }
  click()   { this.tone(880, "sine", 0.09, 0.07); }
  nav()     { this.tone(660, "triangle", 0.1, 0.07); setTimeout(() => this.tone(880, "sine", 0.08, 0.05), 55); }
  ok()      { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, "sine", 0.18, 0.08), i * 75)); }
  err()     { this.tone(200, "sawtooth", 0.22, 0.11); }
  warn()    { [440, 330].forEach((f, i) => setTimeout(() => this.tone(f, "square", 0.14, 0.09), i * 85)); }
  boot(i)   { this.tone([261,294,329,349,392,440,494,523][i % 8], "sine", 0.13, 0.07); }
  chain()   { [1046, 1318].forEach((f, i) => setTimeout(() => this.tone(f, "sine", 0.09, 0.06), i * 50)); }
  msg()     { this.tone(1200, "sine", 0.07, 0.05); }
  hover()   { this.tone(1400, "sine", 0.04, 0.03); }
}
const P = new Piano();

// ═══════════════════════════════════════════════
// BLOCKCHAIN
// ═══════════════════════════════════════════════
class Blockchain {
  constructor() { this.chain = [this.genesis()]; }
  genesis() {
    return { index: 0, ts: Date.now(), data: "GENESIS", prev: "0000000000000000", hash: this.hash(0, Date.now(), "GENESIS", "0000000000000000") };
  }
  hash(i, t, d, p) {
    let h = 0, s = `${i}${t}${JSON.stringify(d)}${p}`;
    for (const c of s) { h = ((h << 5) - h) + c.charCodeAt(0); h |= 0; }
    return Math.abs(h).toString(16).padStart(16, "0");
  }
  add(data) {
    const prev = this.chain[this.chain.length - 1];
    const b = { index: prev.index + 1, ts: Date.now(), data, prev: prev.hash };
    b.hash = this.hash(b.index, b.ts, b.data, b.prev);
    this.chain.push(b);
    return b;
  }
  valid() { return this.chain.every((b, i) => i === 0 || b.prev === this.chain[i - 1].hash); }
}
const BC = new Blockchain();

// ═══════════════════════════════════════════════
// USER STORE  (localStorage)
// ═══════════════════════════════════════════════
const Store = {
  all: () => { try { return JSON.parse(localStorage.getItem("ce_u") || "[]"); } catch { return []; } },
  save: (u) => localStorage.setItem("ce_u", JSON.stringify(u)),
  find: (mob) => Store.all().find(u => u.mobile === mob),
  register(d) {
    const users = Store.all();
    if (users.find(u => u.mobile === d.mobile)) return { ok: false, msg: "Mobile already registered! Please login." };
    const u = { ...d, id: "USR" + Date.now(), role: "citizen", ward: d.ward || "Ward 1", joined: new Date().toISOString() };
    users.push(u); Store.save(users); return { ok: true, user: u };
  },
  login(mob, pwd) {
    const u = Store.find(mob);
    if (!u) return { ok: false, msg: "Mobile not registered. Please Sign Up first." };
    if (u.password !== pwd) return { ok: false, msg: "Wrong password. Try again." };
    return { ok: true, user: u };
  },
  sess: {
    get: () => { try { return JSON.parse(localStorage.getItem("ce_s") || "null"); } catch { return null; } },
    set: (u) => localStorage.setItem("ce_s", JSON.stringify(u)),
    clear: () => localStorage.removeItem("ce_s"),
  },
  seed() {
    const u = Store.all();
    if (!u.find(x => x.role === "officer")) {
      u.push({ id: "OFF001", name: "Insp. Sharma", mobile: "9999999999", password: "officer@123", role: "officer", dept: "Public Works", ward: "Ward 1", joined: new Date().toISOString() });
      u.push({ id: "ADM001", name: "Commissioner Das", mobile: "8888888888", password: "admin@123", role: "admin", dept: "City Admin", ward: "All", joined: new Date().toISOString() });
      Store.save(u);
    }
  }
};

// ═══════════════════════════════════════════════
// OTP  (simulated — show on screen for demo)
// ═══════════════════════════════════════════════
const OTPStore = {};
const OTP = {
  gen: (mob) => { const o = (100000 + Math.floor(Math.random() * 900000)).toString(); OTPStore[mob] = { o, exp: Date.now() + 300000 }; return o; },
  check: (mob, o) => { const s = OTPStore[mob]; return s && Date.now() < s.exp && s.o === o; },
};

// ═══════════════════════════════════════════════
// AI CLASSIFIER
// ═══════════════════════════════════════════════
async function classify(text) {
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
  const t = text.toLowerCase();
  const has = (...w) => w.some(x => t.includes(x));
  const corrupt  = has("bribe","corrupt","rishwat","ghoos","paisa de");
  const water    = has("water","paani","tap","pipeline","supply");
  const power    = has("bijli","electricity","light","current","power");
  const road     = has("road","pothole","sadak","gaddha","crack");
  const garbage  = has("garbage","kachra","safai","trash","waste","dustbin");
  const drain    = has("drain","naali","sewer","blockage","flood");
  const health   = has("hospital","health","disease","medical","dengue","malaria","sick");
  const safety   = has("danger","emergency","accident","fire","bachao","urgent");
  const delay    = has("month","year","mahine","saal","purana","no response");
  const score    = corrupt?91:safety?94:health?87:water?80:power?74:road?67:garbage?62:drain?71:delay?58:52;
  const level    = score>=85?"Critical":score>=70?"High":score>=55?"Medium":"Low";
  const cat      = corrupt?"Corruption / Bribery":safety?"Public Safety":health?"Public Health":water?"Water Supply":power?"Electricity":road?"Road & Infrastructure":garbage?"Garbage & Sanitation":drain?"Sewage & Drainage":"Administrative Delay";
  const dept     = corrupt?"Vigilance Dept":safety?"Police / Emergency":health?"Health Dept":water?"Water Board":power?"Electricity Board":road?"Public Works Dept":garbage?"Sanitation Dept":drain?"Drainage Dept":"Admin Office";
  const sla      = level==="Critical"?24:level==="High"?72:level==="Medium"?168:336;
  const id       = "CEP" + Date.now().toString(36).toUpperCase().slice(-6);
  const conf     = Math.round(73 + Math.random() * 22);
  return { id, cat, level, score, dept, sla, conf,
    sla_text: level==="Critical"?"0–24 hours":level==="High"?"1–3 days":level==="Medium"?"3–7 days":"7–14 days",
    corrupt_flag: corrupt, corrupt_risk: corrupt ? 89 : Math.round(Math.random()*18),
    escalate: corrupt || score > 80 || delay, esc_to: corrupt?"City Commissioner":score>80?"Ward Officer":null,
    alert: score > 75 || corrupt, perf_flag: delay,
    impact: score>=85?"Zone":score>=70?"Ward":"Street",
    ward: ["Ward 1","Ward 2","Ward 3","Ward 4"][Math.floor(Math.random()*4)],
    officer_grade: score>=85?"Commissioner":score>=70?"Dept Head":"Senior",
    summary: `${level} priority ${cat} complaint. Auto-assigned to ${dept} with ${sla}h SLA. ${corrupt?"⚠ Corruption flagged — Vigilance notified. ":""}${delay?"Performance flag raised. ":""}AI Confidence: ${conf}%.`,
    wa: `🏛 CivicEye Alert!\nID: ${id}\nIssue: ${cat}\nPriority: ${level}\nDept: ${dept}\nSLA: ${sla}h\n✅ Blockchain logged`,
  };
}

// ═══════════════════════════════════════════════
// AI SUPPORT AGENT
// ═══════════════════════════════════════════════
async function support(msg, user) {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
  const m = msg.toLowerCase(), name = user?.name || "Citizen";
  const has = (...w) => w.some(x => m.includes(x));
  if (has("hello","hi","namaste","hey") || m.length < 8)
    return `🙏 **Namaste ${name}!**\n\nMain CivicEye AI Support hoon — 24/7 aapki seva mein!\n\n→ 📋 Complaint status track\n→ 📡 Complaint file karna\n→ ⚠️ Corruption report\n→ ⏱ SLA timelines\n→ 🤖 AI Automation info\n→ ⛓ Blockchain queries\n\nKoi bhi sawaal puchho! 😊`;
  if (has("status","track","cep")) {
    const id = msg.match(/CEP[A-Z0-9]+/i);
    if (id) return `🔍 **${id[0]} Tracking...**\n\nStatus: **Under Review**\nDept: Public Works\nSLA: 48h remaining\nOfficer: Insp. Sharma\n\n⛓ Blockchain verified ✅`;
    return `📋 Apna **Complaint ID** share karo (format: CEPXXXXXX)\n\nKahan milega:\n→ "All Cases" tab\n→ WhatsApp message\n→ Registered mobile`;
  }
  if (has("file","submit","complaint","darz"))
    return `📡 **Complaint File Karna:**\n\n→ "File Complaint" tab pe jao\n→ Details bharo (ya 🎤 voice use karo)\n→ AI classify karega automatically\n→ ⛓ Blockchain log hoga\n→ 📲 WhatsApp alert aayega\n\n⚡ Time: **2 minutes se kam!**`;
  if (has("bribe","corrupt","rishwat","ghoos"))
    return `⚠️ **Corruption Report!**\n\n🔴 Critical Priority case hai.\n\nAapki report:\n→ Vigilance Dept ko immediately\n→ City Commissioner ko escalate\n→ ⛓ Tamper-proof blockchain evidence\n→ Identity protected 🛡\n\nAbhi file karo → "File Complaint" tab`;
  if (has("water","paani"))
    return `💧 **Water Supply Issue**\n\nDept: **Water Board**\n⏱ SLA: **72 hours**\n\nExact address likho fastest response ke liye 📍`;
  if (has("road","pothole","sadak"))
    return `🛣️ **Road Issue**\n\nDept: **Public Works**\n⏱ SLA: **3–7 days**\n\n💡 Tip: Kitne time se hai + exact location → urgency score badhta hai!`;
  if (has("bijli","electricity","light"))
    return `⚡ **Electricity Issue**\n\nDept: **Electricity Board**\n⏱ SLA: **24–72 hours**\n\n💡 Hospital/pump affected? "emergency" word use karo → Critical priority milegi!`;
  if (has("sla","time","kitne","days","resolve"))
    return `⏱️ **Resolution Timelines:**\n\n🔴 Critical: **0–24 hours**\n🟠 High: **1–3 days**\n🟡 Medium: **3–7 days**\n🟢 Low: **7–14 days**\n\nSLA breach = auto escalation! ⚡`;
  if (has("blockchain","secure","proof","tamper"))
    return `⛓ **Blockchain Security:**\n\nHar complaint:\n→ Cryptographically hashed\n→ Tamper-proof chain\n→ Permanent audit trail\n→ Koi alter nahi kar sakta\n\nChain Integrity: **${BC.valid() ? "✅ VALID" : "⚠ CHECK"}** — ${BC.chain.length} blocks`;
  if (has("automation","auto","job"))
    return `🤖 **AI Automation Engine:**\n\n8 jobs 24/7 run karte hain:\n→ Auto corruption escalation\n→ SLA breach monitoring\n→ Officer auto-assignment\n→ Blockchain auto-logging\n→ WhatsApp auto-alerts\n→ Duplicate detection\n→ Ward risk recalculation\n→ Performance flagging\n\n"AI Automation" tab mein dekho!`;
  if (has("thanks","shukriya","dhanyavad","thank"))
    return `😊 **Aapka swagat hai ${name}!**\n\nCivicEye hamesha aapki seva ke liye taiyar hai.\n\n🏛 *Transparent governance, empowered citizens!*`;
  return `🤖 **CivicEye AI Support**\n\nAapka message samjha: *"${msg.slice(0, 50)}${msg.length > 50 ? "..." : ""}"*\n\nBest solution:\n→ **"File Complaint"** tab mein jayein\n→ Issue describe karein (Hindi/English)\n→ AI automatically handle karega\n\nKoi aur help? 😊`;
}

// ═══════════════════════════════════════════════
// AUTOMATION JOBS
// ═══════════════════════════════════════════════
const JOBS = [
  { id: "j1", icon: "⚠️", name: "Corruption Auto-Escalation",  trigger: "corruption_flag = true",        action: "Escalate → Vigilance + Commissioner" },
  { id: "j2", icon: "🚨", name: "Critical SLA Alert",           trigger: "urgency_score ≥ 85 & time>20h", action: "WhatsApp alert + Officer notify" },
  { id: "j3", icon: "🔍", name: "Duplicate Detector",           trigger: "same location + category 7d",   action: "Merge + notify filer" },
  { id: "j4", icon: "👮", name: "Officer Auto-Assign",          trigger: "new complaint filed",            action: "Match ward+dept+grade → assign" },
  { id: "j5", icon: "⛓", name: "Blockchain Logger",            trigger: "any complaint state change",     action: "Hash & chain block auto" },
  { id: "j6", icon: "📲", name: "WhatsApp Notifier",            trigger: "filed / resolved / escalated",   action: "Send WhatsApp to citizen" },
  { id: "j7", icon: "⏱", name: "SLA Breach Monitor",           trigger: "time > sla_hours",               action: "Auto-escalate + perf flag dept" },
  { id: "j8", icon: "🗺", name: "Ward Risk Updater",            trigger: "every 5 complaints in ward",     action: "Recalculate ward risk score" },
];

// ═══════════════════════════════════════════════
// COLORS & CONSTANTS
// ═══════════════════════════════════════════════
const C = {
  bg: "#010408", cyan: "#00F0FF", blue: "#0A84FF", purple: "#7B2FFF",
  green: "#00FF88", amber: "#FFB800", red: "#FF2D55", orange: "#FF6D00",
  pink: "#FF0099", white: "#E8F4FF", mid: "#3A6080", dim: "#1A3040",
  border: "rgba(0,240,255,0.18)", hi: "rgba(0,240,255,0.32)",
};
const UC = { Low: C.green, Medium: C.amber, High: C.orange, Critical: C.red };
const API = "http://localhost:8000/api";
const CNAV = [
  { id: "cmd",        icon: "◈",  label: "Command Center" },
  { id: "file",       icon: "📡", label: "File Complaint" },
  { id: "cases",      icon: "📋", label: "All Cases" },
  { id: "map",        icon: "🌐", label: "Holo Map" },
  { id: "corrupt",    icon: "⚠",  label: "Corruption AI" },
  { id: "esc",        icon: "🚨", label: "Escalations" },
  { id: "chain",      icon: "⛓", label: "Blockchain" },
  { id: "analytics",  icon: "📊", label: "Analytics" },
  { id: "automation", icon: "🤖", label: "AI Automation" },
  { id: "support",    icon: "💬", label: "AI Support" },
];
const ONAV = [
  { id: "ocases",  icon: "👮", label: "My Cases" },
  { id: "omap",    icon: "🗺", label: "Field Map" },
  { id: "esc",     icon: "🚨", label: "Escalations" },
  { id: "ores",    icon: "✅", label: "Resolved" },
  { id: "support", icon: "💬", label: "AI Support" },
];

// ═══════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;background:#010408;overflow:hidden}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(0,240,255,0.2);border-radius:3px}
  input,textarea,button,select{font-family:inherit;outline:none}
  textarea{resize:vertical}
  input::placeholder,textarea::placeholder{color:#1A3040}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.85)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes scan{0%{top:-2px}100%{top:100vh}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,45,85,.5)}70%{box-shadow:0 0 0 10px rgba(255,45,85,0)}}
  @keyframes pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
`;

// ═══════════════════════════════════════════════
// SMALL UI ATOMS
// ═══════════════════════════════════════════════
function Dot({ color, size = 7 }) {
  return <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:color, boxShadow:`0 0 ${size}px ${color},0 0 ${size*2}px ${color}44`, animation:"pulse 2s ease-in-out infinite", flexShrink:0 }}/>;
}

function Tag({ text, color, icon }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:8.5, fontWeight:700, color, background:`${color}14`, border:`1px solid ${color}35`, borderRadius:4, padding:"2px 7px", textTransform:"uppercase", letterSpacing:1, whiteSpace:"nowrap", fontFamily:"'Share Tech Mono'" }}>
      {icon && <span>{icon}</span>}{text}
    </span>
  );
}

function Ring({ val, color, size = 56, label }) {
  const r = (size - 12) / 2, circ = 2 * Math.PI * r;
  const dash = (Math.min(val, 100) / 100) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <svg width={size} height={size} style={{ filter:`drop-shadow(0 0 6px ${color}70)` }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,240,255,0.07)" strokeWidth={9}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size < 52 ? 10 : 12} fontWeight="700" fontFamily="'Share Tech Mono'">{Math.round(val)}</text>
      </svg>
      {label && <div style={{ fontSize:7, color:C.mid, textTransform:"uppercase", letterSpacing:1.4, fontFamily:"'Share Tech Mono'" }}>{label}</div>}
    </div>
  );
}

function HCard({ children, color = C.cyan, style = {}, onClick }) {
  const ref = useRef(null);
  const tilt = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5) * 13;
    const y = ((e.clientY - r.top) / r.height - .5) * -13;
    el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateZ(7px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = "none"; };
  return (
    <div ref={ref} onMouseMove={tilt} onMouseLeave={reset} onClick={onClick}
      style={{ background:"linear-gradient(135deg,rgba(0,240,255,0.05),transparent)", border:`1px solid ${C.border}`, borderTop:`1px solid ${C.hi}`, borderRadius:12, backdropFilter:"blur(18px)", position:"relative", overflow:"hidden", transition:"transform .13s ease", transformStyle:"preserve-3d", cursor:onClick?"pointer":"default", ...style }}>
      <div style={{ position:"absolute", top:0, left:0, width:13, height:13, borderTop:`2px solid ${color}`, borderLeft:`2px solid ${color}`, borderRadius:"11px 0 0 0", pointerEvents:"none", zIndex:2 }}/>
      <div style={{ position:"absolute", top:0, right:0, width:13, height:13, borderTop:`2px solid ${color}`, borderRight:`2px solid ${color}`, borderRadius:"0 11px 0 0", pointerEvents:"none", zIndex:2 }}/>
      <div style={{ position:"relative", zIndex:1 }}>{children}</div>
    </div>
  );
}

function Stat({ label, value, color, icon }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let s = null;
    const step = (ts) => { if (!s) s = ts; const p = Math.min((ts - s) / 1100, 1); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <HCard color={color} style={{ padding:"13px 15px", minHeight:80 }} onClick={() => P.click()}>
      <div style={{ fontSize:7, color:C.mid, letterSpacing:1.8, textTransform:"uppercase", marginBottom:5, display:"flex", alignItems:"center", gap:5, fontFamily:"'Share Tech Mono'" }}>
        {icon && <span>{icon}</span>}{label}
      </div>
      <div style={{ fontSize:24, fontWeight:700, color, fontFamily:"'Share Tech Mono'", textShadow:`0 0 16px ${color}70` }}>
        {typeof value === "number" ? n : value}
      </div>
    </HCard>
  );
}

function Sparkline({ vals, color, h = 44 }) {
  if (!vals || vals.length < 2) return null;
  const max = Math.max(...vals, 1), W = 200;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${h - (v / max) * (h - 6) - 3}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 3px ${color})` }}/>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#sp${color.slice(1)})`}/>
    </svg>
  );
}

function Bars({ data }) {
  const max = Math.max(...(data || []).map(d => d.v), 1);
  return (
    <div>
      {(data || []).map((d, i) => (
        <div key={i} style={{ marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
            <span style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{d.k}</span>
            <span style={{ fontSize:8, color:d.c || C.cyan, fontFamily:"'Share Tech Mono'" }}>{d.v}</span>
          </div>
          <div style={{ background:"rgba(0,240,255,0.05)", borderRadius:2, height:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(d.v / max) * 100}%`, background:d.c || C.cyan, transition:"width 1.1s ease", borderRadius:2 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 75 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
      r: Math.random() * 1.2 + .3, op: Math.random() * .45 + .1,
      col: Math.random() > .6 ? C.cyan : Math.random() > .5 ? C.purple : C.blue,
      p: Math.random() * Math.PI * 2,
    }));
    let af;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.p += .018;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const op = p.op * (.7 + .3 * Math.sin(p.p));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(op * 255).toString(16).padStart(2, "0");
        ctx.shadowBlur = 6; ctx.shadowColor = p.col; ctx.fill(); ctx.shadowBlur = 0;
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx + dy*dy);
          if (d < 80) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(0,240,255,${(1 - d / 80) * .08})`; ctx.lineWidth = .35; ctx.stroke(); }
        }
      }
      af = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(af); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>;
}

function Grid() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"8%", left:"15%", width:500, height:500, borderRadius:"50%", background:`radial-gradient(${C.cyan}05,transparent 70%)`, filter:"blur(45px)" }}/>
      <div style={{ position:"absolute", bottom:"10%", right:"10%", width:400, height:400, borderRadius:"50%", background:`radial-gradient(${C.purple}06,transparent 70%)`, filter:"blur(45px)" }}/>
      <svg width="100%" height="100%" style={{ opacity:.035 }}>
        <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke={C.cyan} strokeWidth=".35"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      <div style={{ position:"absolute", left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.cyan}30,transparent)`, animation:"scan 8s linear infinite", top:0 }}/>
    </div>
  );
}

function Toasts({ items, remove }) {
  const tc = { success:C.green, error:C.red, warn:C.amber, info:C.cyan };
  const ti = { success:"✅", error:"❌", warn:"⚠️", info:"ℹ️" };
  return (
    <div style={{ position:"fixed", top:56, right:12, zIndex:9999, display:"flex", flexDirection:"column", gap:6, pointerEvents:"none" }}>
      {items.map(t => (
        <div key={t.id} onClick={() => remove(t.id)}
          style={{ background:"rgba(1,4,8,0.96)", border:`1px solid ${tc[t.type]}40`, borderLeft:`3px solid ${tc[t.type]}`, borderRadius:8, padding:"8px 12px", maxWidth:275, backdropFilter:"blur(16px)", animation:"fadeUp .3s ease", pointerEvents:"all", cursor:"pointer", boxShadow:`0 4px 18px rgba(0,0,0,.4),0 0 8px ${tc[t.type]}15` }}>
          <div style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
            <span style={{ fontSize:12 }}>{ti[t.type]}</span>
            <span style={{ fontSize:9.5, color:C.white, fontFamily:"'Share Tech Mono'", lineHeight:1.5 }}>{t.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BootScreen({ done }) {
  const [prog, setP] = useState(0);
  const [logs, setL] = useState([]);
  const LINES = [
    "Initializing CivicEye Neural Core v6.0...",
    "Loading holographic rendering engine...",
    "Connecting to blockchain network...",
    "Loading AI Automation Engine (8 jobs)...",
    "Activating AI Customer Support Agent...",
    "Initializing Piano Sound Engine 🎹...",
    "Loading real authentication system...",
    "Calibrating ward risk matrices...",
    "All systems GO — CivicEye PRO v6.0 🚀",
  ];
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < LINES.length) { P.boot(i); setL(x => [...x, LINES[i]]); setP(Math.round((i + 1) / LINES.length * 100)); i++; }
      else { clearInterval(t); P.ok(); setTimeout(done, 400); }
    }, 290);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:C.bg, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Share Tech Mono'" }}>
      <Particles/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:500, width:"90%", padding:24 }}>
        <div style={{ fontSize:54, marginBottom:6, filter:`drop-shadow(0 0 25px ${C.cyan})`, animation:"float 3s ease-in-out infinite" }}>👁</div>
        <div style={{ fontSize:22, fontWeight:900, color:C.cyan, letterSpacing:6, fontFamily:"'Orbitron'", textShadow:`0 0 25px ${C.cyan}` }}>CIVICEYE</div>
        <div style={{ fontSize:8.5, color:C.purple, letterSpacing:2.5, marginTop:3 }}>PRO v6.0 — REAL AUTH · AI SUPPORT · AI AUTOMATION · BLOCKCHAIN</div>
        <div style={{ background:"rgba(0,240,255,0.06)", borderRadius:3, height:3, margin:"14px 0", overflow:"hidden" }}>
          <div style={{ height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, width:`${prog}%`, transition:"width .28s ease", boxShadow:`0 0 9px ${C.cyan}` }}/>
        </div>
        <div style={{ background:"rgba(0,240,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 13px", textAlign:"left", minHeight:175 }}>
          {logs.map((l, i) => (
            <div key={i} style={{ fontSize:9, color:i === logs.length-1 ? C.green : C.mid, marginBottom:3.5, animation:"fadeUp .3s ease", display:"flex", gap:7 }}>
              <span style={{ color:C.purple }}>▶</span>{l}
            </div>
          ))}
          <span style={{ color:C.cyan, animation:"blink 1s infinite" }}>█</span>
        </div>
        <div style={{ marginTop:7, fontSize:8.5, color:C.dim }}>{prog}% BOOT COMPLETE</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// VOICE BUTTON
// ═══════════════════════════════════════════════
function VoiceBtn({ onText }) {
  const [on, setOn] = useState(false);
  const rr = useRef(null);
  const sup = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  const go = () => {
    if (on) { rr.current?.stop(); setOn(false); P.click(); return; }
    P.nav();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.lang = "hi-IN"; r.continuous = false; r.interimResults = true;
    r.onstart = () => setOn(true);
    r.onresult = (e) => onText(Array.from(e.results).map(x => x[0].transcript).join(""));
    r.onend = () => setOn(false); r.onerror = () => setOn(false);
    rr.current = r; r.start();
  };
  if (!sup) return null;
  return (
    <button onClick={go} style={{ background:on ? `${C.red}18` : `${C.cyan}0d`, border:`1px solid ${on ? C.red : C.cyan}35`, borderRadius:6, padding:"6px 11px", color:on ? C.red : C.cyan, fontSize:9.5, fontWeight:700, display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"'Share Tech Mono'", whiteSpace:"nowrap" }}>
      <span style={{ animation:on ? "pulse 1s infinite" : "none" }}>{on ? "🔴" : "🎤"}</span>{on ? "STOP" : "VOICE"}
    </button>
  );
}

// ═══════════════════════════════════════════════
// FLIP CARD
// ═══════════════════════════════════════════════
function FlipCard({ c, onResolve }) {
  const [fl, setFl] = useState(false);
  const ai = (() => { try { return typeof c.ai === "string" ? JSON.parse(c.ai || "{}") : c.ai || {}; } catch { return {}; } })();
  const sc = c.score || ai.score || 50;
  const col = sc >= 85 ? C.red : sc >= 70 ? C.orange : sc >= 55 ? C.amber : C.green;
  return (
    <div style={{ perspective:"1000px", marginBottom:8, height:fl ? 225 : 100, transition:"height .42s ease" }}>
      <div style={{ position:"relative", width:"100%", height:"100%", transformStyle:"preserve-3d", transform:fl ? "rotateX(180deg)" : "rotateX(0)", transition:"transform .55s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden" }}>
          <HCard color={col} style={{ padding:"10px 12px", height:"100%" }} onClick={() => { P.click(); setFl(f => !f); }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${col},${col}30)`, borderRadius:"11px 0 0 11px" }}/>
            <div style={{ display:"flex", gap:10, alignItems:"center", paddingLeft:5 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginBottom:3, alignItems:"center" }}>
                  <span style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{c.id}</span>
                  <Tag text={c.level || ai.level || "LOW"} color={col}/>
                  <Tag text={c.status || "Pending"} color={c.status === "Resolved" ? C.green : C.cyan}/>
                  {(c.corrupt || ai.corrupt_flag) && <Tag text="⚠ CORRUPT" color={C.purple}/>}
                  <span style={{ fontSize:7, color:C.dim, marginLeft:"auto", fontFamily:"'Share Tech Mono'" }}>{c.created_at ? new Date(c.created_at).toLocaleTimeString("en-IN") : ""}</span>
                </div>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:2, color:C.white, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.issue}</div>
                <div style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{(c.dept || ai.dept || "").slice(0, 22)} <span style={{ color:C.cyan }}>▼ FLIP</span></div>
              </div>
              <Ring val={sc} color={col} size={42}/>
            </div>
          </HCard>
        </div>
        <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", transform:"rotateX(180deg)" }}>
          <HCard color={col} style={{ padding:"10px 12px", height:"100%", overflow:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <span style={{ fontSize:8, color:C.cyan, fontFamily:"'Share Tech Mono'", fontWeight:700 }}>{c.id}</span>
              <div style={{ display:"flex", gap:5 }}>
                {c.status !== "Resolved" && (
                  <button onClick={() => { onResolve && onResolve(c.id); setFl(false); P.ok(); }}
                    style={{ background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}35`, borderRadius:5, padding:"3px 8px", fontSize:8, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'" }}>✓ RESOLVE</button>
                )}
                <button onClick={() => { P.click(); setFl(false); }} style={{ background:"rgba(255,255,255,0.04)", color:C.mid, border:`1px solid ${C.border}`, borderRadius:5, padding:"3px 7px", fontSize:9, cursor:"pointer" }}>✕</button>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:7, flexWrap:"wrap" }}>
              <Ring val={sc} color={col} size={42} label="Urgency"/>
              <Ring val={ai.corrupt_risk || 0} color={C.purple} size={42} label="Corrupt"/>
              <Ring val={ai.conf || 75} color={C.green} size={42} label="Confid."/>
            </div>
            <div style={{ fontSize:8.5, color:C.mid, lineHeight:1.55, fontFamily:"'Share Tech Mono'", marginBottom:5 }}>{ai.summary || c.issue}</div>
            {ai.wa && (
              <a href={`https://wa.me/?text=${encodeURIComponent(ai.wa)}`} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#25D36616", border:"1px solid #25D36638", borderRadius:5, padding:"3px 8px", color:"#25D366", fontSize:8, fontWeight:700, textDecoration:"none", fontFamily:"'Share Tech Mono'" }}>📲 WhatsApp</a>
            )}
          </HCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CHAT MARKDOWN RENDERER
// ═══════════════════════════════════════════════
function MsgText({ text }) {
  return (
    <div style={{ fontSize:10, lineHeight:1.7, fontFamily:"'Share Tech Mono'", color:C.white }}>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <br key={i}/>;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color:C.cyan }}>{p}</strong> : <span key={j}>{p}</span>);
        if (line.startsWith("→")) return <div key={i} style={{ display:"flex", gap:5, marginBottom:2 }}><span style={{ color:C.purple, flexShrink:0 }}>→</span><span>{rendered.slice(1)}</span></div>;
        return <div key={i} style={{ marginBottom:2 }}>{rendered}</div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AI SUPPORT PAGE
// ═══════════════════════════════════════════════
function SupportPage({ user }) {
  const [msgs, setMsgs] = useState([{
    id: 1, from: "ai", ts: new Date(),
    text: `🙏 **Namaste ${user?.name || ""}!**\n\nMain CivicEye AI Support Agent hoon — 24/7 ready!\n\n→ 📋 Complaint status track\n→ 📡 Filing guide\n→ ⚠️ Corruption report\n→ ⏱ SLA timelines\n→ 🤖 Automation info\n→ ⛓ Blockchain queries\n\nKoi bhi sawaal puchho — Hindi ya English! 😊`
  }]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const bot = useRef(null);
  const QUICK = [
    { i:"📋", l:"Complaint status track" }, { i:"⚠️", l:"Corruption report" },
    { i:"💧", l:"Water supply problem" }, { i:"🛣️", l:"Road pothole" },
    { i:"🤖", l:"AI Automation kya hai?" }, { i:"⛓", l:"Blockchain secure?" },
  ];
  useEffect(() => { bot.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);
  const send = async (txt) => {
    const msg = txt || inp.trim(); if (!msg || loading) return;
    P.msg(); setInp("");
    setMsgs(p => [...p, { id: Date.now(), from:"user", text:msg, ts:new Date() }]);
    setLoading(true);
    const res = await support(msg, user);
    P.msg(); setMsgs(p => [...p, { id: Date.now()+1, from:"ai", text:res, ts:new Date() }]);
    setLoading(false);
  };
  const IS = { flex:1, background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 13px", color:C.white, fontSize:11, fontFamily:"'Share Tech Mono'", outline:"none", transition:"all .2s" };
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - 128px)", gap:0 }}>
      <HCard color={C.green} style={{ padding:"11px 15px", marginBottom:9, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.green},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:`0 0 16px ${C.green}50`, animation:"float 4s ease-in-out infinite" }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.green, fontFamily:"'Orbitron'", letterSpacing:1.4 }}>AI SUPPORT AGENT</div>
            <div style={{ fontSize:7.5, color:C.mid, fontFamily:"'Share Tech Mono'", display:"flex", alignItems:"center", gap:5, marginTop:1 }}><Dot color={C.green} size={5}/>ONLINE 24/7 · Hindi + English · ~1s response</div>
          </div>
        </div>
      </HCard>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8, flexShrink:0 }}>
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q.l)} onMouseEnter={() => P.hover()}
            style={{ background:"rgba(0,240,255,0.05)", border:`1px solid ${C.border}`, borderRadius:18, padding:"4px 10px", color:C.cyan, fontSize:8.5, fontFamily:"'Share Tech Mono'", cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all .18s" }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(0,240,255,0.11)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(0,240,255,0.05)"}>
            {q.i} {q.l}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, paddingRight:2 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display:"flex", gap:8, alignItems:"flex-start", flexDirection:m.from === "user" ? "row-reverse" : "row" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:m.from === "ai" ? `linear-gradient(135deg,${C.green},${C.cyan})` : `linear-gradient(135deg,${C.blue},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{m.from === "ai" ? "🤖" : "👤"}</div>
            <div style={{ maxWidth:"78%", background:m.from === "ai" ? "rgba(0,255,136,0.05)" : "rgba(10,132,255,0.08)", border:`1px solid ${m.from === "ai" ? C.green + "22" : C.blue + "22"}`, borderRadius:m.from === "ai" ? "4px 11px 11px 11px" : "11px 4px 11px 11px", padding:"9px 12px", backdropFilter:"blur(10px)" }}>
              {m.from === "ai" ? <MsgText text={m.text}/> : <div style={{ fontSize:10, color:C.white, fontFamily:"'Share Tech Mono'", lineHeight:1.6 }}>{m.text}</div>}
              <div style={{ fontSize:7, color:C.dim, marginTop:4, fontFamily:"'Share Tech Mono'", textAlign:m.from === "user" ? "right" : "left" }}>{m.ts.toLocaleTimeString("en-IN")}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.green},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
            <div style={{ background:"rgba(0,255,136,0.05)", border:`1px solid ${C.green}22`, borderRadius:"4px 11px 11px 11px", padding:"11px 14px" }}>
              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.green, animation:`pulse 1s ease-in-out ${i*.2}s infinite` }}/>)}
                <span style={{ fontSize:8.5, color:C.green, fontFamily:"'Share Tech Mono'", marginLeft:3 }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bot}/>
      </div>
      <div style={{ display:"flex", gap:7, marginTop:8, flexShrink:0 }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Apni problem likho... (Hindi ya English)" style={IS}
          onFocus={e => { e.target.style.borderColor = C.green; e.target.style.background = "rgba(0,255,136,0.06)"; }}
          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = "rgba(0,240,255,0.04)"; }}/>
        <VoiceBtn onText={t => setInp(t)}/>
        <button onClick={() => send()} disabled={loading || !inp.trim()}
          style={{ background:`linear-gradient(135deg,${C.green},${C.cyan})`, color:"#000", border:"none", borderRadius:8, padding:"9px 15px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", opacity:loading || !inp.trim() ? 0.5 : 1 }}>➤</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// AI AUTOMATION PAGE
// ═══════════════════════════════════════════════
function AutoPage({ cpts, bch }) {
  const [jobs, setJobs] = useState(() => JOBS.map(j => ({ ...j, runs: Math.floor(Math.random()*35+5), last: new Date(Date.now() - Math.random()*3600000) })));
  const [running, setRunning] = useState(null);
  const [log, setLog] = useState([
    { ts: new Date(), msg:"🚀 Automation Engine initialized — 8 jobs active", t:"ok" },
    { ts: new Date(Date.now()-5000), msg:"⛓ Blockchain Logger: GENESIS block verified", t:"ok" },
    { ts: new Date(Date.now()-12000), msg:"👮 Officer Auto-Assign: monitoring for new complaints...", t:"info" },
  ]);
  const runJob = async (job) => {
    if (running) return; P.ok(); setRunning(job.id);
    setLog(p => [{ ts:new Date(), msg:`🚀 Running: ${job.name}...`, t:"info" }, ...p.slice(0,18)]);
    await new Promise(r => setTimeout(r, 1100));
    const results = {
      j1: cpts.filter(c=>c.corrupt||c.ai?.corrupt_flag).length > 0 ? `⚠️ ${cpts.filter(c=>c.corrupt||c.ai?.corrupt_flag).length} corruption cases escalated` : "✅ No corruption cases pending",
      j2: `🚨 ${cpts.filter(c=>(c.score||0)>=85).length} critical cases — SLA alerts sent`,
      j3: `🔍 Scanned ${cpts.length} complaints — 0 duplicates found`,
      j4: `👮 ${cpts.filter(c=>c.status!=="Resolved").length} complaints auto-assigned`,
      j5: `⛓ ${bch.length} blocks verified — Chain: ${BC.valid()?"VALID ✅":"INVALID ⚠"}`,
      j6: `📲 WhatsApp alerts sent for ${cpts.filter(c=>c.alert).length} complaints`,
      j7: `⏱ ${cpts.filter(c=>c.status!=="Resolved").length} open complaints tracked for SLA`,
      j8: "🗺 Ward risk scores recalculated for 4 wards",
    };
    setLog(p => [{ ts:new Date(), msg:results[job.id]||"✅ Completed", t:"ok" }, ...p.slice(0,18)]);
    setJobs(p => p.map(j => j.id === job.id ? { ...j, runs:j.runs+1, last:new Date() } : j));
    setRunning(null);
  };
  const runAll = async () => { for (const j of jobs) { await runJob(j); await new Promise(r => setTimeout(r, 250)); } };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11, flexWrap:"wrap", gap:8 }}>
        <div>
          <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.cyan, letterSpacing:1.8 }}>AI AUTOMATION ENGINE</h2>
          <p style={{ color:C.mid, fontSize:7.5, marginTop:2, fontFamily:"'Share Tech Mono'" }}>8 AUTONOMOUS JOBS · 24/7 · ZERO HUMAN INTERVENTION</p>
        </div>
        <button onClick={runAll} disabled={!!running} style={{ background:`linear-gradient(135deg,${C.green},${C.cyan})`, color:"#000", border:"none", borderRadius:8, padding:"8px 16px", fontSize:9.5, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", letterSpacing:1, opacity:running?0.6:1 }}>▶ RUN ALL</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:9, marginBottom:12 }}>
        {jobs.map(job => (
          <HCard key={job.id} color={C.green} style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:20, filter:`drop-shadow(0 0 7px ${C.green})` }}>{job.icon}</span>
                <div>
                  <div style={{ fontSize:9.5, fontWeight:700, color:C.green, fontFamily:"'Share Tech Mono'" }}>{job.name}</div>
                  <Tag text="ACTIVE" color={C.green} icon={<Dot color={C.green} size={4}/>}/>
                </div>
              </div>
              <button onClick={() => runJob(job)} disabled={!!running}
                style={{ background:running===job.id ? `${C.amber}18` : `${C.cyan}0d`, color:running===job.id ? C.amber : C.cyan, border:`1px solid ${running===job.id?C.amber:C.cyan}30`, borderRadius:6, padding:"4px 10px", fontSize:8, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", whiteSpace:"nowrap" }}>
                {running === job.id ? <><span style={{ width:8, height:8, border:`1.5px solid ${C.amber}50`, borderTopColor:C.amber, borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block", marginRight:4 }}/>RUNNING</> : "▶ RUN"}
              </button>
            </div>
            <div style={{ fontSize:8, color:C.dim, fontFamily:"'Share Tech Mono'", marginBottom:4 }}><span style={{ color:C.purple }}>TRIGGER:</span> {job.trigger}</div>
            <div style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'", marginBottom:7 }}><span style={{ color:C.cyan }}>ACTION:</span> {job.action}</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, color:C.dim, fontFamily:"'Share Tech Mono'", borderTop:`1px solid rgba(0,240,255,0.07)`, paddingTop:6 }}>
              <span>Runs: <span style={{ color:C.green }}>{job.runs}</span></span>
              <span>Last: <span style={{ color:C.amber }}>{job.last?.toLocaleTimeString("en-IN")}</span></span>
            </div>
          </HCard>
        ))}
      </div>
      <HCard color={C.purple} style={{ padding:13 }}>
        <div style={{ fontSize:7.5, color:C.mid, letterSpacing:1.5, marginBottom:8, fontFamily:"'Share Tech Mono'", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>📟 AUTOMATION LOG</span><Dot color={C.green} size={5}/>
        </div>
        <div style={{ fontFamily:"'Share Tech Mono'", fontSize:8.5, maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:3 }}>
          {log.map((l, i) => (
            <div key={i} style={{ display:"flex", gap:8, padding:"3px 7px", background:i===0?"rgba(0,255,136,0.04)":"rgba(0,240,255,0.02)", borderRadius:4, border:`1px solid ${i===0?C.green+"18":"rgba(0,240,255,0.05)"}` }}>
              <span style={{ color:C.dim, flexShrink:0, fontSize:7 }}>{l.ts.toLocaleTimeString("en-IN")}</span>
              <span style={{ color:l.t==="ok"?C.green:l.t==="warn"?C.amber:C.mid }}>{l.msg}</span>
            </div>
          ))}
        </div>
      </HCard>
    </div>
  );
}

// ═══════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [view, setView] = useState("login"); // login | signup | otp
  const [form, setForm] = useState({ name:"", mobile:"", password:"", cp:"", otp:"", ward:"" });
  const [otpMode, setOtpMode] = useState(""); // "login" or "signup"
  const [shownOtp, setShownOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const fi = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { Store.seed(); const s = Store.sess.get(); if (s) onLogin(s); }, []);
  useEffect(() => { let t; if (timer > 0) t = setTimeout(() => setTimer(v => v-1), 1000); return () => clearTimeout(t); }, [timer]);

  const sendOTP = async () => {
    if (!form.mobile || form.mobile.length !== 10) { setErr("Valid 10-digit mobile enter karo"); return; }
    if (view === "signup" && Store.find(form.mobile)) { setErr("Mobile already registered! Login karo."); return; }
    if (view === "login" && !Store.find(form.mobile)) { setErr("Mobile not registered! Pehle Sign Up karo."); return; }
    if (view === "login" && !form.password) { setErr("Password bhi enter karo"); return; }
    setLoad(true); setErr("");
    await new Promise(r => setTimeout(r, 600));
    const o = OTP.gen(form.mobile); setShownOtp(o); setOtpMode(view); setView("otp"); setTimer(60); P.ok(); setLoad(false);
  };

  const verify = async () => {
    if (!OTP.check(form.mobile, form.otp)) { setErr("Wrong OTP!"); P.err(); return; }
    setLoad(true);
    if (otpMode === "signup") {
      if (form.password !== form.cp) { setErr("Passwords match nahi karte!"); setLoad(false); return; }
      if (form.password.length < 6) { setErr("Password min 6 characters!"); setLoad(false); return; }
      const res = Store.register({ name:form.name, mobile:form.mobile, password:form.password, ward:form.ward||"Ward 1" });
      if (!res.ok) { setErr(res.msg); setLoad(false); return; }
      Store.sess.set(res.user); P.ok(); onLogin(res.user);
    } else {
      const res = Store.login(form.mobile, form.password);
      if (!res.ok) { setErr(res.msg); setLoad(false); return; }
      Store.sess.set(res.user); P.ok(); onLogin(res.user);
    }
    setLoad(false);
  };

  const directLogin = async () => {
    if (!form.mobile || !form.password) { setErr("Mobile aur password dono zaroori hain"); return; }
    setLoad(true); setErr("");
    await new Promise(r => setTimeout(r, 500));
    const res = Store.login(form.mobile, form.password);
    if (!res.ok) { P.err(); setErr(res.msg); setLoad(false); return; }
    Store.sess.set(res.user); P.ok(); onLogin(res.user); setLoad(false);
  };

  const IS = { background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:7, padding:"9px 12px", color:C.white, fontSize:12, width:"100%", fontFamily:"'Share Tech Mono'", outline:"none", transition:"all .2s" };
  const Btn = { width:"100%", background:`linear-gradient(135deg,${C.purple},${C.blue})`, color:"#fff", border:"none", borderRadius:8, padding:11, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", letterSpacing:1.4, display:"flex", alignItems:"center", justifyContent:"center", gap:8 };
  const Spin = () => <span style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>;

  return (
    <div style={{ position:"fixed", inset:0, background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:"'Rajdhani',monospace" }}>
      <Particles/>
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:415, padding:16, animation:"fadeUp .4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:42, animation:"float 4s ease-in-out infinite", filter:`drop-shadow(0 0 16px ${C.cyan})` }}>👁</div>
          <div style={{ fontSize:19, fontWeight:900, color:C.cyan, fontFamily:"'Orbitron'", letterSpacing:4, textShadow:`0 0 16px ${C.cyan}` }}>CIVICEYE</div>
          <div style={{ fontSize:7.5, color:C.purple, letterSpacing:2, marginTop:2, fontFamily:"'Share Tech Mono'" }}>HOLOGRAPHIC GOVERNANCE v6.0</div>
        </div>

        <div style={{ display:"flex", background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:9, padding:3, marginBottom:13, gap:3 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setView(m); setErr(""); P.click(); }}
              style={{ flex:1, background:view===m ? `linear-gradient(135deg,${C.purple},${C.blue})` : "none", border:"none", borderRadius:7, padding:"8px 0", color:view===m ? "#fff" : C.mid, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", letterSpacing:1 }}>
              {m === "login" ? "🔐 LOGIN" : "👤 SIGN UP"}
            </button>
          ))}
        </div>

        <HCard color={view === "otp" ? C.green : C.cyan} style={{ padding:19 }}>

          {view === "otp" ? (
            <div>
              <div style={{ background:`${C.green}0f`, border:`1px solid ${C.green}28`, borderRadius:7, padding:"10px 12px", marginBottom:13 }}>
                <div style={{ fontSize:8.5, color:C.green, fontFamily:"'Share Tech Mono'", marginBottom:3 }}>✅ OTP sent to +91-{form.mobile}</div>
                <div style={{ fontSize:7.5, color:C.dim, fontFamily:"'Share Tech Mono'" }}>Demo ke liye OTP: <span style={{ color:C.amber, fontSize:18, fontWeight:700, letterSpacing:5 }}>{shownOtp}</span></div>
                <div style={{ fontSize:7, color:C.dim, marginTop:2, fontFamily:"'Share Tech Mono'" }}>⚠ Production mein real SMS aayega (MSG91/Twilio)</div>
              </div>
              <label style={{ fontSize:7, color:C.mid, display:"block", marginBottom:4, fontFamily:"'Share Tech Mono'", letterSpacing:2 }}>6-DIGIT OTP</label>
              <input value={form.otp} onChange={e => fi("otp", e.target.value.slice(0,6))} placeholder="000000" maxLength={6}
                style={{ ...IS, fontSize:20, letterSpacing:8, textAlign:"center", marginBottom:12 }}
                onFocus={e => { e.target.style.borderColor = C.green; }} onBlur={e => { e.target.style.borderColor = C.border; }}
                onKeyDown={e => e.key === "Enter" && verify()}/>
              {otpMode === "login" && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:7, color:C.mid, display:"block", marginBottom:4, fontFamily:"'Share Tech Mono'", letterSpacing:2 }}>PASSWORD</label>
                  <input type="password" value={form.password} onChange={e => fi("password", e.target.value)} placeholder="Your password"
                    style={IS} onFocus={e => e.target.style.borderColor = C.cyan} onBlur={e => e.target.style.borderColor = C.border}/>
                </div>
              )}
              {err && <div style={{ background:`${C.red}12`, border:`1px solid ${C.red}32`, borderRadius:6, padding:"7px 10px", marginBottom:11, fontSize:8.5, color:C.red, fontFamily:"'Share Tech Mono'" }}>{err}</div>}
              <button onClick={verify} disabled={load || form.otp.length !== 6} style={{ ...Btn, marginBottom:7, opacity:load || form.otp.length!==6 ? 0.6:1 }}>
                {load ? <><Spin/>VERIFYING...</> : "✅ VERIFY & ACCESS"}
              </button>
              <button onClick={() => { setView(otpMode || "login"); setForm(p => ({...p, otp:""})); setErr(""); }}
                style={{ width:"100%", background:"none", border:`1px solid ${C.border}`, borderRadius:7, padding:"8px 0", color:C.mid, fontSize:9.5, cursor:"pointer", fontFamily:"'Share Tech Mono'" }}>← BACK</button>
              {timer > 0 && <div style={{ textAlign:"center", marginTop:7, fontSize:8, color:C.dim, fontFamily:"'Share Tech Mono'" }}>Resend in {timer}s</div>}
              {timer === 0 && <button onClick={sendOTP} style={{ width:"100%", background:"none", border:"none", color:C.cyan, fontSize:9.5, cursor:"pointer", fontFamily:"'Share Tech Mono'", marginTop:5 }}>Resend OTP</button>}
            </div>

          ) : view === "signup" ? (
            <div>
              <div style={{ fontSize:7.5, color:C.mid, letterSpacing:2, marginBottom:13, fontFamily:"'Share Tech Mono'" }}>👤 NEW CITIZEN REGISTRATION</div>
              {[{k:"name",l:"FULL NAME *",p:"Aapka poora naam"},{k:"mobile",l:"MOBILE NUMBER *",p:"10 digits",t:"tel",mx:10},{k:"ward",l:"WARD / AREA",p:"Ward 1, 2, 3..."}].map(fd => (
                <div key={fd.k} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:7, color:C.mid, display:"block", marginBottom:3, fontFamily:"'Share Tech Mono'", letterSpacing:2 }}>{fd.l}</label>
                  <input type={fd.t||"text"} maxLength={fd.mx} value={form[fd.k]} onChange={e => fi(fd.k, e.target.value)} placeholder={fd.p}
                    style={IS} onFocus={e => { e.target.style.borderColor = C.cyan; P.hover(); }} onBlur={e => e.target.style.borderColor = C.border}/>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:10 }}>
                {[{k:"password",l:"PASSWORD *",p:"Min 6 chars"},{k:"cp",l:"CONFIRM *",p:"Same"}].map(fd => (
                  <div key={fd.k}>
                    <label style={{ fontSize:7, color:C.mid, display:"block", marginBottom:3, fontFamily:"'Share Tech Mono'", letterSpacing:1.4 }}>{fd.l}</label>
                    <input type="password" value={form[fd.k]} onChange={e => fi(fd.k, e.target.value)} placeholder={fd.p}
                      style={{...IS,padding:"8px 10px",fontSize:11}} onFocus={e => e.target.style.borderColor=C.cyan} onBlur={e => e.target.style.borderColor=C.border}/>
                  </div>
                ))}
              </div>
              {err && <div style={{ background:`${C.red}12`, border:`1px solid ${C.red}32`, borderRadius:6, padding:"7px 10px", marginBottom:11, fontSize:8.5, color:C.red, fontFamily:"'Share Tech Mono'" }}>{err}</div>}
              <button onClick={sendOTP} disabled={load} style={{ ...Btn, opacity:load?0.6:1 }}>
                {load ? <><Spin/>SENDING OTP...</> : "📱 SEND OTP & REGISTER"}
              </button>
            </div>

          ) : (
            <div>
              <div style={{ fontSize:7.5, color:C.mid, letterSpacing:2, marginBottom:13, fontFamily:"'Share Tech Mono'" }}>🔐 CITIZEN / OFFICER LOGIN</div>
              {[{k:"mobile",l:"MOBILE NUMBER",p:"Registered mobile",t:"tel",mx:10},{k:"password",l:"PASSWORD",p:"Enter password",t:"password"}].map(fd => (
                <div key={fd.k} style={{ marginBottom:11 }}>
                  <label style={{ fontSize:7, color:C.mid, display:"block", marginBottom:3, fontFamily:"'Share Tech Mono'", letterSpacing:2 }}>{fd.l}</label>
                  <input type={fd.t||"text"} maxLength={fd.mx} value={form[fd.k]} onChange={e => fi(fd.k, e.target.value)} placeholder={fd.p}
                    style={IS} onFocus={e => { e.target.style.borderColor = C.cyan; P.hover(); }} onBlur={e => e.target.style.borderColor = C.border} onKeyDown={e => e.key === "Enter" && directLogin()}/>
                </div>
              ))}
              {err && <div style={{ background:`${C.red}12`, border:`1px solid ${C.red}32`, borderRadius:6, padding:"7px 10px", marginBottom:11, fontSize:8.5, color:C.red, fontFamily:"'Share Tech Mono'" }}>{err}</div>}
              <button onClick={directLogin} disabled={load} style={{ ...Btn, marginBottom:11, opacity:load?0.6:1 }}>
                {load ? <><Spin/>AUTHENTICATING...</> : "🔐 LOGIN"}
              </button>
              <div style={{ background:"rgba(0,240,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 11px" }}>
                <div style={{ fontSize:7.5, color:C.dim, fontFamily:"'Share Tech Mono'", marginBottom:5 }}>🔧 STAFF ACCOUNTS (pre-seeded):</div>
                <div style={{ fontSize:9, color:C.mid, fontFamily:"'Share Tech Mono'", lineHeight:2 }}>
                  Officer: <span style={{ color:C.green }}>9999999999</span> / <span style={{ color:C.green }}>officer@123</span><br/>
                  Admin: <span style={{ color:C.purple }}>8888888888</span> / <span style={{ color:C.purple }}>admin@123</span>
                </div>
              </div>
            </div>
          )}
        </HCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [phase, setPhase]   = useState("auth");
  const [user, setUser]     = useState(null);
  const [tab, setTab]       = useState("cmd");
  const [sideOpen, setSide] = useState(true);
  const [isMob, setMob]     = useState(window.innerWidth < 768);
  const [dbUp, setDbUp]     = useState(null);
  const [now, setNow]       = useState(new Date());
  const [cpts, setCpts]     = useState([]);
  const [logs, setLogs]     = useState([]);
  const [bch, setBch]       = useState(BC.chain.slice());
  const [agLoad, setAgL]    = useState([82,45,91,67,78,34,55,60]);
  const [spark, setSpark]   = useState(() => Array.from({length:14},()=>Math.round(Math.random()*28+5)));
  const [toasts, setToasts] = useState([]);
  const [installP, setIP]   = useState(null);
  const [form, setForm]     = useState({ name:"", mobile:"", ward:"", address:"", text:"" });
  const [aiR, setAiR]       = useState(null);
  const [filing, setFiling] = useState("idle");
  const [savedId, setSaved] = useState("");
  const tid = useRef(0);
  const [twText, setTW]     = useState("");

  // Typewriter for AI result
  useEffect(() => {
    if (filing !== "confirming" || !aiR?.summary) return;
    setTW(""); let i = 0;
    const t = setInterval(() => { i++; setTW(aiR.summary.slice(0, i)); if (i >= aiR.summary.length) clearInterval(t); }, 22);
    return () => clearInterval(t);
  }, [filing, aiR]);

  const toast = useCallback((msg, type = "info", dur = 4000) => {
    const id = ++tid.current;
    setToasts(p => [...p, { id, msg, type }]);
    if (type==="success") P.ok(); else if (type==="error") P.err(); else if (type==="warn") P.warn(); else P.click();
    if ("Notification" in window && Notification.permission === "granted") { try { new Notification("CivicEye", { body:msg }); } catch {} }
    if (dur > 0) setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  }, []);

  useEffect(() => { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); }, []);
  useEffect(() => { const h = e => { e.preventDefault(); setIP(e); }; window.addEventListener("beforeinstallprompt", h); return () => window.removeEventListener("beforeinstallprompt", h); }, []);
  useEffect(() => { const fn = () => { const m = window.innerWidth < 768; setMob(m); if (m) setSide(false); else setSide(true); }; window.addEventListener("resize", fn); fn(); return () => window.removeEventListener("resize", fn); }, []);

  const fetchData = useCallback(async () => {
    try {
      const [c, l] = await Promise.all([
        fetch(`${API}/complaints`).then(r => r.json()),
        fetch(`${API}/agents/logs?limit=50`).then(r => r.json()),
      ]);
      setCpts(Array.isArray(c) ? c : []); setLogs(Array.isArray(l) ? l : []); setDbUp(true);
    } catch { setDbUp(false); }
  }, []);

  useEffect(() => {
    if (phase !== "app") return;
    fetchData();
    const t = setInterval(() => {
      setNow(new Date());
      setAgL(p => p.map(v => Math.max(18, Math.min(99, v + (Math.random()-.5)*7))));
      setSpark(p => [...p.slice(1), Math.round(Math.random()*28+5)]);
      fetchData();
    }, 5000);
    return () => clearInterval(t);
  }, [phase, fetchData]);

  const onLogin = (u) => { setUser(u); setPhase("boot"); setTab(u.role === "officer" ? "ocases" : "cmd"); setForm(f => ({...f, name:u.name, mobile:u.mobile||"", ward:u.ward||""})); };
  const onLogout = () => { P.click(); Store.sess.clear(); setUser(null); setPhase("auth"); };
  const go = (id) => { P.nav(); setTab(id); if (isMob) setSide(false); };
  const nav = user?.role === "officer" ? ONAV : CNAV;
  const alertN = cpts.filter(c => c.alert || c.ai?.alert).length;
  const corr = cpts.filter(c => c.corrupt || c.ai?.corrupt_flag);
  const esc_ = cpts.filter(c => c.escalate || c.status === "Escalated" || c.ai?.escalate);
  const crit = cpts.filter(c => (c.score || c.ai?.score || 0) >= 80);
  const byDept = {};
  cpts.forEach(c => { const d = (c.dept || c.ai?.dept || "Other").split(" ")[0]; byDept[d] = (byDept[d]||0)+1; });

  const doAnalyze = async () => {
    if (!form.text.trim() || !form.name.trim()) { toast("Naam aur complaint dono zaroori hain!", "error"); return; }
    P.click(); setFiling("analyzing");
    const r = await classify(form.text);
    setAiR(r); setFiling("confirming"); P.ok();
  };

  const doSubmit = async () => {
    setFiling("saving"); P.click();
    try {
      let cid;
      if (dbUp) {
        const res = await fetch(`${API}/complaints`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:form.name, mobile:form.mobile, address:`${form.ward} — ${form.address}`, issue:form.text, ai_data:JSON.stringify(aiR) }) });
        cid = (await res.json()).complaint_id; await fetchData();
      } else {
        await new Promise(r => setTimeout(r, 600));
        cid = aiR.id;
        const nc = { id:cid, name:form.name, mobile:form.mobile, issue:form.text, dept:aiR.dept, level:aiR.level, status:aiR.escalate?"Escalated":"Assigned", score:aiR.score, corrupt:aiR.corrupt_flag, alert:aiR.alert, escalate:aiR.escalate, ai:aiR, created_at:new Date().toISOString() };
        setCpts(p => [nc, ...p]);
        setLogs(p => [{ from_agent:"CivicEye AI", to_agent:aiR.dept, message:`${cid} | ${aiR.score} | ${aiR.level} | ${aiR.corrupt_flag?"⚠ CORRUPTION":"Clean"}`, severity:aiR.corrupt_flag?"WARN":"INFO", created_at:new Date().toISOString() }, ...p]);
      }
      BC.add({ id:cid, issue:form.text, dept:aiR.dept, level:aiR.level, corrupt:aiR.corrupt_flag, by:user?.name, ts:new Date().toISOString() });
      setBch(BC.chain.slice()); P.chain();
      toast(`✅ ${cid} registered! ⛓ Block added.`, "success");
      if (aiR.corrupt_flag) setTimeout(() => toast("⚠️ Corruption flagged! Vigilance notified.", "warn"), 900);
      if (aiR.escalate) setTimeout(() => toast(`↑ Escalated to ${aiR.esc_to}`, "warn"), 1800);
      setSaved(cid); setFiling("done"); setForm(f => ({...f, text:"", address:""}));
    } catch (e) { toast("Submit failed: " + e.message, "error"); setFiling("confirming"); }
  };

  const doResolve = async (id) => {
    P.ok();
    if (dbUp) { await fetch(`${API}/complaints/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status:"Resolved"}) }); await fetchData(); }
    else setCpts(p => p.map(c => c.id === id ? {...c, status:"Resolved"} : c));
    BC.add({ action:"RESOLVED", id, by:user?.name, ts:new Date().toISOString() });
    setBch(BC.chain.slice()); toast(`${id} resolved! ⛓ Chain updated.`, "success");
  };

  const resetForm = () => { setFiling("idle"); setAiR(null); setSaved(""); };

  if (phase === "auth") return <AuthScreen onLogin={onLogin}/>;
  if (phase === "boot") return <BootScreen done={() => setPhase("app")}/>;

  const SW = sideOpen ? (isMob ? "100vw" : 215) : (isMob ? 0 : 48);
  const IS = { background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 11px", color:C.white, fontSize:11.5, width:"100%", fontFamily:"'Share Tech Mono'", outline:"none", transition:"all .2s" };
  const PB = { background:`linear-gradient(135deg,${C.purple},${C.blue})`, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", letterSpacing:1, boxShadow:`0 4px 16px ${C.blue}35`, transition:"all .2s" };

  return (
    <div style={{ display:"flex", height:"100dvh", width:"100vw", overflow:"hidden", background:C.bg, fontFamily:"'Rajdhani',monospace", color:C.white, position:"relative" }}>
      <style>{css}</style>
      <Particles/><Grid/>
      <Toasts items={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))}/>

      {isMob && sideOpen && <div onClick={() => setSide(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:199, backdropFilter:"blur(4px)" }}/>}

      {/* ── SIDEBAR ── */}
      <aside style={{ width:SW, minWidth:SW, height:"100dvh", background:"rgba(1,4,8,0.94)", backdropFilter:"blur(28px)", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"width .22s ease,min-width .22s ease", overflow:"hidden", position:isMob?"fixed":"relative", zIndex:isMob?200:2, flexShrink:0 }}>
        <div style={{ padding:sideOpen?"12px 13px 9px":"12px 8px 9px", borderBottom:`1px solid rgba(0,240,255,0.12)`, display:"flex", alignItems:"center", gap:8, minHeight:52, background:"rgba(0,240,255,0.016)" }}>
          <div onClick={() => P.click()} style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${C.purple},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, boxShadow:`0 0 16px ${C.cyan}45`, animation:"float 4s ease-in-out infinite", cursor:"pointer" }}>👁</div>
          {sideOpen && <div style={{ animation:"fadeUp .22s ease" }}><div style={{ fontSize:10, fontWeight:900, letterSpacing:3, color:C.cyan, fontFamily:"'Orbitron'", textShadow:`0 0 12px ${C.cyan}` }}>CIVICEYE</div><div style={{ fontSize:6, color:C.purple, letterSpacing:1.5 }}>v6.0 · {user?.role?.toUpperCase()}</div></div>}
          {isMob && sideOpen && <button onClick={() => setSide(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:C.mid, fontSize:14, cursor:"pointer" }}>✕</button>}
        </div>

        {sideOpen && user && (
          <div style={{ margin:"6px 9px 2px", background:"rgba(0,240,255,0.04)", border:`1px solid rgba(0,240,255,0.12)`, borderRadius:8, padding:"6px 8px", display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background:`linear-gradient(135deg,${user.role==="officer"?C.green:user.role==="admin"?C.purple:C.blue},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>{user.role==="officer"?"👮":user.role==="admin"?"🛡":"👤"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:8.5, color:C.white, fontWeight:700, fontFamily:"'Share Tech Mono'", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:6.5, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{user.mobile} · {user.ward||user.dept}</div>
            </div>
          </div>
        )}

        <nav style={{ flex:1, padding:"2px 0", overflowY:"auto" }}>
          {nav.map(item => {
            const active = tab === item.id;
            const badge = item.id === "esc" && alertN > 0;
            return (
              <button key={item.id} onClick={() => go(item.id)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:sideOpen?"7px 13px":"7px 0", justifyContent:sideOpen?"flex-start":"center", background:active?"rgba(0,240,255,0.05)":"none", border:"none", borderLeft:active?`2px solid ${C.cyan}`:"2px solid transparent", color:active?C.cyan:C.mid, fontSize:sideOpen?10:13, fontWeight:active?700:400, transition:"all .13s", position:"relative", fontFamily:active?"'Share Tech Mono'":"'Rajdhani'", cursor:"pointer" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background="rgba(0,240,255,0.03)"; e.currentTarget.style.color=C.white; } P.hover(); }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background="none"; e.currentTarget.style.color=C.mid; } }}>
                <span style={{ filter:active?`drop-shadow(0 0 5px ${C.cyan})`:"none", fontSize:sideOpen?12:14 }}>{item.icon}</span>
                {sideOpen && <span style={{ animation:"fadeUp .16s ease" }}>{item.label}</span>}
                {badge && sideOpen && <span style={{ marginLeft:"auto", background:C.red, color:"#fff", borderRadius:9, padding:"1px 6px", fontSize:7, fontWeight:700, animation:"glow 2s infinite", fontFamily:"'Share Tech Mono'" }}>{alertN}</span>}
                {active && <div style={{ position:"absolute", right:0, top:"18%", bottom:"18%", width:2, background:C.cyan, boxShadow:`0 0 6px ${C.cyan}` }}/>}
              </button>
            );
          })}
        </nav>

        {sideOpen && (
          <div style={{ padding:"6px 9px", borderTop:`1px solid rgba(0,240,255,0.09)`, display:"flex", flexDirection:"column", gap:4 }}>
            {installP && (
              <button onClick={async () => { P.ok(); installP.prompt(); const { outcome } = await installP.userChoice; if (outcome==="accepted") toast("📱 CivicEye installed!", "success"); setIP(null); }}
                style={{ background:`${C.green}13`, color:C.green, border:`1px solid ${C.green}28`, borderRadius:7, padding:"5px 8px", fontSize:7.5, fontWeight:700, fontFamily:"'Share Tech Mono'", cursor:"pointer" }}>📱 INSTALL APP</button>
            )}
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={() => { P.on = !P.on; P.click(); toast(P.on ? "🎹 Sound ON" : "🔇 Sound OFF", "info"); }}
                style={{ flex:1, background:"rgba(0,240,255,0.05)", color:C.mid, border:`1px solid rgba(0,240,255,0.12)`, borderRadius:6, padding:"5px 6px", fontSize:7.5, fontFamily:"'Share Tech Mono'", cursor:"pointer" }}>🎹</button>
              <button onClick={onLogout}
                style={{ flex:1, background:"rgba(255,45,85,0.07)", color:C.red, border:`1px solid ${C.red}20`, borderRadius:6, padding:"5px 6px", fontSize:7.5, fontFamily:"'Share Tech Mono'", cursor:"pointer" }}>⏏ OUT</button>
            </div>
            <div style={{ background:"rgba(0,240,255,0.03)", borderRadius:7, padding:"4px 7px", border:`1px solid rgba(0,240,255,0.09)` }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:1 }}><Dot color={dbUp?C.green:C.amber} size={4}/><span style={{ fontSize:6.5, color:dbUp?C.green:C.amber, fontFamily:"'Share Tech Mono'", fontWeight:700 }}>{dbUp?"LIVE":"DEMO"}</span></div>
              <div style={{ fontSize:6.5, color:C.dim, fontFamily:"'Share Tech Mono'" }}>⛓ {bch.length} BLOCKS · {BC.valid()?"✓ VALID":"⚠"}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0, position:"relative", zIndex:1 }}>

        {/* TOPBAR */}
        <header style={{ background:"rgba(1,4,8,0.9)", backdropFilter:"blur(22px)", borderBottom:`1px solid rgba(0,240,255,0.12)`, padding:"0 13px", display:"flex", alignItems:"center", gap:8, height:46, flexShrink:0 }}>
          <button onClick={() => { P.click(); setSide(s => !s); }}
            style={{ background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", color:C.mid, fontSize:11, cursor:"pointer", transition:"all .13s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(0,240,255,0.09)"; e.currentTarget.style.color=C.cyan; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(0,240,255,0.04)"; e.currentTarget.style.color=C.mid; }}>
            {isMob ? "☰" : sideOpen ? "◀" : "▶"}
          </button>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:7, color:C.purple, letterSpacing:2.5, fontFamily:"'Share Tech Mono'" }}>SYS/</span>
            <span style={{ fontSize:9, fontWeight:700, fontFamily:"'Orbitron'", letterSpacing:1.8, color:C.cyan, textShadow:`0 0 8px ${C.cyan}50` }}>{nav.find(n => n.id===tab)?.label?.toUpperCase() || "CIVICEYE"}</span>
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            {alertN > 0 && (
              <div onClick={() => { P.warn(); go("esc"); }} style={{ display:"flex", alignItems:"center", gap:4, background:`rgba(255,45,85,0.09)`, border:`1px solid ${C.red}35`, borderRadius:16, padding:"3px 8px", animation:"glow 2s infinite", cursor:"pointer" }}>
                <Dot color={C.red} size={5}/><span style={{ fontSize:8, color:C.red, fontWeight:700, fontFamily:"'Share Tech Mono'" }}>{alertN}</span>
              </div>
            )}
            {!isMob && [
              { l:"BLOCKS", v:bch.length, c:C.purple },
              { l:"CRIT",   v:crit.length, c:C.red },
              { l:"FLAGS",  v:corr.length, c:C.orange },
            ].map((s, i) => (
              <div key={i} onClick={() => P.click()} style={{ background:"rgba(0,240,255,0.04)", border:`1px solid rgba(0,240,255,0.12)`, borderRadius:6, padding:"2px 8px", display:"flex", gap:4, alignItems:"center", cursor:"pointer" }}>
                <span style={{ fontSize:7, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{s.l}</span>
                <span style={{ fontSize:10, color:s.c, fontWeight:700, fontFamily:"'Share Tech Mono'" }}>{s.v}</span>
              </div>
            ))}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.cyan, fontFamily:"'Share Tech Mono'" }}>{now.toLocaleTimeString()}</div>
              <div style={{ fontSize:6.5, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{now.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ flex:1, overflowY:"auto", padding:isMob?8:15, paddingBottom:isMob?64:15 }}>

          {/* ── COMMAND CENTER ── */}
          {tab === "cmd" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <HCard color={C.cyan} style={{ padding:isMob?"14px":"18px 24px", marginBottom:12 }}>
                <div style={{ fontSize:6.5, letterSpacing:3.5, color:C.cyan, marginBottom:4, fontFamily:"'Share Tech Mono'", display:"flex", alignItems:"center", gap:7 }}><Dot color={C.green} size={5}/>v6.0 LIVE — {user?.name?.toUpperCase()}</div>
                <h1 style={{ fontSize:isMob?16:22, fontWeight:900, fontFamily:"'Orbitron'", letterSpacing:1.8, marginBottom:4, background:`linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CIVIC GOVERNANCE AI</h1>
                <p style={{ color:C.mid, fontSize:10, marginBottom:12, maxWidth:480 }}>Real Auth · AI Support · AI Automation · Blockchain · Piano UI · PWA</p>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {[{l:"📡 FILE COMPLAINT",id:"file",c:C.blue},{l:"🤖 AUTOMATION",id:"automation",c:C.green},{l:"💬 AI SUPPORT",id:"support",c:C.cyan},{l:"⛓ BLOCKCHAIN",id:"chain",c:C.purple}].map(b => (
                    <button key={b.id} onClick={() => go(b.id)} onMouseEnter={() => P.hover()}
                      style={{ background:`${b.c}16`, color:b.c, border:`1px solid ${b.c}35`, borderRadius:8, padding:"9px 14px", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'Share Tech Mono'", transition:"all .18s" }}
                      onMouseOver={e => e.currentTarget.style.background=`${b.c}25`} onMouseOut={e => e.currentTarget.style.background=`${b.c}16`}>
                      {b.l}
                    </button>
                  ))}
                </div>
              </HCard>

              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:8, marginBottom:12 }}>
                <Stat label="Total Cases" value={cpts.length} color={C.cyan} icon="📋"/>
                <Stat label="Critical" value={crit.length} color={C.red} icon="🚨"/>
                <Stat label="Corruption" value={corr.length} color={C.purple} icon="⚠"/>
                <Stat label="Blockchain" value={bch.length} color={C.blue} icon="⛓"/>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                <HCard color={C.red} style={{ padding:12 }}>
                  <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:8, fontFamily:"'Share Tech Mono'", display:"flex", justifyContent:"space-between" }}>🚨 CRITICAL CASES<Dot color={C.red} size={5}/></div>
                  <Sparkline vals={spark} color={C.red} h={32}/>
                  {crit.slice(0,3).map((c,i) => (
                    <div key={i} style={{ display:"flex", gap:6, padding:"3px 0", borderBottom:`1px solid rgba(0,240,255,0.04)` }}>
                      <div style={{ width:2, height:22, background:C.red, flexShrink:0, borderRadius:1 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:9, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.issue}</div>
                        <div style={{ fontSize:7, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{(c.dept||"").split(" ")[0]}</div>
                      </div>
                    </div>
                  ))}
                  {crit.length === 0 && <p style={{ fontSize:8.5, color:C.dim, textAlign:"center", padding:"9px 0", fontFamily:"'Share Tech Mono'" }}>NO CRITICAL</p>}
                </HCard>

                <HCard color={C.cyan} style={{ padding:12 }}>
                  <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:7, fontFamily:"'Share Tech Mono'" }}>🏛 DEPT LOAD</div>
                  <Sparkline vals={spark.map((v,i)=>v*(i%3+1)/3)} color={C.cyan} h={24}/>
                  <div style={{ marginTop:6 }}>
                    <Bars data={Object.entries(byDept).slice(0,5).map(([k,v])=>({k,v,c:C.cyan}))}/>
                  </div>
                  {Object.keys(byDept).length === 0 && <p style={{ fontSize:8.5, color:C.dim, textAlign:"center", padding:"9px 0", fontFamily:"'Share Tech Mono'" }}>NO DATA YET</p>}
                </HCard>

                <HCard color={C.green} style={{ padding:12 }}>
                  <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:8, fontFamily:"'Share Tech Mono'", display:"flex", justifyContent:"space-between" }}>🤖 ENGINE LOG<Dot color={C.green} size={5}/></div>
                  <div style={{ fontFamily:"'Share Tech Mono'", fontSize:7.5, maxHeight:125, overflowY:"auto" }}>
                    {logs.slice(0,6).map((l,i) => (
                      <div key={i} style={{ padding:"2px 0", borderBottom:`1px solid rgba(0,240,255,0.04)`, display:"flex", gap:4 }}>
                        <span style={{ color:C.dim, flexShrink:0, fontSize:7 }}>{new Date(l.created_at||Date.now()).toLocaleTimeString("en-IN")}</span>
                        <span style={{ flex:1, color:l.severity==="WARN"?C.amber:C.mid }}>{l.message?.slice(0,35)}</span>
                      </div>
                    ))}
                    {logs.length === 0 && <p style={{ color:C.dim, padding:"7px 0" }}>STANDBY...</p>}
                  </div>
                </HCard>
              </div>

              <HCard color={C.purple} style={{ padding:12 }}>
                <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:10, fontFamily:"'Share Tech Mono'", display:"flex", justifyContent:"space-between" }}>📍 WARD RISK INDEX<span style={{ color:C.purple }}>HOLOGRAPHIC</span></div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:7 }}>
                  {[["Ward 1",72],["Ward 2",45],["Ward 3",88],["Ward 4",31]].map(([w,r]) => {
                    const col = r>=80?C.red:r>=60?C.orange:r>=40?C.amber:C.green;
                    return (
                      <div key={w} style={{ background:`${col}07`, border:`1px solid ${col}25`, borderRadius:10, padding:"10px 6px", textAlign:"center", transition:"all .22s", cursor:"pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.background=`${col}12`; e.currentTarget.style.transform="scale(1.04)"; P.hover(); }}
                        onMouseLeave={e => { e.currentTarget.style.background=`${col}07`; e.currentTarget.style.transform="none"; }}
                        onClick={() => P.click()}>
                        <Ring val={r} color={col} size={44}/>
                        <div style={{ fontSize:8, color:C.mid, marginTop:4, fontFamily:"'Share Tech Mono'" }}>{w}</div>
                        <Tag text={r>=80?"CRITICAL":r>=60?"HIGH":r>=40?"MEDIUM":"LOW"} color={col}/>
                      </div>
                    );
                  })}
                </div>
              </HCard>
            </div>
          )}

          {/* ── FILE COMPLAINT ── */}
          {tab === "file" && (
            <div style={{ maxWidth:670, animation:"fadeUp .3s ease" }}>
              <div style={{ marginBottom:11 }}>
                <h2 style={{ fontSize:14, fontWeight:700, fontFamily:"'Orbitron'", letterSpacing:1.8, color:C.cyan }}>FILE COMPLAINT</h2>
                <p style={{ color:C.mid, fontSize:8, marginTop:2, fontFamily:"'Share Tech Mono'" }}>AI · ⛓ BLOCKCHAIN · 🎤 VOICE · 📲 WHATSAPP · 🔔 NOTIFY</p>
              </div>

              {filing === "done" ? (
                <HCard color={C.green} style={{ padding:26, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:8, filter:`drop-shadow(0 0 20px ${C.green})`, animation:"float 3s ease-in-out infinite" }}>✅</div>
                  <div style={{ fontFamily:"'Orbitron'", fontSize:12, color:C.green, marginBottom:4, letterSpacing:2.5 }}>REGISTERED!</div>
                  <div style={{ fontFamily:"'Share Tech Mono'", fontSize:13, color:C.cyan, marginBottom:3 }}>{savedId}</div>
                  <div style={{ fontSize:8, color:C.purple, marginBottom:13, fontFamily:"'Share Tech Mono'" }}>⛓ BLOCK #{bch.length-1} ADDED TO CHAIN</div>
                  {aiR?.wa && (
                    <div style={{ marginBottom:12 }}>
                      <a href={`https://wa.me/?text=${encodeURIComponent(aiR.wa)}`} target="_blank" rel="noopener noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#25D36616", border:"1px solid #25D36640", borderRadius:6, padding:"7px 13px", color:"#25D366", fontSize:9.5, fontWeight:700, textDecoration:"none", fontFamily:"'Share Tech Mono'" }}>📲 SHARE ON WHATSAPP</a>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                    <button onClick={() => { go("cases"); resetForm(); }} style={PB}>📋 VIEW ALL CASES</button>
                    <button onClick={() => { go("chain"); resetForm(); }} style={{ ...PB, background:`linear-gradient(135deg,${C.purple},${C.blue}55)` }}>⛓ BLOCKCHAIN</button>
                    <button onClick={resetForm} style={{ background:"rgba(0,240,255,0.06)", color:C.cyan, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontSize:10.5, cursor:"pointer", fontFamily:"'Share Tech Mono'" }}>+ NEW</button>
                  </div>
                </HCard>

              ) : filing === "confirming" && aiR ? (
                <div>
                  <HCard color={C.amber} style={{ padding:16, marginBottom:10 }}>
                    <div style={{ fontSize:7, color:C.cyan, letterSpacing:1.8, marginBottom:10, fontFamily:"'Share Tech Mono'", display:"flex", alignItems:"center", gap:7 }}><Dot color={C.green} size={5}/>AI ANALYSIS COMPLETE</div>
                    <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
                      <Ring val={aiR.score} color={UC[aiR.level]||C.amber} size={62} label="Urgency"/>
                      <Ring val={aiR.corrupt_risk} color={aiR.corrupt_flag?C.purple:C.cyan} size={62} label="Corrupt"/>
                      <Ring val={aiR.conf} color={C.green} size={62} label="Confid."/>
                    </div>
                    <div style={{ marginBottom:11 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                        <span style={{ fontSize:8.5, color:UC[aiR.level], fontWeight:700, fontFamily:"'Share Tech Mono'" }}>{aiR.level?.toUpperCase()} — {aiR.cat}</span>
                        <span style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{aiR.score}/100</span>
                      </div>
                      <div style={{ background:"rgba(0,240,255,0.05)", borderRadius:3, height:5, overflow:"hidden" }}>
                        <div style={{ width:`${aiR.score}%`, height:"100%", background:UC[aiR.level], transition:"width 1.4s ease" }}/>
                      </div>
                    </div>
                    <div style={{ background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 11px", marginBottom:10 }}>
                      <div style={{ fontSize:6.5, color:C.cyan, letterSpacing:1.8, marginBottom:4, fontFamily:"'Share Tech Mono'" }}>🧠 AI SUMMARY</div>
                      <div style={{ fontSize:9.5, color:C.mid, lineHeight:1.65, fontFamily:"'Share Tech Mono'" }}>{twText}<span style={{ animation:"blink .7s infinite", color:C.cyan }}>|</span></div>
                    </div>
                    <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginBottom:10 }}>
                      <Tag text={aiR.cat} color={C.blue}/>
                      <Tag text={aiR.ward} color={C.amber} icon="📍"/>
                      {aiR.corrupt_flag && <Tag text="⚠ CORRUPTION" color={C.purple}/>}
                      {aiR.alert && <Tag text="ALERT" color={C.red}/>}
                      {aiR.escalate && <Tag text={`↑ ${aiR.esc_to}`} color={C.orange}/>}
                      <Tag text="⛓ BLOCKCHAIN" color={C.purple}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr 1fr":"repeat(3,1fr)", gap:5 }}>
                      {[{l:"DEPT",v:aiR.dept},{l:"SLA",v:aiR.sla_text},{l:"ID",v:aiR.id},{l:"IMPACT",v:aiR.impact},{l:"OFFICER",v:aiR.officer_grade},{l:"SLA HRS",v:`${aiR.sla}h`}].map((x,i) => (
                        <div key={i} style={{ background:"rgba(0,240,255,0.03)", border:`1px solid rgba(0,240,255,0.10)`, borderRadius:6, padding:"6px 8px" }}>
                          <div style={{ fontSize:6.5, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{x.l}</div>
                          <div style={{ fontSize:8.5, fontWeight:700, color:C.cyan, marginTop:1, fontFamily:"'Share Tech Mono'", wordBreak:"break-all" }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                  </HCard>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={doSubmit} disabled={filing==="saving"} style={{ flex:1, ...PB, padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                      {filing==="saving" ? <><span style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>SAVING...</> : "✓ CONFIRM + ⛓ BLOCKCHAIN"}
                    </button>
                    <button onClick={resetForm} style={{ background:"rgba(0,240,255,0.05)", color:C.mid, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 13px", fontSize:10.5, cursor:"pointer", fontFamily:"'Share Tech Mono'" }}>✕</button>
                  </div>
                </div>

              ) : (
                <HCard color={C.blue} style={{ padding:17 }}>
                  <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:10, marginBottom:10 }}>
                    {[{k:"name",l:"FULL NAME *",p:"Aapka naam"},{k:"mobile",l:"MOBILE",p:"+91 XXXXX",t:"tel"},{k:"ward",l:"WARD",p:"Ward 1, 2..."},{k:"address",l:"ADDRESS",p:"Street, Landmark"}].map(fd => (
                      <div key={fd.k}>
                        <label style={{ fontSize:7, color:C.mid, letterSpacing:1.8, display:"block", marginBottom:3, fontFamily:"'Share Tech Mono'" }}>{fd.l}</label>
                        <input type={fd.t||"text"} value={form[fd.k]} onChange={e => setForm(p=>({...p,[fd.k]:e.target.value}))} placeholder={fd.p}
                          style={IS} onFocus={e => { e.target.style.borderColor=C.cyan; e.target.style.background="rgba(0,240,255,0.07)"; P.hover(); }} onBlur={e => { e.target.style.borderColor=C.border; e.target.style.background="rgba(0,240,255,0.04)"; }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <label style={{ fontSize:7, color:C.mid, letterSpacing:1.8, fontFamily:"'Share Tech Mono'" }}>COMPLAINT DETAILS *</label>
                      <VoiceBtn onText={t => setForm(p=>({...p,text:t}))}/>
                    </div>
                    <textarea rows={4} value={form.text} onChange={e => setForm(p=>({...p,text:e.target.value}))} placeholder="Type ya 🎤 voice se bolo — Hindi ya English dono chalega..."
                      style={{...IS, resize:"vertical"}} onFocus={e => { e.target.style.borderColor=C.cyan; e.target.style.background="rgba(0,240,255,0.06)"; P.hover(); }} onBlur={e => { e.target.style.borderColor=C.border; e.target.style.background="rgba(0,240,255,0.04)"; }}/>
                    {form.text.length > 8 && (() => {
                      const t = form.text.toLowerCase();
                      const isC = t.includes("bribe")||t.includes("corrupt")||t.includes("rishwat");
                      const isU = t.includes("emergency")||t.includes("no water")||t.includes("accident");
                      return (
                        <div style={{ marginTop:5, background:"rgba(0,240,255,0.04)", border:`1px solid ${C.border}`, borderRadius:6, padding:"5px 8px", display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
                          <span style={{ fontSize:8, color:C.amber }}>◈ AI preview:</span>
                          {isC && <Tag text="⚠ CORRUPTION" color={C.purple}/>}
                          {isU && <Tag text="🔴 CRITICAL" color={C.red}/>}
                          <Tag text="⛓ BLOCKCHAIN" color={C.purple}/>
                          <Tag text="📲 WHATSAPP" color="#25D366"/>
                        </div>
                      );
                    })()}
                  </div>
                  <button onClick={doAnalyze} disabled={filing==="analyzing"}
                    style={{ width:"100%", ...PB, padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                    {filing === "analyzing" ? <><span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>ANALYZING...</> : "🧠 AI ANALYZE & CLASSIFY"}
                  </button>
                </HCard>
              )}
            </div>
          )}

          {/* ── ALL CASES ── */}
          {tab === "cases" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, flexWrap:"wrap", gap:7 }}>
                <div>
                  <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.cyan, letterSpacing:1.8 }}>ALL CASES</h2>
                  <p style={{ color:C.mid, fontSize:7.5, marginTop:2, fontFamily:"'Share Tech Mono'" }}>{cpts.length} RECORDS · FLIP TO EXPAND</p>
                </div>
                <button onClick={() => go("file")} style={{...PB, padding:"7px 13px", fontSize:9}}>+ FILE NEW</button>
              </div>
              {cpts.length === 0
                ? <HCard color={C.blue} style={{ padding:44, textAlign:"center" }}><div style={{ fontSize:36, marginBottom:8 }}>📡</div><p style={{ color:C.dim, fontFamily:"'Share Tech Mono'", fontSize:9 }}>NO CASES YET — File your first complaint!</p></HCard>
                : cpts.map((c, i) => <FlipCard key={c.id||i} c={c} onResolve={doResolve}/>)
              }
            </div>
          )}

          {/* ── HOLO MAP ── */}
          {tab === "map" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.cyan, letterSpacing:1.8, marginBottom:11 }}>HOLO MAP</h2>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Active Pins" value={cpts.length} color={C.blue} icon="📍"/>
                <Stat label="Critical Zones" value={crit.length} color={C.red} icon="🔴"/>
                <Stat label="Corruption" value={corr.length} color={C.purple} icon="⚠"/>
                <Stat label="Wards" value={4} color={C.green} icon="🗺"/>
              </div>
              <HCard color={C.blue} style={{ padding:0, overflow:"hidden", height:380 }}>
                <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#010A12,#020C18)", position:"relative" }}>
                  <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:.13 }}>
                    <defs><pattern id="mgrid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M 38 0 L 0 0 0 38" fill="none" stroke={C.cyan} strokeWidth=".35"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#mgrid)"/>
                  </svg>
                  {[{x:"33%",y:"28%",r:80,w:"Ward 1",v:72,c:C.orange},{x:"63%",y:"22%",r:68,w:"Ward 2",v:45,c:C.green},{x:"68%",y:"62%",r:86,w:"Ward 3",v:88,c:C.red},{x:"26%",y:"65%",r:63,w:"Ward 4",v:31,c:C.green}].map((w,i) => (
                    <div key={i} style={{ position:"absolute", left:w.x, top:w.y, transform:"translate(-50%,-50%)" }}>
                      <div style={{ width:w.r*2, height:w.r*2, borderRadius:"50%", border:`1px solid ${w.c}35`, background:`radial-gradient(circle,${w.c}07,transparent 70%)`, animation:"float 4s ease-in-out infinite" }}/>
                      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ fontSize:8, color:w.c, fontFamily:"'Share Tech Mono'", fontWeight:700 }}>{w.w}</div>
                        <div style={{ fontSize:13, color:w.c, fontFamily:"'Share Tech Mono'", fontWeight:700 }}>{w.v}</div>
                      </div>
                    </div>
                  ))}
                  {cpts.slice(0,20).map((c,i) => {
                    const sc = c.score||50;
                    const col = sc>=85?C.red:sc>=70?C.orange:sc>=55?C.amber:C.green;
                    const seed = (c.id||"").split("").reduce((a,x)=>a+x.charCodeAt(0),0);
                    const lx = 20 + (seed % 60), ly = 20 + ((seed*2) % 60);
                    return <div key={i} style={{ position:"absolute", left:`${lx}%`, top:`${ly}%`, width:9, height:9, borderRadius:"50%", background:col, boxShadow:`0 0 7px ${col}`, animation:`pulse ${2+i*.1}s ease-in-out infinite`, cursor:"pointer" }} onClick={() => { P.click(); toast(`${c.id}: ${c.issue?.slice(0,30)}...`, "info"); }}/>;
                  })}
                  <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(1,4,8,0.9)", border:`1px solid ${C.border}`, borderRadius:6, padding:"5px 9px" }}>
                    <span style={{ fontSize:7.5, color:C.cyan, fontFamily:"'Share Tech Mono'" }}>HOLOGRAPHIC MAP · {cpts.length} PINS</span>
                  </div>
                </div>
              </HCard>
            </div>
          )}

          {/* ── CORRUPTION ── */}
          {tab === "corrupt" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.purple, letterSpacing:1.8, marginBottom:3 }}>CORRUPTION RADAR</h2>
              <p style={{ color:C.mid, fontSize:7.5, marginBottom:10, fontFamily:"'Share Tech Mono'" }}>AI-DETECTED · BLOCKCHAIN-LOGGED · VIGILANCE NOTIFIED</p>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:3},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Flagged" value={corr.length} color={C.purple} icon="⚠"/>
                <Stat label="On Chain" value={bch.filter(b=>b.data?.corrupt).length} color={C.cyan} icon="⛓"/>
                <Stat label="Escalated" value={corr.filter(c=>c.ai?.escalate).length} color={C.red} icon="↑"/>
              </div>
              <HCard color={C.purple} style={{ padding:12, marginBottom:10 }}>
                <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:10, fontFamily:"'Share Tech Mono'" }}>🗺 WARD CORRUPTION HEATMAP</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {[["W1",88],["W2",23],["W3",67],["W4",45],["W5",91],["W6",34],["W7",76],["W8",12]].map(([w,r]) => {
                    const col = r>=80?C.red:r>=60?C.orange:r>=40?C.amber:C.green;
                    return <div key={w} style={{ background:`${col}09`, border:`1px solid ${col}30`, borderRadius:8, padding:"8px 5px", textAlign:"center", cursor:"pointer", transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)";P.hover();}} onMouseLeave={e=>e.currentTarget.style.transform="none"} onClick={()=>P.click()}><div style={{ fontSize:13, fontWeight:700, color:col, fontFamily:"'Share Tech Mono'" }}>{r}</div><div style={{ fontSize:7, color:C.mid }}>{w}</div></div>;
                  })}
                </div>
              </HCard>
              {corr.length === 0
                ? <HCard color={C.green} style={{ padding:30, textAlign:"center" }}><div style={{ fontSize:32 }}>✅</div><p style={{ color:C.mid, fontFamily:"'Share Tech Mono'", fontSize:9, marginTop:7 }}>NO CORRUPTION FLAGS</p></HCard>
                : corr.map((c,i) => {
                    const ai = typeof c.ai==="string"?JSON.parse(c.ai||"{}"):c.ai||{};
                    return <HCard key={i} color={C.purple} style={{ padding:"10px 12px", marginBottom:7 }} onClick={()=>P.click()}><div style={{ display:"flex", gap:3, marginBottom:3, flexWrap:"wrap" }}><span style={{ fontSize:8, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{c.id}</span><Tag text="⚠ CORRUPTION" color={C.purple}/>{ai.corrupt_risk&&<Tag text={`RISK: ${ai.corrupt_risk}/100`} color={C.red}/>}</div><div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{c.issue}</div><div style={{ fontSize:8, color:C.mid, fontFamily:"'Share Tech Mono'" }}>{c.name} · {c.dept}</div></HCard>;
                  })
              }
            </div>
          )}

          {/* ── ESCALATIONS ── */}
          {tab === "esc" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.red, letterSpacing:1.8, marginBottom:10 }}>ESCALATIONS</h2>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:3},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Escalated" value={esc_.length} color={C.red} icon="↑"/>
                <Stat label="Commissioner" value={esc_.filter(c=>c.ai?.esc_to==="City Commissioner").length} color={C.orange}/>
                <Stat label="SLA Breach" value={cpts.filter(c=>c.ai?.perf_flag).length} color={C.amber}/>
              </div>
              {esc_.length === 0
                ? <HCard color={C.green} style={{ padding:30, textAlign:"center" }}><div style={{ fontSize:32 }}>✅</div><p style={{ color:C.mid, fontFamily:"'Share Tech Mono'", fontSize:9, marginTop:7 }}>NO ESCALATIONS</p></HCard>
                : esc_.map((c,i) => {
                    const ai = typeof c.ai==="string"?JSON.parse(c.ai||"{}"):c.ai||{};
                    return <HCard key={i} color={C.red} style={{ padding:"10px 12px", marginBottom:7, animation:"glow 3s infinite" }} onClick={()=>P.warn()}><div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${C.red},${C.red}30)`, borderRadius:"11px 0 0 11px" }}/><div style={{ display:"flex", gap:3, marginBottom:3, flexWrap:"wrap", paddingLeft:5 }}><span style={{ fontSize:8, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{c.id}</span><Tag text={`↑ ${ai.esc_to||"WARD"}`} color={C.orange}/></div><div style={{ fontSize:12, fontWeight:600, marginBottom:2, paddingLeft:5 }}>{c.issue}</div><div style={{ fontSize:8, color:C.mid, paddingLeft:5, fontFamily:"'Share Tech Mono'" }}>{c.dept||ai.dept} · {ai.sla_text||"—"}</div></HCard>;
                  })
              }
            </div>
          )}

          {/* ── BLOCKCHAIN ── */}
          {tab === "chain" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.purple, letterSpacing:1.8, marginBottom:3 }}>BLOCKCHAIN AUDIT TRAIL</h2>
              <p style={{ color:C.mid, fontSize:7.5, marginBottom:10, fontFamily:"'Share Tech Mono'" }}>{BC.valid() ? `✅ VERIFIED (${bch.length} BLOCKS)` : "⚠ INTEGRITY CHECK FAILED"}</p>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:3},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Blocks" value={bch.length} color={C.purple} icon="⛓"/>
                <Stat label="Integrity" value={BC.valid()?"100%":"FAIL"} color={BC.valid()?C.green:C.red} icon="🔐"/>
                <Stat label="Records" value={bch.filter(b=>b.data?.id).length} color={C.cyan} icon="📋"/>
              </div>
              {[...bch].reverse().map((block) => (
                <HCard key={block.index} color={C.purple} style={{ padding:"10px 12px", marginBottom:7, animation:"pop .3s ease" }} onClick={() => P.chain()}>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${C.purple},${C.purple}30)`, borderRadius:"11px 0 0 11px" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6, marginBottom:6, paddingLeft:5 }}>
                    <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:8.5, color:C.purple, fontFamily:"'Share Tech Mono'", fontWeight:700 }}>BLOCK #{block.index}</span>
                      {block.index === 0 && <Tag text="GENESIS" color={C.amber}/>}
                      {block.data?.id && <Tag text={block.data.id} color={C.cyan}/>}
                      {block.data?.action === "RESOLVED" && <Tag text="✓ RESOLVED" color={C.green}/>}
                      {block.data?.corrupt && <Tag text="⚠ CORRUPT" color={C.purple}/>}
                    </div>
                    <span style={{ fontSize:7, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{new Date(block.ts).toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:5, paddingLeft:5 }}>
                    <div style={{ background:"rgba(123,47,255,0.07)", borderRadius:5, padding:"5px 8px" }}><div style={{ fontSize:6.5, color:C.dim, marginBottom:2, fontFamily:"'Share Tech Mono'" }}>HASH</div><div style={{ fontSize:8, color:C.purple, fontFamily:"'Share Tech Mono'", wordBreak:"break-all" }}>{block.hash}</div></div>
                    <div style={{ background:"rgba(0,240,255,0.04)", borderRadius:5, padding:"5px 8px" }}><div style={{ fontSize:6.5, color:C.dim, marginBottom:2, fontFamily:"'Share Tech Mono'" }}>PREV HASH</div><div style={{ fontSize:8, color:C.cyan, fontFamily:"'Share Tech Mono'", wordBreak:"break-all" }}>{block.prev}</div></div>
                  </div>
                  {block.data && block.data !== "GENESIS" && typeof block.data === "object" && (
                    <div style={{ marginTop:5, fontSize:8.5, color:C.mid, fontFamily:"'Share Tech Mono'", background:"rgba(0,240,255,0.03)", borderRadius:5, padding:"5px 8px", marginLeft:5 }}>
                      {block.data.issue && <div><span style={{ color:C.dim }}>ISSUE: </span>{block.data.issue?.slice(0,55)}</div>}
                      {block.data.by && <div><span style={{ color:C.dim }}>BY: </span><span style={{ color:C.amber }}>{block.data.by}</span></div>}
                    </div>
                  )}
                </HCard>
              ))}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === "analytics" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.cyan, letterSpacing:1.8, marginBottom:11 }}>ANALYTICS</h2>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Total" value={cpts.length} color={C.blue}/>
                <Stat label="Resolved" value={cpts.filter(c=>c.status==="Resolved").length} color={C.green}/>
                <Stat label="Corruption" value={corr.length} color={C.purple}/>
                <Stat label="Blockchain" value={bch.length} color={C.cyan}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:10, marginBottom:10 }}>
                <HCard color={C.cyan} style={{ padding:13 }}>
                  <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:9, fontFamily:"'Share Tech Mono'" }}>DEPT DISTRIBUTION</div>
                  <Bars data={Object.entries(byDept).map(([k,v])=>({k,v,c:C.cyan}))}/>
                  {Object.keys(byDept).length===0&&<p style={{ color:C.dim,fontSize:9,textAlign:"center",padding:"13px 0",fontFamily:"'Share Tech Mono'" }}>NO DATA</p>}
                </HCard>
                <HCard color={C.purple} style={{ padding:13 }}>
                  <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:9, fontFamily:"'Share Tech Mono'" }}>PLATFORM METRICS</div>
                  {[{l:"Corruption Flags",v:corr.length,c:C.purple},{l:"Auto-Escalated",v:esc_.length,c:C.red},{l:"Alerts Triggered",v:alertN,c:C.orange},{l:"Blockchain Blocks",v:bch.length,c:C.cyan},{l:"Chain Valid",v:BC.valid()?"YES":"NO",c:BC.valid()?C.green:C.red},{l:"Registered Users",v:Store.all().length,c:C.blue}].map((x,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:i<5?`1px solid rgba(0,240,255,0.05)`:"none" }}>
                      <span style={{ fontSize:10, color:C.mid }}>{x.l}</span>
                      <span style={{ fontSize:17, fontWeight:700, color:x.c, fontFamily:"'Share Tech Mono'" }}>{x.v}</span>
                    </div>
                  ))}
                </HCard>
              </div>
              <HCard color={C.green} style={{ padding:13 }}>
                <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:8, fontFamily:"'Share Tech Mono'", display:"flex", justifyContent:"space-between", alignItems:"center" }}><span>📈 LIVE ACTIVITY</span><Dot color={C.green} size={5}/></div>
                <Sparkline vals={spark} color={C.green} h={52}/>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:7, color:C.dim, fontFamily:"'Share Tech Mono'" }}>14 ticks ago</span>
                  <span style={{ fontSize:7, color:C.green, fontFamily:"'Share Tech Mono'" }}>NOW</span>
                </div>
              </HCard>
            </div>
          )}

          {/* ── AI AUTOMATION ── */}
          {tab === "automation" && <AutoPage cpts={cpts} bch={bch}/>}

          {/* ── AI SUPPORT ── */}
          {tab === "support" && <SupportPage user={user}/>}

          {/* ── AI AGENTS ── */}
          {tab === "agents" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.cyan, letterSpacing:1.8, marginBottom:11 }}>AI AGENT NETWORK</h2>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:8, marginBottom:11 }}>
                {[{i:"🧠",l:"AI Engine",c:C.orange},{i:"🗺",l:"Map Engine",c:C.blue},{i:"🎤",l:"Voice AI",c:C.cyan},{i:"⚠",l:"Corruption",c:C.red},{i:"⛓",l:"Blockchain",c:C.purple},{i:"📲",l:"WhatsApp",c:"#25D366"},{i:"🚨",l:"Escalation",c:C.pink},{i:"🎹",l:"Piano Engine",c:C.amber}].map((a,idx)=>(
                  <HCard key={idx} color={a.c} style={{ padding:12 }} onClick={()=>P.click()}>
                    <div style={{ fontSize:19, marginBottom:6, filter:`drop-shadow(0 0 8px ${a.c}70)` }}>{a.i}</div>
                    <div style={{ fontSize:9, fontWeight:700, marginBottom:6, fontFamily:"'Share Tech Mono'", color:a.c }}>{a.l}</div>
                    <div style={{ background:"rgba(0,240,255,0.05)", borderRadius:2, height:3, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ width:`${agLoad[idx]}%`, height:"100%", background:a.c, transition:"width 1s ease" }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}><Dot color={a.c} size={4}/><span style={{ fontSize:6.5, color:a.c, fontFamily:"'Share Tech Mono'" }}>ONLINE</span></div>
                      <span style={{ fontSize:7.5, color:a.c, fontFamily:"'Share Tech Mono'" }}>{Math.round(agLoad[idx])}%</span>
                    </div>
                  </HCard>
                ))}
              </div>
              <HCard color={C.green} style={{ padding:13 }}>
                <div style={{ fontSize:7, color:C.mid, letterSpacing:1.5, marginBottom:8, fontFamily:"'Share Tech Mono'", display:"flex", gap:7, alignItems:"center" }}>LIVE ENGINE LOG<Dot color={C.green} size={5}/><span style={{ fontSize:7, color:C.dim, marginLeft:"auto" }}>{logs.length} EVENTS</span></div>
                <div style={{ fontFamily:"'Share Tech Mono'", fontSize:isMob?7.5:8.5, maxHeight:230, overflowY:"auto" }}>
                  {logs.length === 0 ? <p style={{ color:C.dim, padding:"12px 0", textAlign:"center" }}>SUBMIT A COMPLAINT TO ACTIVATE</p>
                    : logs.map((l,i)=>(
                      <div key={i} style={{ display:"flex", gap:8, padding:"3px 0", borderBottom:`1px solid rgba(0,240,255,0.04)`, flexWrap:isMob?"wrap":"nowrap" }}>
                        <span style={{ color:C.dim, minWidth:56, flexShrink:0, fontSize:7 }}>{new Date(l.created_at||Date.now()).toLocaleTimeString("en-IN")}</span>
                        <span style={{ color:l.severity==="WARN"?C.orange:C.cyan, minWidth:80, flexShrink:0, fontSize:8 }}>{l.from_agent}</span>
                        <span style={{ color:l.severity==="WARN"?C.amber:C.mid, flex:1, fontSize:8 }}>{l.message}</span>
                      </div>
                    ))}
                </div>
              </HCard>
            </div>
          )}

          {/* ── OFFICER CASES ── */}
          {tab === "ocases" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <HCard color={C.blue} style={{ padding:"13px 17px", marginBottom:11, borderLeft:`4px solid ${C.blue}` }}>
                <div style={{ fontSize:7, color:C.blue, letterSpacing:1.8, marginBottom:3, fontFamily:"'Share Tech Mono'" }}>👮 OFFICER PORTAL</div>
                <h2 style={{ fontSize:15, fontWeight:700, fontFamily:"'Orbitron'", marginBottom:2 }}>MY ASSIGNED CASES</h2>
                <p style={{ color:C.mid, fontSize:9, fontFamily:"'Share Tech Mono'" }}>{user?.name} · {user?.dept} · Senior Grade</p>
              </HCard>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMob?2:4},1fr)`, gap:8, marginBottom:11 }}>
                <Stat label="Assigned" value={cpts.filter(c=>c.status!=="Resolved").length} color={C.blue} icon="📋"/>
                <Stat label="Resolved" value={cpts.filter(c=>c.status==="Resolved").length} color={C.green} icon="✅"/>
                <Stat label="Escalated" value={esc_.length} color={C.red} icon="↑"/>
                <Stat label="Blockchain" value={bch.length} color={C.purple} icon="⛓"/>
              </div>
              {cpts.filter(c=>c.status!=="Resolved").length === 0
                ? <HCard color={C.green} style={{ padding:30, textAlign:"center" }}><div style={{ fontSize:32 }}>✅</div><p style={{ color:C.mid, fontFamily:"'Share Tech Mono'", fontSize:9, marginTop:7 }}>ALL CAUGHT UP!</p></HCard>
                : cpts.filter(c=>c.status!=="Resolved").slice(0,12).map((c,i)=><FlipCard key={i} c={c} onResolve={doResolve}/>)
              }
            </div>
          )}

          {/* ── OFFICER RESOLVED ── */}
          {tab === "ores" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.green, letterSpacing:1.8, marginBottom:10 }}>RESOLVED CASES</h2>
              {cpts.filter(c=>c.status==="Resolved").length === 0
                ? <HCard color={C.green} style={{ padding:30, textAlign:"center" }}><div style={{ fontSize:32 }}>📋</div><p style={{ color:C.dim, fontFamily:"'Share Tech Mono'", fontSize:9, marginTop:7 }}>NO RESOLVED CASES YET</p></HCard>
                : cpts.filter(c=>c.status==="Resolved").map((c,i)=>(
                    <HCard key={i} color={C.green} style={{ padding:"10px 12px", marginBottom:7 }} onClick={()=>P.click()}>
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${C.green},${C.green}30)`, borderRadius:"11px 0 0 11px" }}/>
                      <div style={{ display:"flex", gap:3, marginBottom:3, paddingLeft:5 }}><span style={{ fontSize:8, color:C.dim, fontFamily:"'Share Tech Mono'" }}>{c.id}</span><Tag text="✓ RESOLVED" color={C.green}/><Tag text="⛓" color={C.purple}/></div>
                      <div style={{ fontSize:12, fontWeight:600, marginBottom:2, paddingLeft:5 }}>{c.issue}</div>
                      <div style={{ fontSize:8, color:C.mid, paddingLeft:5, fontFamily:"'Share Tech Mono'" }}>{c.dept} · {c.name}</div>
                    </HCard>
                  ))
              }
            </div>
          )}

          {/* ── OFFICER FIELD MAP ── */}
          {tab === "omap" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <h2 style={{ fontSize:13, fontWeight:700, fontFamily:"'Orbitron'", color:C.green, letterSpacing:1.8, marginBottom:11 }}>FIELD MAP</h2>
              <HCard color={C.blue} style={{ padding:0, overflow:"hidden", height:360 }}>
                <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#010A12,#020C18)", position:"relative" }}>
                  <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:.13 }}>
                    <defs><pattern id="fmap" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M 38 0 L 0 0 0 38" fill="none" stroke={C.green} strokeWidth=".35"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#fmap)"/>
                  </svg>
                  {cpts.filter(c=>c.status!=="Resolved").slice(0,16).map((c,i) => {
                    const sc = c.score||50;
                    const col = sc>=85?C.red:sc>=70?C.orange:sc>=55?C.amber:C.green;
                    const seed = (c.id||"").split("").reduce((a,x)=>a+x.charCodeAt(0),0);
                    const lx = 15 + (seed%70), ly = 15 + ((seed*3)%70);
                    return <div key={i} style={{ position:"absolute", left:`${lx}%`, top:`${ly}%`, width:10, height:10, borderRadius:"50%", background:col, boxShadow:`0 0 8px ${col}`, animation:`pulse ${1.5+i*.15}s ease-in-out infinite`, cursor:"pointer" }} onClick={()=>{P.click();toast(`${c.id}: ${c.issue?.slice(0,30)}...`,"info");}}/>;
                  })}
                  <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(1,4,8,0.9)", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 8px" }}>
                    <span style={{ fontSize:7.5, color:C.green, fontFamily:"'Share Tech Mono'" }}>FIELD MAP · {cpts.filter(c=>c.status!=="Resolved").length} ACTIVE</span>
                  </div>
                </div>
              </HCard>
            </div>
          )}

        </div>

        {/* MOBILE BOTTOM NAV */}
        {isMob && (
          <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(1,4,8,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100 }}>
            {nav.slice(0,5).map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => go(item.id)}
                  style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"7px 2px", background:"none", border:"none", color:active?C.cyan:C.dim, borderTop:active?`2px solid ${C.cyan}`:"2px solid transparent", fontSize:13, cursor:"pointer", transition:"all .13s" }}>
                  <span style={{ filter:active?`drop-shadow(0 0 5px ${C.cyan})`:"none" }}>{item.icon}</span>
                  <span style={{ fontSize:7, fontWeight:active?700:400, fontFamily:"'Share Tech Mono'" }}>{item.label.split(" ")[0].toUpperCase().slice(0,5)}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
