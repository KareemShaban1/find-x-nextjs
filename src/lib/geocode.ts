/**
 * Geocode a place name or address to coordinates using OpenStreetMap Nominatim (free, no API key).
 * Use when browser geolocation is denied so users can type a city/address and still get "near me" results.
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_KEY_PREFIX = "findx_geocode_";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

function cacheKey(query: string): string {
  return CACHE_KEY_PREFIX + encodeURIComponent(query.trim().toLowerCase());
}

function getCached(query: string): GeocodeResult | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(query));
    if (!raw) return null;
    const { result, at } = JSON.parse(raw) as { result: GeocodeResult; at: number };
    if (Date.now() - at > CACHE_MAX_AGE_MS) return null;
    return result;
  } catch {
    return null;
  }
}

function setCached(query: string, result: GeocodeResult): void {
  try {
    sessionStorage.setItem(cacheKey(query), JSON.stringify({ result, at: Date.now() }));
  } catch {
    // ignore
  }
}

/**
 * Convert a place name or address to latitude/longitude.
 * Returns null if not found or on error.
 */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cached = getCached(trimmed);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "1",
      addressdetails: "0",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FindX-App/1.0 (local business search)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    const result: GeocodeResult = {
      latitude: lat,
      longitude: lon,
      displayName: first.display_name,
    };
    setCached(trimmed, result);
    return result;
  } catch {
    return null;
  }
}
