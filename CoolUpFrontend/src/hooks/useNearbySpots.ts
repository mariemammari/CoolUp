import { useEffect, useMemo, useState } from 'react';
import { spotsApi } from '../api/spots';
import {
  coolSpotToDisplay,
  PARIS_CENTER,
  type DisplaySpot,
  type SpotCategory,
} from '../data/spots';
import type { Coordinates } from '../utils/geo';

export function useNearbySpots(
  origin: Coordinates | null,
  radiusMeters: number,
  activeFilters: SpotCategory[],
  sortBy: 'distance' | 'heatRisk' | 'name',
  extraFilters: {
    arrondissement?: string | null;
    isFree?: boolean | null;
    maxHeatRisk?: number | null;
    placeQuery?: string;
  } = {}
) {
  const [spots, setSpots] = useState<DisplaySpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = activeFilters.slice().sort().join(',');

  useEffect(() => {
    const coords = origin ?? PARIS_CENTER;
    const radiusKm = radiusMeters / 1000;
    let cancelled = false;

    setLoading(true);
    setError(null);

    spotsApi
      .findNearby({
        lat: coords.lat,
        lng: coords.lng,
        radius: radiusKm,
        ...(extraFilters.arrondissement ? { arrondissement: extraFilters.arrondissement } : {}),
        ...(extraFilters.isFree !== null && extraFilters.isFree !== undefined ? { isFree: extraFilters.isFree } : {}),
        ...(extraFilters.maxHeatRisk !== null && extraFilters.maxHeatRisk !== undefined ? { maxHeatRisk: extraFilters.maxHeatRisk } : {}),
      })
      .then((data) => {
        if (cancelled) return;

        let result = data
          .map((s) => coolSpotToDisplay(s, coords))
          .filter((s) => activeFilters.includes(s.category));

        if (extraFilters.placeQuery?.trim()) {
          const q = extraFilters.placeQuery.trim().toLowerCase();
          result = result.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              (s.adresse?.toLowerCase().includes(q) ?? false),
          );
        }

        if (sortBy === 'distance') {
          result = result.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === 'heatRisk') {
          result = result.sort((a, b) => a.heatRiskScore - b.heatRiskScore);
        } else if (sortBy === 'name') {
          result = result.sort((a, b) => a.name.localeCompare(b.name));
        }

        setSpots(result);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setSpots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    origin?.lat,
    origin?.lng,
    radiusMeters,
    filterKey,
    sortBy,
    extraFilters.arrondissement,
    extraFilters.isFree,
    extraFilters.maxHeatRisk,
    extraFilters.placeQuery,
  ]);

  return useMemo(() => ({ spots, loading, error }), [spots, loading, error]);
}
