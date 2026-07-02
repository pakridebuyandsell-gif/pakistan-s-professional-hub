import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MOCK_PROVIDERS, SERVICE_CATEGORIES, PK_CITIES } from "@/services/mock";
import { Search, MapPin, Star, Phone, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/find-services")({
  head: () => ({
    meta: [
      { title: "Find Trusted Service Providers in Pakistan — WorqGo" },
      { name: "description", content: "Book electricians, plumbers, AC technicians, cleaners and more. Verified professionals across Pakistan on WorqGo." },
      { property: "og:title", content: "Find Services — WorqGo" },
      { property: "og:url", content: "/find-services" },
    ],
    links: [{ rel: "canonical", href: "/find-services" }],
  }),
  component: FindServicesPage,
});

function FindServicesPage() {
  const [q, setQ] = useState("");

  const filtered = MOCK_PROVIDERS.filter(
    (p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative bg-gradient-to-br from-[var(--brand-green)] to-[var(--brand-green-dark)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <nav className="mb-3 text-xs text-white/70">
            <Link to="/" className="hover:text-white">Home</Link> <span className="mx-1">/</span> Find Services
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">Find Services</h1>
          <p className="mt-2 text-white/85">Find trusted professionals for your home or business</p>

          <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-lg md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-input px-3 text-foreground">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services by name, skill or keyword…" className="w-full bg-transparent py-3 text-sm outline-none" />
            </div>
            <select className="rounded-xl border border-input bg-white px-3 py-3 text-sm text-foreground md:w-48">
              <option>All Categories</option>
              {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2 rounded-xl border border-input px-3 text-foreground md:w-48">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select className="w-full bg-transparent py-3 text-sm outline-none">
                <option>All Pakistan</option>
                {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Button className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white h-auto min-h-12">Search</Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
            <span className="font-medium text-white/90">Popular:</span>
            {SERVICE_CATEGORIES.slice(0, 5).map((c) => (
              <button key={c} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 hover:bg-white/20">{c}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{filtered.length.toLocaleString()} Service Providers Found</p>
          <select className="rounded-lg border border-input bg-white px-3 py-2 text-xs">
            <option>Top Rated</option><option>Most Reviews</option><option>Nearest</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <article key={p.id} className="card-elevated card-elevated-hover grid gap-5 p-5 md:grid-cols-[auto_1fr_auto]">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-orange)]/20 to-[var(--brand-green)]/20 text-2xl font-bold text-[var(--brand-orange)]">
                  {p.name.charAt(0)}
                </div>
                <span className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.level === "Gold" ? "bg-yellow-100 text-yellow-800" : p.level === "Silver" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"}`}>
                  {p.level}
                </span>
                {p.verified && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-green)] px-2 py-0.5 text-[10px] font-semibold text-white">Verified</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {p.rating} ({p.reviews})
                  </span>
                  <span className="text-xs text-muted-foreground">• {p.yearsExperience} Years</span>
                </div>
                <p className="text-xs text-muted-foreground">📍 {p.city} • Responds in {p.respondsInMinutes} mins</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span><b className="text-foreground">{p.completedProjects}</b> Projects</span>
                  <span><b className="text-foreground">{p.positiveReviewsPct}%</b> Positive</span>
                  <span><b className="text-foreground">{p.happyCustomers}+</b> Customers</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-semibold text-[var(--brand-orange)]">PKR {p.hourlyRate?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/hr</span></p>
                <Button className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white md:w-40">View Profile</Button>
                <div className="grid w-full grid-cols-2 gap-2 md:w-40">
                  <button className="flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted"><MessageCircle className="h-3.5 w-3.5" /> Chat</button>
                  <button className="flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted"><Phone className="h-3.5 w-3.5" /> Call</button>
                </div>
                <button className="text-xs text-muted-foreground hover:text-[var(--brand-orange)]"><Heart className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
