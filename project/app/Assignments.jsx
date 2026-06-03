/* ============================================================
   My Assignments — role-aware queues (BA / Dev / QA / PM)
   ============================================================ */
function AssignmentRow({ t, nav, extra }) {
  return (
    <button onClick={() => nav("ticket",{id:t.id})} className="hoverable"
      style={{ display:"flex", gap:14, alignItems:"center", padding:"13px 14px", border:"1px solid var(--border)", borderRadius:12, background:"var(--surface)", textAlign:"left", width:"100%", transition:"border-color .15s, transform .12s" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-strong)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
      <TypeIcon type={t.type} size={38} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <span className="mono" style={{ fontSize:11.5, color:"var(--text-3)" }}>{t.number}</span>
          <StatusBadge status={t.status} />
          {t.slaBreached && <span className="chip" style={{ height:18, fontSize:10, color:"#dc2626", borderColor:"color-mix(in srgb,#dc2626 30%,transparent)" }}><Icon name="TriangleAlert" size={10} />SLA</span>}
        </div>
        <div style={{ fontWeight:600, fontSize:13.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.title}</div>
        <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:2, display:"flex", gap:10, flexWrap:"wrap" }}>
          <span>{DB.byId[t.requestor]?.name}</span>
          <span>·</span>
          <PriorityBadge priority={t.priority} />
          {extra}
        </div>
      </div>
      {["bug","cr"].includes(t.type) && (
        <div style={{ width:90, flex:"none" }}><Progress value={t.progress} showLabel color={DB.STATUS[t.status]?.color} /></div>
      )}
      <Icon name="ChevronRight" size={18} style={{ color:"var(--text-3)", flex:"none" }} />
    </button>
  );
}

function Assignments({ nav, currentUser }) {
  const role = currentUser.role;
  const cfgByRole = {
    ba: {
      title:"BA Review Queue", icon:"ClipboardCheck",
      tabs:[
        ["new","New Tickets", t => ["Open","BA Review"].includes(t.status)],
        ["assigned","Assigned by Me", t => ["Assigned","In Progress","Ready for QA","QA Testing","Rework"].includes(t.status) && t.ba===currentUser.id],
        ["validation","Final Validation", t => t.status==="QA Passed"],
        ["hold","Hold", t => t.status==="Hold"],
        ["completed","Completed", t => ["Completed","Resolved"].includes(t.status)],
      ],
    },
    developer: {
      title:"My Development Queue", icon:"Code2",
      tabs:[
        ["new","New Assignments", t => t.status==="Assigned"],
        ["progress","In Progress", t => t.status==="In Progress"],
        ["qa","Sent to QA", t => ["Ready for QA","QA Testing"].includes(t.status)],
        ["rework","Rework", t => t.status==="Rework"],
        ["done","Completed", t => ["QA Passed","Completed"].includes(t.status)],
      ],
    },
    qa: {
      title:"My Testing Queue", icon:"FlaskConical",
      tabs:[
        ["new","New", t => t.status==="Ready for QA"],
        ["testing","Testing", t => t.status==="QA Testing"],
        ["tested","Tested", t => ["QA Passed","Rework","Completed"].includes(t.status)],
      ],
    },
    pm: {
      title:"Project Manager Overview", icon:"Telescope",
      tabs:[
        ["all","All Tickets", () => true],
        ["sla","SLA Watch", t => t.slaUsed/t.slaTarget > 0.7],
        ["active","Active", t => !["Completed","Cancelled","Resolved"].includes(t.status)],
        ["completed","Completed", t => ["Completed","Resolved"].includes(t.status)],
      ],
    },
  };
  const cfg = cfgByRole[role] || cfgByRole.pm;
  const [tab, setTab] = useState(cfg.tabs[0][0]);
  useEffect(() => { setTab(cfg.tabs[0][0]); }, [role]);
  const activeTab = cfg.tabs.find(t => t[0]===tab) || cfg.tabs[0];
  const rows = DB.tickets.filter(activeTab[2]);

  const extraFor = (t) => {
    if (role==="developer") return <span style={{ display:"flex", gap:5, alignItems:"center" }}><Icon name="UserCheck" size={12} />QA: {DB.byId[t.qa]?.name?.split(" ")[0]||"—"}</span>;
    if (role==="qa") return <span style={{ display:"flex", gap:5, alignItems:"center" }}><Icon name="Code2" size={12} />Dev: {DB.byId[t.developer]?.name?.split(" ")[0]||"—"}</span>;
    return <span style={{ display:"flex", gap:5, alignItems:"center" }}><Icon name="Clock" size={12} />{relTime(t.updated)}</span>;
  };

  return (
    <div style={{ display:"grid", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, display:"grid", placeItems:"center", background:`color-mix(in srgb, ${DB.ROLES[role]?.color} 14%, var(--surface))`, color:DB.ROLES[role]?.color, border:`1px solid color-mix(in srgb, ${DB.ROLES[role]?.color} 24%, transparent)` }}>
          <Icon name={cfg.icon} size={21} />
        </div>
        <div>
          <h1 style={{ fontSize:19 }}>{cfg.title}</h1>
          <span style={{ fontSize:12.5, color:"var(--text-3)" }}>View for the role {DB.ROLES[role]?.label}</span>
        </div>
      </div>

      {/* PM special: quick metrics */}
      {role==="pm" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:12 }}>
          {[["Total active",26,"Activity","var(--st-inprogress)"],["Approaching SLA",4,"TriangleAlert","#f59e0b"],["SLA breached",1,"CircleX","#dc2626"],["Completed this month",64,"CircleCheckBig","#16a34a"]].map(([l,v,ic,c]) => (
            <div key={l} className="card" style={{ padding:14, display:"flex", gap:11, alignItems:"center" }}>
              <div style={{ width:34, height:34, borderRadius:9, display:"grid", placeItems:"center", background:`color-mix(in srgb, ${c} 14%, var(--surface))`, color:c }}><Icon name={ic} size={17} /></div>
              <div><div className="mono" style={{ fontSize:21, fontWeight:700 }}>{v}</div><div style={{ fontSize:11.5, color:"var(--text-3)" }}>{l}</div></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ overflowX:"auto", paddingBottom:2 }}>
        <div className="segtabs">
          {cfg.tabs.map(([k,l,fn]) => {
            const count = DB.tickets.filter(fn).length;
            return (
              <button key={k} className={tab===k?"active":""} onClick={() => setTab(k)}>
                {l}{count>0 && <span className="seg-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {rows.length ? (
        <div style={{ display:"grid", gap:10 }}>
          {rows.map(t => <AssignmentRow key={t.id} t={t} nav={nav} extra={extraFor(t)} />)}
        </div>
      ) : (
        <div className="card"><Empty icon="CheckCheck" title="Queue is clear!" sub="No tickets in this tab. Nice work." /></div>
      )}
    </div>
  );
}

window.Assignments = Assignments;
