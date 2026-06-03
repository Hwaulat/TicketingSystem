/* ============================================================
   App shell — sidebar, header, router, role switcher
   ============================================================ */
const NAV = [
  { group:"MAIN", items:[
    { id:"dashboard", label:"Dashboard", icon:"LayoutDashboard", roles:"*" },
    { id:"create", label:"Create Ticket", icon:"TicketPlus", roles:"*" },
    { id:"my-tickets", label:"My Tickets", icon:"Ticket", roles:"*" },
    { id:"assignments", label:"My Assignments", icon:"ListTodo", roles:["ba","developer","qa","pm","admin"] },
    { id:"tickets", label:"All Tickets", icon:"Tickets", roles:["ba","pm","admin"] },
  ]},
  { group:"ANALYTICS", items:[
    { id:"reports", label:"Reports", icon:"FileBarChart", roles:["ba","pm","admin"] },
  ]},
  { group:"ADMINISTRATION", items:[
    { id:"users", label:"User Management", icon:"Users", roles:["admin","pm"] },
    { id:"master", label:"Master Data", icon:"Database", roles:["admin","pm"], children:[
      { id:"master:application", label:"Application" },
      { id:"master:module", label:"Module / Feature" },
      { id:"master:department", label:"Business Unit" },
      { id:"master:team", label:"Team" },
      { id:"master:category", label:"Category" },
      { id:"master:severity", label:"Severity" },
      { id:"master:priority", label:"Priority" },
      { id:"master:status", label:"Status" },
      { id:"master:sla", label:"SLA" },
    ]},
  ]},
];

const PAGE_TITLES = {
  dashboard:"Dashboard", create:"Create Ticket", "my-tickets":"My Tickets",
  assignments:"My Assignments", tickets:"All Tickets", reports:"Reports",
  users:"User Management", ticket:"Ticket Detail", notifications:"Notification Preferences", profile:"My Profile",
};

function canSee(item, role) {
  return item.roles === "*" || item.roles.includes(role);
}

