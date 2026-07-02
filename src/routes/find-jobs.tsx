import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES, PK_CITIES } from "@/services/mock";
import { jobsService } from "@/services/jobs.service";
import { Search, MapPin, Bookmark, Briefcase, LocateFixed, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";

export const Route = createFileRoute("/find-jobs")({
  head: () => ({
    meta: [
      { title: "Find Jobs in Pakistan — WorqGo" },
      { name: "description", content: "Browse thousands of jobs across Pakistan. Filter by city, category, salary and apply in one click on WorqGo." },
      { property: "og:title", content: "Find Jobs — WorqGo" },
      { property: "og:url", content: "/find-jobs" },
    ],
    links: [{ rel: "canonical", href: "/find-jobs" }],
  }),
  component: FindJobsPage,
});

function FindJobsPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("");
  const geo = useGeolocation();

  const query = useQuery({
    queryKey: ["jobs", { q, city, cat }],
    queryFn: () => jobsService.list({ q, city, category: cat }),
    retry: 0,
  });

  const jobs = query.data?.items ?? [];

  const useMyLocation = async () => {
    const r = await geo.request();
    if (r?.city) {
      // match against known city list (case-insensitive)
      const matched = PK_CITIES.find((c) => c.toLowerCase() === r.city!.toLowerCase());
      setCity(matched ?? r.city);
      toast.success(`Location set to ${matched ?? r.city}`);
    } else if (geo.error) {
      toast.error(geo.error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border bg-gradient-to-br from-[var(--brand-green)]/5 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <nav className="mb-3 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> Find Jobs
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">Find the right job</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Discover employment opportunities across Pakistan.
          </p>

          <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)] ring-1 ring-border md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-input px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, keywords, or company" className="w-full bg-transparent py-3 text-sm outline-none" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-input bg-white px-3 py-3 text-sm md:w-48">
              <option value="">All Categories</option>
              {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2 rounded-xl border border-input px-3 md:w-56">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none">
                <option value="">All Pakistan</option>
                {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button
                type="button"
                onClick={useMyLocation}
                title="Use my location"
                className="shrink-0 rounded-md p-1 text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10"
              >
                {geo.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              </button>
            </div>
            <Button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white h-auto min-h-12">Search Jobs</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="card-elevated h-fit p-5">
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            Filters <button onClick={() => { setQ(""); setCity(""); setCat(""); }} className="text-xs font-normal text-[var(--brand-green)]">Clear All</button>
          </h3>
          <FilterGroup title="Job Category" items={JOB_CATEGORIES} selected={cat} onToggle={(v) => setCat(cat === v ? "" : v)} />
          <FilterGroup title="Location" items={PK_CITIES.slice(0, 8)} selected={city} onToggle={(v) => setCity(city === v ? "" : v)} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {query.isLoading ? "Loading jobs…" : `${jobs.length.toLocaleString()} Jobs Found`}
            </p>
            <select className="rounded-lg border border-input bg-white px-3 py-2 text-xs">
              <option>Most Recent</option><option>Highest Salary</option>
            </select>
          </div>

          {query.isError && (
            <div className="card-elevated p-6 text-center text-sm text-muted-foreground">
              Couldn't reach the jobs API. Please try again shortly.
            </div>
          )}

          {!query.isLoading && !query.isError && jobs.length === 0 && (
            <div className="card-elevated p-10 text-center">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No jobs found yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Be the first employer to post a job — it takes less than a minute.
              </p>
              <Link to="/post-job"><Button className="mt-4 bg-[var(--brand-green)] text-white hover:bg-[var(--brand-green-dark)]">Post a Job</Button></Link>
            </div>
          )}

          <div className="space-y-3">
            {jobs.map((j) => (
              <article key={j.id} className="card-elevated card-elevated-hover flex flex-wrap items-start gap-4 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                  <Briefcase className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{j.title}</h3>
                    {j.isNew && <span className="rounded-full bg-[var(--brand-green)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-green)]">New</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{j.company} • {j.location} • {j.employmentType}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {j.tags?.map((t) => (
                      <span key={t} className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-semibold text-[var(--brand-green)]">PKR {j.salaryMin?.toLocaleString()} - {j.salaryMax?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{j.postedAt}</p>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-border p-2 text-muted-foreground hover:text-[var(--brand-orange)]" aria-label="Save"><Bookmark className="h-4 w-4" /></button>
                    <Button size="sm" className="bg-[var(--brand-green)] text-white hover:bg-[var(--brand-green-dark)]">Apply Now</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FilterGroup({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string; onToggle: (v: string) => void }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {items.map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={selected === i} onChange={() => onToggle(i)} className="accent-[var(--brand-green)]" /> {i}
          </label>
        ))}
      </div>
    </div>
  );
}
