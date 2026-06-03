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

  // ---------- Tickets ----------
  const now = new Date("2026-06-01T09:30:00");
  const hoursAgo = h => new Date(now.getTime() - h*3600*1000).toISOString();
  const daysAgo = d => hoursAgo(d*24);

  let prCount=0,bugCount=0,crCount=0,discCount=0;
  function tnum(type) {
    const p = TYPES[type].prefix;
    const n = type==='project_request'? ++prCount : type==='bug'? ++bugCount : type==='cr'? ++crCount : ++discCount;
    return `${p}-202605-${String(40+n).padStart(4,'0')}`;
  }

  function act(actor, action, text, hAgo, extra={}) {
    return { actor, action, text, at: hoursAgo(hAgo), ...extra };
  }

  const tickets = [
    {
      id:"tk1", number:"BUG-202605-0042", type:"bug", title:"Checkout total not updating when removing an item from cart",
      app:"a4", appName:"RetailPOS", module:"Checkout", department:"d3", deptName:"Operations",
      priority:"Critical", severity:"Critical", status:"QA Testing", progress:100,
      requestor:"u-req3", ba:"u-ba1", developer:"u-dev1", qa:"u-qa1",
      created: daysAgo(3), updated: hoursAgo(2), target: daysAgo(-1),
      environment:"Production", bugType:"Functional", reproducibility:"Always",
      browser:"Chrome 124 on Windows 11",
      description:"On the RetailPOS checkout page, when a user removes an item from the cart, the payment total does not update and still shows the old amount. This causes billing discrepancies for customers.",
      steps:"1. Add 3 items to the cart\n2. Continue to the checkout page\n3. Click the remove icon on one item\n4. Observe the Total value below",
      expected:"The payment total decreases by the price of the removed item.",
      actual:"The payment total stays the same and does not change until the page is manually refreshed.",
      slaTarget: 4, slaUsed: 2.4,
      timeline: [
        act("u-req3","created","opened this bug ticket", 72),
        act("u-ba1","status","changed status to BA Review", 70),
        act("u-ba1","comment","Reproduced successfully on staging. Severity Critical — approving and assigning right away.", 69, {internal:true}),
        act("u-ba1","approved","approved the ticket", 68),
        act("u-ba1","assigned","assigned Budi Santoso (Dev) & Rina Marlina (QA)", 68),
        act("u-dev1","accepted","accepted the assignment", 66),
        act("u-dev1","progress","updated progress to 40% — found the root cause in the cart reducer", 40, {progress:40}),
        act("u-dev1","progress","updated progress to 100% — fix complete, total recalculation corrected", 6, {progress:100}),
        act("u-dev1","ready_qa","marked ready for QA", 5),
        act("u-qa1","picked","picked up the ticket for testing", 2),
      ],
      comments: 4, watchers:["u-pm","u-req3","u-ba1"],
    },
    {
      id:"tk2", number:"CR-202605-0019", type:"cr", title:"Add a date range filter to the CRM pipeline report",
      app:"a1", appName:"Nusa CRM", module:"Pipeline & Deals", department:"d5", deptName:"Sales",
      priority:"High", severity:"—", status:"In Progress", progress:60,
      requestor:"u-req5", ba:"u-ba1", developer:"u-dev2", qa:"u-qa1",
      created: daysAgo(5), updated: hoursAgo(8), target: daysAgo(-2),
      changeType:"Functional Change", category:"Medium", item:"Report Filter Bar",
      description:"Currently the pipeline report can only be filtered by quarter. The Sales team needs a custom date range filter to analyze performance per campaign.",
      reason:"The Sales team cannot analyze performance for specific campaign periods that don't align with quarters.",
      expected:"Users can pick a custom start and end date, and the report updates to match the range.",
      slaTarget: 40, slaUsed: 22,
      timeline: [
        act("u-req5","created","opened a change request", 120),
        act("u-ba1","approved","approved and assigned the team", 110),
        act("u-ba1","assigned","assigned Agus Pratama (Dev) & Rina Marlina (QA)", 110),
        act("u-dev2","accepted","accepted the assignment", 100),
        act("u-dev2","progress","progress 60% — date range picker component done, query integration in progress", 8, {progress:60}),
      ],
      comments: 6, watchers:["u-pm","u-req5"],
    },
    {
      id:"tk3", number:"BUG-202605-0040", type:"bug", title:"Payslip shows double tax deduction for new employees",
      app:"a2", appName:"PeopleHub HRIS", module:"Payroll", department:"d2", deptName:"Human Resources",
      priority:"High", severity:"High", status:"Ready for QA", progress:100,
      requestor:"u-req2", ba:"u-ba2", developer:"u-dev1", qa:"u-qa1",
      created: daysAgo(4), updated: hoursAgo(5), target: daysAgo(-1),
      environment:"Production", bugType:"Data", reproducibility:"Always", browser:"Firefox 125",
      description:"Payslips for employees who join mid-month show the PPh21 tax deduction twice, making net pay lower than it should be.",
      steps:"1. Add a new employee with a mid-month start date\n2. Run the payroll process for that month\n3. Open that employee's payslip",
      expected:"Tax is deducted once, prorated correctly.",
      actual:"The tax deduction appears twice.",
      slaTarget: 12, slaUsed: 9,
      timeline: [
        act("u-req2","created","opened a bug ticket", 96),
        act("u-ba2","approved","approved and assigned", 90),
        act("u-dev1","accepted","accepted the assignment", 88),
        act("u-dev1","ready_qa","marked ready for QA — perbaikan pada proration logic", 5),
      ],
      comments: 2, watchers:["u-pm","u-req2","u-ba2"],
    },
    {
      id:"tk4", number:"PR-202605-0041", type:"project_request", title:"Implement a real-time sales analytics dashboard",
      app:null, appName:"—", module:null, department:"d5", deptName:"Sales",
      priority:"High", severity:"—", status:"BA Review", progress:0,
      requestor:"u-req5", ba:"u-ba1", developer:null, qa:null,
      created: daysAgo(2), updated: hoursAgo(20), target: null,
      projectCategory:"New Feature", timeline_est:"3–6 months", budget:"200–500jt",
      businessObjective:"Give management real-time visibility into sales performance so decisions are faster and data-driven.",
      scope:"A dashboard with sales KPIs, trends, and breakdowns by region and product, connected directly to the data warehouse.",
      targetUsers:"Sales Managers, Regional Heads, C-Level",
      success:"Dashboard used daily by at least 80% of sales managers; report preparation time reduced by 50%.",
      slaTarget: 120, slaUsed: 20,
      timeline: [
        act("u-req5","created","submitted a project request", 48),
        act("u-ba1","status","picked it up for review", 20),
      ],
      comments: 1, watchers:["u-pm"],
    },
    {
      id:"tk5", number:"BUG-202605-0043", type:"bug", title:"Financial report PDF export fails beyond 500 rows",
      app:"a3", appName:"FinCore Ledger", module:"General Ledger", department:"d1", deptName:"Finance",
      priority:"Medium", severity:"Medium", status:"Rework", progress:70,
      requestor:"u-req1", ba:"u-ba2", developer:"u-dev2", qa:"u-qa2",
      created: daysAgo(6), updated: hoursAgo(12), target: daysAgo(-1),
      environment:"Production", bugType:"Performance", reproducibility:"Always", browser:"Edge 124",
      description:"The PDF export on the General Ledger report fails (timeout) when the data exceeds 500 rows.",
      steps:"1. Open the GL report with a 1-year range\n2. Click Export PDF",
      expected:"The PDF is generated even for large datasets.",
      actual:"A timeout error appears after 30 seconds.",
      slaTarget: 24, slaUsed: 30, slaBreached:true,
      timeline: [
        act("u-req1","created","opened a bug ticket", 144),
        act("u-ba2","approved","approved and assigned", 130),
        act("u-dev2","accepted","accepted the assignment", 128),
        act("u-dev2","ready_qa","marked ready for QA", 40),
        act("u-qa2","picked","picked it up for testing", 30),
        act("u-qa2","qa_fail","marked FAILED — export still times out at 800 rows, severity Major", 12, {internal:true}),
      ],
      comments: 5, watchers:["u-pm","u-req1","u-ba2"],
    },
    {
      id:"tk6", number:"CR-202605-0018", type:"cr", title:"Change leave approval flow to two levels",
      app:"a2", appName:"PeopleHub HRIS", module:"Leave & Attendance", department:"d2", deptName:"Human Resources",
      priority:"Medium", severity:"—", status:"QA Passed", progress:100,
      requestor:"u-req2", ba:"u-ba1", developer:"u-dev3", qa:"u-qa1",
      created: daysAgo(8), updated: hoursAgo(18), target: daysAgo(-2),
      changeType:"Workflow", category:"Major", item:"Leave Approval Engine",
      description:"Change the leave approval flow from one level (direct manager) to two levels (direct manager + HR) for leave longer than 3 days.",
      reason:"New company policy requires HR approval for extended leave.",
      expected:"Leave longer than 3 days requires two sequential approvals.",
      slaTarget: 40, slaUsed: 34,
      timeline: [
        act("u-req2","created","opened a change request", 192),
        act("u-ba1","approved","approved and assigned", 180),
        act("u-dev3","accepted","accepted the assignment", 175),
        act("u-dev3","ready_qa","marked ready for QA", 30),
        act("u-qa1","picked","picked it up for testing", 26),
        act("u-qa1","qa_pass","marked PASSED — all two-level approval scenarios work", 18),
      ],
      comments: 3, watchers:["u-pm","u-req2","u-ba1"],
    },
    {
      id:"tk7", number:"DISC-202605-0012", type:"discussion", title:"API endpoint naming standard across applications",
      app:"a1", appName:"Nusa CRM", module:null, department:"d6", deptName:"Engineering",
      priority:"Low", severity:"—", status:"Active", progress:0,
      requestor:"u-dev1", ba:null, developer:null, qa:null,
      created: daysAgo(2), updated: hoursAgo(3), target: null,
      discCategory:"Technical", outcome:"Decision needed",
      participants:["u-dev1","u-dev2","u-dev3","u-ba1","u-pm"],
      description:"Each team currently uses a different endpoint naming convention. Let's agree on a shared standard (REST resource naming, versioning, pluralization) to make integration between applications easier.",
      timeline: [
        act("u-dev1","created","opened the discussion", 48),
        act("u-dev2","comment","Proposal: use plural nouns + kebab-case, e.g. /api/v1/sales-orders", 30),
        act("u-dev3","comment","Agreed, but should versioning go in the header rather than the path?", 12),
        act("u-dev1","comment","Header versioning is cleaner, but path versioning is more explicit for public documentation.", 3),
      ],
      comments: 8, watchers:["u-pm","u-dev2","u-dev3"],
    },
    {
      id:"tk8", number:"BUG-202605-0039", type:"bug", title:"Order confirmation emails not being delivered to customers",
      app:"a1", appName:"Nusa CRM", module:"Lead Management", department:"d4", deptName:"Marketing",
      priority:"Critical", severity:"Critical", status:"Completed", progress:100,
      requestor:"u-req4", ba:"u-ba1", developer:"u-dev1", qa:"u-qa1",
      created: daysAgo(10), updated: daysAgo(1), target: daysAgo(7), completed: daysAgo(1),
      environment:"Production", bugType:"Integration", reproducibility:"Always", browser:"—",
      description:"Order confirmation emails have not been sent since the last mail service update.",
      slaTarget: 4, slaUsed: 3.5,
      timeline: [
        act("u-req4","created","opened a bug ticket", 240),
        act("u-ba1","approved","approved and assigned", 235),
        act("u-dev1","accepted","accepted", 233),
        act("u-dev1","ready_qa","ready for QA", 60),
        act("u-qa1","qa_pass","PASSED", 40),
        act("u-ba1","completed","final validation — ticket completed", 24),
      ],
      comments: 4, watchers:["u-pm","u-req4"],
    },
    {
      id:"tk9", number:"CR-202605-0020", type:"cr", title:"Add a tax ID (NPWP) field to the vendor form",
      app:"a3", appName:"FinCore Ledger", module:"Accounts Payable", department:"d1", deptName:"Finance",
      priority:"Low", severity:"—", status:"Assigned", progress:0,
      requestor:"u-req1", ba:"u-ba2", developer:"u-dev2", qa:"u-qa2",
      created: daysAgo(1), updated: hoursAgo(10), target: daysAgo(-4),
      changeType:"UI Change", category:"Minor", item:"Vendor Form",
      description:"Add a mandatory tax ID (NPWP) field to the new vendor registration form for tax reporting.",
      reason:"Tax compliance requires recording the vendor tax ID.",
      expected:"The tax ID field appears and validates 15 digits.",
      slaTarget: 40, slaUsed: 10,
      timeline: [
        act("u-req1","created","opened a change request", 24),
        act("u-ba2","approved","approved and assigned", 12),
        act("u-ba2","assigned","assigned Agus Pratama & Fajar Nugroho", 12),
      ],
      comments: 0, watchers:["u-pm"],
    },
    {
      id:"tk10", number:"BUG-202605-0044", type:"bug", title:"Warehouse stock goes negative after a return",
      app:"a5", appName:"Warehouse WMS", module:null, department:"d3", deptName:"Operations",
      priority:"High", severity:"High", status:"Open", progress:0,
      requestor:"u-req3", ba:null, developer:null, qa:null,
      created: hoursAgo(6), updated: hoursAgo(6), target: null,
      environment:"Production", bugType:"Data", reproducibility:"Sometimes", browser:"Chrome 124",
      description:"After processing a customer return, warehouse stock quantity goes negative for several SKUs.",
      steps:"1. Create a return transaction for a given SKU\n2. Check the SKU stock in the inventory module",
      expected:"Stock increases by the returned quantity.",
      actual:"Stock decreases instead / goes negative.",
      slaTarget: 12, slaUsed: 6,
      timeline: [ act("u-req3","created","opened a bug ticket", 6) ],
      comments: 0, watchers:["u-req3"],
    },
    {
      id:"tk11", number:"PR-202605-0042", type:"project_request", title:"Migrate the attendance system to the cloud",
      app:null, appName:"—", module:null, department:"d2", deptName:"Human Resources",
      priority:"Medium", severity:"—", status:"BA Approved", progress:0,
      requestor:"u-req2", ba:"u-ba2", developer:null, qa:null,
      created: daysAgo(7), updated: daysAgo(2), target: null,
      projectCategory:"Migration", timeline_est:"> 6 months", budget:"> 500jt",
      businessObjective:"Reduce on-premise server maintenance costs and improve attendance system reliability.",
      scope:"Migrate attendance data and application to cloud infrastructure with zero downtime.",
      targetUsers:"All employees, HR",
      success:"Migration completed with no data loss; uptime > 99.9%.",
      slaTarget: 120, slaUsed: 48,
      timeline: [
        act("u-req2","created","submitted a project request", 168),
        act("u-ba2","approved","approved — awaiting PM prioritization", 48),
      ],
      comments: 2, watchers:["u-pm","u-req2"],
    },
    {
      id:"tk12", number:"BUG-202605-0038", type:"bug", title:"Profile save button unresponsive on tablet",
      app:"a6", appName:"Customer Portal", module:null, department:"d4", deptName:"Marketing",
      priority:"Low", severity:"Low", status:"Hold", progress:0,
      requestor:"u-req4", ba:"u-ba1", developer:null, qa:null,
      created: daysAgo(9), updated: daysAgo(3), target: null,
      environment:"Production", bugType:"UI", reproducibility:"Sometimes", browser:"Safari iPad",
      description:"On the Customer Portal, the Save button on the profile page sometimes does not respond to touch on tablet devices.",
      slaTarget: 72, slaUsed: 40,
      timeline: [
        act("u-req4","created","opened a bug ticket", 216),
        act("u-ba1","hold","put the ticket on hold — awaiting deprecation of the old Customer Portal", 72, {internal:true}),
      ],
      comments: 1, watchers:["u-ba1"],
    },
  ];

  const ticketById = Object.fromEntries(tickets.map(t => [t.id, t]));

  // ---------- Notifications ----------
  const notifications = [
    { id:"n1", group:"Assigned to Me", actor:"u-ba1", text:"assigned you to", ticket:"CR-202605-0020", at: hoursAgo(2), read:false, type:"info" },
    { id:"n2", group:"Mentions", actor:"u-dev2", text:"mentioned you in", ticket:"DISC-202605-0012", at: hoursAgo(3), read:false, type:"info" },
    { id:"n3", group:"My Tickets", actor:"u-qa1", text:"is testing", ticket:"BUG-202605-0042", at: hoursAgo(2), read:false, type:"info" },
    { id:"n4", group:"System", actor:null, text:"SLA nearly breached for", ticket:"BUG-202605-0043", at: hoursAgo(5), read:true, type:"warning" },
    { id:"n5", group:"My Tickets", actor:"u-ba2", text:"approved", ticket:"PR-202605-0042", at: daysAgo(2), read:true, type:"success" },
    { id:"n6", group:"Assigned to Me", actor:"u-dev1", text:"marked ready for QA", ticket:"BUG-202605-0040", at: hoursAgo(5), read:true, type:"info" },
  ];

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