/* ---------------- Sidebar ---------------- */
function Sidebar({ route, nav, role, collapsed, mobileOpen, setMobileOpen }) {
  const [openMaster, setOpenMaster] = useState(route.page.startsWith("master"));
  useEffect(() => { if (route.page.startsWith("master")) setOpenMaster(true); }, [route.page]);

  const content = (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding: collapsed?"0 0 0 0":"0 6px", height:60, justifyContent: collapsed?"center":"flex-start" }}>
        <div style={{ width:36, height:34, borderRadius:8, background:"#fff", display:"grid", placeItems:"center", color:"var(--accent)", flex:"none", boxShadow:"0 2px 8px rgba(0,0,0,.25)" }}>
          <Icon name="Ticket" size={19} />
        </div>
        {!collapsed && <div><div style={{ fontSize:16, fontWeight:800, letterSpacing:"-.03em", color:"var(--sidebar-text)" }}>TIXA</div><div style={{ fontSize:11, color:"var(--sidebar-text-muted)", marginTop:-2, fontWeight:600 }}>NusaTech IT</div></div>}
      </div>

      <nav className="thin-sc" style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"8px 0", display:"grid", gap:2, alignContent:"start" }}>
        {NAV.map(grp => {
          const items = grp.items.filter(it => canSee(it, role));
          if (!items.length) return null;
          return (
            <div key={grp.group} style={{ marginBottom:8 }}>
              {!collapsed && <div style={{ fontSize:10.5, fontWeight:700, color:"var(--sidebar-label)", letterSpacing:".1em", padding:"10px 14px 5px" }}>{grp.group}</div>}
              {collapsed && <div style={{ height:1, background:"var(--sidebar-border)", margin:"6px 12px" }} />}
              {items.map(it => {
                const active = route.page === it.id || (it.id==="master" && route.page.startsWith("master"));
                if (it.children) {
                  return (
                    <div key={it.id}>
                      <button onClick={() => { if (collapsed) { nav(it.children[0].id); } else setOpenMaster(o=>!o); }}
                        className={`nav-item ${active?"is-active":""}`} title={it.label}
                        style={navItemStyle(active, collapsed)}>
                        <Icon name={it.icon} size={18} style={{ flex:"none" }} />
                        {!collapsed && <><span style={{ flex:1, textAlign:"left" }}>{it.label}</span><Icon name="ChevronDown" size={14} style={{ transform: openMaster?"rotate(180deg)":"none", transition:"transform .2s", color: active?"rgba(255,255,255,.7)":"var(--sidebar-text-muted)" }} /></>}
                      </button>
                      {!collapsed && openMaster && (
                        <div className="fade-in" style={{ display:"grid", gap:1, margin:"2px 0 4px", paddingLeft:0 }}>
                          {it.children.map(ch => {
                            const cActive = route.page === ch.id;
                            return (
                              <button key={ch.id} onClick={() => nav(ch.id)} className={`nav-item ${cActive?"is-active":""}`} style={{ ...navItemStyle(cActive,false), height:34, paddingLeft:42, fontSize:12.5, fontWeight: cActive?600:500 }}>
                                <span style={{ width:5, height:5, borderRadius:999, background: cActive?"#fff":"var(--sidebar-text-muted)", flex:"none", opacity: cActive?1:.6 }} />
                                <span>{ch.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button key={it.id} onClick={() => nav(it.id)} className={`nav-item ${active?"is-active":""}`} title={it.label} style={navItemStyle(active, collapsed)}>
                    <Icon name={it.icon} size={18} style={{ flex:"none" }} />
                    {!collapsed && <span>{it.label}</span>}
                    {!collapsed && it.id==="assignments" && <span style={{ marginLeft:"auto", fontSize:10.5, fontWeight:700, padding:"1px 6px", borderRadius:999, background:"var(--sidebar-active)", color:"#fff" }}>7</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div style={{ padding:10, borderTop:"1px solid var(--sidebar-border)" }}>
          <div style={{ padding:12, borderRadius:12, background:"var(--sidebar-surface)", display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,.1)", color:"#fff", display:"grid", placeItems:"center", flex:"none" }}><Icon name="LifeBuoy" size={17} /></div>
            <div style={{ minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:600, color:"var(--sidebar-text)" }}>Need help?</div><div style={{ fontSize:11, color:"var(--sidebar-text-muted)" }}>Guides & support</div></div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className="sidebar-desk" style={{ width: collapsed?68:248, flex:"none", borderRight:"1px solid var(--sidebar-border)", background:"var(--sidebar-bg)", display:"flex", flexDirection:"column", padding:"6px 10px", transition:"width .22s cubic-bezier(.2,.7,.3,1)", height:"100%" }}>
        {content}
      </aside>
      {mobileOpen && (
        <>
          <div className="scrim sidebar-scrim" onClick={()=>setMobileOpen(false)} />
          <aside className="sidebar-mobile" style={{ position:"fixed", top:0, left:0, bottom:0, width:248, zIndex:90, background:"var(--sidebar-bg)", borderRight:"1px solid var(--sidebar-border)", display:"flex", flexDirection:"column", padding:"6px 10px", animation:"slideInLeft .25s cubic-bezier(.2,.7,.3,1)" }}>
            {content}
          </aside>
        </>
      )}
    </>
  );
}

function navItemStyle(active, collapsed) {
  return {
    display:"flex", alignItems:"center", gap:11, width:"100%",
    height:38, padding: collapsed?0:"0 12px", justifyContent: collapsed?"center":"flex-start",
    borderRadius:10, border:0, cursor:"pointer", fontSize:13.5, fontWeight: active?600:500,
    background: active?"var(--sidebar-active)":"transparent",
    color: active?"#fff":"var(--sidebar-text-muted)",
    boxShadow: active?"0 4px 12px rgba(32,81,159,.35)":"none",
    transition:"background .15s, color .15s",
    position:"relative",
  };
}

/* ---------------- Notification panel ---------------- */
function NotifPanel({ open, onClose, nav }) {
  const [items, setItems] = useState(DB.notifications);
  const grouped = {};
  items.forEach(n => { (grouped[n.group] = grouped[n.group]||[]).push(n); });
  const unread = items.filter(n=>!n.read).length;
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60 }} />
      <div className="card scale-in" style={{ position:"absolute", top:52, right:0, width:360, maxWidth:"calc(100vw - 24px)", zIndex:61, padding:0, boxShadow:"var(--shadow-lg)", maxHeight:"min(560px, 80vh)", display:"flex", flexDirection:"column", transformOrigin:"top right" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:"1px solid var(--border)" }}>
          <h3 style={{ fontSize:14.5 }}>Notifications {unread>0 && <span style={{ fontSize:11, color:"var(--accent)" }}>({unread} new)</span>}</h3>
          <button className="btn btn-ghost btn-sm" style={{ height:28 }} onClick={()=>setItems(it=>it.map(n=>({...n,read:true})))}>Mark all read</button>
        </div>
        <div className="thin-sc" style={{ overflowY:"auto", flex:1 }}>
          {Object.entries(grouped).map(([g,list]) => (
            <div key={g}>
              <div style={{ padding:"8px 16px 4px", fontSize:10.5, fontWeight:700, color:"var(--text-3)", letterSpacing:".06em", textTransform:"uppercase", background:"var(--surface-2)" }}>{g}</div>
              {list.map(n => {
                const actor = n.actor ? DB.byId[n.actor] : null;
                const tk = DB.tickets.find(t=>t.number===n.ticket);
                const tint = { warning:"#f59e0b", success:"#16a34a", info:"var(--accent)" }[n.type];
                return (
                  <button key={n.id} onClick={() => { if(tk) nav("ticket",{id:tk.id}); onClose(); }} className="hoverable"
                    style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"11px 16px", width:"100%", textAlign:"left", border:0, borderBottom:"1px solid var(--border)", background: n.read?"transparent":"var(--accent-soft)", cursor:"pointer" }}>
                    {actor ? <Avatar user={n.actor} size={32} /> : <div style={{ width:32, height:32, borderRadius:999, display:"grid", placeItems:"center", background:`color-mix(in srgb, ${tint} 14%, var(--surface))`, color:tint, flex:"none" }}><Icon name="Bell" size={15} /></div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, lineHeight:1.45 }}>{actor && <b>{actor.name}</b>} <span style={{ color:"var(--text-2)" }}>{n.text}</span> <span className="mono" style={{ color:"var(--accent)", fontWeight:600 }}>{n.ticket}</span></div>
                      <div style={{ fontSize:11, color:"var(--text-3)", marginTop:3 }}>{relTime(n.at)}</div>
                    </div>
                    {!n.read && <span className="dot" style={{ background:"var(--accent)", width:7, height:7, marginTop:6 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ margin:10, borderRadius:9 }} onClick={()=>{nav("notifications");onClose();}}>View all & settings</button>
      </div>
    </>
  );
}

/* ---------------- Profile menu ---------------- */
function ProfileMenu({ open, onClose, currentUser, role, setRole, nav, theme, setTheme }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60 }} />
      <div className="card scale-in" style={{ position:"absolute", top:52, right:0, width:280, zIndex:61, padding:0, boxShadow:"var(--shadow-lg)", transformOrigin:"top right" }}>
        <div style={{ padding:"15px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:11, alignItems:"center" }}>
          <Avatar user={currentUser.id} size={40} />
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser.name}</div>
            <div style={{ fontSize:11.5, color:"var(--text-3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser.email}</div>
          </div>
        </div>

        {/* Role switcher (demo) */}
        <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"var(--surface-2)" }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:"var(--text-3)", letterSpacing:".06em", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="UserCog" size={13} />DEMO MODE — VIEW AS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {Object.entries(DB.ROLES).map(([k,r]) => (
              <button key={k} onClick={() => { setRole(k); onClose(); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 9px", borderRadius:8, fontSize:11.5, fontWeight:600, cursor:"pointer", textAlign:"left",
                border: role===k?`1px solid ${r.color}`:"1px solid var(--border)",
                background: role===k?`color-mix(in srgb, ${r.color} 12%, var(--surface))`:"var(--surface)",
                color: role===k?r.color:"var(--text-2)" }}>
                <span className="dot" style={{ background:r.color, width:7, height:7 }} />{r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:6 }}>
          {[["profile","My Profile","User"],["notifications","Notification Preferences","Bell"]].map(([p,l,ic]) => (
            <button key={p} onClick={()=>{nav(p);onClose();}} className="hoverable" style={menuItemStyle}>
              <Icon name={ic} size={16} style={{ color:"var(--text-3)" }} />{l}
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px" }}>
            <span style={{ display:"flex", gap:11, alignItems:"center", fontSize:13, color:"var(--text-2)" }}><Icon name={theme==="dark"?"Moon":"Sun"} size={16} style={{ color:"var(--text-3)" }} />Theme</span>
            <div className="seg" style={{ padding:2 }}>
              {[["light","Sun"],["dark","Moon"]].map(([t,ic]) => (
                <button key={t} className={theme===t?"active":""} onClick={()=>setTheme(t)} style={{ height:24, padding:"0 8px" }}><Icon name={ic} size={13} /></button>
              ))}
            </div>
          </div>
          <div style={{ height:1, background:"var(--border)", margin:"4px 6px" }} />
          <button className="hoverable" style={{ ...menuItemStyle, color:"#dc2626" }}><Icon name="LogOut" size={16} />Log out</button>
        </div>
      </div>
    </>
  );
}
const menuItemStyle = { display:"flex", alignItems:"center", gap:11, width:"100%", padding:"9px 10px", borderRadius:8, border:0, background:"transparent", fontSize:13, color:"var(--text-2)", cursor:"pointer", textAlign:"left" };

window.Sidebar = Sidebar;
window.NotifPanel = NotifPanel;
window.ProfileMenu = ProfileMenu;
window.PAGE_TITLES = PAGE_TITLES;
