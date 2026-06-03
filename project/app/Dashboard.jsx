/* ============================================================
   Dashboard page
   ============================================================ */
function KpiCard({ k, i }) {
  const up = k.deltaDir === "up";
  const good = (k.label.includes("Resolution") || k.label.includes("Awaiting")) ? !up : up;
  return (
    <div className="card lift fade-up" style={{ padding:16, animationDelay:`${i*0.04}s` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <span style={{ fontSize:12.5, color:"var(--text-3)", fontWeight:550 }}>{k.label}</span>
        <div style={{ width:32, height:32, borderRadius:9, display:"grid", placeItems:"center",
          background:`color-mix(in srgb, ${k.tint} 14%, var(--surface))`, color:k.tint }}>
          <Icon name={k.icon} size={17} />
        </div>
      </div>
      <div className="mono" style={{ fontSize:30, fontWeight:700, marginTop:10, letterSpacing:"-.02em" }}>{k.value}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4, fontSize:12 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:2, fontWeight:600,
          color: good ? "#16a34a" : "#dc2626" }}>
          <Icon name={up ? "TrendingUp" : "TrendingDown"} size={13} />{k.delta}
        </span>
        <span style={{ color:"var(--text-3)" }}>{k.sub}</span>
      </div>
    </div>
  );
}

function Dashboard({ nav }) {
  const [range, setRange] = useState("12w");
  const [typeFilter, setTypeFilter] = useState("All");
  const recent = DB.tickets.flatMap(t => t.timeline.map(a => ({ ...a, ticket:t }))).sort((a,b) => new Date(b.at)-new Date(a.at)).slice(0,12);

  return (
    <div style={{ display:"grid", gap:16 }}>
      {/* Filter bar */}
      <div className="card" style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", position:"sticky", top:0, zIndex:10 }}>
        <div className="seg">
          {["All","PR","Bug","CR","Disc"].map(t => (
            <button key={t} className={typeFilter===t?"active":""} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
        <div style={{ flex:1 }} />
        <button className="btn btn-ghost btn-sm"><Icon name="Calendar" size={15} />May 1 – Jun 1, 2026</button>
        <button className="btn btn-ghost btn-sm"><Icon name="SlidersHorizontal" size={15} />Filter</button>
        <button className="btn btn-ghost btn-sm" style={{ color:"var(--text-3)" }}><Icon name="RotateCcw" size={14} />Reset</button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12 }}>
        {DB.kpis.map((k,i) => <KpiCard key={i} k={k} i={i} />)}
      </div>

      {/* main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:16 }} className="dash-grid">
        <Panel title="Tickets by type" icon="ChartColumnBig"
          action={<div className="seg">{["30h","12w","12bln"].map(r => <button key={r} className={range===r?"active":""} onClick={()=>setRange(r)}>{r}</button>)}</div>}>
          <TrendChart data={DB.trend} />
        </Panel>

        <Panel title="Workload by team" icon="Users">
          <div style={{ display:"grid", gap:16 }}>
            {DB.workload.map((w,i) => <CapacityBar key={i} {...w} />)}
          </div>
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px dashed var(--border)", fontSize:11.5, color:"var(--text-3)", display:"flex", gap:14, justifyContent:"center" }}>
            {[["< 70%","#16a34a"],["70–90%","#f59e0b"],["> 90%","#dc2626"]].map(([l,c]) => (
              <span key={l} style={{ display:"inline-flex", gap:5, alignItems:"center" }}><span className="dot" style={{ background:c, width:7, height:7 }} />{l}</span>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:16 }}>
        <Panel title="Status distribution" icon="ChartPie">
          <Donut data={DB.statusDist} onSlice={(d) => nav("tickets", { status: d.name })} />
        </Panel>

        <Panel title="SLA performance" icon="ShieldCheck">
          <div style={{ display:"grid", placeItems:"center", gap:8 }}>
            <Gauge value={92} />
            <div style={{ fontSize:12.5, color:"var(--text-3)", textAlign:"center" }}>
              <b style={{ color:"#16a34a" }}>92%</b> of tickets resolved within SLA target
            </div>
            <div style={{ display:"flex", gap:12, fontSize:11.5, color:"var(--text-3)" }}>
              {[["≥90% Healthy","#16a34a"],["80–90%","#f59e0b"],["<80%","#dc2626"]].map(([l,c]) => (
                <span key={l} style={{ display:"inline-flex", gap:5, alignItems:"center" }}><span className="dot" style={{ background:c, width:7, height:7 }} />{l}</span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Top requestors" icon="Crown">
          <div style={{ display:"grid", gap:11 }}>
            {DB.topRequestors.map((r,i) => {
              const max = DB.topRequestors[0].count;
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className="mono" style={{ fontSize:12, color:"var(--text-3)", width:14 }}>{i+1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12.5, fontWeight:550, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</span>
                      <span className="mono" style={{ fontSize:12, color:"var(--text-3)" }}>{r.count}</span>
                    </div>
                    <div style={{ height:5, background:"var(--bg-subtle)", borderRadius:999 }}>
                      <div style={{ width:`${r.count/max*100}%`, height:"100%", background:"var(--accent)", borderRadius:999 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Activity feed */}
      <Panel title="Recent activity" icon="Activity"
        action={<button className="btn btn-ghost btn-sm" onClick={() => nav("tickets")}>View all<Icon name="ArrowRight" size={14} /></button>}>
        <div style={{ display:"grid", gap:2 }}>
          {recent.map((a,i) => {
            const actor = DB.byId[a.actor];
            return (
              <button key={i} onClick={() => nav("ticket", { id: a.ticket.id })}
                className="hoverable" style={{ display:"flex", gap:11, alignItems:"center", padding:"9px 8px", borderRadius:8, background:"transparent", border:0, textAlign:"left", width:"100%", transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background="var(--surface-hover)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <Avatar user={a.actor} size={30} />
                <div style={{ flex:1, minWidth:0, fontSize:13 }}>
                  <span style={{ fontWeight:600 }}>{actor?.name || "System"}</span>{" "}
                  <span style={{ color:"var(--text-2)" }}>{a.text}</span>{" "}
                  <span className="mono" style={{ color:"var(--accent)", fontWeight:600 }}>{a.ticket.number}</span>
                </div>
                <span style={{ fontSize:11.5, color:"var(--text-3)", whiteSpace:"nowrap" }}>{relTime(a.at)}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
window.Dashboard = Dashboard;
