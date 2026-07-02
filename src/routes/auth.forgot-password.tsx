import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { requireFirebaseAuth } from "@/lib/firebase";
import { friendlyAuthError } from "@/lib/auth-errors";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — WorqGo" },
      { name: "description", content: "Reset your WorqGo account password via email." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const auth = await requireFirebaseAuth();
      await sendPasswordResetEmail(auth, email.trim());

      setSent(true);
      toast.success("Password reset link bhej diya gaya hai.");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="card-elevated p-8">
          <Link to="/auth/login" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--brand-green)]" />
              <h1 className="mt-3 text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Humne <span className="font-semibold text-foreground">{email}</span> par password reset link bhej diya hai.
                Inbox (aur Spam folder) check karein aur link par click karke naya password set karein.
              </p>
              <Button
                onClick={() => { setSent(false); setEmail(""); }}
                variant="outline"
                className="mt-6 w-full"
              >
                Send to a different email
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Forgot password?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Apna registered email daalein — hum aap ko reset link bhejenge.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">Email</span>
                  <div className="flex items-center gap-2 rounded-xl border border-input px-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"
                >
                  {busy ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Password yaad aa gaya?{" "}
                <Link to="/auth/login" className="font-semibold text-[var(--brand-green)]">Login</Link>
              </p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
