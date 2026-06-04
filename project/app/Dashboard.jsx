/* ============================================================
   Dashboard page — semua metrik dihitung dari DB.tickets live
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

  const tickets = DB.tickets || [];

  /* ── Hitung KPI dari data tiket aktual ── */
  const nowDate = new Date();
  const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).toISOString();

  const OPEN_STATUSES   = ["Open","BA Review","BA Approved","Assigned","In Progress","Ready for QA","QA Testing","Rework","Hold"];
  const ACTIVE_STATUSES = ["Assigned","In Progress","Ready for QA","QA Testing","Rework"];

  const totalOpen     = tickets.filter(t => OPEN_STATUSES.includes(t.status)).length;
  const awaitingBA    = tickets.filter(t => ["Open","BA Review"].includes(t.status)).length;
  const inProgress    = tickets.filter(t => ACTIVE_STATUSES.includes(t.status)).length;
  const completedMth  = tickets.filter(t => t.status === "Completed" && t.completed && t.completed >= monthStart).length;

  const doneTickets   = tickets.filter(t => t.status === "Completed" && t.completed && t.created);
  const avgResMs      = doneTickets.length
    ? doneTickets.reduce((s, t) => s + (new Date(t.completed) - new Date(t.created)), 0) / doneTickets.length
    : null;
  const avgResDays    = avgResMs != null ? (avgResMs / 86400000).toFixed(1) : null;

  const slaTickets    = tickets.filter(t => t.slaTarget > 0 && t.slaUsed >= 0);
  const slaRate       = slaTickets.length
    ? Math.round(slaTickets.filter(t => t.slaUsed <= t.slaTarget).length / slaTickets.length * 100)
    : 92;

  const liveKpis = [
    { label:"Total Open Tickets",    value: totalOpen,                    icon:"Inbox",          tint:"var(--indigo-600)", delta:`${totalOpen}`,            deltaDir:"up",                        sub:"belum selesai" },
    { label:"Awaiting BA Review",     value: awaitingBA,                   icon:"Hourglass",      tint:"#f59e0b",          delta:`${awaitingBA}`,            deltaDir: awaitingBA > 3 ? "up":"down", sub:"perlu ditindaklanjuti" },
    { label:"In Progress",            value: inProgress,                   icon:"LoaderCircle",   tint:"#06b6d4",          delta:`${inProgress}`,            deltaDir:"up",                        sub:"sedang dikerjakan" },
    { label:"Completed This Month",   value: completedMth,                 icon:"CircleCheckBig", tint:"#16a34a",          delta:`+${completedMth}`,         deltaDir:"up",                        sub:"bulan ini" },
    { label:"Avg Resolution Time",    value: avgResDays ? `${avgResDays}d` : "—", icon:"Timer",  tint:"#14b8a6",          delta: avgResDays ? `${avgResDays}d`:"—", deltaDir:"down",              sub:"rata-rata penyelesaian" },
    { label:"SLA Compliance",         value: `${slaRate}%`,                icon:"ShieldCheck",    tint: slaRate>=90?"#16a34a":"#f59e0b", delta:`${slaRate}%`, deltaDir: slaRate>=90?"up":"down",  sub:"target ≥ 90%" },
  ];

  /* ── Status distribution dari tiket aktual ── */
  const statusCounts = {};
  tickets.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const liveStatusDist = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: DB.STATUS[name]?.color || "var(--text-3)" }))
    .sort((a, b) => b.value - a.value);

  /* ── Top requestors dari tiket aktual ── */
  const reqCounts = {};
  tickets.forEach(t => {
    const u = DB.byId[t.requestor];
    if (!u) return;
    if (!reqCounts[t.requestor]) reqCounts[t.requestor] = { name: u.name, dept: u.dept, count: 0 };
    reqCounts[t.requestor].count++;
  });
  const liveTopRequestors = Object.values(reqCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  /* ── Workload dari tiket aktual ── */
  const activeTickets = tickets.filter(t => ACTIVE_STATUSES.includes(t.status));
  const devCounts = {}, qaCounts = {};
  activeTickets.forEach(t => {
    if (t.developer) devCounts[t.developer] = (devCounts[t.developer] || 0) + 1;
    if (t.qa)        qaCounts[t.qa]         = (qaCounts[t.qa]         || 0) + 1;
  });
  const baActive = awaitingBA + activeTickets.filter(t => t.ba).length;
  const liveWorkload = [
    {
      team: "Business Analyst",
      active: baActive,
      capacity: DB.users.filter(u => u.role === "ba").reduce((s, u) => s + u.capacity, 0),
      members: DB.users.filter(u => u.role === "ba").map(u => [u.name, u.activeTickets || 0]),
    },
    {
      team: "Developer",
      active: Object.values(devCounts).reduce((s, v) => s + v, 0),
      capacity: DB.users.filter(u => u.role === "developer").reduce((s, u) => s + u.capacity, 0),
      members: DB.users.filter(u => u.role === "developer").map(u => [u.name, devCounts[u.id] || 0]),
    },
    {
      team: "QA Tester",
      active: Object.values(qaCounts).reduce((s, v) => s + v, 0),
      capacity: DB.users.filter(u => u.role === "qa").reduce((s, u) => s + u.capacity, 0),
      members: DB.users.filter(u => u.role === "qa").map(u => [u.name, qaCounts[u.id] || 0]),
    },
  ];

  /* ── Recent activity: timeline events + fallback ke perubahan tiket terbaru ── */
  const timelineActivity = tickets
    .flatMap(t => (t.timeline || []).map(a => ({ ...a, ticket: t })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12);

  const syntheticActivity = tickets
    .slice()
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 12)
    .map(t => ({
      actor: t.requestor,
      action: t.status === "Completed" ? "completed" : "created",
      text: t.status === "Completed" ? `menyelesaikan tiket` : `membuka tiket baru`,
      at: t.updated || t.created,
      ticket: t,
    }));

  const recent = timelineActivity.length > 0 ? timelineActivity : syntheticActivity;

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

      {/* KPIs — live dari DB.tickets */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12 }}>
        {liveKpis.map((k,i) => <KpiCard key={i} k={k} i={i} />)}
      </div>

      {/* main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:16 }} className="dash-grid">
        <Panel title="Tickets by type" icon="ChartColumnBig"
          action={<div className="seg">{["30h","12w","12bln"].map(r => <button key={r} className={range===r?"active":""} onClick={()=>setRange(r)}>{r}</button>)}</div>}>
          <TrendChart data={DB.trend} />
        </Panel>

        <Panel title="Workload by team" icon="Users">
          <div style={{ display:"grid", gap:16 }}>
            {liveWorkload.map((w,i) => <CapacityBar key={i} {...w} />)}
          </div>
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px dashed var(--border)", fontSize:11.5, color:"var(--text-3)", display:"flex", gap:14, justifyContent:"center" }}>
            {[["< 70%","#16a34a"],["70–90%","#f59e0b"],["> 90%","#dc2626"]].map(([l,c]) => (
              <span key={l} style={{ display:"inline-flex", gap:5, alignItems:"center" }}><span className="dot" style={{ background:c, width:7, height:7 }} />{l}</span>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:16 }}>
        {/* Status distribution — live dari DB.tickets */}
        <Panel title="Status distribution" icon="ChartPie">
          {liveStatusDist.length > 0
            ? <Donut data={liveStatusDist} onSlice={(d) => nav("tickets", { status: d.name })} />
            : <Empty icon="ChartPie" title="Belum ada tiket" sub="Data akan muncul setelah ada tiket masuk." />
          }
        </Panel>

        <Panel title="SLA performance" icon="ShieldCheck">
          <div style={{ display:"grid", placeItems:"center", gap:8 }}>
            <Gauge value={slaRate} />
            <div style={{ fontSize:12.5, color:"var(--text-3)", textAlign:"center" }}>
              <b style={{ color: slaRate>=90?"#16a34a":"#f59e0b" }}>{slaRate}%</b> tiket diselesaikan dalam target SLA
            </div>
            <div style={{ display:"flex", gap:12, fontSize:11.5, color:"var(--text-3)" }}>
              {[["≥90% Healthy","#16a34a"],["80–90%","#f59e0b"],["<80%","#dc2626"]].map(([l,c]) => (
                <span key={l} style={{ display:"inline-flex", gap:5, alignItems:"center" }}><span className="dot" style={{ background:c, width:7, height:7 }} />{l}</span>
              ))}
            </div>
          </div>
        </Panel>

        {/* Top requestors — live dari DB.tickets */}
        <Panel title="Top requestors" icon="Crown">
          {liveTopRequestors.length > 0 ? (
            <div style={{ display:"grid", gap:11 }}>
              {liveTopRequestors.map((r,i) => {
                const max = liveTopRequestors[0].count;
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
          ) : (
            <Empty icon="Crown" title="Belum ada data" sub="Data akan muncul setelah ada tiket dibuat." />
          )}
        </Panel>
      </div>

      {/* Activity feed — dari timeline in-memory tiket */}
      <Panel title="Recent activity" icon="Activity"
        action={<button className="btn btn-ghost btn-sm" onClick={() => nav("tickets")}>View all<Icon name="ArrowRight" size={14} /></button>}>
        {recent.length > 0 ? (
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
        ) : (
          <Empty icon="Activity" title="Belum ada aktivitas" sub="Aktivitas akan muncul setelah ada perubahan pada tiket." />
        )}
      </Panel>
    </div>
  );
}
window.Dashboard = Dashboard;
