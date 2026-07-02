import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase, Users, Star, Wallet, Plus, MessageCircle, Bell, Settings,
  User as UserIcon, MapPin, Save, Trash2, Pencil, Wrench, Search, ShoppingBag, Phone,
} from "lucide-react";
import {
  getProfile, saveProfile, getMyJobs, saveMyJob, deleteMyJob,
  getMyServices, saveMyService, deleteMyService, newId,
  type LocalProfile,
} from "@/lib/local-store";
import { PK_CITIES, JOB_CATEGORIES, SERVICE_CATEGORIES } from "@/services/mock";
import type { Job, ServiceProvider } from "@/services/types";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorqGo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, accountType, logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth/login" });
  }, [loading, user, nav]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {accountType === "employer" ? (
        <EmployerDashboard uid={user.uid} email={user.email ?? ""} displayName={user.displayName ?? ""} onLogout={logout} />
      ) : accountType === "service_provider" ? (
        <ProviderDashboard uid={user.uid} email={user.email ?? ""} displayName={user.displayName ?? ""} onLogout={logout} />
      ) : accountType === "job_seeker" ? (
        <SeekerDashboard uid={user.uid} email={user.email ?? ""} displayName={user.displayName ?? ""} onLogout={logout} />
      ) : (
        <CustomerDashboard uid={user.uid} email={user.email ?? ""} displayName={user.displayName ?? ""} onLogout={logout} />
      )}
      <Footer />
    </div>
  );
}

// ==================== EMPLOYER DASHBOARD ====================

type Tab = "overview" | "profile" | "jobs" | "post" | "applicants" | "messages" | "settings";

function EmployerDashboard({ uid, email, displayName, onLogout }: { uid: string; email: string; displayName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [jobs, setJobs] = useState<Job[]>(() => getMyJobs(uid));
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const refreshJobs = () => setJobs(getMyJobs(uid));

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Sidebar
        role="Employer"
        active={tab}
        onSelect={(t) => { setTab(t as Tab); setEditingJob(null); }}
        items={[
          { key: "overview", label: "Overview", icon: Briefcase },
          { key: "profile", label: "Company Profile", icon: UserIcon },
          { key: "post", label: "Post a Job", icon: Plus },
          { key: "jobs", label: `My Jobs (${jobs.length})`, icon: Briefcase },
          { key: "applicants", label: "Applicants", icon: Users },
          { key: "messages", label: "Messages", icon: MessageCircle },
          { key: "settings", label: "Settings", icon: Settings },
        ]}
        onLogout={onLogout}
      />
      <div className="space-y-6">
        {tab === "overview" && (
          <OverviewCards
            name={displayName || email.split("@")[0]}
            role="Employer"
            stats={[
              { icon: Briefcase, label: "Active Jobs", value: String(jobs.length), tint: "green" },
              { icon: Users, label: "Applicants", value: "0", tint: "blue" },
              { icon: Star, label: "Rating", value: "—", tint: "orange" },
              { icon: Wallet, label: "Spend (PKR)", value: "0", tint: "violet" },
            ]}
            cta={<Button onClick={() => setTab("post")} className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> Post a New Job</Button>}
          />
        )}
        {tab === "profile" && <ProfileEditor uid={uid} email={email} displayName={displayName} role="employer" />}
        {tab === "post" && (
          <JobEditor
            uid={uid}
            initial={editingJob}
            onSaved={() => { refreshJobs(); setEditingJob(null); setTab("jobs"); }}
          />
        )}
        {tab === "jobs" && (
          <MyJobs
            jobs={jobs}
            onEdit={(j) => { setEditingJob(j); setTab("post"); }}
            onDelete={(id) => { deleteMyJob(uid, id); refreshJobs(); toast.success("Job deleted"); }}
            onNew={() => { setEditingJob(null); setTab("post"); }}
          />
        )}
        {tab === "applicants" && <EmptyPanel title="Applicants" message="No applicants yet. Applicants will appear here once your jobs receive applications." />}
        {tab === "messages" && <EmptyPanel title="Messages" message="Your conversations will appear here." />}
        {tab === "settings" && <AccountSettings email={email} />}
      </div>
    </section>
  );
}

