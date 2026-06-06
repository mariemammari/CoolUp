import { Wind, LayoutList, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LocationBar from '../components/LocationBar';
import MapView from '../components/MapView';
import SpotResultsList from '../components/SpotResultsList';
import { useAppContext } from '../context/AppContext';
import type { DisplaySpot } from '../data/spots';
import { useNearbySpots } from '../hooks/useNearbySpots';

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const initialMode =
    mode === 'geolocation' || mode === 'manual' || mode === 'map'
      ? mode
      : undefined;

  const {
    userLocation,
    activeFilters,
    searchRadius,
    sortBy,
    arrondissement,
    isFree,
    maxHeatRisk,
    placeQuery,
  } = useAppContext();

  const { spots, loading, error } = useNearbySpots(
    userLocation,
    searchRadius,
    activeFilters,
    sortBy,
    {
      arrondissement,
      isFree,
      maxHeatRisk,
      placeQuery,
    }
  );

  const [highlightedSpot, setHighlightedSpot] = useState<DisplaySpot | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const radiusLabel = searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`;

  const getSortTitle = () => {
    let base = 'Îlots de fraîcheur';
    if (sortBy === 'distance') base = 'Les plus proches';
    if (sortBy === 'heatRisk') base = 'Les plus frais';
    if (sortBy === 'name') base = 'Spots (A-Z)';

    let locationPart = 'Tout Paris';
    if (userLocation?.address) {
      locationPart = `Autour de ${userLocation.address.split(',')[0]}`;
    }

    let filterPart = arrondissement ? `${arrondissement.replace('750', '')}e arr.` : 'Tout Paris';

    return `${base} · ${filterPart} · ${locationPart}`;
  };

  return (
    <div className="flex flex-1 min-h-0 p-2">
      {/* LEFT 60% — search, filters & results */}
      <div className="w-[60%] flex flex-col min-h-0 bg-transparent">

        {/* TOP HEADER */}
        <div className="shrink-0 px-5 pt-6 pb-4 bg-transparent z-20">
          <h2 className="text-app_black font-extrabold text-3xl flex items-center gap-2.5">
            <Wind className="w-8 h-8 text-app_green" strokeWidth={2.5} />
            {getSortTitle()}
          </h2>
          <p className="text-sm font-semibold text-app_black/60 mt-1.5" style={{ marginLeft: '42px' }}>
            {loading
              ? 'Recherche en cours...'
              : `${spots.length} spot${spots.length !== 1 ? 's' : ''} dans ${radiusLabel}${spots.length >= 500 ? ' (max affiché)' : ''}`
            }
          </p>
        </div>

        <LocationBar initialMode={initialMode} />
        <div className="flex items-center justify-between mb-2 sticky top-0 z-20 bg-app_surface-2/30 py-2 px-5">
          <div className="text-sm text-app_black/70">{spots.length} résultat{spots.length !== 1 ? 's' : ''}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-app_blue text-white shadow-sm' : 'text-app_black/40 hover:text-app_black'}`}
              aria-label="Vue liste"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-app_blue text-white shadow-sm' : 'text-app_black/40 hover:text-app_black'}`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        <SpotResultsList
          spots={spots}
          loading={loading}
          error={error}
          highlightedSpotId={highlightedSpot?.id ?? null}
          onSpotSelect={setHighlightedSpot}
          userLat={userLocation?.lat}
          userLng={userLocation?.lng}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* RIGHT 40% — map */}
      <MapView
        spots={spots}
        loading={loading}
        highlightedSpot={highlightedSpot}
      />
    </div>
  );
}
