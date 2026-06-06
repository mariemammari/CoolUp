import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ArrondissementDropdown from './ArrondissementDropdown';
import AccessDropdown from './AccessDropdown';
import SortDropdown from './SortDropdown';

export default function FilterPanel() {
  const {
    searchQuery, setSearchQuery,
    maxHeatRisk, setMaxHeatRisk,
  } = useAppContext();

  // Debounce the text search
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="shrink-0 border-b border-border">
      <div className="px-4 py-3 bg-transparent flex items-center gap-4 overflow-x-auto no-scrollbar">
        {/* Spot Name Search */}
        <div className="relative min-w-[220px] shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-app_blue/50" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Entrez le nom du lieu recherché..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-full border border-border text-xs focus:outline-none focus:border-app_green shadow-sm bg-white"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app_blue/50 hover:text-app_blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>

        <SortDropdown />

        <ArrondissementDropdown />

        <AccessDropdown />

        <div className="flex items-center gap-2 shrink-0 min-w-[180px]">
          <span className="text-xs font-semibold text-app_blue whitespace-nowrap">Chaleur max:</span>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={maxHeatRisk ?? 100}
            onChange={(e) => setMaxHeatRisk(Number(e.target.value))}
            className="flex-1 h-1.5 accent-app_heat-high cursor-pointer"
          />
          <span className={`text-xs font-bold shrink-0 min-w-[30px] ${maxHeatRisk === 100 || maxHeatRisk === null ? 'text-app_black' : maxHeatRisk <= 30 ? 'text-app_heat-low' : maxHeatRisk <= 60 ? 'text-app_heat-medium' : 'text-app_heat-high'}`}>
            {maxHeatRisk === 100 || maxHeatRisk === null ? 'Tous' : `${maxHeatRisk}`}
          </span>
        </div>
      </div>
    </div>
  );
}
