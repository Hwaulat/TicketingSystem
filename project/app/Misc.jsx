/* ============================================================
   Reports builder + Notification settings + Profile
   ============================================================ */
function Reports({ nav }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const steps = ["Pick Type","Configure","Preview","Export"];

  return (
    <div style={{ display:"grid", gap:16, maxWidth:980, margin:"0 auto", width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:40, height:40, borderRadius:10, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)" }}><Icon name="FileBarChart" size={20} /></div>
        <div style={{ flex:1 }}><h1 style={{ fontSize:19 }}>Reports</h1><span style={{ fontSize:12.5, color:"var(--text-3)" }}>Build, preview, and export reports</span></div>
      </div>

      {/* steps indicator */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {steps.map((s,i) => (
          <button key={s} onClick={()=> i<=step && setStep(i)} className="chip" style={{ height:30, cursor: i<=step?"pointer":"default",
            background: i===step?"var(--accent)":i<step?"var(--accent-soft)":"var(--surface-2)",
            color: i===step?"#fff":i<step?"var(--accent)":"var(--text-3)",
            borderColor: i<=step?"transparent":"var(--border)" }}>
            <span style={{ width:18, height:18, borderRadius:999, display:"grid", placeItems:"center", fontSize:10.5, fontWeight:700, background: i===step?"rgba(255,255,255,.25)":"transparent" }}>{i<step?"✓":i+1}</span>{s}
          </button>
        ))}
      </div>

      {step===0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:12 }}>
          {DB.reportTypes.map((r,i) => (
            <button key={r.id} className="card lift fade-up" onClick={()=>{setPicked(r);setStep(1);}} style={{ padding:16, textAlign:"left", animationDelay:`${i*0.03}s`, cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:38, height:38, borderRadius:10, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)", flex:"none" }}><Icon name={r.icon} size={19} /></div>
              <div><h3 style={{ fontSize:14, marginBottom:4 }}>{r.name}</h3><p style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.5 }}>{r.desc}</p></div>
            </button>
          ))}
        </div>
      )}

      {step===1 && picked && (
        <div className="card fade-in" style={{ padding:20 }}>
          <h3 style={{ fontSize:15, marginBottom:16 }}>{picked.name} — Parameters</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="From date"><input className="input" type="date" defaultValue="2026-05-01" /></Field>
            <Field label="To date"><input className="input" type="date" defaultValue="2026-06-01" /></Field>
            <Field label="Ticket type"><Select value="" onChange={()=>{}} placeholder="All types" options={Object.values(DB.TYPES).map(t=>({value:t.short,label:t.label}))} /></Field>
            <Field label="Application"><Select value="" onChange={()=>{}} placeholder="All applications" options={DB.applications.map(a=>({value:a.id,label:a.name}))} /></Field>
            <Field label="Group by"><Select value="Date" onChange={()=>{}} options={["Date","Application","Department","Assignee","Type"]} /></Field>
            <Field label="Department"><Select value="" onChange={()=>{}} placeholder="All" options={DB.departments.map(d=>({value:d.id,label:d.name}))} /></Field>
          </div>
          <div style={{ display:"flex", gap:18, marginTop:6 }}>
            {[["Include charts",true],["Include detail table",true]].map(([l,d]) => (
              <label key={l} style={{ display:"flex", gap:8, alignItems:"center", fontSize:13, cursor:"pointer" }}><input type="checkbox" defaultChecked={d} style={{ accentColor:"var(--accent)" }} />{l}</label>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 }}>
            <button className="btn btn-ghost" onClick={()=>setStep(0)}>Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(2)}>Preview<Icon name="ChevronRight" size={16} /></button>
          </div>
        </div>
      )}

      {step===2 && picked && (
        <div className="fade-in" style={{ display:"grid", gap:14 }}>
          <div className="card" style={{ padding:"24px 28px", background:"linear-gradient(135deg, var(--accent-soft), var(--surface))" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11.5, color:"var(--text-3)", marginBottom:4, letterSpacing:".05em", textTransform:"uppercase" }}>Reports · NusaTech</div>
                <h2 style={{ fontSize:22 }}>{picked.name}</h2>
                <div style={{ fontSize:12.5, color:"var(--text-3)", marginTop:4 }}>Period May 1 – Jun 1, 2026 · Generated by Dewi Anggraini</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:11, background:"var(--accent)", display:"grid", placeItems:"center", color:"#fff" }}><Icon name="Ticket" size={22} /></div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
            {[["Total tickets",102],["Completed",64],["Avg resolution","2.4h"],["SLA compliance","92%"]].map(([l,v]) => (
              <div key={l} className="card" style={{ padding:14 }}><div style={{ fontSize:11.5, color:"var(--text-3)" }}>{l}</div><div className="mono" style={{ fontSize:24, fontWeight:700, marginTop:4 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Panel title="Ticket trend"><TrendChart data={DB.trend} height={200} /></Panel>
            <Panel title="Status distribution"><Donut data={DB.statusDist.slice(0,6)} size={150} /></Panel>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Export<Icon name="ChevronRight" size={16} /></button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card fade-in" style={{ padding:24, textAlign:"center" }}>
          <h3 style={{ fontSize:16, marginBottom:16 }}>Export & Jadwalkan</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, maxWidth:560, margin:"0 auto" }}>
            {[["PDF","FileText","#dc2626"],["Excel","Sheet","#16a34a"],["CSV","FileSpreadsheet","#0ea5e9"]].map(([l,ic,c]) => (
              <button key={l} className="card lift" onClick={()=>toast.push({type:"success",title:`Reports ${l} downloaded`})} style={{ padding:"20px 14px", display:"grid", gap:8, placeItems:"center", cursor:"pointer" }}>
                <Icon name={ic} size={26} style={{ color:c }} /><span style={{ fontWeight:600, fontSize:13.5 }}>{l}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop:18, paddingTop:18, borderTop:"1px solid var(--border)", display:"flex", gap:10, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
            <Icon name="CalendarClock" size={16} style={{ color:"var(--text-3)" }} />
            <span style={{ fontSize:13, color:"var(--text-2)" }}>Schedule recurring delivery:</span>
            <div style={{ width:140 }}><Select value="Weekly" onChange={()=>{}} options={["Daily","Weekly","Monthly"]} /></div>
            <button className="btn btn-ghost btn-sm" onClick={()=>toast.push({type:"info",title:"Report schedule saved"})}>Enable</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Notification settings ---------- */
function NotificationSettings() {
  const events = [
    "Ticket created","BA approved","Ticket assigned to me","Progress update",
    "Ready for QA","QA passed","QA failed","Ticket completed","@mention","SLA alert","New comment",
  ];
  const [state, setState] = useState(Object.fromEntries(events.map(e => [e, { email:true, app:true }])));
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{ position:"relative", width:38, height:22, borderRadius:999, background: on?"var(--accent)":"var(--border-strong)", border:0, transition:".2s", cursor:"pointer", flex:"none" }}>
      <span style={{ position:"absolute", top:2, left: on?18:2, width:18, height:18, borderRadius:999, background:"#fff", transition:".2s" }} />
    </button>
  );
  return (
    <div style={{ maxWidth:720, margin:"0 auto", width:"100%", display:"grid", gap:14 }}>
      <div><h1 style={{ fontSize:19 }}>Notification Preferences</h1><span style={{ fontSize:12.5, color:"var(--text-3)" }}>Control how you receive notifications</span></div>
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ display:"flex", padding:"11px 16px", borderBottom:"1px solid var(--border)", background:"var(--surface-2)", fontSize:11.5, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".04em", fontWeight:600 }}>
          <span style={{ flex:1 }}>Event</span><span style={{ width:60, textAlign:"center" }}>Email</span><span style={{ width:60, textAlign:"center" }}>In-app</span>
        </div>
        {events.map(e => (
          <div key={e} style={{ display:"flex", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
            <span style={{ flex:1, fontSize:13.5, display:"flex", gap:8, alignItems:"center" }}>{e}{e==="@mention" && <span className="chip" style={{ height:18, fontSize:10 }}>Required</span>}</span>
            <span style={{ width:60, display:"grid", placeItems:"center" }}><Toggle on={state[e].email} onClick={()=>setState(s=>({...s,[e]:{...s[e],email:!s[e].email}}))} /></span>
            <span style={{ width:60, display:"grid", placeItems:"center" }}><Toggle on={state[e].app} onClick={()=>setState(s=>({...s,[e]:{...s[e],app:!s[e].app}}))} /></span>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:11, alignItems:"center" }}>
          <Icon name="Moon" size={18} style={{ color:"var(--text-3)" }} />
          <div><div style={{ fontSize:13.5, fontWeight:600 }}>Quiet Hours</div><div style={{ fontSize:12, color:"var(--text-3)" }}>No notifications during this window</div></div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input className="input" type="time" defaultValue="22:00" style={{ width:120 }} /><span style={{ color:"var(--text-3)" }}>–</span><input className="input" type="time" defaultValue="07:00" style={{ width:120 }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function Profile({ currentUser }) {
  const u = currentUser;
  return (
    <div style={{ maxWidth:720, margin:"0 auto", width:"100%", display:"grid", gap:14 }}>
      <h1 style={{ fontSize:19 }}>My Profile</h1>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ height:88, background:"linear-gradient(120deg, var(--indigo-600), var(--indigo-400))" }} />
        <div style={{ padding:"0 22px 22px", marginTop:-36 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:16, flexWrap:"wrap" }}>
            <div style={{ boxShadow:"0 0 0 4px var(--surface)", borderRadius:999 }}><Avatar user={u.id} size={76} /></div>
            <div style={{ flex:1, paddingBottom:4 }}>
              <h2 style={{ fontSize:19 }}>{u.name}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:4 }}><RoleBadge role={u.role} /><span style={{ fontSize:12.5, color:"var(--text-3)" }}>{u.dept}</span></div>
            </div>
            <button className="btn btn-ghost btn-sm"><Icon name="Camera" size={14} />Change photo</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding:20 }}>
        <h3 style={{ fontSize:14.5, marginBottom:16 }}>Account Information</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Field label="Nama Lengkap"><input className="input" defaultValue={u.name} /></Field>
          <Field label="Email"><input className="input" defaultValue={u.email} /></Field>
          <Field label="Department"><input className="input" defaultValue={u.dept} disabled /></Field>
          <Field label="Phone"><input className="input" placeholder="+62…" /></Field>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary"><Icon name="Check" size={15} />Save Changes</button>
        </div>
      </div>
    </div>
  );
}

window.Reports = Reports;
window.NotificationSettings = NotificationSettings;
window.Profile = Profile;
