import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, MessageCircle, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatLocationLabel } from "@/lib/location";

const NAV = [
  { to: "/find-jobs", key: "findJobs" as const, label: "Find Jobs" },
  { to: "/post-job", key: "postJob" as const, label: "Post Job" },
  { to: "/find-services", key: "findServices" as const, label: "Find Services" },
  { to: "/post-service", key: "postService" as const, label: "Post Service" },
];

export function Header() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const geo = useGeolocation();

  const navText = (item: (typeof NAV)[number]) => {
    const translated = t(`nav.${item.key}`);
    return translated === `nav.${item.key}` ? item.label : translated;
  };

  const useMyLocation = async () => {
    const result = await geo.request();
    if (result) toast.success(`Current location: ${formatLocationLabel(result)}`);
    else toast.error("Location permission blocked or unavailable.");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "text-primary font-semibold bg-accent/60" }}
            >
              {navText(item)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            className="hidden items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted md:inline-flex"
            aria-label="Use current location"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="max-w-24 truncate">{geo.loading ? "Locating…" : formatLocationLabel(geo.data) || "PK"}</span>
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "en" ? "ur" : "en")}
            className="hidden rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted md:inline-flex"
          >
            {i18n.language === "en" ? "اردو" : "EN"}
          </button>

          {user ? (
            <>
              <button className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted md:inline-flex" aria-label="Messages">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted md:inline-flex" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <Link to="/dashboard" className="hidden md:block">
                <Button variant="outline" size="sm">{t("nav.dashboard")}</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => logout()} className="hidden md:inline-flex">
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="hidden md:block">
                <Button variant="outline" size="sm">{t("nav.login")}</Button>
              </Link>
              <Link to="/auth/register" className="hidden md:block">
                <Button size="sm" className="bg-primary text-primary-foreground shadow-[var(--shadow-glow-green)] hover:bg-[var(--brand-green-dark)]">
                  {t("nav.register")}
                </Button>
              </Link>
            </>
          )}

          <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {navText(item)}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">{t("nav.dashboard")}</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => logout()}>{t("nav.logout")}</Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                  </Link>
                  <Link to="/auth/register" className="flex-1" onClick={() => setOpen(false)}>
                    <Button className="w-full">{t("nav.register")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
