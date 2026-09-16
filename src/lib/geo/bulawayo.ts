/** City centre, Bulawayo, Zimbabwe */
export const BULAWAYO_MAP = {
  lat: -20.1561,
  lng: 28.5887,
  zoom: 12,
} as const;

/** Legacy seed/schema default (Harare) — treat as unset. */
const HARARE_DEFAULT = { lat: -17.8252, lng: 31.0335 };

export function resolveContactMap(contact?: {
  map_lat?: number | null;
  map_lng?: number | null;
  map_zoom?: number | null;
} | null) {
  const lat = contact?.map_lat;
  const lng = contact?.map_lng;
  const zoom = contact?.map_zoom && contact.map_zoom > 0 ? contact.map_zoom : BULAWAYO_MAP.zoom;
  const missing = lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng);
  const harareDefault =
    !missing &&
    Math.abs(lat - HARARE_DEFAULT.lat) < 0.05 &&
    Math.abs(lng - HARARE_DEFAULT.lng) < 0.05;

  if (missing || harareDefault) {
    return { lat: BULAWAYO_MAP.lat, lng: BULAWAYO_MAP.lng, zoom };
  }

  return { lat, lng, zoom };
}
