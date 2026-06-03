/* ============================================================
   Admin — Master Data (multiple) + User Management
   ============================================================ */
function MasterPage({ which, nav }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(null); // null | {} (new) | row (edit)
  const cfg = {
    application: { title:"Master Application", icon:"AppWindow", rows:DB.applications,
      cols:[["name","Name"],["code","Code"],["team","Owner Team"],["tickets","Tickets"]], },
    module: { title:"Master Module / Feature", icon:"Layers", rows:DB.modules.map(m=>({...m, appName:DB.applications.find(a=>a.id===m.app)?.name})),
      cols:[["name","Name"],["appName","Application"]], },
    department: { title:"Master Business Unit", icon:"Building2", rows:DB.departments.map(d=>({...d, headName:DB.byId[d.head]?.name})),
      cols:[["name","Name"],["code","Code"],["headName","Head"],["count","Members"]], },
    category: { title:"Master Category", icon:"Tag", rows:DB.categories,
      cols:[["name","Name"],["_color","Color"],["order","Order"]], },
    severity: { title:"Master Severity", icon:"TriangleAlert", rows:DB.severities,
      cols:[["name","Name"],["_color","Color"],["sla","SLA (hours)"],["order","Order"]], },
    priority: { title:"Master Priority", icon:"Flag", rows:DB.priorities,
      cols:[["name","Name"],["_color","Color"],["order","Order"]], },
    status: { title:"Master Status", icon:"CircleDot", rows:Object.entries(DB.STATUS).map(([name,m],i)=>({id:i,name,stage:m.stage,_color:m.color})),
      cols:[["name","Name"],["_color","Color"],["stage","Workflow Stage"]], },
    sla: { title:"Master SLA", icon:"Timer", rows:DB.slas,
      cols:[["name","Name"],["type","Ticket Type"],["sev","Severity"],["response","Response (h)"],["resolution","Resolution (h)"]], },
    team: { title:"Master Team", icon:"UsersRound", rows:DB.teams.map(t=>({...t, leadName:DB.byId[t.lead]?.name, memberCount:t.members.length})),
      cols:[["name","Team Name"],["leadName","Lead"],["memberCount","Members"],["capacity","Capacity"]], },
  }[which] || {};

  let rows = cfg.rows || [];
  if (q) rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ display:"grid", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:40, height:40, borderRadius:10, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)" }}><Icon name={cfg.icon} size={20} /></div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:19 }}>{cfg.title}</h1>
          <span style={{ fontSize:12.5, color:"var(--text-3)" }}>{rows.length} records</span>
        </div>
        <button className="btn btn-primary" onClick={() => setSheet({})}><Icon name="Plus" size={16} />Add</button>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--border)", display:"flex", gap:10 }}>
          <div style={{ position:"relative", flex:"1 1 280px", maxWidth:340 }}>
            <Icon name="Search" size={15} style={{ position:"absolute", left:11, top:11, color:"var(--text-3)" }} />
            <input className="input input-pill" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} style={{ paddingLeft:36 }} />
          </div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--surface-2)" }}>
                <th style={{ textAlign:"left", padding:"10px 14px", fontSize:11.5, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".04em", width:40 }}>#</th>
                {cfg.cols.map(([k,l]) => <th key={k} style={{ textAlign:"left", padding:"10px 14px", fontSize:11.5, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap" }}>{l}</th>)}
                <th style={{ textAlign:"left", padding:"10px 14px", fontSize:11.5, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".04em" }}>Status</th>
                <th style={{ width:90 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={r.id ?? i} className="hoverable" style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"11px 14px", color:"var(--text-3)" }} className="mono">{i+1}</td>
                  {cfg.cols.map(([k]) => (
                    <td key={k} style={{ padding:"11px 14px", whiteSpace:"nowrap" }}>
                      {k==="_color"
                        ? <span style={{ display:"inline-flex", gap:7, alignItems:"center" }}><span className="dot" style={{ background:r._color||r.color, width:12, height:12, borderRadius:4 }} /><span className="mono" style={{ fontSize:11.5, color:"var(--text-3)" }}>{r.color||"—"}</span></span>
                        : k==="name" ? <span style={{ fontWeight:600 }}>{r[k]}</span>
                        : (r[k] ?? "—")}
                    </td>
                  ))}
                  <td style={{ padding:"11px 14px" }}>
                    <span className="chip" style={{ color: r.active!==false?"#16a34a":"#dc2626", borderColor:`color-mix(in srgb, ${r.active!==false?"#16a34a":"#dc2626"} 30%, transparent)`, background:`color-mix(in srgb, ${r.active!==false?"#16a34a":"#dc2626"} 10%, var(--surface))` }}>
                      <span className="dot" style={{ background:r.active!==false?"#16a34a":"#dc2626", width:6, height:6 }} />{r.active!==false?"Active":"Inactive"}
                    </span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <div className="row-actions" style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ width:30, height:30 }} onClick={() => setSheet(r)} aria-label="Edit"><Icon name="Pencil" size={14} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ width:30, height:30, color:"#dc2626" }} onClick={() => toast.push({ type:"warning", title:"Soft delete", message:`${r.name} is referenced by tickets — deactivate instead.` })} aria-label="Delete"><Icon name="Trash2" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet && sheet.id!=null ? `Edit ${cfg.title.replace("Master ","")}` : `Add ${cfg.title.replace("Master ","")}`}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setSheet(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setSheet(null); toast.push({ type:"success", title:"Saved" }); }}><Icon name="Check" size={15} />Save</button>
        </>}>
        {sheet && <>
          <Field label="Name" required><input className="input" defaultValue={sheet.name||""} placeholder="Enter a name" /></Field>
          {(which==="application"||which==="department") && <Field label="Code"><input className="input" defaultValue={sheet.code||""} /></Field>}
          {["category","severity","priority"].includes(which) && <Field label="Color"><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{["#dc2626","#f97316","#f59e0b","#16a34a","#2563eb","#9333ea","#64748b"].map(c => <button key={c} style={{ width:30, height:30, borderRadius:8, background:c, border: (sheet.color===c)?"2px solid var(--text)":"2px solid transparent", cursor:"pointer" }} />)}</div></Field>}
          {which==="severity" && <Field label="Default SLA (hours)"><input className="input" type="number" defaultValue={sheet.sla||24} /></Field>}
          <Field label="Description"><textarea className="input" rows="3" defaultValue={sheet.description||""} /></Field>
          <Field label="Status">
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <span style={{ position:"relative", width:40, height:23, borderRadius:999, background: sheet.active!==false?"var(--accent)":"var(--border-strong)", transition:".2s" }}>
                <span style={{ position:"absolute", top:2, left: sheet.active!==false?19:2, width:19, height:19, borderRadius:999, background:"#fff", transition:".2s" }} />
              </span>
              <span style={{ fontSize:13 }}>{sheet.active!==false?"Active":"Inactive"}</span>
            </label>
          </Field>
        </>}
      </Sheet>
    </div>
  );
}

