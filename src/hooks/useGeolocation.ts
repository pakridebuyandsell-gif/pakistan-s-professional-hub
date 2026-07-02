import { useCallback, useState } from "react";

export interface GeoResult {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  displayName?: string;
}

interface State {
  loading: boolean;
  error: string | null;
  data: GeoResult | null;
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<GeoResult>> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`;
    const res = await fetch(url, { headers: { Accept: "application/json", "Accept-Language": "en" } });
    if (!res.ok) return {};
    const j = (await res.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state_district?: string;
        state?: string;
        country?: string;
      };
    };
    const a = j.address ?? {};
    return {
      city: a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state_district ?? a.state,
      country: a.country,
      displayName: j.display_name,
    };
  } catch {
    return {};
  }
}

export function useGeolocation() {
  const [state, setState] = useState<State>({ loading: false, error: null, data: null });

  const request = useCallback((): Promise<GeoResult | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setState({ loading: false, error: "Geolocation is not supported by your browser.", data: null });
        resolve(null);
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const extra = await reverseGeocode(lat, lng);
          const data: GeoResult = { lat, lng, ...extra };
          setState({ loading: false, error: null, data });
          resolve(data);
        },
        (err) => {
          const msg =
            err.code === err.PERMISSION_DENIED
              ? "Location access denied. Please allow location in your browser settings."
              : err.code === err.POSITION_UNAVAILABLE
                ? "Location information is unavailable."
                : err.code === err.TIMEOUT
                  ? "Getting your location took too long. Try again."
                  : "Could not detect your location.";
          setState({ loading: false, error: msg, data: null });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5 * 60_000 },
      );
    });
  }, []);

  return { ...state, request };
}
