/* ============================================================
   Shared UI components & helpers
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
const DB = window.DB;

/* ---------- time helpers ---------- */
function relTime(iso) {
  const then = new Date(iso).getTime();
  const diff = DB.now.getTime() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.round(d/30)}mo ago`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
}

/* ---------- Avatar ---------- */
function Avatar({ user, size = 30, ring = false }) {
  const u = typeof user === "string" ? DB.byId[user] : user;
  if (!u) return <div className="avatar" style={{ width:size, height:size, background:"var(--border-strong)" }} />;
  const initials = u.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className="avatar" title={u.name}
      style={{ width:size, height:size, background:u.color, fontSize:size*0.4,
        boxShadow: ring ? "0 0 0 2px var(--surface)" : "none" }}>
      {initials}
    </div>
  );
}

function AvatarStack({ ids, size = 26, max = 4 }) {
  const list = ids.filter(Boolean);
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {list.slice(0,max).map((id,i) => (
        <div key={id+i} style={{ marginLeft: i===0?0:-8, zIndex: list.length-i }}>
          <Avatar user={id} size={size} ring />
        </div>
      ))}
      {list.length > max && (
        <div className="avatar" style={{ width:size, height:size, marginLeft:-8, background:"var(--surface-2)", color:"var(--text-2)", fontSize:size*0.36, boxShadow:"0 0 0 2px var(--surface)", border:"1px solid var(--border)" }}>
          +{list.length-max}
        </div>
      )}
    </div>
  );
}

/* ---------- Badges ---------- */
function StatusBadge({ status, dot = true }) {
  const meta = DB.STATUS[status] || { color: "var(--st-open)" };
  return (
    <span className="status-badge" style={{ "--sc": meta.color }}>
      {dot && <span className="dot" style={{ background: meta.color }} />}
      {status}
    </span>
  );
}

function TypeBadge({ type, withLabel = true, size = 14 }) {
  const t = DB.TYPES[type];
  if (!t) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, color:t.color, fontWeight:600, fontSize:12.5 }}>
      <Icon name={t.icon} size={size} />
      {withLabel && t.short}
    </span>
  );
}

function TypeIcon({ type, size = 36 }) {
  const t = DB.TYPES[type];
  if (!t) return null;
  return (
    <div style={{ width:size, height:size, borderRadius:9, display:"grid", placeItems:"center",
      background:`color-mix(in srgb, ${t.color} 14%, var(--surface))`,
      border:`1px solid color-mix(in srgb, ${t.color} 28%, transparent)`, color:t.color }}>
      <Icon name={t.icon} size={size*0.5} />
    </div>
  );
}

function PriorityBadge({ priority }) {
  const p = DB.PRIORITY[priority];
  if (!p) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:p.color }}>
      <Icon name="Flag" size={12} fill={p.color} stroke={p.color} />
      {priority}
    </span>
  );
}

function RoleBadge({ role, sm }) {
  const r = DB.ROLES[role];
  if (!r) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, height: sm?20:22, padding:"0 8px", borderRadius:999,
      fontSize: sm?10.5:11.5, fontWeight:600, letterSpacing:".01em",
      color:r.color, background:`color-mix(in srgb, ${r.color} 13%, var(--surface))`,
      border:`1px solid color-mix(in srgb, ${r.color} 26%, transparent)` }}>
      {r.label}
    </span>
  );
}

/* ---------- Progress bar ---------- */
function Progress({ value, color = "var(--accent)", height = 6, showLabel = false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, width:"100%" }}>
      <div style={{ flex:1, height, background:"var(--bg-subtle)", borderRadius:999, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:999, transition:"width .6s cubic-bezier(.2,.7,.3,1)" }} />
      </div>
      {showLabel && <span className="mono" style={{ fontSize:11.5, color:"var(--text-3)", minWidth:30, textAlign:"right" }}>{value}%</span>}
    </div>
  );
}

/* ---------- Section card ---------- */
function Panel({ title, icon, action, children, className = "", style = {}, bodyStyle = {} }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || action) && (
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {icon && <Icon name={icon} size={16} style={{ color:"var(--text-3)" }} />}
            <h3 style={{ fontSize:14, fontWeight:600 }}>{title}</h3>
          </div>
          {action}
        </header>
      )}
      <div style={{ padding:16, ...bodyStyle }}>{children}</div>
    </section>
  );
}

/* ---------- Empty state ---------- */
function Empty({ icon = "Inbox", title, sub }) {
  return (
    <div style={{ display:"grid", placeItems:"center", padding:"48px 16px", textAlign:"center", gap:4 }}>
      <div style={{ width:48, height:48, borderRadius:12, display:"grid", placeItems:"center", background:"var(--bg-subtle)", color:"var(--text-3)", marginBottom:6 }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontWeight:600, fontSize:14 }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:"var(--text-3)", maxWidth:320 }}>{sub}</div>}
    </div>
  );
}

/* ============================================================
   CHARTS (hand-built SVG/CSS, theme-aware)
   ============================================================ */

/* Donut */
function Donut({ data, size = 160, thickness = 22, onSlice }) {
  const total = data.reduce((s,d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const [hover, setHover] = useState(null);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
      <div style={{ position:"relative", width:size, height:size, flex:"none" }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={thickness} />
          {data.map((d,i) => {
            const frac = d.value / total;
            const len = frac * c;
            const seg = (
              <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
                stroke={d.color} strokeWidth={hover===i ? thickness+3 : thickness}
                strokeDasharray={`${len} ${c-len}`} strokeDashoffset={-offset}
                style={{ transition:"stroke-width .15s", cursor:"pointer", opacity: hover===null||hover===i?1:.45 }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => onSlice && onSlice(d)} />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", textAlign:"center" }}>
          <div>
            <div className="mono" style={{ fontSize:26, fontWeight:700, lineHeight:1 }}>{hover!==null ? data[hover].value : total}</div>
            <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{hover!==null ? data[hover].name : "Total"}</div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gap:6, flex:1, minWidth:130 }}>
        {data.map((d,i) => (
          <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onClick={() => onSlice && onSlice(d)}
            style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, cursor:"pointer", opacity: hover===null||hover===i?1:.5, transition:"opacity .15s" }}>
            <span className="dot" style={{ background:d.color, width:9, height:9 }} />
            <span style={{ color:"var(--text-2)", flex:1 }}>{d.name}</span>
            <span className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Composed bar+line trend */
function TrendChart({ data, height = 240 }) {
  const pad = { t: 16, r: 44, b: 26, l: 30 };
  const W = 640, H = height;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const maxBar = Math.max(...data.map(d => d.pr+d.bug+d.cr+d.disc)) * 1.15;
  const maxRes = Math.max(...data.map(d => d.res)) * 1.2;
  const bw = iw / data.length;
  const cats = [["pr","var(--type-pr)"],["bug","var(--type-bug)"],["cr","var(--type-cr)"],["disc","var(--type-disc)"]];
  const [hover, setHover] = useState(null);
  const linePts = data.map((d,i) => {
    const x = pad.l + bw*i + bw/2;
    const y = pad.t + ih - (d.res/maxRes)*ih;
    return [x,y];
  });
  const linePath = linePts.map((p,i) => (i?"L":"M")+p[0]+" "+p[1]).join(" ");
  return (
    <div style={{ width:"100%", overflow:"hidden", position:"relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:"block" }}>
        {[0,.25,.5,.75,1].map((g,i) => (
          <line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+ih*g} y2={pad.t+ih*g} stroke="var(--border)" strokeWidth="1" strokeDasharray={i===4?"0":"3 4"} opacity=".7" />
        ))}
        {data.map((d,i) => {
          let yAcc = pad.t + ih;
          const x = pad.l + bw*i + bw*0.22;
          const w = bw*0.56;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor:"pointer" }}>
              <rect x={pad.l+bw*i} y={pad.t} width={bw} height={ih} fill={hover===i?"var(--surface-hover)":"transparent"} />
              {cats.map(([k,c]) => {
                const h = (d[k]/maxBar)*ih;
                yAcc -= h;
                return <rect key={k} x={x} y={yAcc} width={w} height={Math.max(h,0)} fill={c} rx="2"
                  opacity={hover===null||hover===i?1:.4} style={{ transition:"opacity .15s" }} />;
              })}
              <text x={pad.l+bw*i+bw/2} y={H-8} textAnchor="middle" fontSize="10" fill="var(--text-3)">{d.label}</text>
            </g>
          );
        })}
        <path d={linePath} fill="none" stroke="var(--indigo-500)" strokeWidth="2.5" strokeLinecap="round" />
        {linePts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r={hover===i?4.5:3} fill="var(--surface)" stroke="var(--indigo-500)" strokeWidth="2" />)}
      </svg>
      {hover!==null && (
        <div style={{ position:"absolute", top:8, left:`${(pad.l+bw*hover+bw/2)/W*100}%`, transform:"translateX(-50%)",
          background:"var(--navy-900)", color:"var(--sidebar-text)", borderRadius:8, padding:"7px 10px", fontSize:11, pointerEvents:"none", whiteSpace:"nowrap", boxShadow:"var(--shadow-lg)", zIndex:5 }}>
          <div style={{ fontWeight:700, marginBottom:3 }}>{data[hover].label} · {data[hover].pr+data[hover].bug+data[hover].cr+data[hover].disc} tickets</div>
          <div style={{ opacity:.85 }}>PR {data[hover].pr} · Bug {data[hover].bug} · CR {data[hover].cr} · Disc {data[hover].disc}</div>
          <div style={{ opacity:.85 }}>Avg resolution {data[hover].res}h</div>
        </div>
      )}
      <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:6, flexWrap:"wrap" }}>
        {[["Project Request","var(--type-pr)"],["Bug","var(--type-bug)"],["CR","var(--type-cr)"],["Discussion","var(--type-disc)"],["Avg resolution","var(--indigo-500)"]].map(([l,c]) => (
          <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--text-2)" }}>
            <span className="dot" style={{ background:c, width:8, height:8 }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Horizontal capacity bars */
function CapacityBar({ label, active, capacity, members }) {
  const pct = Math.min(Math.round(active/capacity*100), 100);
  const color = pct < 70 ? "#16a34a" : pct <= 90 ? "#f59e0b" : "#dc2626";
  const [open, setOpen] = useState(false);
  return (
    <div className="hoverable" onClick={() => setOpen(o=>!o)} style={{ cursor:"pointer" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:550 }}>{label}</span>
        <span style={{ fontSize:12, color:"var(--text-3)" }}><b style={{ color:"var(--text)" }} className="mono">{active}</b> / {capacity} · <span style={{ color }}>{pct}%</span></span>
      </div>
      <div style={{ height:8, background:"var(--bg-subtle)", borderRadius:999, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:999, transition:"width .7s cubic-bezier(.2,.7,.3,1)" }} />
      </div>
      {open && members && (
        <div className="fade-in" style={{ marginTop:8, display:"grid", gap:5, paddingLeft:4 }}>
          {members.map(([n,c],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--text-2)" }}>
              <span style={{ display:"flex", gap:7, alignItems:"center" }}><span className="dot" style={{ background:"var(--text-3)", width:5, height:5 }} />{n}</span>
              <span className="mono">{c} active</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Gauge */
function Gauge({ value, size = 150 }) {
  const r = size/2 - 14;
  const c = Math.PI * r; // half circle
  const frac = value/100;
  const color = value >= 90 ? "#16a34a" : value >= 80 ? "#f59e0b" : "#dc2626";
  return (
    <div style={{ position:"relative", width:size, height:size/2+20 }}>
      <svg width={size} height={size/2+20}>
        <path d={`M 14 ${size/2} A ${r} ${r} 0 0 1 ${size-14} ${size/2}`} fill="none" stroke="var(--bg-subtle)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M 14 ${size/2} A ${r} ${r} 0 0 1 ${size-14} ${size/2}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${c*frac} ${c}`} style={{ transition:"stroke-dasharray 1s cubic-bezier(.2,.7,.3,1)" }} />
      </svg>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, textAlign:"center" }}>
        <div className="mono" style={{ fontSize:24, fontWeight:700, color }}>{value}%</div>
      </div>
    </div>
  );
}

