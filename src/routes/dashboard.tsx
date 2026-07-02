import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { Briefcase, Users, Star, Wallet, Plus, MessageCircle, Bell, Settings } from "lucide-react";

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

  const name = user.displayName || user.email?.split("@")[0] || "there";
  const isEmployer = accountType === "employer";
  const isProvider = accountType === "service_provider";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="card-elevated h-fit p-4">
          <p className="mb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">
            {isEmployer ? "Employer" : isProvider ? "Service Provider" : accountType === "job_seeker" ? "Job Seeker" : "Customer"} Panel
          </p>
          <nav className="space-y-1">
            <SideItem active label="Overview" />
            {isEmployer && <>
              <Link to="/post-job"><SideItem label="Post a Job" /></Link>
              <SideItem label="My Jobs" />
              <SideItem label="Applicants" />
              <SideItem label="Company Profile" />
            </>}
            {isProvider && <>
              <Link to="/post-service"><SideItem label="Post a Service" /></Link>
              <SideItem label="My Services" />
              <SideItem label="Bookings / Requests" />
              <SideItem label="Portfolio" />
              <SideItem label="Reviews" />
              <SideItem label="Earnings" />
            </>}
            {accountType === "job_seeker" && <>
              <Link to="/find-jobs"><SideItem label="Find Jobs" /></Link>
              <SideItem label="My Applications" />
              <SideItem label="Saved Jobs" />
            </>}
            {accountType === "customer" && <>
              <Link to="/find-services"><SideItem label="Find Services" /></Link>
              <SideItem label="My Bookings" />
              <SideItem label="Saved Providers" />
            </>}
            <SideItem label="Messages" icon={MessageCircle} />
            <SideItem label="Notifications" icon={Bell} />
            <SideItem label="Settings" icon={Settings} />
          </nav>
          <Button variant="outline" onClick={() => logout()} className="mt-4 w-full">Logout</Button>
        </aside>

        <div className="space-y-6">
          <div className="card-elevated flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {name} 👋</h1>
              <p className="text-sm text-muted-foreground">Here's what's happening with your account.</p>
            </div>
            {isEmployer && <Link to="/post-job"><Button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> Post a New Job</Button></Link>}
            {isProvider && <Link to="/post-service"><Button className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white"><Plus className="mr-1 h-4 w-4" /> Post a Service</Button></Link>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Briefcase} label="Active" value="0" tint="green" />
            <Stat icon={Users} label="Applicants / Leads" value="0" tint="blue" />
            <Stat icon={Star} label="Rating" value="—" tint="orange" />
            <Stat icon={Wallet} label="Earnings (PKR)" value="0" tint="violet" />
          </div>

          <div className="card-elevated p-6">
            <h3 className="mb-1 text-lg font-bold">Get started</h3>
            <p className="text-sm text-muted-foreground">
              Your dashboard will populate as you post {isEmployer ? "jobs" : isProvider ? "services" : "activity"} and connect with the WorqGo backend.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function SideItem({ label, icon: Icon, active }: { label: string; icon?: typeof Briefcase; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-[var(--brand-green)]/10 font-semibold text-[var(--brand-green)]" : "text-foreground/80 hover:bg-muted"}`}>
      {Icon && <Icon className="h-4 w-4" />} {label}
    </div>
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