// ==================== PROVIDER DASHBOARD ====================

type PTab = "overview" | "profile" | "services" | "post" | "portfolio" | "reviews" | "earnings" | "bookings" | "messages" | "settings";

function ProviderDashboard({ uid, email, displayName, onLogout }: { uid: string; email: string; displayName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<PTab>("overview");
  const [services, setServices] = useState<ServiceProvider[]>(() => getMyServices(uid));
  const [editingService, setEditingService] = useState<ServiceProvider | null>(null);
  const refreshServices = () => setServices(getMyServices(uid));

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Sidebar
        role="Service Provider"
        active={tab}
        onSelect={(t) => { setTab(t as PTab); setEditingService(null); }}
        items={[
          { key: "overview", label: "Overview", icon: Wrench },
          { key: "profile", label: "Profile", icon: UserIcon },
          { key: "post", label: "Post a Service", icon: Plus },
          { key: "services", label: `My Services (${services.length})`, icon: Wrench },
          { key: "bookings", label: "Bookings / Requests", icon: Briefcase },
          { key: "portfolio", label: "Portfolio", icon: ShoppingBag },
          { key: "reviews", label: "Reviews", icon: Star },
          { key: "earnings", label: "Earnings", icon: Wallet },
          { key: "messages", label: "Messages", icon: MessageCircle },
          { key: "settings", label: "Settings", icon: Settings },
        ]}
        onLogout={onLogout}
      />
      <div className="space-y-6">
        {tab === "overview" && (
          <OverviewCards
            name={displayName || email.split("@")[0]}
            role="Service Provider"
            stats={[
              { icon: Wrench, label: "Active Services", value: String(services.length), tint: "green" },
              { icon: Users, label: "Leads", value: "0", tint: "blue" },
              { icon: Star, label: "Rating", value: "—", tint: "orange" },
              { icon: Wallet, label: "Earnings (PKR)", value: "0", tint: "violet" },
            ]}
            cta={<Button onClick={() => setTab("post")} className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> Post a Service</Button>}
          />
        )}
        {tab === "profile" && <ProfileEditor uid={uid} email={email} displayName={displayName} role="service_provider" />}
        {tab === "post" && (
          <ServiceEditor
            uid={uid}
            initial={editingService}
            onSaved={() => { refreshServices(); setEditingService(null); setTab("services"); }}
          />
        )}
        {tab === "services" && (
          <MyServices
            services={services}
            onEdit={(s) => { setEditingService(s); setTab("post"); }}
            onDelete={(id) => { deleteMyService(uid, id); refreshServices(); toast.success("Service deleted"); }}
            onNew={() => { setEditingService(null); setTab("post"); }}
          />
        )}
        {tab === "bookings" && <EmptyPanel title="Bookings & Requests" message="Booking requests from customers will appear here." />}
        {tab === "portfolio" && <PortfolioEditor uid={uid} />}
        {tab === "reviews" && <EmptyPanel title="Reviews" message="Customer reviews will appear here." />}
        {tab === "earnings" && <EmptyPanel title="Earnings" message="Your earnings summary will appear here as you complete bookings." />}
        {tab === "messages" && <EmptyPanel title="Messages" message="Your conversations will appear here." />}
        {tab === "settings" && <AccountSettings email={email} />}
      </div>
    </section>
  );
}

// ==================== SEEKER / CUSTOMER ====================

