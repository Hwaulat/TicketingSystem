/* ============================================================
   Tickets list — All Tickets & My Tickets
   ============================================================ */
function TicketTypePill({ type }) {
  const t = DB.TYPES[type];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, height:22, padding:"0 8px", borderRadius:6,
      fontSize:11, fontWeight:600, color:t.color,
      background:`color-mix(in srgb, ${t.color} 12%, var(--surface))`,
      border:`1px solid color-mix(in srgb, ${t.color} 24%, transparent)` }}>
      <Icon name={t.icon} size={12} />{t.short}
    </span>
  );
}

function TicketsList({ nav, mode = "all", currentUser, initialFilter }) {
  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("All");
  const [statusF, setStatusF] = useState(initialFilter?.status || "All");
  const [tab, setTab] = useState("All");
  const [sort, setSort] = useState({ key:"updated", dir:"desc" });

  useEffect(() => { if (initialFilter?.status) setStatusF(initialFilter.status); }, [initialFilter]);

  let rows = DB.tickets.slice();
  if (mode === "my") rows = rows.filter(t => t.requestor === currentUser.id);

  // tab filters for my-tickets
  if (mode === "my") {
    if (tab === "In Progress") rows = rows.filter(t => ["Assigned","In Progress","Ready for QA","QA Testing","Rework"].includes(t.status));
    else if (tab === "Awaiting My Action") rows = rows.filter(t => ["Open","Completed","Hold"].includes(t.status));
    else if (tab === "Completed") rows = rows.filter(t => ["Completed","Resolved"].includes(t.status));
    else if (tab === "Cancelled") rows = rows.filter(t => t.status === "Cancelled");
  }

  if (typeF !== "All") rows = rows.filter(t => DB.TYPES[t.type].short === typeF);
  if (statusF !== "All") rows = rows.filter(t => t.status === statusF);
  if (q) {
    const s = q.toLowerCase();
    rows = rows.filter(t => t.number.toLowerCase().includes(s) || t.title.toLowerCase().includes(s) || (DB.byId[t.requestor]?.name||"").toLowerCase().includes(s));
  }
  rows.sort((a,b) => {
    let av, bv;
    if (sort.key === "priority") { av = DB.PRIORITY[a.priority]?.rank||0; bv = DB.PRIORITY[b.priority]?.rank||0; }
    else if (sort.key === "number") { av = a.number; bv = b.number; }
    else { av = new Date(a[sort.key]); bv = new Date(b[sort.key]); }
    const r = av > bv ? 1 : av < bv ? -1 : 0;
    return sort.dir === "asc" ? r : -r;
  });

  const allStatuses = ["All", ...Object.keys(DB.STATUS).filter(s => DB.tickets.some(t => t.status===s))];
  const toggleSort = key => setSort(s => ({ key, dir: s.key===key && s.dir==="desc" ? "asc" : "desc" }));

  const myTabs = ["All","In Progress","Awaiting My Action","Completed","Cancelled"];

  return (
    <div style={{ display:"grid", gap:14 }}>
      {mode === "my" && (
        <div style={{ overflowX:"auto", paddingBottom:2 }}>
          <div className="segtabs">
            {myTabs.map(t => {
              const count = t==="All"
                ? DB.tickets.filter(x=>x.requestor===currentUser.id).length
                : DB.tickets.filter(x=>x.requestor===currentUser.id).filter(x => {
                    if (t==="In Progress") return ["Assigned","In Progress","Ready for QA","QA Testing","Rework"].includes(x.status);
                    if (t==="Awaiting My Action") return ["Open","Completed","Hold"].includes(x.status);
                    if (t==="Completed") return ["Completed","Resolved"].includes(x.status);
                    if (t==="Cancelled") return x.status==="Cancelled";
                    return true;
                  }).length;
              return <button key={t} className={tab===t?"active":""} onClick={() => setTab(t)}>{t}<span className="seg-count">{count}</span></button>;
            })}
          </div>
        </div>
      )}

      {/* toolbar */}
      <div className="card" style={{ padding:"10px 12px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 220px", maxWidth:340 }}>
          <Icon name="Search" size={15} style={{ position:"absolute", left:11, top:11, color:"var(--text-3)" }} />
          <input className="input input-pill" placeholder="Search number, title, requestor…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft:36 }} />
        </div>
        <div className="seg">
          {["All","PR","Bug","CR","Disc"].map(t => <button key={t} className={typeF===t?"active":""} onClick={()=>setTypeF(t)}>{t}</button>)}
        </div>
        <div style={{ minWidth:160 }}>
          <Select value={statusF} onChange={setStatusF} options={allStatuses.map(s => ({ value:s, label: s==="All"?"All statuses":s }))} />
        </div>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12.5, color:"var(--text-3)" }}>{rows.length} tickets</span>
        <div className="seg">
          <button className={view==="table"?"active":""} onClick={()=>setView("table")} aria-label="Table view"><Icon name="Rows3" size={15} /></button>
          <button className={view==="card"?"active":""} onClick={()=>setView("card")} aria-label="Card view"><Icon name="LayoutGrid" size={15} /></button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card"><Empty icon="SearchX" title="No tickets found" sub="Try adjusting the filters or search terms." /></div>
      ) : view === "table" ? (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--surface-2)" }}>
                  {[["number","Ticket"],["title","Title"],["",""],["status","Status"],["priority","Priority"],["",""],["updated","Updated"]].map(([k,l],i) => (
                    <th key={i} onClick={() => k && toggleSort(k)} style={{ textAlign:"left", padding:"11px 14px", fontWeight:600, color:"var(--text-3)", fontSize:11.5, textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap", cursor:k?"pointer":"default", userSelect:"none" }}>
                      <span style={{ display:"inline-flex", gap:4, alignItems:"center" }}>{l}{sort.key===k && <Icon name={sort.dir==="asc"?"ArrowUp":"ArrowDown"} size={12} />}</span>
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.id} onClick={() => nav("ticket", { id:t.id })}
                    style={{ borderBottom:"1px solid var(--border)", cursor:"pointer", transition:"background .12s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--surface-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"11px 14px" }}>
                      <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", whiteSpace:"nowrap" }}>{t.number}</span>
                    </td>
                    <td style={{ padding:"11px 14px", maxWidth:340 }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        <span style={{ fontWeight:550, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:320 }}>{t.title}</span>
                        <span style={{ fontSize:11.5, color:"var(--text-3)" }}>{t.appName !== "—" ? t.appName : DB.byId[t.requestor]?.dept} · {DB.byId[t.requestor]?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"11px 8px" }}><TicketTypePill type={t.type} /></td>
                    <td style={{ padding:"11px 14px" }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding:"11px 14px" }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding:"11px 14px", minWidth:90 }}>
                      {["bug","cr"].includes(t.type) && <Progress value={t.progress} showLabel color={DB.STATUS[t.status]?.color} />}
                    </td>
                    <td style={{ padding:"11px 14px", color:"var(--text-3)", fontSize:12, whiteSpace:"nowrap" }}>{relTime(t.updated)}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <div className="row-actions" style={{ display:"flex", gap:4 }}>
                        <Icon name="ChevronRight" size={16} style={{ color:"var(--text-3)" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:12 }}>
          {rows.map(t => <TicketCard key={t.id} t={t} nav={nav} />)}
        </div>
      )}
    </div>
  );
}

