import React, { useState, useMemo } from 'react';
import {
  CATEGORY_LABELS,
  type DisplaySpot,
  type SpotCategory,
} from '../data/spots';
import { formatDistance, getDirectionsUrl } from '../utils/geo';
import CategoryIcon from './CategoryIcon';

const PAGE_SIZE = 20;

const CATEGORY_BADGE: Record<SpotCategory, string> = {
  fontaine: 'bg-app_blue/10 text-app_blue',
  parc: 'bg-app_green/10 text-app_green',
  climatise: 'bg-app_teal/10 text-app_teal',
};

const HEAT_TOOLTIP =
  'Score de 0 à 100 — mesure l\'exposition à la chaleur urbaine autour de ce lieu. Plus le score est élevé, plus la zone est exposée.';

function heatRiskStyle(score: number): { backgroundColor: string; color: string } {
  if (score <= 30) return { backgroundColor: '#e8f5ee', color: '#2d7a4f' };
  if (score <= 60) return { backgroundColor: '#fef3cd', color: '#856404' };
  return { backgroundColor: '#fdecea', color: '#c0392b' };
}

interface SpotResultsListProps {
  spots: DisplaySpot[];
  loading: boolean;
  error: string | null;
  highlightedSpotId: string | null;
  onSpotSelect: (spot: DisplaySpot) => void;
  userLat?: number;
  userLng?: number;
  viewMode: 'list' | 'grid';
  setViewMode: (m: 'list' | 'grid') => void;
}

interface GridCardProps {
  spot: DisplaySpot;
  isHighlighted: boolean;
  heatStyle: { backgroundColor: string; color: string };
  directionsUrl: string;
  onSpotSelect: (spot: DisplaySpot) => void;
}

function GridCard({ spot, isHighlighted, heatStyle, directionsUrl, onSpotSelect }: GridCardProps) {
  return (
    <article
      onClick={() => onSpotSelect(spot)}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-2 ${isHighlighted
        ? 'bg-white shadow-md ring-2 ring-app_teal/50 scale-[1.02]'
        : 'bg-white shadow-sm hover:shadow-lg hover:-translate-y-1'
        }`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[spot.category]}`}>
          <CategoryIcon category={spot.category} className="w-3.5 h-3.5" />
          {CATEGORY_LABELS[spot.category]}
        </span>
      </div>

      <h4 className="font-semibold text-app_blue text-base truncate">{spot.name}</h4>

      {spot.adresse && (
        <p className="text-sm text-app_black/60 truncate">{spot.adresse}</p>
      )}

      <div className="flex items-center justify-between mt-auto gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md" style={heatStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></svg>
            <span className="text-xs">{Math.round(spot.heatRiskScore)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-app_green font-bold text-sm">{formatDistance(spot.distance)}</span>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-app_green text-white text-[11px] font-medium hover:bg-app_teal transition-colors"
          >
            Itinéraire
          </a>
        </div>
      </div>
    </article>
  );
}

export default function SpotResultsList({
  spots,
  loading,
  error,
  highlightedSpotId,
  onSpotSelect,
  userLat,
  userLng,
  viewMode,
}: SpotResultsListProps) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [showHeatTooltip, setShowHeatTooltip] = useState(false);

  useMemo(() => {
    setDisplayCount(PAGE_SIZE);
  }, [spots]);

  const visibleSpots = spots.slice(0, displayCount);

  return (
    <section className="flex-1 flex flex-col min-h-0 bg-app_surface-2/30 pt-1">
      <div className={`flex-1 overflow-y-auto no-scrollbar px-4 py-3 ${viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-2 gap-3'}`}>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && spots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-app_blue font-medium">Aucun spot trouvé</p>
            <p className="text-sm text-app_black/60 mt-2 max-w-xs">
              Élargissez le rayon ou activez d'autres catégories dans les filtres.
            </p>
          </div>
        )}



        {visibleSpots.map((spot, index) => {
          const directionsUrl =
            userLat !== undefined && userLng !== undefined
              ? getDirectionsUrl({ lat: userLat, lng: userLng }, { lat: spot.lat, lng: spot.lng })
              : `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

          const isHighlighted = highlightedSpotId === spot.id;
          const heatStyle = heatRiskStyle(spot.heatRiskScore);
          const isFirstHeatBadge = index === 0;

          if (viewMode === 'grid') {
            return (
              <GridCard
                key={spot.id}
                spot={spot}
                isHighlighted={isHighlighted}
                heatStyle={heatStyle}
                directionsUrl={directionsUrl}
                onSpotSelect={onSpotSelect}
              />
            );
          }

          return (
            <article
              key={spot.id}
              onClick={() => onSpotSelect(spot)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform ${isHighlighted
                ? 'bg-white shadow-md ring-2 ring-app_teal/50 scale-[1.02]'
                : 'bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]'
                }`}
            >
              {/* ── Row 1: Title + Heat badge ── */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-app_blue text-lg leading-snug flex-1 min-w-0">
                  {spot.name}
                </h3>

                {/* Heat badge */}
                <div className="relative flex items-center gap-1 shrink-0">
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={heatStyle}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                    </svg>
                    Risque Chaleur : {Math.round(spot.heatRiskScore)}
                  </div>
                  {isFirstHeatBadge && (
                    <button
                      type="button"
                      className="text-app_black/40 hover:text-app_blue text-xs"
                      aria-label="Explication du score de risque chaleur"
                      onMouseEnter={() => setShowHeatTooltip(true)}
                      onMouseLeave={() => setShowHeatTooltip(false)}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setShowHeatTooltip((v) => !v); }}
                    >
                      ⓘ
                    </button>
                  )}
                  {isFirstHeatBadge && showHeatTooltip && (
                    <div
                      className="absolute top-full right-0 mt-2 w-56 p-2.5 bg-white border border-border rounded-lg shadow-lg text-[11px] text-app_black/80 leading-snug z-10"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    >
                      {HEAT_TOOLTIP}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Row 2: Address ── */}
              {spot.adresse && (
                <p className="text-xs text-app_black/50 mb-2 truncate">
                  {spot.adresse}
                </p>
              )}

              {/* ── Row 3: Tags ── */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_BADGE[spot.category]}`}>
                  <CategoryIcon category={spot.category} className="w-3.5 h-3.5" />
                  {CATEGORY_LABELS[spot.category]}
                </span>
                {spot.isFree !== undefined && spot.isFree !== null && (
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-app_blue/5 text-app_blue">
                    {spot.isFree ? 'Gratuit' : 'Payant'}
                  </span>
                )}
                {spot.arrondissement && (
                  <span title={spot.arrondissement} className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-app_black/5 text-app_black/60">
                    {parseInt(spot.arrondissement.replace('750', ''), 10)}e
                  </span>
                )}
              </div>

              {/* ── Row 4: Distance + Itinéraire ── */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="text-app_green">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-app_green font-bold text-base">{formatDistance(spot.distance)}</span>
                </span>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-app_green text-white text-xs font-medium hover:bg-app_teal transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Itinéraire
                </a>
              </div>
            </article>
          );
        })}

        {displayCount < spots.length && (
          <button
            onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
            className="w-full py-2.5 mt-2 rounded-xl border border-app_blue text-app_blue font-medium text-sm hover:bg-app_blue hover:text-white transition-colors"
          >
            Afficher plus de résultats
          </button>
        )}
      </div>
    </section >
  );
}
