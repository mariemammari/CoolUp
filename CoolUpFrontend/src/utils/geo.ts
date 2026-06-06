const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'CoolUp/1.0 (Paris cool spots finder)',
};

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function haversineDistance(
  from: Coordinates,
  to: Coordinates,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) throw new Error('Impossible de résoudre l\'adresse.');
  const data = await res.json();
  return data.display_name as string;
}

export async function searchAddresses(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const searchQuery = query.toLowerCase().includes('paris')
    ? query
    : `${query}, Paris, France`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=fr`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) throw new Error('Recherche d\'adresse impossible.');
  return res.json() as Promise<NominatimResult[]>;
}

export function getDirectionsUrl(from: Coordinates, to: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=walking`;
}