/* ============================================================
   TOAST system
   ============================================================ */
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, duration: 4000, ...t }]);
    if (t.duration !== 0) setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 4000);
  }, []);
  const dismiss = (id) => setToasts(ts => ts.filter(x => x.id !== id));
  const icons = { success:"CircleCheck", info:"Info", warning:"TriangleAlert", error:"CircleX" };
  const colors = { success:"#16a34a", info:"var(--accent)", warning:"#f59e0b", error:"#dc2626" };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{ position:"fixed", top:16, right:16, zIndex:200, display:"grid", gap:10, width:340, maxWidth:"calc(100vw - 32px)" }}>
        {toasts.map(t => (
          <div key={t.id} className="card scale-in" style={{ padding:"12px 14px", display:"flex", gap:11, alignItems:"flex-start", boxShadow:"var(--shadow-lg)" }}>
            <Icon name={icons[t.type]||"Info"} size={18} style={{ color:colors[t.type]||"var(--accent)", marginTop:1 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>{t.title}</div>
              {t.message && <div style={{ fontSize:12.5, color:"var(--text-3)", marginTop:2 }}>{t.message}</div>}
            </div>
            <button className="btn-icon" onClick={() => dismiss(t.id)} style={{ width:22, height:22, border:0, background:"transparent", color:"var(--text-3)" }}>
              <Icon name="X" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ============================================================
   Modal / Dialog & Sheet
   ============================================================ */
function Modal({ open, onClose, children, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose} style={{ display:"grid", placeItems:"center", padding:16 }}>
      <div className="card scale-in" onClick={e => e.stopPropagation()}
        style={{ width, maxWidth:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:"var(--shadow-lg)" }}>
        {children}
      </div>
    </div>
  );
}

function Sheet({ open, onClose, title, children, footer, width = 460 }) {
  useEffect(() => {
    if (!open) return;
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose} style={{ justifyContent:"flex-end", display:"flex" }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth:"100%", height:"100%", background:"var(--surface)", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", animation:"slideInRight .28s cubic-bezier(.2,.7,.3,1)", boxShadow:"var(--shadow-lg)" }}>
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderBottom:"1px solid var(--border)", flex:"none" }}>
          <h3 style={{ fontSize:15.5 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close"><Icon name="X" size={16} /></button>
        </header>
        <div className="thin-sc" style={{ flex:1, overflow:"auto", padding:18 }}>{children}</div>
        {footer && <footer style={{ padding:"14px 18px", borderTop:"1px solid var(--border)", display:"flex", gap:10, justifyContent:"flex-end", flex:"none" }}>{footer}</footer>}
      </div>
    </div>
  );
}

/* Field wrapper */
function Field({ label, required, children, hint, error }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label className={`label ${required?"req":""}`}>{label}</label>}
      {children}
      {hint && !error && <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:5 }}>{hint}</div>}
      {error && <div style={{ fontSize:11.5, color:"var(--st-qafailed)", marginTop:5, display:"flex", gap:4, alignItems:"center" }}><Icon name="CircleAlert" size={12} />{error}</div>}
    </div>
  );
}

/* simple select styled */
function Select({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position:"relative" }}>
      <select className="input" value={value} onChange={e => onChange(e.target.value)} style={{ appearance:"none", paddingRight:34, cursor:"pointer" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="ChevronDown" size={15} style={{ position:"absolute", right:11, top:11, color:"var(--text-3)", pointerEvents:"none" }} />
    </div>
  );
}

Object.assign(window, {
  relTime, fmtDate, fmtDateTime, Avatar, AvatarStack, StatusBadge, TypeBadge, TypeIcon,
  PriorityBadge, RoleBadge, Progress, Panel, Empty, Donut, TrendChart, CapacityBar, Gauge,
  ToastProvider, useToast, Modal, Sheet, Field, Select,
});
