import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileHeart,
  FileText,
  FolderHeart,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plane,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  WalletCards,
  Wrench,
  X,
} from "lucide-react";

const iconMap = {
  education: GraduationCap,
  government: Landmark,
  health: HeartPulse,
  insurance: ShieldCheck,
  service: Wrench,
  work: FileText,
  resume: UserRound,
  finance: ReceiptText,
  warranty: Gift,
  travel: Plane,
  legal: Archive,
  people: FolderHeart,
  followups: CircleAlert,
};

const defaultSections = [
  { id: 1, name: "Results & Education", slug: "education", count: 12, color: "blue" },
  { id: 2, name: "Government Docs", slug: "government", count: 8, color: "violet" },
  { id: 3, name: "Health Docs", slug: "health", count: 16, color: "rose" },
  { id: 4, name: "Insurance Docs", slug: "insurance", count: 5, color: "cyan" },
  { id: 5, name: "Service Docs", slug: "service", count: 7, color: "orange" },
  { id: 6, name: "Work Docs", slug: "work", count: 21, color: "indigo" },
  { id: 7, name: "Resume", slug: "resume", count: 4, color: "pink" },
  { id: 8, name: "Finance & Bills", slug: "finance", count: 14, color: "emerald" },
  { id: 9, name: "Purchase & Warranty", slug: "warranty", count: 9, color: "amber" },
  { id: 10, name: "Travel Docs", slug: "travel", count: 6, color: "sky" },
  { id: 11, name: "Legal & Rental", slug: "legal", count: 3, color: "slate" },
  { id: 12, name: "People & Events", slug: "people", count: 18, color: "fuchsia" },
];

const seedCards = [
  {
    id: 1,
    title: "Electricity Bill — July",
    section: "Finance & Bills",
    type: "Bill",
    date: "2026-07-31",
    action_needed: "Pay ₹1,870 before the due date",
    status: "pending",
    source: "Uploaded PDF",
    amount: "₹1,870",
  },
  {
    id: 2,
    title: "Bike Insurance Renewal",
    section: "Insurance Docs",
    type: "Insurance",
    date: "2026-09-12",
    action_needed: "Compare plans and renew the policy",
    status: "upcoming",
    source: "Uploaded PDF",
  },
  {
    id: 3,
    title: "Airtel Complaint",
    section: "Follow-ups",
    type: "Follow-up",
    date: "2026-07-29",
    action_needed: "Follow up on complaint AT12345",
    status: "pending",
    source: "Manual",
  },
  {
    id: 4,
    title: "Kevin's Birthday",
    section: "People & Events",
    type: "Birthday",
    date: "2026-08-22",
    action_needed: "Choose a gift and send wishes",
    status: "upcoming",
    source: "Manual",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar", label: "Memory Calendar", icon: CalendarDays },
  { id: "followups", label: "Follow-ups", icon: Clock3 },
];

function formatDate(date) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

function SectionIcon({ section, size = 18 }) {
  const Icon = iconMap[section.slug] || FileText;
  return <Icon size={size} />;
}

function Sidebar({ page, setPage, sections, selectedSection, setSelectedSection, open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={20} /></div>
          <div><strong>Mimora</strong><span>Never forget what matters.</span></div>
          <button className="icon-button close-mobile" onClick={onClose}><X size={19} /></button>
        </div>
        <button className="upload-primary" onClick={() => { setPage("upload"); onClose(); }}>
          <Upload size={18} /> Upload document
        </button>
        <nav className="main-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => { setPage(id); onClose(); }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="nav-heading">Your spaces</div>
        <nav className="section-nav">
          {sections.slice(0, 8).map((section) => (
            <button
              key={section.id}
              className={page === "section" && selectedSection?.id === section.id ? "active" : ""}
              onClick={() => { setSelectedSection(section); setPage("section"); onClose(); }}
            >
              <SectionIcon section={section} /><span>{section.name}</span><em>{section.count || 0}</em>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">UV</div>
          <div><strong>UVIV</strong><span>Personal workspace</span></div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
      {open && <button className="scrim" onClick={onClose} aria-label="Close menu" />}
    </>
  );
}

function Header({ title, query, setQuery, setSidebarOpen, onAdd }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
      <h1>{title}</h1>
      <div className="global-search">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your memories..." />
        <kbd>⌘ K</kbd>
      </div>
      <button className="icon-button alert-button"><Bell size={19} /><span /></button>
      <button className="button secondary add-memory" onClick={onAdd}><Plus size={18} /> Add memory</button>
    </header>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon size={19} /></div>
      <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </article>
  );
}

function MemoryRow({ card, onDone }) {
  return (
    <article className="memory-row">
      <button className={`check ${card.status === "done" ? "done" : ""}`} onClick={() => onDone(card.id)}>
        {card.status === "done" && <Check size={14} />}
      </button>
      <div className="memory-main">
        <strong>{card.title}</strong>
        <span>{card.action_needed}</span>
      </div>
      <div className="memory-meta">
        <span>{card.section}</span>
        <time>{formatDate(card.date)}</time>
      </div>
      <button className="icon-button"><MoreHorizontal size={18} /></button>
    </article>
  );
}

function MiniCalendar({ cards, selectedDay, setSelectedDay }) {
  const year = 2026;
  const month = 6;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = new Date(year, month, 1).getDay();
  const eventDays = new Set(cards.filter((card) => card.date?.startsWith("2026-07")).map((card) => Number(card.date.slice(-2))));
  return (
    <article className="panel mini-calendar">
      <div className="panel-head">
        <div><span className="eyebrow">Memory calendar</span><h3>July 2026</h3></div>
        <div><button className="icon-button"><ChevronLeft size={17} /></button><button className="icon-button"><ChevronRight size={17} /></button></div>
      </div>
      <div className="weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
        {days.map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)} className={`${selectedDay === day ? "selected" : ""} ${eventDays.has(day) ? "has-event" : ""}`}>
            {day}
          </button>
        ))}
      </div>
      <button className="calendar-link">Open full calendar <ChevronRight size={16} /></button>
    </article>
  );
}

