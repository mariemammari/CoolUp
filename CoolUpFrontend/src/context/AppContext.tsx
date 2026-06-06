import { createContext, useContext, useState, type ReactNode } from 'react';
import { ALL_CATEGORIES, type SpotCategory } from '../data/spots';

export type LocationMode = 'geolocation' | 'manual' | 'map' | null;

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

interface AppContextValue {
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  locationMode: LocationMode;
  setLocationMode: (mode: LocationMode) => void;
  activeFilters: SpotCategory[];
  setActiveFilters: (filters: SpotCategory[]) => void;
  toggleFilter: (category: SpotCategory) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  sortBy: 'distance' | 'heatRisk' | 'name';
  setSortBy: (value: 'distance' | 'heatRisk' | 'name') => void;
  arrondissement: string | null;
  setArrondissement: (value: string | null) => void;
  isFree: boolean | null;
  setIsFree: (value: boolean | null) => void;
  maxHeatRisk: number | null;
  setMaxHeatRisk: (value: number | null) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeQuery: string;
  setPlaceQuery: (value: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>(null);
  const [activeFilters, setActiveFilters] = useState<SpotCategory[]>([...ALL_CATEGORIES]);
  const [searchRadius, setSearchRadius] = useState(1000);
  const [sortBy, setSortBy] = useState<'distance' | 'heatRisk' | 'name'>('distance');
  const [arrondissement, setArrondissement] = useState<string | null>(null);
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [maxHeatRisk, setMaxHeatRisk] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');

  const toggleFilter = (category: SpotCategory) => {
    setActiveFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  return (
    <AppContext.Provider
      value={{
        userLocation,
        setUserLocation,
        locationMode,
        setLocationMode,
        activeFilters,
        setActiveFilters,
        toggleFilter,
        searchRadius,
        setSearchRadius,
        sortBy,
        setSortBy,
        arrondissement,
        setArrondissement,
        isFree,
        setIsFree,
        maxHeatRisk,
        setMaxHeatRisk,
        searchQuery,
        setSearchQuery,
        placeQuery,
        setPlaceQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
