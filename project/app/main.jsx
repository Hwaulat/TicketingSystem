/* ============================================================
   Main app — header, routing, theme management
   ============================================================ */
const { useState: uS, useEffect: uE } = React;

function useTheme() {
  const [theme, setTheme] = uS(() => localStorage.getItem("tixa-theme") || "light");
  uE(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tixa-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const date = now.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
  return (
    <div className="header-clock" style={{ textAlign:"right", lineHeight:1.2, paddingRight:6, marginRight:2, borderRight:"1px solid var(--border)" }}>
      <div className="mono" style={{ fontSize:13.5, fontWeight:700, letterSpacing:"-.01em" }}>{time}</div>
      <div style={{ fontSize:10.5, color:"var(--text-3)" }}>{date}</div>
    </div>
  );
}

function Header({ route, nav, role, currentUser, theme, setTheme, onMenu }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const unread = DB.notifications.filter(n=>!n.read).length;

  const title = route.page==="ticket" ? (DB.ticketById[route.params.id]?.number || "Ticket Detail")
    : route.page.startsWith("master") ? "Master Data"
    : PAGE_TITLES[route.page] || "TIXA";

  return (
    <header style={{ height:60, flex:"none", borderBottom:"1px solid var(--border)", background:"color-mix(in srgb, var(--surface) 88%, transparent)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", gap:14, padding:"0 18px", position:"sticky", top:0, zIndex:40 }}>
      <button className="btn btn-ghost btn-icon menu-btn" onClick={onMenu} style={{ display:"none" }} aria-label="Menu"><Icon name="Menu" size={18} /></button>

      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <h1 style={{ fontSize:16.5, fontWeight:650, whiteSpace:"nowrap" }}>{title}</h1>
        </div>
        <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:-1 }} className="header-sub">{breadcrumb(route)}</div>
      </div>

      <div style={{ flex:1 }} />

      {/* Search */}
      <div className="header-search" style={{ position:"relative", width: searchFocus?320:240, transition:"width .2s", maxWidth:"32vw" }}>
        <Icon name="Search" size={16} style={{ position:"absolute", left:12, top:11, color:"var(--text-3)", pointerEvents:"none" }} />
        <input className="input input-pill" placeholder="Search tickets, people…" onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
          style={{ paddingLeft:36, paddingRight:50, height:40, background:"var(--surface-2)" }} />
        <kbd style={{ position:"absolute", right:10, top:9, fontSize:10.5, color:"var(--text-3)", border:"1px solid var(--border)", borderRadius:5, padding:"2px 6px", fontFamily:"var(--font-mono)" }}>⌘K</kbd>
      </div>


      {/* === Header right cluster: date/time → dark/light → notification → profile === */}
      <div style={{ display:"flex", alignItems:"center", gap:8, position:"relative" }}>
        {/* Live date & time */}
        <Clock />

        {/* Theme toggle */}
        <button className="btn btn-ghost btn-icon" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label="Toggle theme" title={theme==="dark"?"Light mode":"Dark mode"} style={{ position:"relative", overflow:"hidden" }}>
          <span style={{ display:"grid", placeItems:"center", transition:"transform .4s cubic-bezier(.2,.7,.3,1)", transform: theme==="dark"?"rotate(0)":"rotate(0)" }}>
            <Icon name={theme==="dark"?"Moon":"Sun"} size={18} />
          </span>
        </button>

        {/* Notifications (middle) */}
        <div style={{ position:"relative" }}>
          <button className="btn btn-ghost btn-icon" onClick={()=>{setNotifOpen(o=>!o);setProfileOpen(false);}} aria-label="Notifications" style={{ position:"relative" }}>
            <Icon name="Bell" size={18} />
            {unread>0 && <span style={{ position:"absolute", top:7, right:7, minWidth:15, height:15, padding:"0 3px", borderRadius:999, background:"#dc2626", color:"#fff", fontSize:9.5, fontWeight:700, display:"grid", placeItems:"center", border:"2px solid var(--surface)", animation:"pulseDot 2s infinite" }}>{unread}</span>}
          </button>
          <NotifPanel open={notifOpen} onClose={()=>setNotifOpen(false)} nav={nav} />
        </div>

        {/* Profile (rightmost) */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>{setProfileOpen(o=>!o);setNotifOpen(false);}} aria-label="Profile" style={{ display:"flex", alignItems:"center", gap:8, padding:"3px 3px 3px 10px", height:42, borderRadius:999, border:"1px solid var(--border)", background:"var(--surface)", cursor:"pointer", transition:"border-color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-strong)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{ textAlign:"right" }} className="profile-name">
              <div style={{ fontSize:12.5, fontWeight:600, lineHeight:1.1 }}>{currentUser.name.split(" ")[0]}</div>
              <div style={{ fontSize:10.5, color:DB.ROLES[role]?.color, fontWeight:600 }}>{DB.ROLES[role]?.label}</div>
            </div>
            <Avatar user={currentUser.id} size={32} />
          </button>
          <ProfileMenu open={profileOpen} onClose={()=>setProfileOpen(false)} currentUser={currentUser} role={role} setRole={window.__setRole} nav={nav} theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}

function breadcrumb(route) {
  const map = {
    dashboard:"IT team operations overview",
    create:"Submit a new request to the IT team",
    "my-tickets":"Tickets you created",
    assignments:"Your work queue",
    tickets:"All tickets in the system",
    reports:"Build & export reports",
    users:"Manage accounts & roles",
    profile:"Your account settings",
    notifications:"Configure notifications",
  };
  if (route.page==="ticket") return "Tickets › Detail";
  if (route.page.startsWith("master")) return "Administration › Master Data";
  return map[route.page] || "";
}

function App() {
  const [theme, setTheme] = useTheme();
  const [role, setRole] = useState("pm");
  const [route, setRoute] = useState({ page:"dashboard", params:{} });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  window.__setRole = setRole;

  // current user follows the demo role
  const roleUserMap = { pm:"u-pm", admin:"u-ad", ba:"u-ba1", developer:"u-dev1", qa:"u-qa1", requestor:"u-req3" };
  const currentUser = DB.byId[roleUserMap[role]] || DB.byId["u-pm"];

  const nav = (page, params={}) => {
    if (page.startsWith("master:")) { setRoute({ page, params }); }
    else setRoute({ page, params });
    setMobileOpen(false);
    document.querySelector(".main-scroll")?.scrollTo({ top:0 });
  };

  // redirect if current role can't see the page
  useEffect(() => {
    const flat = NAV.flatMap(g=>g.items);
    const item = flat.find(i => i.id===route.page);
    if (item && !canSee(item, role) && !["ticket","profile","notifications"].includes(route.page) && !route.page.startsWith("master")) {
      setRoute({ page:"dashboard", params:{} });
    }
  }, [role]);

  let page;
  const p = route.page;
  if (p==="dashboard") page = <Dashboard nav={nav} />;
  else if (p==="create") page = <CreateTicket nav={nav} currentUser={currentUser} />;
  else if (p==="my-tickets") page = <TicketsList nav={nav} mode="my" currentUser={currentUser} />;
  else if (p==="tickets") page = <TicketsList nav={nav} mode="all" currentUser={currentUser} initialFilter={route.params} />;
  else if (p==="assignments") page = <Assignments nav={nav} currentUser={currentUser} />;
  else if (p==="ticket") page = <TicketDetail id={route.params.id} nav={nav} currentUser={currentUser} />;
  else if (p==="reports") page = <Reports nav={nav} />;
  else if (p==="users") page = <UserManagement nav={nav} />;
  else if (p.startsWith("master:")) page = <MasterPage which={p.split(":")[1]} nav={nav} />;
  else if (p==="notifications") page = <NotificationSettings />;
  else if (p==="profile") page = <Profile currentUser={currentUser} />;
  else page = <Dashboard nav={nav} />;

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <Sidebar route={route} nav={nav} role={role} collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100%" }}>
        <Header route={route} nav={nav} role={role} currentUser={currentUser} theme={theme} setTheme={setTheme} onMenu={()=>setMobileOpen(true)} />
        <main className="main-scroll" style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"20px 22px 60px", background:"var(--bg)" }}>
          <div key={p+JSON.stringify(route.params)} className="fade-up" style={{ maxWidth:1320, margin:"0 auto" }}>
            {page}
          </div>
        </main>
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ToastProvider><App /></ToastProvider>);
