import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type SpotCategory,
} from '../data/spots';
import CategoryIcon from './CategoryIcon';

const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
];

const ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return { value: `750${num.toString().padStart(2, '0')}`, label: `${num}${num === 1 ? 'er' : 'ème'} arr.` };
});

const CATEGORY_DOT: Record<SpotCategory, string> = {
  fontaine: 'bg-app_blue',
  parc: 'bg-app_green',
  climatise: 'bg-app_teal',
};

export function countActiveFilters(
  activeFilters: SpotCategory[],
  arrondissement: string | null,
  isFree: boolean | null,
  maxHeatRisk: number | null,
  sortBy: string,
  searchRadius: number,
): number {
  let count = 0;
  if (activeFilters.length !== ALL_CATEGORIES.length) count += 1;
  if (arrondissement) count += 1;
  if (isFree !== null) count += 1;
  if (maxHeatRisk !== null && maxHeatRisk < 100) count += 1;
  if (sortBy !== 'distance') count += 1;
  if (searchRadius !== 1000) count += 1;
  return count;
}

interface FilterPopoverProps {
  open: boolean;
  onClose: () => void;
}

export default function FilterPopover({ open, onClose }: FilterPopoverProps) {
  const {
    activeFilters,
    setActiveFilters,
    toggleFilter,
    arrondissement,
    setArrondissement,
    isFree,
    setIsFree,
    sortBy,
    setSortBy,
    maxHeatRisk,
    setMaxHeatRisk,
    searchRadius,
    setSearchRadius,
  } = useAppContext();

  const panelRef = useRef<HTMLDivElement>(null);
  const radiusIndex = RADIUS_OPTIONS.findIndex((o) => o.value === searchRadius);
  const safeRadiusIndex = radiusIndex >= 0 ? radiusIndex : 1;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  const resetAll = () => {
    setActiveFilters([...ALL_CATEGORIES]);
    setArrondissement(null);
    setIsFree(null);
    setMaxHeatRisk(null);
    setSortBy('distance');
    setSearchRadius(1000);
  };

  if (!open) return null;

  const heatValue = maxHeatRisk ?? 100;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[min(100vw-2rem,320px)] bg-white border border-border rounded-xl shadow-xl z-[9999] py-3 max-h-[70vh] overflow-y-auto"
    >
      <p className="px-4 pb-2 text-xs font-semibold text-app_blue uppercase tracking-wide border-b border-border">
        Filtres
      </p>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-border/60">
        <p className="text-xs font-medium text-app_black/70 mb-2">Catégories</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const active = activeFilters.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active
                    ? 'bg-app_green text-white border-app_green'
                    : 'bg-transparent text-app_black border-border hover:border-app_green'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat]}`} />
                <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Arrondissement */}
      <div className="px-4 py-3 border-b border-border/60">
        <label className="text-xs font-medium text-app_black/70 mb-1.5 block">Arrondissement</label>
        <select
          value={arrondissement ?? ''}
          onChange={(e) => setArrondissement(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-app_surface focus:outline-none focus:ring-2 focus:ring-app_green/30"
        >
          <option value="">Tout Paris</option>
          {ARRONDISSEMENTS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Access */}
      <div className="px-4 py-3 border-b border-border/60">
        <p className="text-xs font-medium text-app_black/70 mb-2">Accès</p>
        <div className="flex gap-2">
          {[
            { value: null, label: 'Tous' },
            { value: true, label: 'Gratuit' },
            { value: false, label: 'Payant' },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIsFree(opt.value)}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium border transition-colors ${isFree === opt.value
                  ? 'bg-app_blue text-white border-app_blue'
                  : 'border-border text-app_black hover:border-app_teal'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="px-4 py-3 border-b border-border/60">
        <p className="text-xs font-medium text-app_black/70 mb-2">Tri</p>
        <div className="flex gap-2">
          {[
            { value: 'distance' as const, label: 'Proximité' },
            { value: 'heatRisk' as const, label: 'Risque chaleur' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortBy(opt.value)}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium border transition-colors ${sortBy === opt.value
                  ? 'bg-app_blue text-white border-app_blue'
                  : 'border-border text-app_black hover:border-app_teal'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heat risk */}
      <div className="px-4 py-3 border-b border-border/60">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-app_black/70">Risque chaleur max</p>
          <span className="text-xs font-bold text-app_blue">
            {heatValue >= 100 ? 'Tous' : heatValue}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={heatValue}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMaxHeatRisk(v >= 100 ? null : v);
          }}
          className="w-full h-1.5 accent-app_blue cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-app_black/50 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      {/* Rayon moved to map UI */}

      <div className="px-4 pt-2 border-t border-border">
        <button
          type="button"
          onClick={resetAll}
          className="text-xs font-medium text-app_teal hover:text-app_blue transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  onClick: () => void;
}

export function FilterButton({ onClick }: FilterButtonProps) {
  const ctx = useAppContext();
  const count = countActiveFilters(
    ctx.activeFilters,
    ctx.arrondissement,
    ctx.isFree,
    ctx.maxHeatRisk,
    ctx.sortBy,
    ctx.searchRadius,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border border-border bg-app_surface text-app_blue hover:border-app_green transition-colors"
    >
      Filtres{count > 0 ? ` · ${count}` : ''}
    </button>
  );
}
