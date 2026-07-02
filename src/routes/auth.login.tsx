import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { friendlyAuthError } from "@/lib/auth-errors";
import { Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Login — WorqGo" },
      { name: "description", content: "Log in to your WorqGo account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signInEmail, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInEmail(email, password);
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally { setBusy(false); }
  };

  const google = async () => {
    try { await signInGoogle(); nav({ to: "/dashboard" }); }
    catch (err) { toast.error(friendlyAuthError(err)); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="card-elevated p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Log in to your WorqGo account.</p>

          <button onClick={google} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">
            <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">Email</span>
              <div className="flex items-center gap-2 rounded-xl border border-input px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-input px-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none" />
              </div>
            </label>
            <Button type="submit" disabled={busy} className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
              {busy ? "Signing in…" : "Login"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/auth/register" className="font-semibold text-[var(--brand-green)]">Create one</Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
