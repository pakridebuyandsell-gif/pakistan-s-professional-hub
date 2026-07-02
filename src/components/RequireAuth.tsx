import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { AccountType } from "@/services/types";
import { humanRole } from "@/lib/local-store";

interface Props {
  children: ReactNode;
  requiredRole?: AccountType;
  action?: string;
}

/**
 * Client-side gate. If the user isn't signed in, shows a friendly
 * login-or-create-account panel instead of the protected content.
 * If they're signed in with the wrong account type, explains why.
 */
export function RequireAuth({ children, requiredRole, action = "continue" }: Props) {
  const { user, loading, accountType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
          Loading…
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="mx-auto max-w-lg px-4 py-16">
          <div className="card-elevated p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">Login required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {action.charAt(0).toUpperCase() + action.slice(1)} karne ke liye pehle apna
              account banayein ya login karein. Ek email par sirf ek hi account ban sakta hai.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/auth/register">
                <Button className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
                  Create Account
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
            </div>

            {requiredRole && (
              <p className="mt-4 text-xs text-muted-foreground">
                Is action ke liye <b>{humanRole(requiredRole)}</b> account chahiye.
              </p>
            )}
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (requiredRole && accountType && accountType !== requiredRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="mx-auto max-w-lg px-4 py-16">
          <div className="card-elevated p-8 text-center">
            <h1 className="text-2xl font-bold">Ye action allowed nahi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Aap ka account <b>{humanRole(accountType)}</b> ke tor par registered hai.
              {" "}{action} karne ke liye <b>{humanRole(requiredRole)}</b> account chahiye.
              Ek email par sirf ek hi account ban sakta hai — dusra role banane ke liye
              alag email use karein.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/dashboard">
                <Button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/"><Button variant="outline">Home</Button></Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