/* ---------- User Management ---------- */
function UserManagement({ nav }) {
  const toast = useToast();
  const [tab, setTab] = useState("accounts");
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("All");
  const [sheet, setSheet] = useState(null);
  let users = DB.users.slice();
  if (roleF!=="All") users = users.filter(u => u.role===roleF);
  if (q) users = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ display:"grid", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:40, height:40, borderRadius:10, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)" }}><Icon name="Users" size={20} /></div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:19 }}>User Management</h1>
          <span style={{ fontSize:12.5, color:"var(--text-3)" }}>{DB.users.length} users · {Object.keys(DB.ROLES).length} roles</span>
        </div>
        {tab==="accounts" && <button className="btn btn-primary" onClick={() => setSheet({})}><Icon name="UserPlus" size={16} />Add User</button>}
      </div>

      <div className="segtabs">
        {[["accounts","User Accounts","Users"],["roles","Roles & Permissions","ShieldCheck"]].map(([k,l,ic]) => (
          <button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}><Icon name={ic} size={14} />{l}</button>
        ))}
      </div>

      {tab==="accounts" ? (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--border)", display:"flex", gap:10, flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:"1 1 240px", maxWidth:320 }}>
              <Icon name="Search" size={15} style={{ position:"absolute", left:11, top:11, color:"var(--text-3)" }} />
              <input className="input input-pill" placeholder="Search name / email…" value={q} onChange={e=>setQ(e.target.value)} style={{ paddingLeft:36 }} />
            </div>
            <div style={{ minWidth:150 }}><Select value={roleF} onChange={setRoleF} options={[{value:"All",label:"Semua roles"},...Object.entries(DB.ROLES).map(([k,v])=>({value:k,label:v.label}))]} /></div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ borderBottom:"1px solid var(--border)", background:"var(--surface-2)" }}>
                {["User","Role","Team","Tickets Active","Status","Last Login",""].map((h,i) => <th key={i} style={{ textAlign:"left", padding:"10px 14px", fontSize:11.5, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hoverable" style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <Avatar user={u.id} size={34} />
                        <div><div style={{ fontWeight:600 }}>{u.name}</div><div style={{ fontSize:11.5, color:"var(--text-3)" }}>{u.email}</div></div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px" }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding:"10px 14px", color:"var(--text-2)" }}>{u.team||"—"}</td>
                    <td style={{ padding:"10px 14px" }}><span className="mono" style={{ fontWeight:600 }}>{u.activeTickets}</span></td>
                    <td style={{ padding:"10px 14px" }}>
                      <span className="chip" style={{ color:u.active?"#16a34a":"#dc2626", borderColor:`color-mix(in srgb, ${u.active?"#16a34a":"#dc2626"} 30%, transparent)`, background:`color-mix(in srgb, ${u.active?"#16a34a":"#dc2626"} 10%, var(--surface))` }}><span className="dot" style={{ background:u.active?"#16a34a":"#dc2626", width:6, height:6 }} />{u.active?"Active":"Inactive"}</span>
                    </td>
                    <td style={{ padding:"10px 14px", color:"var(--text-3)", fontSize:12, whiteSpace:"nowrap" }}>{relTime(u.lastLogin)}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <div className="row-actions" style={{ display:"flex", gap:4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ width:30, height:30 }} onClick={()=>setSheet(u)} aria-label="Edit"><Icon name="Pencil" size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ width:30, height:30 }} onClick={()=>toast.push({type:"info",title:"Reset password",message:`Reset link sent to ${u.email}`})} aria-label="Reset"><Icon name="KeyRound" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:12 }}>
          {Object.entries(DB.ROLES).map(([k,r]) => {
            const count = DB.users.filter(u=>u.role===k).length;
            return (
              <div key={k} className="card lift" style={{ padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span className="dot" style={{ background:r.color, width:12, height:12 }} />
                  <h3 style={{ fontSize:15, flex:1 }}>{r.label}</h3>
                  <span className="chip">{count} members</span>
                </div>
                <p style={{ fontSize:12.5, color:"var(--text-3)", lineHeight:1.5, marginBottom:12, minHeight:36 }}>{r.desc}</p>
                <button className="btn btn-ghost btn-sm" style={{ width:"100%" }} onClick={()=>toast.push({type:"info",title:`Permission matrix: ${r.label}`})}><Icon name="SlidersHorizontal" size={14} />Edit Permissions</button>
              </div>
            );
          })}
          <button className="card lift" onClick={()=>toast.push({type:"info",title:"Buat roles kustom"})} style={{ padding:16, display:"grid", placeItems:"center", gap:8, border:"1.5px dashed var(--border-strong)", color:"var(--text-3)", cursor:"pointer", background:"transparent", minHeight:140 }}>
            <Icon name="Plus" size={22} /><span style={{ fontSize:13, fontWeight:550 }}>Create Custom Role</span>
          </button>
        </div>
      )}

      <Sheet open={!!sheet} onClose={()=>setSheet(null)} title={sheet&&sheet.id?"Edit User":"Add User"}
        footer={<><button className="btn btn-ghost" onClick={()=>setSheet(null)}>Cancel</button><button className="btn btn-primary" onClick={()=>{setSheet(null);toast.push({type:"success",title:"User tersimpan"});}}><Icon name="Check" size={15} />Save</button></>}>
        {sheet && <>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
            {sheet.id ? <Avatar user={sheet.id} size={72} /> : <div className="avatar" style={{ width:72, height:72, background:"var(--bg-subtle)", color:"var(--text-3)" }}><Icon name="Camera" size={24} /></div>}
          </div>
          <Field label="Name Lengkap" required><input className="input" defaultValue={sheet.name||""} /></Field>
          <Field label="Email" required><input className="input" type="email" defaultValue={sheet.email||""} /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Role" required><Select value={sheet.role||""} onChange={()=>{}} placeholder="Select" options={Object.entries(DB.ROLES).map(([k,v])=>({value:k,label:v.label}))} /></Field>
            <Field label="Department"><Select value={sheet.dept||""} onChange={()=>{}} placeholder="Select" options={DB.departments.map(d=>({value:d.name,label:d.name}))} /></Field>
          </div>
          {["developer","qa"].includes(sheet.role) && <Field label="Capacity (concurrent tickets)"><input className="input" type="number" defaultValue={sheet.capacity||5} /></Field>}
          {!sheet.id && <div style={{ padding:"11px 13px", borderRadius:10, background:"var(--accent-soft)", border:"1px solid var(--accent-soft-border)", fontSize:12.5, color:"var(--text-2)", display:"flex", gap:9 }}>
            <Icon name="Info" size={15} style={{ color:"var(--accent)" }} />Password is auto-generated from the email. <label style={{ display:"flex", gap:5, alignItems:"center", marginLeft:"auto", cursor:"pointer" }}><input type="checkbox" defaultChecked style={{ accentColor:"var(--accent)" }} />Send credentials</label>
          </div>}
        </>}
      </Sheet>
    </div>
  );
}

window.MasterPage = MasterPage;
window.UserManagement = UserManagement;
