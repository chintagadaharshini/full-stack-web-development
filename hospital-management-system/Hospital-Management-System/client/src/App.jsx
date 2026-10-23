import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import {
  Activity, LayoutDashboard, Users, Stethoscope, CalendarDays, BedDouble,
  Pill, ReceiptText, Search, Bell, ChevronDown, Plus, Pencil, Trash2,
  X, LogOut, HeartPulse, ArrowUpRight, Clock3, Menu, ShieldCheck, AlertTriangle
} from "lucide-react";

const MODULES = {
  patients: { label: "Patients", singular: "Patient", icon: Users, fields: [
    ["name","Full name","text",true],["age","Age","number",true],["gender","Gender","select",true,["Female","Male","Other"]],
    ["phone","Phone","tel",true],["email","Email","email"],["address","Address","text"],["notes","Notes","text"]
  ], columns: [["name","Patient"],["age","Age"],["gender","Gender"],["phone","Phone"],["email","Email"]] },
  doctors: { label: "Doctors", singular: "Doctor", icon: Stethoscope, fields: [
    ["name","Full name","text",true],["specialization","Specialization","text",true],["phone","Phone","tel",true],["email","Email","email"],["availability","Availability","select",true,["Available","Busy","On leave"]]
  ], columns: [["name","Doctor"],["specialization","Specialization"],["phone","Phone"],["email","Email"],["availability","Availability"]] },
  appointments: { label: "Appointments", singular: "Appointment", icon: CalendarDays, fields: [
    ["patientName","Patient name","text",true],["doctorName","Doctor name","text",true],["date","Date","date",true],["time","Time","time",true],["reason","Reason","text"],["status","Status","select",true,["Scheduled","Completed","Cancelled"]]
  ], columns: [["patientName","Patient"],["doctorName","Doctor"],["date","Date"],["time","Time"],["reason","Reason"],["status","Status"]] },
  beds: { label: "Bed management", singular: "Bed", icon: BedDouble, fields: [
    ["bedNumber","Bed number","text",true],["ward","Ward","text",true],["type","Bed type","select",true,["General","Private","ICU"]],["status","Status","select",true,["Available","Occupied","Maintenance"]],["patientName","Patient name (if occupied)","text"]
  ], columns: [["bedNumber","Bed"],["ward","Ward"],["type","Type"],["status","Status"],["patientName","Patient"]] },
  medicines: { label: "Pharmacy", singular: "Medicine", icon: Pill, fields: [
    ["name","Medicine name","text",true],["category","Category","text",true],["quantity","Stock quantity","number",true],["price","Unit price (₹)","number",true],["expiryDate","Expiry date","date"]
  ], columns: [["name","Medicine"],["category","Category"],["quantity","Stock"],["price","Unit price"],["expiryDate","Expiry date"]] },
  bills: { label: "Billing", singular: "Bill", icon: ReceiptText, fields: [
    ["patientName","Patient name","text",true],["description","Description","text",true],["amount","Amount (₹)","number",true],["status","Payment status","select",true,["Paid","Pending","Overdue"]],["dueDate","Due date","date"]
  ], columns: [["patientName","Patient"],["description","Description"],["amount","Amount"],["status","Status"],["dueDate","Due date"]] }
};
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:LayoutDashboard },
  ...Object.entries(MODULES).map(([id, module]) => ({ id, label:module.label, icon:module.icon }))
];
const money = n => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(Number(n || 0));
const blank = module => Object.fromEntries(module.fields.map(([key,,,, options]) => [key, options ? options[0] : ""]));

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("carepoint-token") || "");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("carepoint-user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name:"", email:"", password:"", role:"Receptionist" });
  const [page, setPage] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("carepoint-token", token);
    else localStorage.removeItem("carepoint-token");
    if (user) localStorage.setItem("carepoint-user", JSON.stringify(user));
    else localStorage.removeItem("carepoint-user");
  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    api("/auth/me", { token }).then(data => setUser(data.user)).catch(() => { setToken(""); setUser(null); });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadPage();
  }, [token, page, statusFilter]);

  async function loadPage() {
    setLoading(true); setError("");
    try {
      if (page === "dashboard") {
        const data = await api("/dashboard", { token });
        setStats(data.stats || {}); setRecent(data.recentAppointments || []); setLowStock(data.lowStock || []);
      } else {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());
        const data = await api(`/${page}?${params}`, { token });
        setItems(data.items || []);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!token || page === "dashboard") return;
    const timer = setTimeout(() => loadPage(), 250);
    return () => clearTimeout(timer);
  }, [search]);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  async function submitAuth(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login"
        ? { email: auth.email, password: auth.password }
        : auth;
      const data = await api(endpoint, { method:"POST", body:JSON.stringify(payload) });
      setToken(data.token); setUser(data.user); setPage("dashboard");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function signOut() {
    setToken(""); setUser(null); setPage("dashboard"); setItems([]);
    notify("Signed out successfully.");
  }

  function openCreate() {
    setEditing(null); setForm(blank(MODULES[page])); setModalOpen(true); setError("");
  }
  function openEdit(item) {
    setEditing(item); setForm(Object.fromEntries(MODULES[page].fields.map(([key]) => [key, item[key] ?? ""])));
    setModalOpen(true); setError("");
  }

  async function saveRecord(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form };
      for (const key of ["age","quantity","price","amount"]) {
        if (payload[key] !== "" && payload[key] !== undefined) payload[key] = Number(payload[key]);
      }
      const endpoint = editing ? `/${page}/${editing._id}` : `/${page}`;
      const data = await api(endpoint, { token, method:editing ? "PUT" : "POST", body:JSON.stringify(payload) });
      setModalOpen(false); notify(`${MODULES[page].singular} ${editing ? "updated" : "added"} successfully.`);
      await loadPage();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function deleteRecord(item) {
    if (!window.confirm(`Delete this ${MODULES[page].singular.toLowerCase()} record? This cannot be undone.`)) return;
    try {
      await api(`/${page}/${item._id}`, { token, method:"DELETE" });
      notify("Record deleted."); await loadPage();
    } catch (err) { notify(err.message); }
  }

  const module = MODULES[page];
  const activeNav = NAV.find(n => n.id === page);
  const greeting = user?.name?.split(" ")[0] || "there";
  const statCards = [
    { label:"Total patients", value:stats.patients ?? 0, icon:Users, color:"blue", foot:"Registered patient records" },
    { label:"Medical staff", value:stats.doctors ?? 0, icon:Stethoscope, color:"purple", foot:"Doctors in the directory" },
    { label:"Appointments", value:stats.upcomingAppointments ?? 0, icon:CalendarDays, color:"green", foot:"Scheduled appointments" },
    { label:"Beds occupied", value:`${stats.occupiedBeds ?? 0}/${stats.beds ?? 0}`, icon:BedDouble, color:"orange", foot:"Occupied beds / total beds" }
  ];
  const filteredItems = items;

  if (!token) return <div className="auth-screen">
    <div className="auth-decoration"><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/><div className="auth-brand"><span className="brand-mark"><HeartPulse size={25}/></span><span>carepoint<span>.</span></span></div><div className="auth-message"><p className="overline">CARE THAT CONNECTS</p><h1>Better care<br/>starts <em>here.</em></h1><p>One connected space for your hospital team to manage the day with clarity and confidence.</p><div className="auth-trust"><ShieldCheck size={17}/> A student project built for learning</div></div><div className="auth-bottom">HOSPITAL MANAGEMENT SYSTEM · DEMO</div></div>
    <div className="auth-panel"><form className="auth-form" onSubmit={submitAuth}><div className="mobile-auth-brand"><span className="brand-mark"><HeartPulse size={22}/></span><b>carepoint<span>.</span></b></div><p className="overline">{authMode === "login" ? "WELCOME BACK" : "GET STARTED"}</p><h2>{authMode === "login" ? "Sign in to CarePoint" : "Create your account"}</h2><p className="auth-subtitle">{authMode === "login" ? "Enter your details to access your dashboard." : "Create a demo account for your project."}</p>
      {authMode === "register" && <label>Full name<input required value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} placeholder="Enter your name"/></label>}
      <label>Email address<input required type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength={8} type="password" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="At least 8 characters"/></label>
      {authMode === "register" && <label>Demo role<select value={auth.role} onChange={e=>setAuth({...auth,role:e.target.value})}><option>Receptionist</option><option>Doctor</option><option>Admin</option></select><small className="field-note">For local demonstration only. Production apps must restrict role assignment.</small></label>}
      {error && <div className="error-box">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"} <ArrowUpRight size={17}/></button><p className="auth-switch">{authMode === "login" ? "New to CarePoint?" : "Already have an account?"} <button type="button" onClick={()=>{setAuthMode(authMode==="login"?"register":"login");setError("");}}>{authMode==="login"?"Create an account":"Sign in instead"}</button></p><p className="auth-legal">Use synthetic demo data only. Not for real patient information.</p>
    </form></div>
  </div>;

  return <div className="app-layout">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="sidebar-brand"><span className="brand-mark"><HeartPulse size={23}/></span><span>carepoint<span>.</span></span><button className="sidebar-close" onClick={()=>setMobileNav(false)}><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">{NAV.map(item=>{const Icon=item.icon;return <button key={item.id} className={`side-link ${page===item.id?"selected":""}`} onClick={()=>{setPage(item.id);setSearch("");setStatusFilter("");setMobileNav(false);}}><Icon size={18}/><span>{item.label}</span>{item.id==="appointments"&&<span className="nav-dot"/>}</button>})}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Activity size={17}/></span><b>Need a hand?</b><p>Keep your daily workflow calm and organized.</p><button onClick={()=>notify("Tip: use the sidebar to switch modules and the Add button to create records.")}>Quick tip <ArrowUpRight size={14}/></button></div><div className="sidebar-user"><div className="user-avatar">{user?.name?.slice(0,1).toUpperCase()}</div><div className="user-details"><b>{user?.name}</b><span>{user?.role}</span></div><button title="Sign out" onClick={signOut}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="top-header"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{activeNav?.label}</b></div><div className="header-actions"><div className="header-date"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div><button className="notification-button" onClick={()=>notify("You're all caught up. This is a demo notification panel.")}><Bell size={18}/><i/></button><div className="header-user"><div className="user-avatar small">{user?.name?.slice(0,1).toUpperCase()}</div><span>{user?.name?.split(" ")[0]}</span><ChevronDown size={14}/></div></div></header>
      <div className="page-content">
        {page==="dashboard" ? <>
          <div className="welcome-row"><div><p className="overline">OVERVIEW</p><h1>Good day, {greeting}<span>.</span></h1><p className="page-subtitle">Here's what's happening at your hospital today.</p></div><div className="welcome-date"><span className="welcome-date-icon"><CalendarDays size={18}/></span><div><b>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long"})}</b><small>Today's overview</small></div></div></div>
          {error && <div className="error-box page-error">{error}</div>}
          <div className="stat-grid">{statCards.map(card=>{const Icon=card.icon;return <article className="stat-card" key={card.label}><div className="stat-top"><span>{card.label}</span><span className={`stat-icon ${card.color}`}><Icon size={19}/></span></div><strong>{card.value}</strong><p>{card.foot}</p><div className={`stat-accent ${card.color}`}/></article>})}</div>
          <div className="dashboard-grid"><section className="panel appointments-panel"><div className="panel-heading"><div><h2>Recent appointments</h2><p>Your latest appointment activity</p></div><button className="text-button" onClick={()=>setPage("appointments")}>View all <ArrowUpRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Status</th></tr></thead><tbody>{recent.length?recent.map(item=><tr key={item._id}><td><div className="patient-cell"><span className="patient-avatar">{item.patientName?.slice(0,1)}</span><b>{item.patientName}</b></div></td><td>{item.doctorName}</td><td><span className="date-cell">{item.date}<small>{item.time}</small></span></td><td><span className={`status-pill ${item.status?.toLowerCase()}`}>{item.status}</span></td></tr>):<tr><td colSpan="4" className="empty-cell">No appointments yet. Add one in Appointments.</td></tr>}</tbody></table></div></section>
          <section className="panel stock-panel"><div className="panel-heading"><div><h2>Low stock alerts</h2><p>Items that may need attention</p></div><span className="alert-count"><AlertTriangle size={14}/>{lowStock.length}</span></div>{lowStock.length?lowStock.map(item=><div className="stock-item" key={item._id}><span className="medicine-icon"><Pill size={17}/></span><div className="stock-info"><b>{item.name}</b><small>{item.category}</small><div className="stock-track"><i style={{width:`${Math.min(100,Number(item.quantity)*5)}%`}}/></div></div><span className={`stock-quantity ${item.quantity<=5?"critical":""}`}>{item.quantity} left</span></div>):<div className="stock-empty"><ShieldCheck size={24}/><b>Stock looks healthy</b><span>No low-stock medicines detected.</span></div>}<button className="stock-link" onClick={()=>setPage("medicines")}>Manage pharmacy inventory <ArrowUpRight size={15}/></button></section></div>
          <section className="quick-actions"><div><p className="overline">QUICK ACTIONS</p><h2>What would you like to do?</h2></div><div className="quick-action-buttons"><button onClick={()=>{setPage("patients");setForm(blank(MODULES.patients));setEditing(null);setModalOpen(true);}}><span className="quick-action-icon blue"><Users size={18}/></span><span><b>Register patient</b><small>Add a new patient record</small></span><Plus size={16}/></button><button onClick={()=>{setPage("appointments");setForm(blank(MODULES.appointments));setEditing(null);setModalOpen(true);}}><span className="quick-action-icon green"><CalendarDays size={18}/></span><span><b>Book appointment</b><small>Schedule a consultation</small></span><Plus size={16}/></button><button onClick={()=>{setPage("bills");setForm(blank(MODULES.bills));setEditing(null);setModalOpen(true);}}><span className="quick-action-icon purple"><ReceiptText size={18}/></span><span><b>Create bill</b><small>Record a patient bill</small></span><Plus size={16}/></button></div></section>
        </> : <section className="module-view"><div className="module-heading"><div><p className="overline">HOSPITAL OPERATIONS</p><h1>{module.label}<span>.</span></h1><p className="page-subtitle">Manage and maintain your {module.label.toLowerCase()} records.</p></div>{(page!=="doctors"||user?.role==="Admin")&&<button className="add-button" onClick={openCreate}><Plus size={17}/> Add {module.singular}</button>}</div>
          {error && <div className="error-box page-error">{error}</div>}
          <div className="list-toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${module.label.toLowerCase()}...`}/></label>{["appointments","beds","bills"].includes(page)&&<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">All statuses</option>{(page==="appointments"?["Scheduled","Completed","Cancelled"]:page==="beds"?["Available","Occupied","Maintenance"]:["Paid","Pending","Overdue"]).map(s=><option key={s}>{s}</option>)}</select>}<button className="refresh-button" onClick={loadPage}>Refresh</button><span className="record-count">{filteredItems.length} records</span></div>
          <div className="panel resource-panel"><div className="table-wrap"><table><thead><tr>{module.columns.map(([,label])=><th key={label}>{label}</th>)}<th>Actions</th></tr></thead><tbody>{loading?<tr><td colSpan={module.columns.length+1} className="empty-cell">Loading records...</td></tr>:filteredItems.length?filteredItems.map(item=><tr key={item._id}>{module.columns.map(([key])=><td key={key}>{key==="amount"||key==="price"?money(item[key]):key==="status"||key==="availability"?<span className={`status-pill ${String(item[key]).toLowerCase().replaceAll(" ","-")}`}>{item[key]}</span>:key==="quantity"?<span className={item[key]<=10?"quantity-low":""}>{item[key]}</span>:item[key]||<span className="muted-dash">—</span>}</td>)}<td><div className="row-actions"><button title="Edit record" onClick={()=>openEdit(item)}><Pencil size={15}/></button>{user?.role==="Admin"&&<button title="Delete record" className="delete-action" onClick={()=>deleteRecord(item)}><Trash2 size={15}/></button>}</div></td></tr>):<tr><td colSpan={module.columns.length+1} className="empty-cell"><div className="table-empty"><module.icon size={25}/><b>No {module.label.toLowerCase()} found</b><span>Add a record or change your search.</span></div></td></tr>}</tbody></table></div><div className="table-footer"><span>Showing {filteredItems.length} records</span><span>CarePoint management console</span></div></div>
        </section>}
        <footer className="app-footer"><span>© {new Date().getFullYear()} CarePoint Hospital Management</span><span><span className="footer-status-dot"/> Demo environment · Use synthetic data only</span></footer>
      </div>
    </main>
    {toast&&<div className="toast"><span className="toast-check">✓</span>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}
    {modalOpen&&module&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModalOpen(false);}}><form className="record-modal" onSubmit={saveRecord}><div className="modal-heading"><div><p className="overline">{editing?"UPDATE RECORD":"NEW RECORD"}</p><h2>{editing?"Edit":"Add"} {module.singular.toLowerCase()}</h2></div><button type="button" className="modal-close" onClick={()=>setModalOpen(false)}><X size={19}/></button></div><div className="form-grid">{module.fields.map(([key,label,type,required,options])=><label key={key} className={type==="textarea"?"wide-field":""}>{label}{options?<select required={required} value={form[key]??options[0]} onChange={e=>setForm({...form,[key]:e.target.value})}>{options.map(opt=><option key={opt}>{opt}</option>)}</select>:<input required={required} type={type} min={type==="number"?"0":undefined} value={form[key]??""} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label}/>}</label>)}</div>{error&&<div className="error-box">{error}</div>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={()=>setModalOpen(false)}>Cancel</button><button className="save-button" disabled={busy}>{busy?"Saving...":editing?"Save changes":`Add ${module.singular}`}</button></div></form></div>}
  </div>;
}

export default App;
