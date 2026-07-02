import logoAsset from "@/assets/worqgo-logo.asset.json";
import { Link } from "@tanstack/react-router";

export function Logo({
  className,
  imgClassName = "h-16 w-auto md:h-20 lg:h-24",
  linked = true,
}: {
  className?: string;
  imgClassName?: string;
  linked?: boolean;
}) {
  const img = (
    <img
      src={logoAsset.url}
      alt="WORQGO"
      className={imgClassName}
      loading="eager"
      decoding="async"
    />
  );
  if (!linked) return <span className={`inline-flex items-center ${className ?? ""}`}>{img}</span>;
  return (
    <Link to="/" className={`inline-flex items-center ${className ?? ""}`}>
      {img}
    </Link>
  );
}
