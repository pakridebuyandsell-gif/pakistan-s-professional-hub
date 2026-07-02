import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { friendlyAuthError } from "@/lib/auth-errors";
import { Briefcase, Search, Wrench, User as UserIcon, CheckCircle2 } from "lucide-react";
import type { AccountType } from "@/services/types";
import { PK_CITIES } from "@/services/mock";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create your WorqGo Account" },
      { name: "description", content: "Join WorqGo — Pakistan's marketplace for jobs and professional services." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

const TYPES: { id: AccountType; title: string; desc: string; icon: typeof Briefcase; tone: "green" | "orange" | "blue" | "violet" }[] = [
  { id: "employer", title: "I want to Hire Employees", desc: "Post jobs, hire talent and manage applications.", icon: Briefcase, tone: "green" },
  { id: "job_seeker", title: "I want to Find a Job", desc: "Browse jobs and apply to opportunities.", icon: Search, tone: "blue" },
  { id: "service_provider", title: "I want to Offer Services", desc: "Create your service profile and get customers.", icon: Wrench, tone: "violet" },
  { id: "customer", title: "I want to Find Services", desc: "Find trusted professionals for your home or business.", icon: UserIcon, tone: "orange" },
];

function RegisterPage() {
  const { signUpEmail, signInGoogle, setAccountType } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<"type" | "form">("type");
  const [accountType, setType] = useState<AccountType | null>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", whatsapp: "", country: "Pakistan", city: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return;
    setBusy(true);
    try {
      await signUpEmail(form.email, form.password, form.fullName, accountType, {
        whatsapp: form.whatsapp, city: form.city,
      });
      toast.success("Account created!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally { setBusy(false); }
  };

  const google = async () => {
    if (!accountType) { toast.error("Pick an account type first"); return; }
    try { await signInGoogle(accountType); nav({ to: "/dashboard" }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Google sign-up failed"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="card-elevated p-6 md:p-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Pakistan's trusted marketplace for jobs & professional services.
          </p>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground">Choose account type</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {TYPES.map((t) => {
                const active = accountType === t.id;
                const toneCls =
                  t.tone === "green" ? "text-[var(--brand-green)] bg-[var(--brand-green)]/10" :
                  t.tone === "orange" ? "text-[var(--brand-orange)] bg-[var(--brand-orange)]/10" :
                  t.tone === "blue" ? "text-blue-600 bg-blue-100" :
                  "text-violet-600 bg-violet-100";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setType(t.id); setAccountType(t.id); }}
                    className={`relative rounded-xl border p-4 text-left transition ${active ? "border-[var(--brand-green)] ring-2 ring-[var(--brand-green)]/30 bg-[var(--brand-green)]/5" : "border-border hover:border-[var(--brand-green)]/40"}`}
                  >
                    {active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-[var(--brand-green)]" />}
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full ${toneCls}`}>
                      <t.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                );
              })}
            </div>

            {step === "type" && (
              <Button
                disabled={!accountType}
                onClick={() => setStep("form")}
                className="mt-6 w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"
              >
                Continue
              </Button>
            )}
          </div>

          {step === "form" && (
            <form onSubmit={submit} className="mt-8 space-y-4 border-t border-border pt-6">
              <button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">
                <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" /> Continue with Google
              </button>
              <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or fill your details <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full Name *"><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" /></Field>
                <Field label="Email *"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password *"><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" /></Field>
                <Field label="WhatsApp Number *"><input required placeholder="+92 3XX XXXXXXX" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" /></Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Country">
                  <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input">
                    <option>Pakistan</option>
                  </select>
                </Field>
                <Field label="City *">
                  <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input">
                    <option value="">Select city</option>
                    {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 accent-[var(--brand-green)]" />
                I agree to the <a className="text-[var(--brand-green)]">Terms & Conditions</a> and <a className="text-[var(--brand-green)]">Privacy Policy</a>.
              </label>

              <Button type="submit" disabled={busy} className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
                {busy ? "Creating…" : "Create Account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/auth/login" className="font-semibold text-[var(--brand-green)]">Login</Link>
              </p>
            </form>
          )}
        </div>

        <aside className="card-elevated h-fit p-6">
          <h3 className="font-bold text-[var(--brand-green)]">Why join WorqGo?</h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <p className="font-semibold">💯 100% Free to Join</p>
              <p className="text-xs text-muted-foreground">No hidden charges. Post jobs or services for free.</p>
            </li>
            <li>
              <p className="font-semibold">🛡️ Trusted by Thousands</p>
              <p className="text-xs text-muted-foreground">Join 10,000+ employers and service providers.</p>
            </li>
            <li>
              <p className="font-semibold">🔒 Safe & Secure</p>
              <p className="text-xs text-muted-foreground">Your data is protected with enterprise-level security.</p>
            </li>
            <li>
              <p className="font-semibold">🎧 Dedicated Support</p>
              <p className="text-xs text-muted-foreground">We're here to help you grow and succeed.</p>
            </li>
          </ul>
        </aside>
      </section>
      <Footer />
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:white;border-radius:var(--radius-md);padding:0.65rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--brand-green);box-shadow:0 0 0 3px oklch(0.58 0.18 145 / 0.15)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}</label>;
}