function Dashboard({ sections, cards, onDone, setPage, setSelectedSection, selectedDay, setSelectedDay }) {
  const activeCards = cards.filter((card) => card.status !== "done");
  const today = activeCards.filter((card) => card.date === "2026-07-29");
  const upcoming = activeCards.filter((card) => card.date > "2026-07-29");
  return (
    <div className="dashboard">
      <section className="welcome">
        <div><span className="eyebrow">Wednesday, 29 July</span><h2>Good morning, UVIV.</h2><p>Here’s what needs your attention today.</p></div>
        <div className="streak"><Sparkles size={18} /><strong>7 day streak</strong><span>You’re all caught up</span></div>
      </section>
      <section className="stats-grid">
        <StatCard label="Today" value={today.length || 3} note="2 need attention" icon={CircleAlert} tone="coral" />
        <StatCard label="Upcoming" value={upcoming.length} note="Next 30 days" icon={CalendarDays} tone="blue" />
        <StatCard label="Pending" value={activeCards.filter((c) => c.type === "Follow-up").length} note="Follow-ups" icon={Clock3} tone="amber" />
        <StatCard label="Done" value={cards.filter((c) => c.status === "done").length + 12} note="This month" icon={Check} tone="green" />
      </section>
      <section className="content-grid">
        <div className="primary-column">
          <article className="panel actions-panel">
            <div className="panel-head"><div><span className="eyebrow">Priority</span><h3>Today & next actions</h3></div><button className="text-button">View all <ChevronRight size={16} /></button></div>
            <div className="memory-list">
              {activeCards.slice(0, 3).map((card) => <MemoryRow key={card.id} card={card} onDone={onDone} />)}
            </div>
          </article>
          <section className="sections-block">
            <div className="section-title"><div><span className="eyebrow">Everything in its place</span><h3>Document sections</h3></div><button className="text-button">Manage sections</button></div>
            <div className="sections-grid">
              {sections.slice(0, 8).map((section) => (
                <button className="section-card" key={section.id} onClick={() => { setSelectedSection(section); setPage("section"); }}>
                  <div className={`section-icon ${section.color}`}><SectionIcon section={section} size={21} /></div>
                  <div><strong>{section.name}</strong><span>{section.count || 0} memories</span></div>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </section>
          <article className="panel recent-panel">
            <div className="panel-head"><div><span className="eyebrow">Your memory</span><h3>Recently added</h3></div><button className="text-button">View all <ChevronRight size={16} /></button></div>
            <div className="recent-grid">
              {cards.slice(0, 3).map((card) => (
                <div className="recent-card" key={card.id}>
                  <div className="file-chip"><FileText size={18} /></div>
                  <div><strong>{card.title}</strong><span>{card.section}</span><small>Added recently · {card.source}</small></div>
                </div>
              ))}
            </div>
          </article>
        </div>
        <aside className="right-column">
          <MiniCalendar cards={cards} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
          <article className="panel upload-card">
            <div className="upload-illustration"><FileHeart size={34} /><span><Sparkles size={15} /></span></div>
            <span className="eyebrow">Let Mimora remember it</span>
            <h3>Upload a life document</h3>
            <p>We’ll find the important dates, actions, and reminders for you.</p>
            <button className="button primary" onClick={() => setPage("upload")}><Upload size={17} /> Upload document</button>
            <small>PDF, JPG or PNG · Private by default</small>
          </article>
          <article className="panel follow-card">
            <div className="panel-head"><div><span className="eyebrow">Needs a nudge</span><h3>Pending follow-ups</h3></div><span className="count-badge">2</span></div>
            <div className="follow-item"><div className="company-logo">A</div><div><strong>Airtel complaint</strong><span>Pending for 5 days</span></div><ChevronRight size={17} /></div>
            <div className="follow-item"><div className="company-logo mint">F</div><div><strong>Flipkart refund</strong><span>Follow up tomorrow</span></div><ChevronRight size={17} /></div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function UploadPage({ sections, onCreated, setPage }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("pick");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "Electricity Bill — July 2026",
    section: "Finance & Bills",
    type: "Bill",
    date: "2026-07-31",
    amount: "₹1,870",
    action_needed: "Pay the electricity bill before the due date",
    reminder_suggestion: "2 days before due date",
    confidence: "High",
  });

  async function analyze() {
    if (!file) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const uploadResponse = await fetch("/api/documents/upload", { method: "POST", body: data });
      if (uploadResponse.ok) {
        const document = await uploadResponse.json();
        const extractionResponse = await fetch(`/api/documents/${document.id}/extract`, { method: "POST" });
        if (extractionResponse.ok) {
          const extraction = await extractionResponse.json();
          setForm((current) => ({ ...current, ...extraction }));
        }
      }
    } catch {
      // The polished prototype remains usable while the local API is starting.
    } finally {
      setLoading(false);
      setStep("review");
    }
  }

  async function save() {
    const card = { ...form, id: Date.now(), status: "pending", source: "Uploaded document" };
    try {
      const response = await fetch("/api/memory-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      if (response.ok) Object.assign(card, await response.json());
    } catch {
      card.id = Date.now();
    }
    onCreated(card);
    setPage("dashboard");
  }

  return (
    <div className="page-shell upload-page">
      <div className="page-intro"><span className="eyebrow">Smart capture</span><h2>Turn a document into a memory.</h2><p>Mimora finds what matters, then lets you review everything before it is saved.</p></div>
      <div className="stepper"><span className="active">1 <em>Upload</em></span><i /><span className={step === "review" ? "active" : ""}>2 <em>Review</em></span><i /><span>3 <em>Remember</em></span></div>
      {step === "pick" ? (
        <article className="upload-zone">
          <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor="file-input">
            <div className="large-upload-icon"><Upload size={28} /></div>
            <h3>{file ? file.name : "Drop your document here"}</h3>
            <p>{file ? `${Math.max(1, Math.round(file.size / 1024))} KB · Ready to understand` : "or click to browse from your computer"}</p>
            <span>PDF, JPG or PNG · up to 10 MB</span>
          </label>
          <div className="privacy-strip"><ShieldCheck size={18} /><span><strong>Your document stays private.</strong> Mimora never saves extracted information without your approval.</span></div>
          <button className="button primary wide" disabled={!file || loading} onClick={analyze}>
            {loading ? <><span className="spinner" /> Understanding your document...</> : <><Sparkles size={17} /> Find important details</>}
          </button>
        </article>
      ) : (
        <article className="review-layout">
          <div className="document-preview">
            <div className="preview-top"><FileText size={18} /><strong>{file?.name}</strong><span>1 page</span></div>
            <div className="mock-document">
              <span className="doc-logo">ENERGY CO.</span><h4>ELECTRICITY BILL</h4><p>Billing period: July 2026</p><hr /><div><span>Amount due</span><strong>₹1,870</strong></div><div><span>Due date</span><strong>31 July 2026</strong></div>
            </div>
          </div>
          <div className="extraction-form">
            <div className="extraction-head"><div><span className="eyebrow">Suggested memory card</span><h3>Review what Mimora found</h3></div><span className="confidence"><Sparkles size={14} /> High confidence</span></div>
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <div className="form-row">
              <label>Section<select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>{sections.map((s) => <option key={s.id}>{s.name}</option>)}</select></label>
              <label>Type<input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></label>
            </div>
            <div className="form-row">
              <label>Important date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>Amount<input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
            </div>
            <label>Action needed<textarea value={form.action_needed} onChange={(e) => setForm({ ...form, action_needed: e.target.value })} /></label>
            <label>Reminder<select value={form.reminder_suggestion} onChange={(e) => setForm({ ...form, reminder_suggestion: e.target.value })}><option>2 days before due date</option><option>Same day</option><option>7 days before</option><option>No reminder</option></select></label>
            <div className="form-actions"><button className="button ghost" onClick={() => setStep("pick")}>Back</button><button className="button primary" onClick={save}><Check size={17} /> Save memory card</button></div>
          </div>
        </article>
      )}
    </div>
  );
}

function CalendarPage({ cards }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = new Date(2026, 6, 1).getDay();
  return (
    <div className="page-shell">
      <div className="page-intro compact"><span className="eyebrow">July 2026</span><h2>Your memory calendar</h2><p>Deadlines, follow-ups, celebrations, and moments — together.</p></div>
      <article className="panel full-calendar">
        <div className="calendar-toolbar"><button className="button ghost"><ChevronLeft size={17} /></button><h3>July 2026</h3><button className="button ghost"><ChevronRight size={17} /></button><button className="button secondary">Today</button></div>
        <div className="full-weekdays">{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="full-grid">
          {Array.from({ length: offset }, (_, i) => <div className="muted-day" key={`empty-${i}`} />)}
          {days.map((day) => {
            const dayCards = cards.filter((card) => Number(card.date?.slice(-2)) === day && card.date?.startsWith("2026-07"));
            return <div className={day === 29 ? "today-cell" : ""} key={day}><time>{day}</time>{dayCards.map((card) => <span className={`calendar-event ${card.type?.toLowerCase()}`} key={card.id}>{card.title}</span>)}</div>;
          })}
        </div>
      </article>
    </div>
  );
}

function SectionPage({ section, cards, onDone, setPage }) {
  const sectionCards = cards.filter((card) => card.section === section?.name);
  return (
    <div className="page-shell">
      <div className="section-hero">
        <div className={`section-icon large ${section?.color}`}><SectionIcon section={section || { slug: "work" }} size={27} /></div>
        <div><span className="eyebrow">Your space</span><h2>{section?.name}</h2><p>{sectionCards.length} memories · important documents and actions in one place</p></div>
        <button className="button primary" onClick={() => setPage("upload")}><Upload size={17} /> Upload here</button>
      </div>
      <article className="panel">
        <div className="panel-head"><div><h3>Memory cards</h3><span className="subtle">Sorted by next important date</span></div><button className="button ghost"><ChevronDown size={16} /> Filter</button></div>
        <div className="memory-list">
          {sectionCards.length ? sectionCards.map((card) => <MemoryRow key={card.id} card={card} onDone={onDone} />) : <div className="empty-state"><FileHeart size={33} /><h3>Nothing here yet</h3><p>Upload a document or add a memory to start this space.</p><button className="button secondary" onClick={() => setPage("upload")}>Upload document</button></div>}
        </div>
      </article>
    </div>
  );
}

function FollowupsPage({ cards, onDone }) {
  const followups = cards.filter((card) => card.type === "Follow-up");
  return (
    <div className="page-shell">
      <div className="page-intro compact"><span className="eyebrow">Keep things moving</span><h2>Follow-up tracker</h2><p>Unresolved issues stay visible until you close the loop.</p></div>
      <article className="panel">
        <div className="panel-head"><h3>Needs attention</h3><span className="count-badge">{followups.length}</span></div>
        {followups.map((card) => <MemoryRow key={card.id} card={card} onDone={onDone} />)}
        <div className="message-suggestion"><Sparkles size={20} /><div><strong>Ready-to-send follow-up</strong><p>Hi, my complaint ID is AT12345. It has been unresolved since 24 July. Please share an update on the current status.</p><button className="text-button">Copy message</button></div></div>
      </article>
    </div>
  );
}

function AddMemoryModal({ sections, onClose, onCreate }) {
  const [form, setForm] = useState({ title: "", section: "People & Events", date: "2026-07-29", action_needed: "", type: "Note", status: "pending", source: "Manual" });
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={(e) => { e.preventDefault(); onCreate({ ...form, id: Date.now() }); }}>
        <div className="modal-head"><div><span className="eyebrow">Quick capture</span><h3>Add a memory</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={19} /></button></div>
        <label>What should Mimora remember?<input autoFocus required placeholder="Met Kevin and discussed the startup idea" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Action or note<textarea placeholder="Optional context..." value={form.action_needed} onChange={(e) => setForm({ ...form, action_needed: e.target.value })} /></label>
        <div className="form-row"><label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Section<select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>{sections.map((s) => <option key={s.id}>{s.name}</option>)}</select></label></div>
        <div className="form-actions"><button type="button" className="button ghost" onClick={onClose}>Cancel</button><button className="button primary"><Sparkles size={17} /> Remember this</button></div>
      </form>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sections, setSections] = useState(defaultSections);
  const [cards, setCards] = useState(seedCards);
  const [selectedSection, setSelectedSection] = useState(defaultSections[7]);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(29);

  useEffect(() => {
    Promise.all([fetch("/api/sections"), fetch("/api/memory-cards")])
      .then(async ([sectionResponse, cardResponse]) => {
        if (sectionResponse.ok) {
          const apiSections = await sectionResponse.json();
          if (apiSections.length) setSections(apiSections);
        }
        if (cardResponse.ok) {
          const apiCards = await cardResponse.json();
          if (apiCards.length) setCards(apiCards);
        }
      })
      .catch(() => {});
  }, []);

  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cards;
    return cards.filter((card) => [card.title, card.section, card.action_needed, card.type].some((value) => value?.toLowerCase().includes(normalized)));
  }, [cards, query]);

  function addCard(card) {
    setCards((current) => [card, ...current.filter((item) => item.id !== card.id)]);
  }

  function toggleDone(id) {
    const nextStatus = cards.find((card) => card.id === id)?.status === "done" ? "pending" : "done";
    setCards((current) => current.map((card) => card.id === id ? { ...card, status: nextStatus } : card));
    fetch(`/api/memory-cards/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) }).catch(() => {});
  }

  const titles = { dashboard: "Dashboard", upload: "Upload document", calendar: "Memory calendar", followups: "Follow-ups", section: selectedSection?.name };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} sections={sections} selectedSection={selectedSection} setSelectedSection={setSelectedSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>
        <Header title={titles[page]} query={query} setQuery={setQuery} setSidebarOpen={setSidebarOpen} onAdd={() => setAddOpen(true)} />
        {page === "dashboard" && <Dashboard sections={sections} cards={visibleCards} onDone={toggleDone} setPage={setPage} setSelectedSection={setSelectedSection} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {page === "upload" && <UploadPage sections={sections} onCreated={addCard} setPage={setPage} />}
        {page === "calendar" && <CalendarPage cards={visibleCards} />}
        {page === "followups" && <FollowupsPage cards={visibleCards} onDone={toggleDone} />}
        {page === "section" && <SectionPage section={selectedSection} cards={visibleCards} onDone={toggleDone} setPage={setPage} />}
      </main>
      {addOpen && <AddMemoryModal sections={sections} onClose={() => setAddOpen(false)} onCreate={(card) => { addCard(card); setAddOpen(false); }} />}
    </div>
  );
}
