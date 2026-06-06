import type { CoolSpot } from '../api/spots';
import { haversineDistance, type Coordinates } from '../utils/geo';
import { cleanName } from '../utils/cleanName';

export type SpotCategory = 'fontaine' | 'parc' | 'climatise';

export interface DisplaySpot {
  id: string;
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  arrondissement: string;
  distance: number;
  heatRiskScore: number;
  adresse?: string;
  isFree?: boolean | null;
}

export const DATASET_TO_CATEGORY: Record<string, SpotCategory> = {
  fountain: 'fontaine',
  green_space: 'parc',
  equipment: 'climatise',
};

export const CATEGORY_TO_DATASET: Record<SpotCategory, string> = {
  fontaine: 'fountain',
  parc: 'green_space',
  climatise: 'equipment',
};

export const CATEGORY_LABELS: Record<SpotCategory, string> = {
  fontaine: 'Fontaine à boire',
  parc: 'Parc & jardin',
  climatise: 'Espace climatisé',
};

export const ALL_CATEGORIES: SpotCategory[] = ['fontaine', 'parc', 'climatise'];

export const PARIS_CENTER: Coordinates = { lat: 48.8566, lng: 2.3522 };

export function coolSpotToDisplay(spot: CoolSpot, origin: Coordinates): DisplaySpot {
  return {
    id: spot.id,
    name: cleanName(spot.nom),
    category: DATASET_TO_CATEGORY[spot.dataset] ?? 'fontaine',
    lat: spot.lat,
    lng: spot.lng,
    arrondissement: spot.arrondissement ?? '',
    distance: haversineDistance(origin, { lat: spot.lat, lng: spot.lng }),
    heatRiskScore: spot.heatRiskScore,
    adresse: spot.adresse,
    isFree: spot.isFree,
  };
}
