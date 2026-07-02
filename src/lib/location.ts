import { PK_CITIES } from "@/services/mock";

export interface LocationLike {
  lat: number;
  lng: number;
  city?: string;
  displayName?: string;
}

const CITY_COORDS: Record<string, [number, number]> = {
  Lahore: [31.5204, 74.3587],
  Karachi: [24.8607, 67.0011],
  Islamabad: [33.6844, 73.0479],
  Rawalpindi: [33.5651, 73.0169],
  Peshawar: [34.0151, 71.5249],
  Quetta: [30.1798, 66.975],
  Multan: [30.1575, 71.5249],
  Faisalabad: [31.4504, 73.135],
  Hyderabad: [25.396, 68.3578],
  Sialkot: [32.4945, 74.5229],
  Bahawalpur: [29.3956, 71.6836],
  Sargodha: [32.0836, 72.6711],
  Gujranwala: [32.1877, 74.1945],
  Abbottabad: [34.1688, 73.2215],
  Mardan: [34.1986, 72.0404],
  Swat: [35.2227, 72.4258],
  Sukkur: [27.7052, 68.8574],
  Larkana: [27.559, 68.2123],
  Gujrat: [32.5731, 74.1005],
  Sheikhupura: [31.7131, 73.9783],
};

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - s1 - s2));
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

export function resolveCityForLocation(location: LocationLike | null) {
  if (!location) return "";
  const known = resolveKnownPakistaniCity(location.city);
  if (known && PK_CITIES.includes(known)) return known;

  const nearest = Object.entries(CITY_COORDS)
    .map(([city, [lat, lng]]) => ({ city, km: distanceKm(location.lat, location.lng, lat, lng) }))
    .sort((a, b) => a.km - b.km)[0];

  return nearest && nearest.km <= 120 ? nearest.city : known;
}

export function formatLocationLabel(location: LocationLike | null) {
  if (!location) return "";
  const city = resolveCityForLocation(location);
  if (city) return city;
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}