function SeekerDashboard({ uid, email, displayName, onLogout }: { uid: string; email: string; displayName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"overview" | "profile" | "settings">("overview");
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Sidebar
        role="Job Seeker" active={tab} onSelect={(t) => setTab(t as never)} onLogout={onLogout}
        items={[
          { key: "overview", label: "Overview", icon: Search },
          { key: "profile", label: "My Profile / CV", icon: UserIcon },
          { key: "settings", label: "Settings", icon: Settings },
        ]}
        extra={<Link to="/find-jobs"><Button variant="outline" className="w-full">Find Jobs</Button></Link>}
      />
      <div className="space-y-6">
        {tab === "overview" && (
          <OverviewCards name={displayName || email.split("@")[0]} role="Job Seeker" stats={[
            { icon: Search, label: "Applications", value: "0", tint: "green" },
            { icon: Star, label: "Saved Jobs", value: "0", tint: "orange" },
            { icon: MessageCircle, label: "Messages", value: "0", tint: "blue" },
            { icon: Bell, label: "Alerts", value: "0", tint: "violet" },
          ]} cta={<Link to="/find-jobs"><Button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">Find Jobs</Button></Link>} />
        )}
        {tab === "profile" && <ProfileEditor uid={uid} email={email} displayName={displayName} role="job_seeker" />}
        {tab === "settings" && <AccountSettings email={email} />}
      </div>
    </section>
  );
}

function CustomerDashboard({ uid, email, displayName, onLogout }: { uid: string; email: string; displayName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"overview" | "profile" | "settings">("overview");
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Sidebar
        role="Customer" active={tab} onSelect={(t) => setTab(t as never)} onLogout={onLogout}
        items={[
          { key: "overview", label: "Overview", icon: UserIcon },
          { key: "profile", label: "My Profile", icon: UserIcon },
          { key: "settings", label: "Settings", icon: Settings },
        ]}
        extra={<Link to="/find-services"><Button variant="outline" className="w-full">Find Services</Button></Link>}
      />
      <div className="space-y-6">
        {tab === "overview" && (
          <OverviewCards name={displayName || email.split("@")[0]} role="Customer" stats={[
            { icon: ShoppingBag, label: "Bookings", value: "0", tint: "green" },
            { icon: Star, label: "Saved Providers", value: "0", tint: "orange" },
            { icon: MessageCircle, label: "Messages", value: "0", tint: "blue" },
            { icon: Bell, label: "Alerts", value: "0", tint: "violet" },
          ]} cta={<Link to="/find-services"><Button className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">Find Services</Button></Link>} />
        )}
        {tab === "profile" && <ProfileEditor uid={uid} email={email} displayName={displayName} role="customer" />}
        {tab === "settings" && <AccountSettings email={email} />}
      </div>
    </section>
  );
}

// ==================== SHARED ====================

function Sidebar({ role, items, active, onSelect, onLogout, extra }: {
  role: string;
  items: { key: string; label: string; icon: typeof Briefcase }[];
  active: string;
  onSelect: (k: string) => void;
  onLogout: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <aside className="card-elevated h-fit p-4">
      <p className="mb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">{role} Panel</p>
      <nav className="space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => onSelect(it.key)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${active === it.key ? "bg-[var(--brand-green)]/10 font-semibold text-[var(--brand-green)]" : "text-foreground/80 hover:bg-muted"}`}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </button>
        ))}
      </nav>
      {extra && <div className="mt-3">{extra}</div>}
      <Button variant="outline" onClick={onLogout} className="mt-3 w-full">Logout</Button>
    </aside>
  );
}

