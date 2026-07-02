import logoAsset from "@/assets/worqgo-logo.asset.json";
import { Link } from "@tanstack/react-router";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <img src={logoAsset.url} alt="WORQGO" width={size} height={size} className="h-10 w-auto" />
    </Link>
  );
}
