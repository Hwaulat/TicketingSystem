/* ============================================================
   Create Ticket — type selector → form → review → success
   ============================================================ */
function CreateTicket({ nav, currentUser }) {
  const toast = useToast();
  const [type, setType] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [done, setDone] = useState(null);
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const TYPE_CARDS = [
    { type:"project_request", icon:"FolderPlus", title:"Project Request", desc:"Propose a new project or initiative" },
    { type:"bug", icon:"Bug", title:"Bug Report", desc:"Report a defect in an existing system" },
    { type:"cr", icon:"GitPullRequest", title:"Change Request", desc:"Request a change to an existing feature" },
    { type:"discussion", icon:"MessageCircle", title:"Discussion", desc:"Start a cross-team discussion" },
  ];

  // ----- Type selector -----
  if (!type && !done) {
    return (
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{ fontSize:24, marginBottom:8 }}>Create a new ticket</h1>
          <p style={{ color:"var(--text-3)", fontSize:14 }}>Pick a ticket type to begin. The form adapts automatically.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:14 }}>
          {TYPE_CARDS.map((c,i) => {
            const col = DB.TYPES[c.type].color;
            return (
              <button key={c.type} className="card lift fade-up" onClick={() => { setType(c.type); setStep(0); }}
                style={{ padding:22, textAlign:"left", background:"var(--surface)", animationDelay:`${i*0.05}s`, cursor:"pointer", position:"relative", overflow:"hidden" }}>
                <div style={{ width:46, height:46, borderRadius:12, display:"grid", placeItems:"center", marginBottom:14,
                  background:`color-mix(in srgb, ${col} 14%, var(--surface))`, color:col, border:`1px solid color-mix(in srgb, ${col} 26%, transparent)` }}>
                  <Icon name={c.icon} size={22} />
                </div>
                <h3 style={{ fontSize:15.5, marginBottom:5 }}>{c.title}</h3>
                <p style={{ fontSize:12.5, color:"var(--text-3)", lineHeight:1.5 }}>{c.desc}</p>
                <div style={{ position:"absolute", top:18, right:18, color:"var(--text-3)" }}><Icon name="ArrowUpRight" size={18} /></div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- Success page -----
  if (done) {
    return (
      <div style={{ maxWidth:520, margin:"40px auto 0", textAlign:"center" }}>
        <div className="scale-in" style={{ width:72, height:72, borderRadius:999, margin:"0 auto 18px", display:"grid", placeItems:"center", background:"color-mix(in srgb, #16a34a 14%, var(--surface))", color:"#16a34a" }}>
          <Icon name="CircleCheckBig" size={36} />
        </div>
        <h1 style={{ fontSize:22, marginBottom:8 }}>Ticket created successfully!</h1>
        <p style={{ color:"var(--text-3)", fontSize:14, marginBottom:18 }}>A confirmation email has been sent to {currentUser.email}</p>
        <div className="card" style={{ padding:"18px 20px", marginBottom:20, display:"inline-flex", flexDirection:"column", gap:4 }}>
          <span style={{ fontSize:12, color:"var(--text-3)" }}>Your ticket number</span>
          <span className="mono" style={{ fontSize:24, fontWeight:700, color:DB.TYPES[type].color }}>{done}</span>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="btn btn-primary" onClick={() => nav("ticket",{ id:"tk1" })}><Icon name="Eye" size={16} />Track Ticket</button>
          <button className="btn btn-ghost" onClick={() => { setDone(null); setType(null); setForm({}); setStep(0); }}><Icon name="Plus" size={16} />Create Another</button>
        </div>
      </div>
    );
  }

  // ----- Forms -----
  const cfg = DB.TYPES[type];
  const steps = type==="project_request"
    ? ["Basics","Details","Planning","Attachments","Review"]
    : ["Details","Attachments","Review"];
  const isLast = step === steps.length-1;
  const isReview = isLast;

  function submit() {
    const num = `${cfg.prefix}-202605-${String(Math.floor(Math.random()*9000)+1000)}`;
    setDone(num);
    toast.push({ type:"success", title:"Ticket submitted", message:`${num} created successfully.` });
  }

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => type && step===0 ? setType(null) : setStep(s=>s-1)} aria-label="Back"><Icon name="ArrowLeft" size={16} /></button>
        <TypeIcon type={type} size={38} />
        <div>
          <h1 style={{ fontSize:18 }}>{cfg.label}</h1>
          <span style={{ fontSize:12.5, color:"var(--text-3)" }}>Step {step+1} of {steps.length} · {steps[step]}</span>
        </div>
        <div style={{ flex:1 }} />
        <span className="chip" style={{ color:"#16a34a" }}><Icon name="Save" size={12} />Draft saved</span>
      </div>

      {/* stepper */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:20, gap:0 }}>
        {steps.map((s,i) => (
          <React.Fragment key={s}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:"none" }}>
              <div style={{ width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12, fontWeight:600,
                background: i<step?"var(--accent)":i===step?"var(--accent-soft)":"var(--bg-subtle)",
                color: i<step?"#fff":i===step?"var(--accent)":"var(--text-3)",
                border: i===step?"1px solid var(--accent)":"1px solid transparent", transition:"all .2s" }}>
                {i<step ? <Icon name="Check" size={14} /> : i+1}
              </div>
              <span style={{ fontSize:11, color: i<=step?"var(--text-2)":"var(--text-3)", fontWeight: i===step?600:400, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i<steps.length-1 && <div style={{ flex:1, height:2, background: i<step?"var(--accent)":"var(--border)", margin:"0 6px", marginBottom:18, transition:"background .2s" }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card fade-in" key={step} style={{ padding:22 }}>
        {isReview
          ? <ReviewStep type={type} form={form} currentUser={currentUser} onEdit={setStep} />
          : <FormStep type={type} step={step} form={form} set={set} currentUser={currentUser} />}
      </div>

      {/* footer nav */}
      <div style={{ display:"flex", gap:10, marginTop:18, justifyContent:"space-between" }}>
        <button className="btn btn-ghost" onClick={() => step===0 ? setType(null) : setStep(s=>s-1)}>
          <Icon name="ChevronLeft" size={16} />{step===0?"Change type":"Back"}
        </button>
        <div style={{ display:"flex", gap:10 }}>
          {isReview && <button className="btn btn-ghost"><Icon name="Save" size={15} />Save Draft</button>}
          {isReview
            ? <button className="btn btn-primary" onClick={submit}><Icon name="Send" size={15} />Submit Ticket</button>
            : <button className="btn btn-primary" onClick={() => setStep(s=>s+1)}>Next<Icon name="ChevronRight" size={16} /></button>}
        </div>
      </div>
    </div>
  );
}

/* Form fields per type & step */
function FormStep({ type, step, form, set, currentUser }) {
  const F = (k) => form[k] || "";
  const appOpts = DB.applications.map(a => ({ value:a.name, label:a.name }));
  const deptOpts = DB.departments.map(d => ({ value:d.name, label:d.name }));

  const requestorBox = (
    <div style={{ display:"flex", gap:10, alignItems:"center", padding:"11px 13px", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:10, marginBottom:16 }}>
      <Avatar user={currentUser.id} size={34} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{currentUser.name}</div>
        <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{currentUser.email} · {currentUser.dept}</div>
      </div>
      <span className="chip"><Icon name="Calendar" size={12} />Hari ini</span>
    </div>
  );

  if (type==="bug") {
    return (<div>{requestorBox}
      <Field label="Bug Title" required><input className="input" placeholder="Brief summary of the problem" value={F("title")} onChange={e=>set("title",e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Application / System" required><Select value={F("app")} onChange={v=>set("app",v)} placeholder="Select application" options={appOpts} /></Field>
        <Field label="Module / Feature" required><Select value={F("module")} onChange={v=>set("module",v)} placeholder="Select module" options={DB.modules.map(m=>({value:m.name,label:m.name}))} /></Field>
        <Field label="Environment" required><Select value={F("env")} onChange={v=>set("env",v)} placeholder="Select" options={["Production","Staging","UAT","Development"]} /></Field>
        <Field label="Severity" required><Select value={F("sev")} onChange={v=>set("sev",v)} placeholder="Select" options={["Critical","High","Medium","Low"]} /></Field>
        <Field label="Bug Type" required><Select value={F("bugType")} onChange={v=>set("bugType",v)} placeholder="Select" options={["UI","Functional","Performance","Security","Data","Integration"]} /></Field>
        <Field label="Reproducibility" required><Select value={F("repro")} onChange={v=>set("repro",v)} placeholder="Select" options={["Always","Sometimes","Once","Cannot Reproduce"]} /></Field>
      </div>
      <Field label="Steps to Reproduce" required hint="At least 30 characters, use a numbered list"><textarea className="input" rows="4" placeholder="1. …&#10;2. …" value={F("steps")} onChange={e=>set("steps",e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Expected Behavior" required><textarea className="input" rows="3" value={F("expected")} onChange={e=>set("expected",e.target.value)} /></Field>
        <Field label="Actual Behavior" required><textarea className="input" rows="3" value={F("actual")} onChange={e=>set("actual",e.target.value)} /></Field>
      </div>
    </div>);
  }

  if (type==="cr") {
    return (<div>{requestorBox}
      <Field label="Change Title" required><input className="input" placeholder="Brief summary of the change" value={F("title")} onChange={e=>set("title",e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Application / System" required><Select value={F("app")} onChange={v=>set("app",v)} placeholder="Select application" options={appOpts} /></Field>
        <Field label="Module / Feature" required><Select value={F("module")} onChange={v=>set("module",v)} placeholder="Select module" options={DB.modules.map(m=>({value:m.name,label:m.name}))} /></Field>
        <Field label="Category" required><Select value={F("cat")} onChange={v=>set("cat",v)} placeholder="Select" options={["Minor","Medium","Major"]} /></Field>
        <Field label="Change Type" required><Select value={F("changeType")} onChange={v=>set("changeType",v)} placeholder="Select" options={["UI Change","Functional Change","Workflow","Configuration","Other"]} /></Field>
      </div>
      <Field label="Change Description" required><textarea className="input" rows="3" value={F("desc")} onChange={e=>set("desc",e.target.value)} /></Field>
      <Field label="Reason / Justification" required><textarea className="input" rows="3" value={F("reason")} onChange={e=>set("reason",e.target.value)} /></Field>
      <Field label="Expected Outcome" required><textarea className="input" rows="2" value={F("expected")} onChange={e=>set("expected",e.target.value)} /></Field>
    </div>);
  }

  if (type==="discussion") {
    return (<div>{requestorBox}
      <Field label="Discussion Topic" required><input className="input" placeholder="A clear topic title" value={F("title")} onChange={e=>set("title",e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Category" required><Select value={F("cat")} onChange={v=>set("cat",v)} placeholder="Select" options={["General","Technical","Process","Decision","Brainstorm"]} /></Field>
        <Field label="Related Application"><Select value={F("app")} onChange={v=>set("app",v)} placeholder="Select (optional)" options={appOpts} /></Field>
      </div>
      <Field label="Description" required hint="Topic context, what needs to be discussed"><textarea className="input" rows="4" value={F("desc")} onChange={e=>set("desc",e.target.value)} /></Field>
      <Field label="Participants" required hint="Tag colleagues to involve them">
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", padding:8, border:"1px solid var(--border-strong)", borderRadius:8, minHeight:42 }}>
          {DB.users.filter(u=>["developer","ba","pm"].includes(u.role)).slice(0,3).map(u => (
            <span key={u.id} className="chip" style={{ background:"var(--accent-soft)", color:"var(--accent)", borderColor:"var(--accent-soft-border)" }}><Avatar user={u.id} size={16} />{u.name}<Icon name="X" size={11} /></span>
          ))}
          <button className="chip" style={{ cursor:"pointer", border:"1px dashed var(--border-strong)" }}><Icon name="Plus" size={12} />Add</button>
        </div>
      </Field>
    </div>);
  }

  // project_request stepper
  if (type==="project_request") {
    if (step===0) return (<div>{requestorBox}
      <Field label="Project Name" required><input className="input" placeholder="Proposed project title" value={F("title")} onChange={e=>set("title",e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Project Category" required><Select value={F("cat")} onChange={v=>set("cat",v)} placeholder="Select" options={["New Feature","Integration","Migration","Infrastructure","Other"]} /></Field>
        <Field label="Business Unit" required><Select value={F("bu")} onChange={v=>set("bu",v)} placeholder="Select" options={deptOpts} /></Field>
        <Field label="Priority" required><Select value={F("priority")} onChange={v=>set("priority",v)} placeholder="Select" options={["Low","Medium","High","Critical"]} /></Field>
      </div>
    </div>);
    if (step===1) return (<div>
      <Field label="Business Objective" required hint="Why this project matters and its business value"><textarea className="input" rows="3" value={F("obj")} onChange={e=>set("obj",e.target.value)} /></Field>
      <Field label="Scope Summary" required><textarea className="input" rows="4" value={F("scope")} onChange={e=>set("scope",e.target.value)} /></Field>
      <Field label="Target Users" required><input className="input" placeholder="Who will use it" value={F("users")} onChange={e=>set("users",e.target.value)} /></Field>
    </div>);
    if (step===2) return (<div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Estimated Timeline" required><Select value={F("timeline")} onChange={v=>set("timeline",v)} placeholder="Select" options={["< 1 month","1–3 months","3–6 months","> 6 months"]} /></Field>
        <Field label="Estimated Budget"><Select value={F("budget")} onChange={v=>set("budget",v)} placeholder="Select" options={["< 50jt","50–200jt","200–500jt","> 500jt","TBD"]} /></Field>
      </div>
      <Field label="Success Criteria" required hint="Measurable outcomes"><textarea className="input" rows="3" value={F("success")} onChange={e=>set("success",e.target.value)} /></Field>
      <Field label="Risks / Constraints"><textarea className="input" rows="2" value={F("risks")} onChange={e=>set("risks",e.target.value)} /></Field>
    </div>);
  }

  // attachments step (shared)
  return (
    <div>
      <Field label="Attachments" hint="PDF, DOCX, XLSX, PNG, MP4 — max 10 files, 20MB each">
        <div style={{ border:"1.5px dashed var(--border-strong)", borderRadius:12, padding:"30px 16px", textAlign:"center", color:"var(--text-3)", cursor:"pointer", transition:"border-color .2s, background .2s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.background="var(--accent-soft)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-strong)";e.currentTarget.style.background="transparent";}}>
          <Icon name="CloudUpload" size={30} style={{ marginBottom:8 }} />
          <div style={{ fontSize:13.5, fontWeight:550, color:"var(--text-2)" }}>Drag files here or click to upload</div>
        </div>
      </Field>
      <Field label="Reference Links">
        <div style={{ display:"flex", gap:8 }}>
          <input className="input" placeholder="https://…" style={{ flex:2 }} />
          <input className="input" placeholder="Description" style={{ flex:1 }} />
          <button className="btn btn-ghost btn-icon"><Icon name="Plus" size={16} /></button>
        </div>
      </Field>
      <Field label="Additional Notes"><textarea className="input" rows="2" placeholder="Additional context…" value={form.note||""} onChange={e=>set("note",e.target.value)} /></Field>
    </div>
  );
}

function ReviewStep({ type, form, currentUser, onEdit }) {
  const cfg = DB.TYPES[type];
  const fields = Object.entries(form).filter(([k,v]) => v);
  const labels = { title:"Title", app:"Application", module:"Module", env:"Environment", sev:"Severity", bugType:"Bug Type", repro:"Reproducibility", steps:"Steps to Reproduce", expected:"Expected Behavior", actual:"Actual Behavior", cat:"Category", changeType:"Change Type", desc:"Description", reason:"Reason", bu:"Business Unit", priority:"Priority", obj:"Business Objective", scope:"Scope", users:"Target Users", timeline:"Timeline", budget:"Budget", success:"Success Criteria", risks:"Risiko", note:"Notes" };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, paddingBottom:16, borderBottom:"1px solid var(--border)" }}>
        <TypeIcon type={type} size={40} />
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:16 }}>{form.title || cfg.label}</h3>
          <span style={{ fontSize:12.5, color:"var(--text-3)" }}>{cfg.label} · by {currentUser.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(0)}><Icon name="Pencil" size={13} />Edit</button>
      </div>
      <div style={{ display:"grid", gap:0 }}>
        {fields.length ? fields.map(([k,v]) => (
          <div key={k} style={{ display:"flex", gap:14, padding:"10px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
            <span style={{ color:"var(--text-3)", width:150, flex:"none" }}>{labels[k]||k}</span>
            <span style={{ flex:1, whiteSpace:"pre-wrap" }}>{v}</span>
          </div>
        )) : <div style={{ color:"var(--text-3)", fontSize:13, padding:"8px 0" }}>No data entered yet — go back to complete the form.</div>}
      </div>
      <div style={{ marginTop:16, padding:"12px 14px", borderRadius:10, background:"var(--accent-soft)", border:"1px solid var(--accent-soft-border)", display:"flex", gap:9, alignItems:"flex-start", fontSize:12.5, color:"var(--text-2)" }}>
        <Icon name="Info" size={15} style={{ color:"var(--accent)", marginTop:1 }} />
        After submission, the ticket enters the <b>BA Review</b>. You will receive a ticket number and confirmation email.
      </div>
    </div>
  );
}

window.CreateTicket = CreateTicket;
