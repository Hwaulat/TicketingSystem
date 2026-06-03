/* ============================================================
   Seed data for TIXA ticketing system
   Exposed on window.DB
   ============================================================ */
(function () {
  // ---------- Status registry ----------
  const STATUS = {
    "Open":         { color: "var(--st-open)",       stage: "Initial" },
    "BA Review":    { color: "var(--st-ba-review)",  stage: "Review" },
    "BA Approved":  { color: "var(--st-ba-approved)",stage: "Review" },
    "Assigned":     { color: "var(--st-assigned)",   stage: "Active" },
    "In Progress":  { color: "var(--st-inprogress)", stage: "Active" },
    "Ready for QA": { color: "var(--st-readyqa)",    stage: "Active" },
    "QA Testing":   { color: "var(--st-qatesting)",  stage: "Active" },
    "QA Passed":    { color: "var(--st-qapassed)",   stage: "Validation" },
    "QA Failed":    { color: "var(--st-qafailed)",   stage: "Active" },
    "Rework":       { color: "var(--st-rework)",      stage: "Active" },
    "Hold":         { color: "var(--st-hold)",        stage: "Review" },
    "Cancelled":    { color: "var(--st-cancelled)",   stage: "Final" },
    "Completed":    { color: "var(--st-completed)",   stage: "Final" },
    "Active":       { color: "var(--st-active)",      stage: "Active" },
    "Resolved":     { color: "var(--st-resolved)",    stage: "Final" },
  };

  const TYPES = {
    project_request: { label: "Project Request", short: "PR",   icon: "FolderPlus",      color: "var(--type-pr)",   prefix: "PR" },
    bug:             { label: "Bug Report",      short: "Bug",  icon: "Bug",             color: "var(--type-bug)",  prefix: "BUG" },
    cr:              { label: "Change Request",  short: "CR",   icon: "GitPullRequest",  color: "var(--type-cr)",   prefix: "CR" },
    discussion:      { label: "Discussion",      short: "Disc", icon: "MessageCircle",   color: "var(--type-disc)", prefix: "DISC" },
  };

  const PRIORITY = {
    Critical: { color: "#dc2626", rank: 4 },
    High:     { color: "#f97316", rank: 3 },
    Medium:   { color: "#f59e0b", rank: 2 },
    Low:      { color: "#64748b", rank: 1 },
  };

  // ---------- Roles ----------
  const ROLES = {
    admin:     { label: "Admin",         color: "#9333ea", desc: "Full system access" },
    pm:        { label: "Project Manager",color: "#4f46e5", desc: "Manage all tickets, reports, reassign" },
    ba:        { label: "Business Analyst",color: "#14b8a6", desc: "Review, approve, assign, validate" },
    developer: { label: "Developer",     color: "#3b82f6", desc: "Accept/reject, work, update progress" },
    qa:        { label: "QA Tester",     color: "#8b5cf6", desc: "Test, pass/fail" },
    requestor: { label: "Requestor",     color: "#64748b", desc: "Create tickets, view own" },
  };

  // ---------- Users ----------
  const U = (id, name, role, dept, team, opts={}) => ({
    id, name, role, dept, team,
    email: name.toLowerCase().replace(/[^a-z ]/g,'').split(' ').slice(0,2).join('.') + "@nusatech.co.id",
    avatar: opts.avatar || null,
    color: opts.color || pickColor(name),
    capacity: opts.capacity || 5,
    active: opts.active !== false,
    activeTickets: opts.activeTickets || 0,
    lastLogin: opts.lastLogin || "2026-05-31T08:12:00",
    skills: opts.skills || [],
  });

  function pickColor(seed) {
    const palette = ["#4f46e5","#0ea5e9","#14b8a6","#f59e0b","#ec4899","#8b5cf6","#10b981","#f97316","#6366f1","#06b6d4"];
    let h=0; for (const c of seed) h = (h*31 + c.charCodeAt(0))>>>0;
    return palette[h % palette.length];
  }

  const users = [
    U("u-pm",   "Dewi Anggraini",  "pm",        "IT Management", "Leadership", { capacity: 99, activeTickets: 0, skills:["Roadmap","SLA"] }),
    U("u-ad",   "Rangga Wijaya",   "admin",     "IT Operations", "Platform",   { capacity: 99 }),
    U("u-ba1",  "Sarah Putri",     "ba",        "Business Analysis", "BA Guild", { activeTickets: 7, skills:["Requirements","UAT"] }),
    U("u-ba2",  "Hendra Gunawan",  "ba",        "Business Analysis", "BA Guild", { activeTickets: 4 }),
    U("u-dev1", "Budi Santoso",    "developer", "Engineering", "Backend Dev", { activeTickets: 3, capacity: 5, skills:["Node","PostgreSQL","Go"] }),
    U("u-dev2", "Agus Pratama",    "developer", "Engineering", "Frontend Dev",{ activeTickets: 5, capacity: 5, skills:["React","TypeScript"] }),
    U("u-dev3", "Citra Lestari",   "developer", "Engineering", "Mobile Dev",  { activeTickets: 2, capacity: 4, skills:["Flutter","Kotlin"] }),
    U("u-qa1",  "Rina Marlina",    "qa",        "Quality Assurance", "QA Web", { activeTickets: 4, skills:["Cypress","Manual"] }),
    U("u-qa2",  "Fajar Nugroho",   "qa",        "Quality Assurance", "QA Mobile",{ activeTickets: 2, skills:["Appium"] }),
    U("u-req1", "Andi Saputra",    "requestor", "Finance", null, { activeTickets: 5 }),
    U("u-req2", "Maya Sari",       "requestor", "Human Resources", null, { activeTickets: 3 }),
    U("u-req3", "Eko Prasetyo",    "requestor", "Operations", null, { activeTickets: 6 }),
    U("u-req4", "Lina Wati",       "requestor", "Marketing", null, { activeTickets: 2 }),
    U("u-req5", "Doni Kurniawan",  "requestor", "Sales", null, { activeTickets: 4, active:false }),
  ];
  const byId = Object.fromEntries(users.map(u => [u.id, u]));

  // ---------- Masters ----------
  const departments = [
    { id:"d1", code:"FIN", name:"Finance", head:"u-req1", count: 18, active:true },
    { id:"d2", code:"HR",  name:"Human Resources", head:"u-req2", count: 9, active:true },
    { id:"d3", code:"OPS", name:"Operations", head:"u-req3", count: 24, active:true },
    { id:"d4", code:"MKT", name:"Marketing", head:"u-req4", count: 11, active:true },
    { id:"d5", code:"SAL", name:"Sales", head:"u-req5", count: 15, active:true },
    { id:"d6", code:"ENG", name:"Engineering", head:"u-dev1", count: 32, active:true },
  ];
  const applications = [
    { id:"a1", code:"CRM",  name:"Nusa CRM",         team:"Backend Dev",  tickets: 42, active:true },
    { id:"a2", code:"HRIS", name:"PeopleHub HRIS",   team:"Frontend Dev", tickets: 28, active:true },
    { id:"a3", code:"FIN",  name:"FinCore Ledger",   team:"Backend Dev",  tickets: 35, active:true },
    { id:"a4", code:"POS",  name:"RetailPOS",        team:"Mobile Dev",   tickets: 19, active:true },
    { id:"a5", code:"WMS",  name:"Warehouse WMS",    team:"Backend Dev",  tickets: 14, active:true },
    { id:"a6", code:"PORTAL",name:"Customer Portal", team:"Frontend Dev", tickets: 23, active:false },
  ];
  const modules = [
    { id:"m1", app:"a1", name:"Lead Management", active:true },
    { id:"m2", app:"a1", name:"Pipeline & Deals", active:true },
    { id:"m3", app:"a3", name:"General Ledger", active:true },
    { id:"m4", app:"a3", name:"Accounts Payable", active:true },
    { id:"m5", app:"a2", name:"Payroll", active:true },
    { id:"m6", app:"a2", name:"Leave & Attendance", active:true },
    { id:"m7", app:"a4", name:"Checkout", active:true },
  ];
  const teams = [
    { id:"t1", name:"Backend Dev",  lead:"u-dev1", capacity: 20, members:["u-dev1"], active:true },
    { id:"t2", name:"Frontend Dev", lead:"u-dev2", capacity: 20, members:["u-dev2"], active:true },
    { id:"t3", name:"Mobile Dev",   lead:"u-dev3", capacity: 16, members:["u-dev3"], active:true },
    { id:"t4", name:"QA Web",       lead:"u-qa1",  capacity: 18, members:["u-qa1"], active:true },
    { id:"t5", name:"QA Mobile",    lead:"u-qa2",  capacity: 14, members:["u-qa2"], active:true },
    { id:"t6", name:"BA Guild",     lead:"u-ba1",  capacity: 24, members:["u-ba1","u-ba2"], active:true },
  ];
  const categories = [
    { id:"c1", name:"Minor",  color:"#64748b", appliesTo:["cr"], order:1, active:true },
    { id:"c2", name:"Medium", color:"#f59e0b", appliesTo:["cr"], order:2, active:true },
    { id:"c3", name:"Major",  color:"#dc2626", appliesTo:["cr"], order:3, active:true },
    { id:"c4", name:"New Feature", color:"#16a34a", appliesTo:["project_request"], order:1, active:true },
    { id:"c5", name:"Integration", color:"#2563eb", appliesTo:["project_request"], order:2, active:true },
    { id:"c6", name:"Migration", color:"#9333ea", appliesTo:["project_request"], order:3, active:true },
  ];
  const severities = [
    { id:"s1", name:"Critical", color:"#dc2626", sla: 4,  order:1, active:true },
    { id:"s2", name:"High",     color:"#f97316", sla: 12, order:2, active:true },
    { id:"s3", name:"Medium",   color:"#f59e0b", sla: 24, order:3, active:true },
    { id:"s4", name:"Low",      color:"#64748b", sla: 72, order:4, active:true },
  ];
  const priorities = [
    { id:"p1", name:"Critical", color:"#dc2626", order:1, active:true },
    { id:"p2", name:"High",     color:"#f97316", order:2, active:true },
    { id:"p3", name:"Medium",   color:"#f59e0b", order:3, active:true },
    { id:"p4", name:"Low",      color:"#64748b", order:4, active:true },
  ];
  const slas = [
    { id:"sla1", name:"Critical Bug SLA", type:"bug", sev:"Critical", response: 1, resolution: 4, active:true },
    { id:"sla2", name:"High Bug SLA",     type:"bug", sev:"High",     response: 2, resolution: 12, active:true },
    { id:"sla3", name:"Standard CR SLA",  type:"cr",  sev:"Medium",   response: 8, resolution: 40, active:true },
    { id:"sla4", name:"Project Review SLA",type:"project_request", sev:"—", response: 24, resolution: 120, active:true },
  ];

  // ---------- Tickets (diisi dari Supabase saat runtime) ----------
  const now = new Date();

  const tickets = []; // diisi dari Supabase oleh main.jsx
  const ticketById = {}; // diisi dari Supabase oleh main.jsx

  // ---------- Notifications ----------
  const notifications = [];

  // ---------- Dashboard aggregates ----------
  const kpis = [
    { label:"Total Open Tickets", value: 38, icon:"Inbox", tint:"var(--indigo-600)", delta:"+5", deltaDir:"up", sub:"vs last week" },
    { label:"Awaiting My Action", value: 7, icon:"Hourglass", tint:"#f59e0b", delta:"+2", deltaDir:"up", sub:"need your decision" },
    { label:"In Progress", value: 12, icon:"LoaderCircle", tint:"#06b6d4", delta:"-1", deltaDir:"down", sub:"in progress" },
    { label:"Completed This Month", value: 64, icon:"CircleCheckBig", tint:"#16a34a", delta:"+18%", deltaDir:"up", sub:"vs last month" },
    { label:"Avg Resolution Time", value: "2.4d", icon:"Timer", tint:"#14b8a6", delta:"-0.3d", deltaDir:"down", sub:"faster" },
    { label:"SLA Compliance", value: "92%", icon:"ShieldCheck", tint:"#16a34a", delta:"+3%", deltaDir:"up", sub:"target ≥ 90%" },
  ];

  const trend = [
    // last 12 weeks-ish sample (pr,bug,cr,disc,resHrs)
    { label:"W1", pr:2,bug:6,cr:3,disc:1, res:62 },
    { label:"W2", pr:1,bug:8,cr:4,disc:2, res:58 },
    { label:"W3", pr:3,bug:5,cr:2,disc:1, res:66 },
    { label:"W4", pr:2,bug:9,cr:5,disc:3, res:54 },
    { label:"W5", pr:4,bug:7,cr:3,disc:2, res:50 },
    { label:"W6", pr:1,bug:11,cr:6,disc:1, res:60 },
    { label:"W7", pr:3,bug:8,cr:4,disc:4, res:48 },
    { label:"W8", pr:2,bug:6,cr:5,disc:2, res:44 },
  ];

  const statusDist = [
    { name:"Open", value: 9, color:"var(--st-open)" },
    { name:"BA Review", value: 5, color:"var(--st-ba-review)" },
    { name:"Approved", value: 4, color:"var(--st-ba-approved)" },
    { name:"Assigned", value: 6, color:"var(--st-assigned)" },
    { name:"In Progress", value: 12, color:"var(--st-inprogress)" },
    { name:"Ready for QA", value: 3, color:"var(--st-readyqa)" },
    { name:"QA Testing", value: 4, color:"var(--st-qatesting)" },
    { name:"Rework", value: 2, color:"var(--st-rework)" },
    { name:"Completed", value: 64, color:"var(--st-completed)" },
  ];

  const workload = [
    { team:"Business Analyst", active: 11, capacity: 24, members:[["Sarah Putri",7],["Hendra Gunawan",4]] },
    { team:"Developer", active: 10, capacity: 14, members:[["Agus Pratama",5],["Budi Santoso",3],["Citra Lestari",2]] },
    { team:"QA Tester", active: 6, capacity: 32, members:[["Rina Marlina",4],["Fajar Nugroho",2]] },
  ];

  const topRequestors = [
    { name:"Eko Prasetyo", dept:"Operations", count: 6 },
    { name:"Andi Saputra", dept:"Finance", count: 5 },
    { name:"Doni Kurniawan", dept:"Sales", count: 4 },
    { name:"Maya Sari", dept:"Human Resources", count: 3 },
    { name:"Lina Wati", dept:"Marketing", count: 2 },
  ];

  const reportTypes = [
    { id:"r1", name:"Ticket Summary", icon:"FileText", desc:"All tickets in the period, grouped by type/status" },
    { id:"r2", name:"SLA Compliance", icon:"ShieldCheck", desc:"Tickets meeting/breaching SLA targets" },
    { id:"r3", name:"Workload Report", icon:"UsersRound", desc:"Tickets per role / individual" },
    { id:"r4", name:"Department Report", icon:"Building2", desc:"Tickets per requesting department" },
    { id:"r5", name:"Application Report", icon:"AppWindow", desc:"Tickets per application / system" },
    { id:"r6", name:"Bug Trend Analysis", icon:"Bug", desc:"Bug volume + severity over time" },
    { id:"r7", name:"QA Quality Report", icon:"BadgeCheck", desc:"Pass/fail rate per developer, defect escape" },
    { id:"r8", name:"Resolution Time", icon:"Timer", desc:"Average resolution time per type" },
    { id:"r9", name:"Requestor Activity", icon:"UserSearch", desc:"Ticket history & patterns per requestor" },
    { id:"r10", name:"Discussion Activity", icon:"MessagesSquare", desc:"Active discussions, resolution rate" },
  ];

  window.DB = {
    STATUS, TYPES, PRIORITY, ROLES, users, byId, tickets, ticketById,
    departments, applications, modules, teams, categories, severities, priorities, slas,
    notifications, kpis, trend, statusDist, workload, topRequestors, reportTypes,
    now,
  };
})();
