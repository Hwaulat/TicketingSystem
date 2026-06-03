/* ============================================================
   Ticket Detail — 3-column layout + activity timeline + actions
   ============================================================ */

function fileIcon(name, mimeType) {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (mimeType?.startsWith("image/") || ["png","jpg","jpeg","gif","webp","svg","bmp"].includes(ext)) return "Image";
  if (mimeType === "application/pdf" || ext === "pdf") return "FileText";
  if (["doc","docx"].includes(ext) || mimeType?.includes("word")) return "FileText";
  if (["xls","xlsx","csv"].includes(ext) || mimeType?.includes("sheet")) return "FileSpreadsheet";
  if (["mp4","mov","avi","mkv"].includes(ext) || mimeType?.startsWith("video/")) return "FileVideo";
  if (["zip","rar","7z","tar","gz"].includes(ext)) return "FileArchive";
  return "File";
}

function fmtFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MetaRow({ label, children }) {
  return (
    <div style={{ display:"flex", gap:10, padding:"7px 0", fontSize:12.5, alignItems:"flex-start" }}>
      <span style={{ color:"var(--text-3)", width:88, flex:"none" }}>{label}</span>
      <span style={{ flex:1, fontWeight:500, minWidth:0 }}>{children}</span>
    </div>
  );
}

function UserLine({ id, role }) {
  const u = DB.byId[id];
  if (!u) return <span style={{ color:"var(--text-3)" }}>—</span>;
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <Avatar user={id} size={26} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</div>
        <div style={{ fontSize:11, color:"var(--text-3)" }}>{role || DB.ROLES[u.role]?.label}</div>
      </div>
    </div>
  );
}

const ACTION_ICONS = {
  created:"Plus", status:"ArrowRightLeft", approved:"CircleCheck", assigned:"UserPlus",
  accepted:"Check", progress:"Activity", ready_qa:"FlaskConical", picked:"Hand",
  qa_pass:"BadgeCheck", qa_fail:"BadgeX", completed:"PartyPopper", comment:"MessageSquare", hold:"PauseCircle",
};
const ACTION_COLORS = {
  created:"var(--st-open)", approved:"var(--st-ba-approved)", assigned:"var(--st-assigned)",
  accepted:"var(--st-inprogress)", progress:"var(--st-inprogress)", ready_qa:"var(--st-readyqa)",
  picked:"var(--st-qatesting)", qa_pass:"var(--st-qapassed)", qa_fail:"var(--st-qafailed)",
  completed:"var(--st-completed)", comment:"var(--text-3)", hold:"var(--st-hold)", status:"var(--text-3)",
};

