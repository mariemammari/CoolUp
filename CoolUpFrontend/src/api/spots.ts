// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoolSpot {
  id: string;
  sourceId?: string;
  dataset: string;
  nom: string;
  type?: string;
  lat: number;
  lng: number;
  adresse?: string;
  arrondissement?: string;
  isFree?: boolean;
  isAvailable?: boolean;
  caniculeOuverture?: boolean;
  ouvertureEstivaleNocturne?: boolean;
  categorie?: string;
  modele?: string;
  surfVegetSup8m2024?: number;
  indiceVegetSup8m2024?: number;
  heatRiskScore: number;
}

export interface SpotsPage {
  data: CoolSpot[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FindAllParams {
  q?: string;
  dataset?: string;
  arrondissement?: string;
  isFree?: boolean;
  isAvailable?: boolean;
  maxHeatRisk?: number;
  page?: number;
  limit?: number;
}

export interface FindNearbyParams {
  lat: number;
  lng: number;
  radius?: number; // km
  dataset?: string;
  arrondissement?: string;
  isFree?: boolean;
  maxHeatRisk?: number;
  q?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── API client ───────────────────────────────────────────────────────────────

export const spotsApi = {
  /**
   * Paginated list of cool spots with optional filters.
   */
  findAll(params: FindAllParams = {}): Promise<SpotsPage> {
    const qs = buildQuery(params as unknown as Record<string, unknown>);
    return request<SpotsPage>(`/spots${qs}`);
  },

  /**
   * Spots within a given radius (km) of a lat/lng coordinate.
   */
  findNearby(params: FindNearbyParams): Promise<CoolSpot[]> {
    const qs = buildQuery(params as unknown as Record<string, unknown>);
    return request<CoolSpot[]>(`/spots/nearby${qs}`);
  },
};
