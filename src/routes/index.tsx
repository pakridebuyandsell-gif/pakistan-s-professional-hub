import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES, SERVICE_CATEGORIES, PK_CITIES } from "@/services/mock";
import { jobsService } from "@/services/jobs.service";
import { providersService } from "@/services/providers.service";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatLocationLabel, resolveKnownPakistaniCity } from "@/lib/location";
import { toast } from "sonner";
import {
  Search, Briefcase, Wrench, Megaphone, MapPin, ArrowRight, ShieldCheck, Users, Globe,
  Headphones, Star, CheckCircle2, ChevronRight, LocateFixed, Loader2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorqGo — Pakistan's Marketplace for Jobs & Professional Services" },
      { name: "description", content: "Search jobs, hire employees, offer or find trusted local services across Pakistan. Free to join, verified providers, nationwide." },
      { property: "og:title", content: "WorqGo — Jobs & Services in Pakistan" },
      { property: "og:description", content: "Two trusted marketplaces. One platform. Endless opportunities." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <QuickActions />
      <JobsMarketplace />
      <ServicesMarketplace />
      <TrustStrip />
      <HowItWorks />
      <Footer />
    </div>
  );
}

function Hero() {
  const [tab, setTab] = useState<"jobs" | "services">("jobs");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const geo = useGeolocation();
  const navigate = useNavigate();

  const useMyLocation = async () => {
    const r = await geo.request();
    if (r) {
      const label = formatLocationLabel(r);
      setCity(resolveKnownPakistaniCity(r.city) || label);
      toast.success(`Current location: ${label}`);
    } else {
      toast.error("Location permission blocked or unavailable.");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: tab === "jobs" ? "/find-jobs" : "/find-services" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-8 h-64 w-64 rounded-full bg-[var(--brand-green)]/10 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 text-center md:pt-24">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" /> Pakistan's Marketplace
        </span>
        <h1 className="text-balance text-4xl font-extrabold leading-tight md:text-6xl">
          Pakistan's Marketplace for
          <br />
          <span className="text-[var(--brand-green)]">Jobs</span>{" "}
          <span className="text-muted-foreground">&</span>{" "}
          <span className="text-[var(--brand-orange)]">Professional Services</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          Two trusted marketplaces. One platform. Endless opportunities.
        </p>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-3 shadow-[var(--shadow-lift)] ring-1 ring-border md:p-4">
          <div className="mb-3 flex gap-1 rounded-xl bg-muted/60 p-1">
            <button
              onClick={() => setTab("jobs")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "jobs" ? "bg-white text-[var(--brand-green)] shadow-sm" : "text-muted-foreground"}`}
            >
              Jobs
            </button>
            <button
              onClick={() => setTab("services")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "services" ? "bg-white text-[var(--brand-orange)] shadow-sm" : "text-muted-foreground"}`}
            >
              Services
            </button>
          </div>
          <form className="flex flex-col gap-2 md:flex-row md:items-stretch" onSubmit={submit}>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-input px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === "jobs" ? "Search jobs by title, skill or keyword…" : "Search services, providers…"}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-input px-3 md:w-56">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none">
                <option value="">All Pakistan</option>
                {city && !PK_CITIES.includes(city) && <option value={city}>{city}</option>}
                {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button
                type="button"
                onClick={useMyLocation}
                title="Use my location"
                className={`shrink-0 rounded-md p-1 ${tab === "jobs" ? "text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10" : "text-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/10"}`}
              >
                {geo.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" size="lg" className={`h-full min-h-12 w-full md:w-auto ${tab === "services" ? "bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)]" : "bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)]"} text-white`}>
              Search <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
          {(geo.data || geo.error) && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-[var(--brand-green)]" />
              {geo.data ? <>Current location: <span className="font-semibold text-foreground">{formatLocationLabel(geo.data)}</span></> : geo.error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const QUICK = [
  { title: "Find Jobs", desc: "Browse employment opportunities.", to: "/find-jobs", icon: Search, tone: "green", cta: "Browse Jobs" },
  { title: "Post Job", desc: "Hire workers and receive applications.", to: "/post-job", icon: Briefcase, tone: "green", cta: "Post a Job" },
  { title: "Find Services", desc: "Trusted professionals for your home or business.", to: "/find-services", icon: Wrench, tone: "orange", cta: "Browse Services" },
  { title: "Post Service", desc: "Create a professional profile and get customers.", to: "/post-service", icon: Megaphone, tone: "orange", cta: "Post a Service" },
] as const;

function QuickActions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q) => {
          const isGreen = q.tone === "green";
          const Icon = q.icon;
          return (
            <div key={q.title} className="card-elevated card-elevated-hover group flex flex-col p-6">
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md ${isGreen ? "bg-[var(--brand-green)]" : "bg-[var(--brand-orange)]"}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{q.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{q.desc}</p>
              <Link to={q.to} className="mt-4">
                <Button className={`w-full ${isGreen ? "bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)]" : "bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)]"} text-white`}>
                  {q.cta} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function JobsMarketplace() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "home"],
    queryFn: () => jobsService.list({ limit: 4 }),
    retry: 0,
  });
  const jobs = data?.items ?? [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="card-elevated p-5 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="border-l-4 border-[var(--brand-green)] pl-3">
            <h2 className="text-2xl font-bold text-[var(--brand-green)] md:text-3xl">Jobs Marketplace</h2>
            <p className="text-sm text-muted-foreground">Find jobs and build your career</p>
          </div>
          <Link to="/find-jobs">
            <Button variant="outline" className="border-[var(--brand-green)]/30 text-[var(--brand-green)] hover:bg-[var(--brand-green)]/5">
              View All Jobs <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex snap-x gap-2 overflow-x-auto pb-2">
          {JOB_CATEGORIES.map((c) => (
            <button key={c} className="shrink-0 snap-start rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-foreground/80 hover:border-[var(--brand-green)]/40 hover:text-[var(--brand-green)]">
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Latest Job Listings</h3>
            <div className="divide-y divide-border rounded-xl border border-border bg-white">
              {isLoading && <div className="p-6 text-center text-xs text-muted-foreground">Loading latest jobs…</div>}
              {!isLoading && jobs.length === 0 && (
                <div className="p-8 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">No jobs posted yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Be the first to hire on WorqGo.</p>
                </div>
              )}
              {jobs.slice(0, 4).map((j) => (
                <div key={j.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted/30">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.company} • {j.location}</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-semibold text-[var(--brand-green)]">PKR {j.salaryMin?.toLocaleString()} - {j.salaryMax?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{j.employmentType} • {j.postedAt}</p>
                  </div>
                  <Link to="/find-jobs">
                    <Button size="sm" className="bg-[var(--brand-green)] text-white hover:bg-[var(--brand-green-dark)]">Apply Now</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[var(--brand-green)]/20 bg-[var(--brand-green)]/5 p-6">
            <div>
              <h4 className="text-lg font-bold text-[var(--brand-green)]">Are You an Employer?</h4>
              <p className="mt-1 text-sm text-muted-foreground">Post jobs and hire the best talent.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Get more applications", "Manage jobs easily", "Find verified candidates"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--brand-green)]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/post-job" className="mt-6">
              <Button className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">Post a Job Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesMarketplace() {
  const { data, isLoading } = useQuery({
    queryKey: ["providers", "home"],
    queryFn: () => providersService.list({ limit: 4 }),
    retry: 0,
  });
  const providers = data?.items ?? [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="card-elevated p-5 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="border-l-4 border-[var(--brand-orange)] pl-3">
            <h2 className="text-2xl font-bold text-[var(--brand-orange)] md:text-3xl">Services Marketplace</h2>
            <p className="text-sm text-muted-foreground">Trusted professionals for your home or business</p>
          </div>
          <Link to="/find-services">
            <Button variant="outline" className="border-[var(--brand-orange)]/30 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/5">
              View All Services <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex snap-x gap-2 overflow-x-auto pb-2">
          {SERVICE_CATEGORIES.map((c) => (
            <button key={c} className="shrink-0 snap-start rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-foreground/80 hover:border-[var(--brand-orange)]/40 hover:text-[var(--brand-orange)]">
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Top Rated Service Providers</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {isLoading && <div className="col-span-full p-6 text-center text-xs text-muted-foreground">Loading providers…</div>}
              {!isLoading && providers.length === 0 && (
                <div className="col-span-full card-elevated p-8 text-center">
                  <Wrench className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">No service providers yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Post your service to get discovered.</p>
                </div>
              )}
              {providers.slice(0, 4).map((p) => (
                <div key={p.id} className="card-elevated card-elevated-hover p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {p.rating} ({p.reviews}) • {p.city}
                      </div>
                    </div>
                    {p.level && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.level === "Gold" ? "bg-yellow-100 text-yellow-800" : p.level === "Silver" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"}`}>
                        {p.level}
                      </span>
                    )}
                  </div>
                  <Link to="/find-services" className="mt-3 block">
                    <Button variant="outline" size="sm" className="w-full border-[var(--brand-orange)]/30 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/5">View Profile</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[var(--brand-orange)]/20 bg-[var(--brand-orange)]/5 p-6">
            <div>
              <h4 className="text-lg font-bold text-[var(--brand-orange)]">Are You a Service Provider?</h4>
              <p className="mt-1 text-sm text-muted-foreground">Grow your business and get more customers.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Create your profile", "Showcase your skills", "Get more leads & bookings"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--brand-orange)]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/post-service" className="mt-6">
              <Button className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">Post a Service Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: ShieldCheck, title: "100% Free to Browse", desc: "Browse jobs and services without any charges." },
  { icon: Users, title: "Verified Employers & Providers", desc: "Trusted and verified profiles." },
  { icon: CheckCircle2, title: "Secure Platform", desc: "Your data is safe with us." },
  { icon: Globe, title: "Nationwide Access", desc: "Opportunities across all cities in Pakistan." },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help you anytime." },
];

function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="card-elevated grid grid-cols-2 gap-6 p-6 md:grid-cols-5">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--brand-green)]/10 p-2 text-[var(--brand-green)]">
              <t.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: "Search", desc: "Browse jobs or services that match your needs." },
    { n: 2, title: "Register", desc: "Create an account to connect." },
    { n: 3, title: "Connect", desc: "Apply for jobs or contact service providers." },
    { n: 4, title: "Grow", desc: "Build your career or grow your business." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold">How WorqGo Works</h2>
        <p className="mt-2 text-sm text-muted-foreground">Simple, fast and effective.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.n} className="card-elevated card-elevated-hover relative flex flex-col items-start p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white shadow-md">
              {s.n}
            </div>
            <h4 className="text-lg font-semibold">{s.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            {i < 3 && <ChevronRight className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-muted-foreground/30 md:block" />}
          </div>
        ))}
      </div>
    </section>
  );
}
