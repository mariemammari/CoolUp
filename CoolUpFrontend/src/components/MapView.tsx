import { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import { useAppContext } from '../context/AppContext';
import {
  CATEGORY_LABELS,
  PARIS_CENTER,
  type DisplaySpot,
  type SpotCategory,
} from '../data/spots';
import { formatDistance, getDirectionsUrl, reverseGeocode } from '../utils/geo';
import CategoryIcon from './CategoryIcon';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import 'leaflet.heat';

// Fix default Leaflet marker icons in Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const DEFAULT_ZOOM = 14;

const MIN_RADIUS = 500;
const MAX_RADIUS = 5000;
const STEP_RADIUS = 250;

function formatRadius(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`;
  }
  return `${meters} m`;
}

const userPinIcon = L.divIcon({
  className: 'user-location-pin',
  html: '<div class="user-pin-dot"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Palette pulled from CSS variables in index.css for more variety
const MARKER_PALETTE = [
  'var(--color-app_blue)',
  'var(--color-app_teal)',
  'var(--color-app_green)',
  'var(--color-app_heat-low)',
  'var(--color-app_heat-medium)',
  'var(--color-app_heat-high)',
  'var(--color-accent)',
  'var(--color-text-secondary)'
];

function hashStringToInt(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickColorForSpot(id: string, category: SpotCategory) {
  const idx = hashStringToInt(id + '::' + category) % MARKER_PALETTE.length;
  return MARKER_PALETTE[idx];
}

function categoryIconSvg(category: SpotCategory, size: number) {
  // simple inline svgs sized to fit inside the marker
  const s = Math.max(10, Math.floor(size * 0.5));
  switch (category) {
    case 'fontaine':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2s-6 6-6 10a6 6 0 0012 0c0-4-6-10-6-10z" fill="white"/></svg>`;
    case 'parc':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l-4 6h8l-4-6z" fill="white"/><rect x="10" y="10" width="4" height="6" rx="0.5" fill="white"/></svg>`;
    case 'climatise':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4 12h4"/><path d="M16 12h4"/><path d="M5 5l3 3"/><path d="M16 16l3 3"/></g></svg>`;
    default:
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" fill="white"/></svg>`;
  }
}

function createCategoryIcon(category: SpotCategory, id: string, highlighted = false) {
  const color = pickColorForSpot(id, category);
  const size = highlighted ? 34 : 28;
  const anchor = Math.round(size / 2);
  const innerSvg = categoryIconSvg(category, size);

  const html = `<div style="
    background:${color};
    width:${size}px;height:${size}px;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    border:${highlighted ? 3 : 2}px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
  ">${innerSvg}</div>`;

  return L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -size],
  });
}

function MapController({
  center,
  zoom,
  radiusMeters,
  hasUserLocation,
}: {
  center: [number, number];
  zoom: number;
  radiusMeters: number;
  hasUserLocation: boolean;
}) {
  const map = useMap();
  const [lat, lng] = center;

  useEffect(() => {
    map.whenReady(() => {
      if (hasUserLocation) {
        const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16, animate: true });
      } else {
        map.flyTo([lat, lng], zoom, { duration: 0.8 });
      }
    });
  }, [map, lat, lng, zoom, radiusMeters, hasUserLocation]);
  return null;
}

function MapCursor({ mapMode }: { mapMode: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = mapMode ? 'crosshair' : '';
    return () => {
      container.style.cursor = '';
    };
  }, [map, mapMode]);
  return null;
}