function TicketCard({ t, nav }) {
  const sla = t.slaUsed/t.slaTarget;
  return (
    <button onClick={() => nav("ticket",{id:t.id})} className="card lift" style={{ padding:14, textAlign:"left", background:"var(--surface)", display:"flex", flexDirection:"column", gap:10, border:"1px solid var(--border)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <TicketTypePill type={t.type} />
        <span className="mono" style={{ fontSize:11.5, color:"var(--text-3)" }}>{t.number}</span>
      </div>
      <div style={{ fontWeight:600, fontSize:13.5, lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:38 }}>{t.title}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"space-between" }}>
        <StatusBadge status={t.status} />
        <PriorityBadge priority={t.priority} />
      </div>
      {["bug","cr"].includes(t.type) && <Progress value={t.progress} showLabel color={DB.STATUS[t.status]?.color} />}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
        <AvatarStack ids={[t.ba,t.developer,t.qa]} size={24} />
        <span style={{ fontSize:11.5, color: sla>1?"var(--st-qafailed)":"var(--text-3)", display:"inline-flex", gap:4, alignItems:"center" }}>
          <Icon name="Clock" size={12} />{relTime(t.updated)}
        </span>
      </div>
    </button>
  );
}

window.TicketsList = TicketsList;
window.TicketCard = TicketCard;
