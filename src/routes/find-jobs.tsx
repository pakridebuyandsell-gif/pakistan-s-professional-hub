import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MOCK_JOBS, JOB_CATEGORIES, PK_CITIES } from "@/services/mock";
import { Search, MapPin, Bookmark, Briefcase } from "lucide-react";
import { useState } from "react";

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

  const filtered = MOCK_JOBS.filter((j) =>
    (!q || j.title.toLowerCase().includes(q.toLowerCase())) &&
    (!city || j.city === city) &&
    (!cat || j.category === cat),
  );

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
            Discover thousands of employment opportunities across Pakistan.
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
            <div className="flex items-center gap-2 rounded-xl border border-input px-3 md:w-48">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none">
                <option value="">All Pakistan</option>
                {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white h-auto min-h-12">Search Jobs</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="card-elevated h-fit p-5">
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            Filters <button className="text-xs font-normal text-[var(--brand-green)]">Clear All</button>
          </h3>
          <FilterGroup title="Job Category" items={JOB_CATEGORIES} />
          <FilterGroup title="Job Type" items={["Full Time", "Part Time", "Contract", "Internship"]} />
          <FilterGroup title="Location" items={PK_CITIES.slice(0, 6)} />
          <FilterGroup title="Experience Level" items={["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">{filtered.length.toLocaleString()} Jobs Found</p>
            <select className="rounded-lg border border-input bg-white px-3 py-2 text-xs">
              <option>Most Recent</option><option>Highest Salary</option><option>Most Relevant</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map((j) => (
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

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {items.map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="accent-[var(--brand-green)]" /> {i}
          </label>
        ))}
      </div>
    </div>
  );
}
