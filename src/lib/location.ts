import { PK_CITIES } from "@/services/mock";

export interface LocationLike {
  lat: number;
  lng: number;
  city?: string;
  displayName?: string;
}

export function resolveKnownPakistaniCity(value?: string | null) {
  if (!value) return "";
  const lower = value.toLowerCase();
  return (
    PK_CITIES.find((city) => {
      const cityLower = city.toLowerCase();
      return lower === cityLower || lower.includes(cityLower) || cityLower.includes(lower);
    }) ?? value
  );
}

export function formatLocationLabel(location: LocationLike | null) {
  if (!location) return "";
  const city = resolveKnownPakistaniCity(location.city);
  if (city) return city;
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}