function OverviewCards({ name, role, stats, cta }: { name: string; role: string; stats: { icon: typeof Briefcase; label: string; value: string; tint: "green" | "blue" | "orange" | "violet" }[]; cta?: React.ReactNode }) {
  return (
    <>
      <div className="card-elevated flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {name} 👋</h1>
          <p className="text-sm text-muted-foreground">{role} dashboard — sab kuch yahin se manage karein.</p>
        </div>
        {cta}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Briefcase; label: string; value: string; tint: "green" | "blue" | "orange" | "violet" }) {
  const cls = tint === "green" ? "bg-[var(--brand-green)]/10 text-[var(--brand-green)]"
    : tint === "orange" ? "bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]"
    : tint === "blue" ? "bg-blue-100 text-blue-600" : "bg-violet-100 text-violet-600";
  return (
    <div className="card-elevated flex items-center justify-between p-5">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${cls}`}><Icon className="h-6 w-6" /></div>
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="card-elevated p-8 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---- Profile Editor ----

function ProfileEditor({ uid, email, displayName, role }: { uid: string; email: string; displayName: string; role: "employer" | "service_provider" | "job_seeker" | "customer" }) {
  const [p, setP] = useState<LocalProfile>(() => getProfile(uid) ?? {
    uid, fullName: displayName, email, whatsapp: "", country: "Pakistan", city: "", updatedAt: "",
  });
  const [busy, setBusy] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = saveProfile(uid, p);
      setP(saved);
      toast.success("Profile saved");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="card-elevated p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">Yeh info aapke public profile aur listings par dikhegi.</p>
        </div>
        <Button type="submit" disabled={busy} className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
          <Save className="mr-1 h-4 w-4" /> {busy ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name *"><Input value={p.fullName} onChange={(v) => setP({ ...p, fullName: v })} required /></Field>
        <Field label="Email"><Input value={p.email} onChange={() => {}} disabled /></Field>
        <Field label="WhatsApp Number *"><Input value={p.whatsapp} onChange={(v) => setP({ ...p, whatsapp: v })} placeholder="+92 3XX XXXXXXX" required /></Field>
        <Field label="Phone"><Input value={p.phone ?? ""} onChange={(v) => setP({ ...p, phone: v })} placeholder="+92 …" /></Field>
        <Field label="City *">
          <Select value={p.city} onChange={(v) => setP({ ...p, city: v })} required>
            <option value="">Select city</option>
            {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Address"><Input value={p.address ?? ""} onChange={(v) => setP({ ...p, address: v })} /></Field>
      </div>

      {role === "employer" && (
        <div className="grid gap-4 md:grid-cols-2 border-t border-border pt-5">
          <Field label="Company Name"><Input value={p.companyName ?? ""} onChange={(v) => setP({ ...p, companyName: v })} /></Field>
          <Field label="Company Website"><Input value={p.companyWebsite ?? ""} onChange={(v) => setP({ ...p, companyWebsite: v })} placeholder="https://…" /></Field>
        </div>
      )}

      {role === "service_provider" && (
        <div className="grid gap-4 md:grid-cols-3 border-t border-border pt-5">
          <Field label="Primary Category">
            <Select value={p.category ?? ""} onChange={(v) => setP({ ...p, category: v })}>
              <option value="">Select</option>
              {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Years of Experience"><Input type="number" value={String(p.yearsExperience ?? "")} onChange={(v) => setP({ ...p, yearsExperience: Number(v) || 0 })} /></Field>
          <Field label="Hourly Rate (PKR)"><Input type="number" value={String(p.hourlyRate ?? "")} onChange={(v) => setP({ ...p, hourlyRate: Number(v) || 0 })} /></Field>
        </div>
      )}

      <Field label="Bio / About">
        <textarea value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })}
          rows={4} className="input" placeholder="Apne bare mein ya apni company ke bare mein likhein…" />
      </Field>

      <Field label="Avatar / Logo (1 image)">
        <UrlUploader max={1} value={p.avatarUrl ? [p.avatarUrl] : []} onChange={(urls) => setP({ ...p, avatarUrl: urls[0] })} />
      </Field>

      <style>{globalInputCss}</style>
    </form>
  );
}

// ---- Job Editor & List ----

function JobEditor({ uid, initial, onSaved }: { uid: string; initial: Job | null; onSaved: () => void }) {
  const profile = useMemo(() => getProfile(uid), [uid]);
  const [job, setJob] = useState<Job>(() => initial ?? {
    id: newId(),
    title: "",
    company: profile?.companyName ?? "",
    location: profile?.city ?? "",
    city: profile?.city ?? "",
    employmentType: "Full Time",
    category: JOB_CATEGORIES[0],
    postedAt: new Date().toISOString(),
    tags: [],
    isNew: true,
    verified: false,
  });
  const [logoUrls, setLogoUrls] = useState<string[]>(initial?.companyLogo ? [initial.companyLogo] : []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const merged: Job = { ...job, companyLogo: logoUrls[0], postedAt: initial?.postedAt ?? new Date().toISOString() };
    saveMyJob(uid, merged);
    toast.success(initial ? "Job updated" : "Job posted");
    onSaved();
  };

  return (
    <form onSubmit={save} className="card-elevated p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{initial ? "Edit Job" : "Post a New Job"}</h2>
        <Button type="submit" className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
          <Save className="mr-1 h-4 w-4" /> Save
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Job Title *"><Input value={job.title} onChange={(v) => setJob({ ...job, title: v })} required /></Field>
        <Field label="Company Name *"><Input value={job.company} onChange={(v) => setJob({ ...job, company: v })} required /></Field>
        <Field label="Category *">
          <Select value={job.category} onChange={(v) => setJob({ ...job, category: v })}>
            {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Employment Type *">
          <Select value={job.employmentType} onChange={(v) => setJob({ ...job, employmentType: v as Job["employmentType"] })}>
            {(["Full Time", "Part Time", "Contract", "Internship"] as const).map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="City *">
          <Select value={job.city} onChange={(v) => setJob({ ...job, city: v, location: v })} required>
            <option value="">Select</option>
            {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Location details"><Input value={job.location} onChange={(v) => setJob({ ...job, location: v })} placeholder="Area / neighbourhood" /></Field>
        <Field label="Salary Min (PKR)"><Input type="number" value={String(job.salaryMin ?? "")} onChange={(v) => setJob({ ...job, salaryMin: Number(v) || undefined })} /></Field>
        <Field label="Salary Max (PKR)"><Input type="number" value={String(job.salaryMax ?? "")} onChange={(v) => setJob({ ...job, salaryMax: Number(v) || undefined })} /></Field>
      </div>

      <Field label="Company Logo (1 image)">
        <UrlUploader max={1} value={logoUrls} onChange={setLogoUrls} />
      </Field>

      <style>{globalInputCss}</style>
    </form>
  );
}

function MyJobs({ jobs, onEdit, onDelete, onNew }: { jobs: Job[]; onEdit: (j: Job) => void; onDelete: (id: string) => void; onNew: () => void }) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">My Jobs</h2>
        <Button onClick={onNew} className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> New Job</Button>
      </div>
      {jobs.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Abhi tak koi job post nahi hui. "New Job" par click karein.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="min-w-0">
                <p className="font-semibold">{j.title}</p>
                <p className="text-xs text-muted-foreground truncate">{j.company} · {j.city} · {j.employmentType}{j.salaryMin ? ` · PKR ${j.salaryMin}${j.salaryMax ? `–${j.salaryMax}` : ""}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(j)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(j.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Service Editor & List ----

function ServiceEditor({ uid, initial, onSaved }: { uid: string; initial: ServiceProvider | null; onSaved: () => void }) {
  const profile = useMemo(() => getProfile(uid), [uid]);
  const [s, setS] = useState<ServiceProvider>(() => initial ?? {
    id: newId(),
    name: profile?.fullName ?? "",
    category: profile?.category ?? SERVICE_CATEGORIES[0],
    city: profile?.city ?? "",
    rating: 0, reviews: 0,
    yearsExperience: profile?.yearsExperience ?? 0,
    level: "Bronze",
    hourlyRate: profile?.hourlyRate,
    verified: false,
    description: "",
    tags: [],
  });
  const [avatars, setAvatars] = useState<string[]>(initial?.avatarUrl ? [initial.avatarUrl] : []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveMyService(uid, { ...s, avatarUrl: avatars[0] });
    toast.success(initial ? "Service updated" : "Service posted");
    onSaved();
  };

  return (
    <form onSubmit={save} className="card-elevated p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{initial ? "Edit Service" : "Post a New Service"}</h2>
        <Button type="submit" className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">
          <Save className="mr-1 h-4 w-4" /> Save
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Service / Business Name *"><Input value={s.name} onChange={(v) => setS({ ...s, name: v })} required /></Field>
        <Field label="Category *">
          <Select value={s.category} onChange={(v) => setS({ ...s, category: v })}>
            {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="City *">
          <Select value={s.city} onChange={(v) => setS({ ...s, city: v })} required>
            <option value="">Select</option>
            {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Years of Experience"><Input type="number" value={String(s.yearsExperience)} onChange={(v) => setS({ ...s, yearsExperience: Number(v) || 0 })} /></Field>
        <Field label="Hourly Rate (PKR)"><Input type="number" value={String(s.hourlyRate ?? "")} onChange={(v) => setS({ ...s, hourlyRate: Number(v) || undefined })} /></Field>
        <Field label="Tags (comma separated)"><Input value={s.tags.join(", ")} onChange={(v) => setS({ ...s, tags: v.split(",").map((t) => t.trim()).filter(Boolean) })} /></Field>
      </div>

      <Field label="Description *">
        <textarea required value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })}
          rows={5} className="input" placeholder="Aap kya offer karte hain?" />
      </Field>

      <Field label="Profile Photo (1 image)">
        <UrlUploader max={1} value={avatars} onChange={setAvatars} />
      </Field>

      <style>{globalInputCss}</style>
    </form>
  );
}

function MyServices({ services, onEdit, onDelete, onNew }: { services: ServiceProvider[]; onEdit: (s: ServiceProvider) => void; onDelete: (id: string) => void; onNew: () => void }) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">My Services</h2>
        <Button onClick={onNew} className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> New Service</Button>
      </div>
      {services.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Abhi tak koi service post nahi hui. "New Service" par click karein.</p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 min-w-0">
                {s.avatarUrl && <img src={s.avatarUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.category} · {s.city} · {s.yearsExperience}y exp{s.hourlyRate ? ` · PKR ${s.hourlyRate}/hr` : ""}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(s)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(s.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioEditor({ uid }: { uid: string }) {
  const key = `worqgo:portfolio:${uid}`;
  const [urls, setUrls] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
  });
  const save = (next: string[]) => {
    setUrls(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return (
    <div className="card-elevated p-6 space-y-3">
      <h2 className="text-xl font-bold">Portfolio (max 4 photos)</h2>
      <p className="text-sm text-muted-foreground">Apne kaam ki photos add karein — yeh customers ko dikhengi.</p>
      <UrlUploader max={4} value={urls} onChange={save} />
    </div>
  );
}

function AccountSettings({ email }: { email: string }) {
  return (
    <div className="card-elevated p-6 space-y-4">
      <h2 className="text-xl font-bold">Account Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email"><Input value={email} onChange={() => {}} disabled /></Field>
      </div>
      <p className="text-xs text-muted-foreground">Ek email par sirf ek hi account allowed hai. Role change karne ke liye support se contact karein.</p>
      <style>{globalInputCss}</style>
    </div>
  );
}

// ---- primitives ----

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}</label>;
}
function Input({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="input" />;
}
function Select({ value, onChange, children, required }: { value: string; onChange: (v: string) => void; children: React.ReactNode; required?: boolean }) {
  return <select required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input">{children}</select>;
}

const globalInputCss = `.input{width:100%;border:1px solid var(--color-input);background:white;border-radius:var(--radius-md);padding:0.65rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--brand-green);box-shadow:0 0 0 3px oklch(0.58 0.18 145 / 0.15)}.input:disabled{background:hsl(var(--muted));color:hsl(var(--muted-foreground))}`;