function MapClickPicker({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToSpot({ spot }: { spot: DisplaySpot | null }) {
  const map = useMap();
  useEffect(() => {
    if (spot) map.flyTo([spot.lat, spot.lng], 16, { duration: 0.6 });
  }, [map, spot]);
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

function HeatmapLayer({ spots }: { spots: DisplaySpot[] }) {
  const map = useMap();
  useEffect(() => {
    if (spots.length === 0) return;

    // Intensity based on heatRiskScore (0-100). We map it to 0-1 range.
    const points = spots.map(s => [s.lat, s.lng, Math.max(0.1, s.heatRiskScore / 100)]);

    // @ts-expect-error leaflet.heat extends L globally but types might be missing
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      gradient: { 0.2: '#307B8E', 0.5: '#307B8E', 0.8: '#307B8E' } // green -> amber -> red
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, spots]);
  return null;
}

interface MapViewProps {
  spots: DisplaySpot[];
  loading: boolean;
  highlightedSpot: DisplaySpot | null;
}

export default function MapView({ spots, loading, highlightedSpot }: MapViewProps) {
  const { userLocation, setUserLocation, locationMode, setLocationMode, searchRadius, setSearchRadius } = useAppContext();
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  const mapMode = locationMode === 'map';
  const showMiniCards = currentZoom >= 16;

  const handleMapPick = useCallback(
    async (lat: number, lng: number) => {
      setResolvingAddress(true);

      try {
        const address = await reverseGeocode(lat, lng);
        setUserLocation({ lat, lng, address });
        setLocationMode('manual');
      } catch {
        setUserLocation({
          lat,
          lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
        setLocationMode('manual');
      } finally {
        setResolvingAddress(false);
      }
    },
    [setUserLocation, setLocationMode],
  );

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [PARIS_CENTER.lat, PARIS_CENTER.lng];

  return (
    <section className="flex-1 min-w-0 flex flex-col min-h-0 px-4 py-4">
      <div className="relative flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden border border-border shadow-sm">
        <div className="flex-1 min-h-0 relative">
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full z-0"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              center={mapCenter}
              zoom={DEFAULT_ZOOM}
              radiusMeters={searchRadius}
              hasUserLocation={!!userLocation}
            />
            <ZoomTracker onZoomChange={setCurrentZoom} />
            <MapCursor mapMode={mapMode} />
            <MapClickPicker enabled={mapMode} onPick={handleMapPick} />
            <FlyToSpot spot={highlightedSpot} />

            {userLocation && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius}
                pathOptions={{
                  color: '#307B8E',
                  fillColor: '#307B8E',
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '6 4',
                }}
              />
            )}

            {showHeatmap ? (
              <HeatmapLayer spots={spots} />
            ) : (
              <MarkerClusterGroup chunkedLoading>
                {spots.map((spot) => {
                  const highlighted = highlightedSpot?.id === spot.id;
                  return (
                    <Marker
                      key={spot.id}
                      position={[spot.lat, spot.lng]}
                      icon={createCategoryIcon(spot.category, spot.id, highlighted)}
                    >
                      {showMiniCards && (
                        <Tooltip
                          permanent
                          direction="bottom"
                          offset={[0, 10]}
                          opacity={1}
                          className="!bg-white !border-none !shadow-md !rounded-xl !p-2 !text-app_black !min-w-0"
                        >
                          <div className="flex flex-col gap-0.5 w-[140px] overflow-hidden">
                            <span className="text-xs font-bold truncate text-app_blue whitespace-normal leading-tight">
                              {spot.name}
                            </span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-medium text-app_black/70 flex items-center gap-1">
                                <CategoryIcon category={spot.category} className="w-3 h-3" />
                                {CATEGORY_LABELS[spot.category]}
                              </span>
                              <span className="text-[10px] font-bold text-app_green">
                                {formatDistance(spot.distance)}
                              </span>
                            </div>
                          </div>
                        </Tooltip>
                      )}
                      <Popup>
                        <div className="min-w-[160px]">
                          <p className="font-semibold text-app_blue text-sm">{spot.name}</p>
                          <p className="text-xs text-app_black/70 mt-1 flex items-center gap-1">
                            <CategoryIcon category={spot.category} className="w-3 h-3" />
                            {CATEGORY_LABELS[spot.category]}
                          </p>
                          <p className="text-xs text-app_green font-medium mt-1">
                            {formatDistance(spot.distance)}
                          </p>
                          <a
                            href={
                              userLocation
                                ? getDirectionsUrl(userLocation, { lat: spot.lat, lng: spot.lng })
                                : `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block bg-app_green text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-app_teal transition-colors"
                          >
                            Itinéraire
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            )}

            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userPinIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <p className="text-sm font-medium text-app_blue">
                    Votre position : {userLocation.address}
                  </p>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Floating Controls (Top Right) */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shadow-md transition-colors ${showHeatmap
                ? 'bg-app_heat-high text-white'
                : 'bg-white text-app_blue hover:bg-app_surface-2'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></svg>
              {showHeatmap ? 'Masquer la carte de chaleur' : 'Carte de chaleur'}
            </button>

            <button
              type="button"
              onClick={() => setLocationMode(mapMode ? null : 'map')}
              disabled={resolvingAddress}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shadow-md transition-colors disabled:opacity-70 ${mapMode
                ? 'bg-app_green text-white'
                : 'bg-app_blue text-white hover:bg-app_teal'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {resolvingAddress
                ? 'Résolution...'
                : mapMode
                  ? 'Cliquez sur la carte'
                  : 'Choisir sur la carte'}
            </button>
          </div>

          {/* Floating Radius Slider (bottom center) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1100] bg-app/35 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-border flex items-center gap-4 w-11/12 max-w-sm">
            <span className="text-xs font-semibold text-app_blue uppercase tracking-wide shrink-0">Rayon</span>
            <input
              type="range"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step={STEP_RADIUS}
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="flex-1 h-1.5 accent-app_blue cursor-pointer"
              aria-label="Rayon de recherche"
            />
            <span className="text-xs font-bold text-app_green shrink-0 min-w-[48px] text-right">{formatRadius(searchRadius)}</span>
          </div>

          {mapMode && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-app_green text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-[1000] pointer-events-none whitespace-nowrap">
              Cliquez pour placer votre adresse
            </div>
          )}

          {loading && (
            <div className="absolute bottom-5 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-app_blue shadow-md z-[1000] flex items-center gap-1.5 pointer-events-none">
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Chargement...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