function TimelineEntry({ a, last }) {
  const actor = DB.byId[a.actor];
  const isComment = a.action === "comment";
  const color = ACTION_COLORS[a.action] || "var(--text-3)";
  return (
    <div style={{ display:"flex", gap:12, position:"relative" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:"none" }}>
        <div style={{ width:30, height:30, borderRadius:999, display:"grid", placeItems:"center", flex:"none",
          background:`color-mix(in srgb, ${color} 14%, var(--surface))`, color, border:`1px solid color-mix(in srgb, ${color} 28%, transparent)`, zIndex:1 }}>
          <Icon name={ACTION_ICONS[a.action]||"Dot"} size={15} />
        </div>
        {!last && <div style={{ width:2, flex:1, background:"var(--border)", marginTop:2 }} />}
      </div>
      <div style={{ flex:1, paddingBottom:20, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
          <Avatar user={a.actor} size={20} />
          <span style={{ fontSize:13 }}><b>{actor?.name||"Sistem"}</b> <span style={{ color:"var(--text-2)" }}>{a.text}</span></span>
          {a.internal && <span className="chip" style={{ height:18, fontSize:10, color:"var(--st-rework)", borderColor:"color-mix(in srgb, var(--st-rework) 30%, transparent)", background:"color-mix(in srgb, var(--st-rework) 10%, var(--surface))" }}><Icon name="Lock" size={10} />Internal</span>}
          <span style={{ fontSize:11.5, color:"var(--text-3)", marginLeft:"auto" }}>{relTime(a.at)}</span>
        </div>
        {isComment && (
          <div style={{ marginTop:7, padding:"10px 12px", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:10, fontSize:13, color:"var(--text)", lineHeight:1.55 }}>{a.text}</div>
        )}
        {a.progress != null && (
          <div style={{ marginTop:7, maxWidth:240 }}><Progress value={a.progress} showLabel color="var(--st-inprogress)" /></div>
        )}
      </div>
    </div>
  );
}

/* Action dialogs config keyed by action id */
function ActionDialog({ action, ticket, onClose, onConfirm }) {
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(ticket.progress || 0);
  const [dev, setDev] = useState("");
  const [qa, setQa] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  function handleFiles(incoming) {
    const newFiles = Array.from(incoming).map(f => ({
      name: f.name,
      size: fmtFileSize(f.size),
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }
  const cfg = {
    BA_APPROVE: { title:"Approve Ticket", color:"var(--st-ba-approved)", btn:"Approve", icon:"CircleCheck", note:"Approval note (optional)" },
    BA_REJECT:  { title:"Reject Ticket", color:"var(--st-qafailed)", btn:"Reject", icon:"CircleX", note:"Rejection reason", req:true },
    BA_HOLD:    { title:"Put On Hold", color:"var(--st-hold)", btn:"Hold", icon:"PauseCircle", note:"Hold reason" },
    BA_REQUEST_INFO: { title:"Request Information", color:"var(--st-ba-review)", btn:"Send Request", icon:"MessageCircleQuestion", note:"Information needed", req:true },
    BA_ASSIGN:  { title:"Assign Developer + QA", color:"var(--st-assigned)", btn:"Assign", icon:"UserPlus", assign:true },
    BA_VALIDATE:{ title:"Final Validation → Complete", color:"var(--st-completed)", btn:"Mark Complete", icon:"PartyPopper", note:"Closing note (optional)" },
    DEV_ACCEPT: { title:"Accept Assignment", color:"var(--st-inprogress)", btn:"Accept", icon:"Check", note:"Note (optional)" },
    DEV_REJECT: { title:"Reject Assignment", color:"var(--st-qafailed)", btn:"Reject", icon:"X", note:"Rejection reason", req:true },
    DEV_PROGRESS:{ title:"Update Progress", color:"var(--st-inprogress)", btn:"Save", icon:"Activity", progress:true, note:"Progress note" },
    DEV_READY_QA:{ title:"Mark Ready for QA", color:"var(--st-readyqa)", btn:"Send to QA", icon:"FlaskConical", note:"Notes & test scenarios", req:true },
    QA_PICK:    { title:"Pick Up for Testing", color:"var(--st-qatesting)", btn:"Start Testing", icon:"Hand", note:"Note (optional)" },
    QA_PASS:    { title:"Mark QA Passed", color:"var(--st-qapassed)", btn:"Pass", icon:"BadgeCheck", note:"Test summary" },
    QA_FAIL:    { title:"Mark QA Failed", color:"var(--st-qafailed)", btn:"Fail", icon:"BadgeX", note:"Failure reason & reproduction steps", req:true },
  }[action];
  if (!cfg) return null;
  const devs = DB.users.filter(u => u.role==="developer");
  const qas = DB.users.filter(u => u.role==="qa");
  const valid = cfg.assign ? (dev && qa) : (cfg.req ? note.trim().length>0 : true);
  return (
    <Modal open onClose={onClose} width={460}>
      <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:36, height:36, borderRadius:10, display:"grid", placeItems:"center", background:`color-mix(in srgb, ${cfg.color} 14%, var(--surface))`, color:cfg.color }}>
          <Icon name={cfg.icon} size={18} />
        </div>
        <div>
          <h3 style={{ fontSize:15.5 }}>{cfg.title}</h3>
          <span className="mono" style={{ fontSize:12, color:"var(--text-3)" }}>{ticket.number}</span>
        </div>
      </div>
      <div style={{ padding:20 }}>
        {cfg.assign && (
          <>
            <Field label="Developer" required>
              <Select value={dev} onChange={setDev} placeholder="Select developer…" options={devs.map(u => ({ value:u.id, label:`${u.name} · ${u.activeTickets}/${u.capacity} active` }))} />
            </Field>
            <Field label="QA Tester" required>
              <Select value={qa} onChange={setQa} placeholder="Select QA…" options={qas.map(u => ({ value:u.id, label:`${u.name} · ${u.activeTickets}/${u.capacity} active` }))} />
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Field label="Estimate (hours)"><input className="input" type="number" defaultValue="16" /></Field>
              <Field label="Target date"><input className="input" type="date" defaultValue="2026-06-08" /></Field>
            </div>
          </>
        )}
        {cfg.progress && (
          <Field label={`Progress: ${progress}%`}>
            <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(+e.target.value)} style={{ width:"100%", accentColor:"var(--accent)" }} />
          </Field>
        )}
        {cfg.note && (
          <Field label={cfg.note} required={cfg.req}>
            <textarea className="input" rows="4" placeholder="Write here…" value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        )}
        <Field label="Attachment (optional)">
          <input ref={fileInputRef} type="file" multiple style={{ display:"none" }}
            onChange={e => handleFiles(e.target.files)} />
          <div
            style={{ border:"1.5px dashed var(--border-strong)", borderRadius:10, padding:"16px", textAlign:"center", color:"var(--text-3)", fontSize:12.5, cursor:"pointer" }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
            onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; handleFiles(e.dataTransfer.files); }}
          >
            <Icon name="Upload" size={18} style={{ marginBottom:4 }} />
            <div>Drag files here or click to upload</div>
          </div>
          {files.length > 0 && (
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {files.map((f, i) => (
                <div key={i} style={{ display:"flex", gap:6, alignItems:"center", padding:"5px 9px", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }}>
                  <Icon name={fileIcon(f.name, f.type)} size={13} style={{ color:"var(--accent)", flex:"none" }} />
                  <span style={{ maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                  <span style={{ color:"var(--text-3)", flex:"none" }}>{f.size}</span>
                  <button onClick={() => setFiles(fs => fs.filter((_,j) => j!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:0, lineHeight:1, display:"grid", placeItems:"center" }}>
                    <Icon name="X" size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
      </div>
      <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)", display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} style={{ background:cfg.color }} onClick={() => onConfirm(cfg, files)}>
          <Icon name={cfg.icon} size={16} />{cfg.btn}
        </button>
      </div>
    </Modal>
  );
}

/* Determine available actions by role + status */
function availableActions(ticket, role) {
  const s = ticket.status;
  const isBug = ["bug","cr"].includes(ticket.type);
  const A = [];
  const add = (id, label, icon, variant) => A.push({ id, label, icon, variant });
  if (["ba","pm","admin"].includes(role)) {
    if (s==="Open"||s==="BA Review") { add("BA_APPROVE","Approve","CircleCheck","primary"); add("BA_REJECT","Reject","CircleX","ghost"); add("BA_HOLD","Hold","PauseCircle","ghost"); add("BA_REQUEST_INFO","Request Info","MessageCircleQuestion","ghost"); }
    if (s==="BA Approved" && isBug) add("BA_ASSIGN","Assign Dev + QA","UserPlus","primary");
    if (s==="QA Passed") { add("BA_VALIDATE","Validate → Complete","PartyPopper","primary"); add("BA_HOLD","Hold","PauseCircle","ghost"); }
  }
  if (role==="developer") {
    if (s==="Assigned") { add("DEV_ACCEPT","Accept","Check","primary"); add("DEV_REJECT","Reject","X","ghost"); }
    if (s==="In Progress") { add("DEV_PROGRESS","Update Progress","Activity","primary"); add("DEV_READY_QA","Ready for QA","FlaskConical","soft"); }
    if (s==="Rework") { add("DEV_PROGRESS","Continue Work","Activity","primary"); }
  }
  if (role==="qa") {
    if (s==="Ready for QA") add("QA_PICK","Pick Up to Test","Hand","primary");
    if (s==="QA Testing") { add("QA_PASS","Pass","BadgeCheck","primary"); add("QA_FAIL","Fail","BadgeX","ghost"); }
  }
  return A;
}

function TicketDetail({ id, nav, currentUser }) {
  const ticket = DB.ticketById[id];
  const toast = useToast();
  const [tab, setTab] = useState("activity");
  const [dialog, setDialog] = useState(null);
  const [comment, setComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [localTimeline, setLocalTimeline] = useState(ticket?.timeline || []);
  const [status, setStatus] = useState(ticket?.status);
  const [attachments, setAttachments] = useState([
    { name:"screenshot-error.png", size:"240 KB", type:"image/png", url:null },
    { name:"langkah-detail.pdf", size:"1.2 MB", type:"application/pdf", url:null },
  ]);
  const commentFileRef = useRef(null);

  function addAttachments(fileList) {
    const now = new Date().toISOString();
    /* fileList bisa berupa FileList (dari input) ATAU array objek pre-proses dari ActionDialog */
    const newFiles = Array.from(fileList).map(f => {
      const isRawFile = typeof f.size === "number"; // File object punya size numerik
      return {
        name: f.name,
        size: isRawFile ? fmtFileSize(f.size) : f.size,
        type: f.type || "",
        url: f.url || (isRawFile ? URL.createObjectURL(f) : null),
      };
    });
    setAttachments(prev => [...prev, ...newFiles]);

    /* Simpan metadata ke Supabase */
    const tId   = ticket.id;
    const tNum  = ticket.number;
    const uId   = currentUser.id;
    const uName = currentUser.name;
    newFiles.forEach(f => {
      SupabaseDB.addAttachment({
        ticket_id: tId, ticket_number: tNum,
        name: f.name, size: f.size, file_type: f.type,
        url: f.url || null,
        uploaded_by: uId, uploader_name: uName,
        created_at: now,
      }).catch(err => console.error("[TIXA] Gagal simpan attachment:", err));
    });
  }

  if (!ticket) return <Empty icon="FileQuestion" title="Ticket not found" />;
  const t = ticket;
  const role = currentUser.role;
  const actions = availableActions({ ...t, status }, role);
  const isDiscussion = t.type === "discussion";

  const STATUS_FLOW = {
    BA_APPROVE: t.type==="project_request" ? "BA Approved" : "BA Approved",
    BA_REJECT:"Cancelled", BA_HOLD:"Hold", BA_REQUEST_INFO:"Open", BA_ASSIGN:"Assigned",
    BA_VALIDATE:"Completed", DEV_ACCEPT:"In Progress", DEV_REJECT:"BA Approved",
    DEV_PROGRESS:"In Progress", DEV_READY_QA:"Ready for QA", QA_PICK:"QA Testing",
    QA_PASS:"QA Passed", QA_FAIL:"Rework",
  };

  function handleConfirm(cfg, files) {
    const newStatus = STATUS_FLOW[dialog];
    const now = new Date().toISOString();
    setStatus(newStatus);
    setLocalTimeline(tl => [...tl, { actor: currentUser.id, action:"status", text:`changed status to ${newStatus}`, at: now }]);
    if (files?.length) addAttachments(files);
    setDialog(null);
    toast.push({ type:"success", title:`Status updated → ${newStatus}`, message:`${t.number} processed successfully.` });

    /* ── Simpan ke Supabase (non-blocking) ── */
    const updates = { status: newStatus, updated_at: now };
    if (newStatus === "Completed") updates.completed_at = now;
    SupabaseDB.updateTicket(t.id, updates)
      .catch(err => console.error("[TIXA] Gagal update status tiket:", err));

    SupabaseDB.addTimelineEvent({
      ticket_id: t.id, ticket_number: t.number,
      actor_id: currentUser.id, actor_name: currentUser.name,
      action: "status",
      text: `changed status to ${newStatus}`,
      created_at: now,
    }).catch(err => console.error("[TIXA] Gagal simpan timeline:", err));
  }

  function postComment() {
    if (!comment.trim()) return;
    const now = new Date().toISOString();
    const text = comment;
    setLocalTimeline(tl => [...tl, { actor: currentUser.id, action:"comment", text, at: now, internal }]);
    setComment(""); setInternal(false);
    toast.push({ type:"info", title:"Comment added" });

    /* ── Simpan ke Supabase (non-blocking) ── */
    SupabaseDB.addTimelineEvent({
      ticket_id: t.id, ticket_number: t.number,
      actor_id: currentUser.id, actor_name: currentUser.name,
      action: "comment",
      text,
      is_internal: internal,
      created_at: now,
    }).catch(err => console.error("[TIXA] Gagal simpan komentar:", err));

    SupabaseDB.updateTicket(t.id, { updated_at: now })
      .catch(err => console.error("[TIXA] Gagal update tiket:", err));
  }

  const sortedTl = [...localTimeline].sort((a,b)=> new Date(a.at)-new Date(b.at));

  return (
    <div style={{ display:"grid", gap:14 }}>
      {/* breadcrumb + title */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => nav("tickets")} aria-label="Back"><Icon name="ArrowLeft" size={16} /></button>
        <TypeBadge type={t.type} withLabel={false} size={18} />
        <span className="mono" style={{ fontSize:14, fontWeight:700, color:DB.TYPES[t.type].color }}>{t.number}</span>
        <StatusBadge status={status} />
        {t.slaBreached && <span className="chip" style={{ color:"#dc2626", borderColor:"color-mix(in srgb,#dc2626 30%,transparent)", background:"color-mix(in srgb,#dc2626 10%,var(--surface))" }}><Icon name="TriangleAlert" size={12} />SLA Breached</span>}
      </div>

      <div className="detail-grid" style={{ display:"grid", gridTemplateColumns:"248px minmax(0,1fr) 290px", gap:14, alignItems:"start" }}>
        {/* LEFT meta */}
        <aside className="card detail-left" style={{ padding:16, position:"sticky", top:0 }}>
          <h4 style={{ fontSize:13.5, marginBottom:4 }}>Ticket Detail</h4>
          <div style={{ borderTop:"1px solid var(--border)", marginTop:8, paddingTop:4 }}>
            <MetaRow label="Type"><TypeBadge type={t.type} /></MetaRow>
            <MetaRow label="Priority"><PriorityBadge priority={t.priority} /></MetaRow>
            {t.severity && t.severity!=="—" && <MetaRow label="Severity"><span style={{ color: DB.severities.find(s=>s.name===t.severity)?.color }}>{t.severity}</span></MetaRow>}
            <MetaRow label="Application">{t.appName}</MetaRow>
            {t.module && <MetaRow label="Module">{t.module}</MetaRow>}
            <MetaRow label="Department">{t.deptName}</MetaRow>
            <MetaRow label="Created">{fmtDate(t.created)}</MetaRow>
            <MetaRow label="Updated">{relTime(t.updated)}</MetaRow>
          </div>
          {["bug","cr"].includes(t.type) && (
            <div style={{ marginTop:6, paddingTop:12, borderTop:"1px solid var(--border)" }}>
              <div style={{ fontSize:11.5, color:"var(--text-3)", marginBottom:6 }}>Progress</div>
              <Progress value={t.progress} showLabel color={DB.STATUS[status]?.color} />
            </div>
          )}
          <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid var(--border)", display:"grid", gap:10 }}>
            <div style={{ fontSize:11.5, color:"var(--text-3)" }}>Requestor</div>
            <UserLine id={t.requestor} role={`${DB.byId[t.requestor]?.dept}`} />
            {!isDiscussion && (t.ba||t.developer||t.qa) && (
              <>
                <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:4 }}>Handling chain</div>
                {t.ba && <UserLine id={t.ba} role="Business Analyst" />}
                {t.developer && <UserLine id={t.developer} role="Developer" />}
                {t.qa && <UserLine id={t.qa} role="QA Tester" />}
              </>
            )}
            {isDiscussion && (
              <>
                <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:4 }}>Participants</div>
                <AvatarStack ids={t.participants||[]} size={28} max={6} />
              </>
            )}
          </div>
        </aside>

        {/* CENTER */}
        <main style={{ display:"grid", gap:14, minWidth:0 }}>
          <div className="card" style={{ padding:18 }}>
            <h2 style={{ fontSize:18, lineHeight:1.3, marginBottom:12 }}>{t.title}</h2>
            <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{t.description}</p>

            {t.type==="bug" && (
              <div style={{ marginTop:16, display:"grid", gap:14 }}>
                <Detail title="Steps to Reproduce" icon="ListOrdered" body={t.steps} mono />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Detail title="Expected Behavior" icon="CircleCheck" body={t.expected} tint="#16a34a" />
                  <Detail title="Actual Behavior" icon="CircleX" body={t.actual} tint="#dc2626" />
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["Environment",t.environment],["Bug Type",t.bugType],["Reproducibility",t.reproducibility],["Browser/Device",t.browser]].filter(x=>x[1]).map(([l,v]) => (
                    <span key={l} className="chip">{l}: <b style={{ color:"var(--text)", marginLeft:3 }}>{v}</b></span>
                  ))}
                </div>
              </div>
            )}
            {t.type==="cr" && (
              <div style={{ marginTop:16, display:"grid", gap:14 }}>
                <Detail title="Reason / Justification" icon="MessageSquareQuote" body={t.reason} />
                <Detail title="Expected Outcome" icon="Target" body={t.expected} />
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["Change Type",t.changeType],["Category",t.category],["Component",t.item]].filter(x=>x[1]).map(([l,v]) => <span key={l} className="chip">{l}: <b style={{ color:"var(--text)", marginLeft:3 }}>{v}</b></span>)}
                </div>
              </div>
            )}
            {t.type==="project_request" && (
              <div style={{ marginTop:16, display:"grid", gap:14 }}>
                <Detail title="Business Objective" icon="Goal" body={t.businessObjective} />
                <Detail title="Scope Summary" icon="Scan" body={t.scope} />
                <Detail title="Success Criteria" icon="Trophy" body={t.success} />
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["Category",t.projectCategory],["Timeline",t.timeline_est],["Budget",t.budget],["Target Users",t.targetUsers]].filter(x=>x[1]).map(([l,v]) => <span key={l} className="chip">{l}: <b style={{ color:"var(--text)", marginLeft:3 }}>{v}</b></span>)}
                </div>
              </div>
            )}

            {/* attachments */}
            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)" }}>
              <div style={{ fontSize:12, color:"var(--text-3)", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                <Icon name="Paperclip" size={13} />Attachment ({attachments.length})
                <label style={{ marginLeft:"auto", cursor:"pointer" }}>
                  <input type="file" multiple style={{ display:"none" }} onChange={e => addAttachments(e.target.files)} />
                  <span className="btn btn-ghost btn-sm" style={{ height:24, fontSize:11, padding:"0 8px", display:"inline-flex", alignItems:"center", gap:4 }}>
                    <Icon name="Plus" size={12} />Add
                  </span>
                </label>
              </div>
              {attachments.length === 0
                ? <div style={{ fontSize:12.5, color:"var(--text-3)", padding:"8px 0" }}>No attachments.</div>
                : (
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    {attachments.map((att, i) => (
                      att.url
                        ? (
                          <a key={i} href={att.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none", color:"inherit" }}>
                            <div className="hoverable" style={{ display:"flex", gap:9, alignItems:"center", padding:"9px 11px", border:"1px solid var(--border)", borderRadius:10, cursor:"pointer", background:"var(--surface-2)" }}>
                              <div style={{ width:30, height:30, borderRadius:7, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)" }}>
                                <Icon name={fileIcon(att.name, att.type)} size={15} />
                              </div>
                              <div>
                                <div style={{ fontSize:12.5, fontWeight:550 }}>{att.name}</div>
                                <div style={{ fontSize:11, color:"var(--text-3)" }}>{att.size}</div>
                              </div>
                            </div>
                          </a>
                        ) : (
                          <div key={i} className="hoverable" style={{ display:"flex", gap:9, alignItems:"center", padding:"9px 11px", border:"1px solid var(--border)", borderRadius:10, cursor:"default", background:"var(--surface-2)" }}>
                            <div style={{ width:30, height:30, borderRadius:7, display:"grid", placeItems:"center", background:"var(--accent-soft)", color:"var(--accent)" }}>
                              <Icon name={fileIcon(att.name, att.type)} size={15} />
                            </div>
                            <div>
                              <div style={{ fontSize:12.5, fontWeight:550 }}>{att.name}</div>
                              <div style={{ fontSize:11, color:"var(--text-3)" }}>{att.size}</div>
                            </div>
                          </div>
                        )
                    ))}
                  </div>
                )
              }
            </div>
          </div>

          {/* timeline + comments */}
          <div className="card" style={{ padding:0 }}>
            <div style={{ padding:"12px 16px 0" }}>
              <div className="segtabs">
                {[["activity","Activity","Activity"],["history","Audit History","History"]].map(([k,l,ic]) => (
                  <button key={k} className={tab===k?"active":""} onClick={() => setTab(k)}><Icon name={ic} size={14} />{l}</button>
                ))}
              </div>
            </div>
            <div style={{ padding:18 }}>
              {tab==="activity" ? (
                <>
                  <div>
                    {sortedTl.map((a,i) => <TimelineEntry key={i} a={a} last={i===sortedTl.length-1} />)}
                  </div>
                  {/* comment box */}
                  <div style={{ marginTop:8, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", gap:10 }}>
                      <Avatar user={currentUser.id} size={32} />
                      <div style={{ flex:1 }}>
                        <textarea className="input" rows="3" placeholder="Write a comment… use @ to mention colleagues" value={comment} onChange={e => setComment(e.target.value)} />
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
                          <input ref={commentFileRef} type="file" multiple style={{ display:"none" }} onChange={e => addAttachments(e.target.files)} />
                          <button className="btn btn-ghost btn-sm btn-icon" aria-label="Attach" onClick={() => commentFileRef.current?.click()}><Icon name="Paperclip" size={15} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" aria-label="Mention"><Icon name="AtSign" size={15} /></button>
                          {role!=="requestor" && (
                            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                              <input type="checkbox" checked={internal} onChange={e=>setInternal(e.target.checked)} style={{ accentColor:"var(--accent)" }} />
                              <Icon name="Lock" size={12} />Internal only
                            </label>
                          )}
                          <div style={{ flex:1 }} />
                          <button className="btn btn-primary btn-sm" onClick={postComment} disabled={!comment.trim()}><Icon name="Send" size={14} />Send</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display:"grid", gap:10 }}>
                  {sortedTl.map((a,i) => (
                    <div key={i} style={{ display:"flex", gap:10, fontSize:12.5, padding:"8px 0", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
                      <span className="mono" style={{ color:"var(--text-3)", width:120, flex:"none" }}>{fmtDateTime(a.at)}</span>
                      <Avatar user={a.actor} size={20} />
                      <span style={{ fontWeight:600 }}>{DB.byId[a.actor]?.name||"Sistem"}</span>
                      <span style={{ color:"var(--text-2)" }}>{a.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT actions */}
        <aside className="detail-right" style={{ display:"grid", gap:14, position:"sticky", top:0 }}>
          <div className="card" style={{ padding:16 }}>
            <h4 style={{ fontSize:13.5, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}><Icon name="Zap" size={14} style={{ color:"var(--accent)" }} />Available Actions</h4>
            {actions.length ? (
              <div style={{ display:"grid", gap:8 }}>
                {actions.map(a => (
                  <button key={a.id} className={`btn btn-${a.variant}`} onClick={() => setDialog(a.id)} style={{ justifyContent:"flex-start" }}>
                    <Icon name={a.icon} size={16} />{a.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:12.5, color:"var(--text-3)", padding:"8px 0", display:"flex", gap:7, alignItems:"flex-start" }}>
                <Icon name="Info" size={14} style={{ marginTop:1 }} />
                No actions for the role <b style={{ color:"var(--text-2)" }}>{DB.ROLES[role]?.label}</b> at this status.
              </div>
            )}
          </div>

          <div className="card" style={{ padding:16 }}>
            <h4 style={{ fontSize:13.5, marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ display:"flex", gap:6, alignItems:"center" }}><Icon name="Eye" size={14} style={{ color:"var(--text-3)" }} />Watchers</span>
              <button className="btn btn-ghost btn-sm btn-icon" style={{ width:26, height:26 }} aria-label="Add watcher"><Icon name="Plus" size={14} /></button>
            </h4>
            <AvatarStack ids={t.watchers||[]} size={28} max={6} />
          </div>

          <div className="card" style={{ padding:16 }}>
            <h4 style={{ fontSize:13.5, marginBottom:12, display:"flex", gap:6, alignItems:"center" }}><Icon name="Timer" size={14} style={{ color:"var(--text-3)" }} />SLA</h4>
            <div style={{ display:"grid", gap:10 }}>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                  <span style={{ color:"var(--text-3)" }}>Resolution used</span>
                  <span className="mono" style={{ fontWeight:600, color: t.slaUsed>t.slaTarget?"#dc2626":"var(--text)" }}>{t.slaUsed}j / {t.slaTarget}j</span>
                </div>
                <Progress value={Math.min(t.slaUsed/t.slaTarget*100,100)} color={t.slaUsed>t.slaTarget?"#dc2626":t.slaUsed/t.slaTarget>0.8?"#f59e0b":"#16a34a"} />
              </div>
              <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{t.slaUsed>t.slaTarget ? "SLA target breached" : `About ${(t.slaTarget-t.slaUsed).toFixed(1)} hours until SLA`}</div>
            </div>
          </div>

          <div className="card" style={{ padding:16 }}>
            <h4 style={{ fontSize:13.5, marginBottom:12, display:"flex", gap:6, alignItems:"center" }}><Icon name="Link2" size={14} style={{ color:"var(--text-3)" }} />Related tickets</h4>
            <div style={{ display:"grid", gap:8 }}>
              {DB.tickets.filter(x => x.id!==t.id && x.app===t.app && t.app).slice(0,3).map(rt => (
                <button key={rt.id} onClick={() => nav("ticket",{id:rt.id})} className="hoverable" style={{ display:"flex", gap:8, alignItems:"center", padding:"7px 8px", borderRadius:8, border:0, background:"transparent", textAlign:"left", width:"100%" }}>
                  <TypeBadge type={rt.type} withLabel={false} size={14} />
                  <span style={{ fontSize:12, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{rt.title}</span>
                </button>
              ))}
              {!DB.tickets.some(x => x.id!==t.id && x.app===t.app && t.app) && <span style={{ fontSize:12, color:"var(--text-3)" }}>No related tickets.</span>}
            </div>
          </div>
        </aside>
      </div>

      {dialog && <ActionDialog action={dialog} ticket={t} onClose={() => setDialog(null)} onConfirm={handleConfirm} />}
    </div>
  );
}

function Detail({ title, icon, body, mono, tint, }) {
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:600, color: tint||"var(--text-2)", marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
        <Icon name={icon} size={13} />{title}
      </div>
      <div className={mono?"mono":""} style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.6, whiteSpace:"pre-wrap", padding: mono?"10px 12px":0, background: mono?"var(--surface-2)":"transparent", borderRadius: mono?8:0, border: mono?"1px solid var(--border)":0 }}>{body}</div>
    </div>
  );
}

window.TicketDetail = TicketDetail;
