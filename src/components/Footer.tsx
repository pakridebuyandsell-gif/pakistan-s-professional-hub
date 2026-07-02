import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const cols = [
  {
    title: "For Job Seekers",
    links: [
      { label: "Find Jobs", to: "/find-jobs" },
      { label: "Browse Categories", to: "/find-jobs" },
      { label: "Career Tips", to: "/find-jobs" },
    ],
  },
  {
    title: "For Employers",
    links: [
      { label: "Post a Job", to: "/post-job" },
      { label: "Manage Jobs", to: "/dashboard" },
      { label: "Employer Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "For Service Providers",
    links: [
      { label: "Find Services", to: "/find-services" },
      { label: "Post Service", to: "/post-service" },
      { label: "Provider Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/" },
      { label: "Contact Us", to: "/" },
      { label: "Terms & Conditions", to: "/" },
      { label: "Privacy Policy", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-[oklch(0.16_0.02_250)] text-[oklch(0.9_0.005_250)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="mb-4 inline-block rounded-2xl bg-white p-4 shadow-lg">
            <Logo linked={false} imgClassName="h-28 w-auto md:h-36" />
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Pakistan's trusted marketplace for jobs and professional services.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="rounded-full border border-white/15 p-2 text-white/70 hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/70 hover:text-[var(--brand-orange)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} WorqGo.com — All rights reserved.</p>
          <p>Made in Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  );
}
