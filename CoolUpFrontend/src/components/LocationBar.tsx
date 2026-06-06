import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import FilterPopover, { FilterButton } from './FilterPopover';
import { MapPin, Search } from 'lucide-react';
import { reverseGeocode, searchAddresses, type NominatimResult } from '../utils/geo';

type SearchTab = 'address' | 'place';

interface LocationBarProps {
  initialMode?: 'geolocation' | 'manual' | 'map';
}

export default function LocationBar({ initialMode }: LocationBarProps) {
  const {
    userLocation,
    setUserLocation,
    locationMode,
    setLocationMode,
    placeQuery,
    setPlaceQuery,
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTab, setSearchTab] = useState<SearchTab>('address');
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userLocation) {
      setAddressQuery(userLocation.address);
    }
  }, [userLocation]);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLocationMode('geolocation');

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const address = await reverseGeocode(lat, lng);
          setUserLocation({ lat, lng, address });
          setAddressQuery(address);
        } catch {
          setError('Impossible de résoudre votre adresse.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Accès à la géolocalisation refusé. Autorisez la localisation dans votre navigateur.',
          2: 'Position indisponible. Réessayez plus tard.',
          3: 'Délai de géolocalisation dépassé.',
        };
        setError(messages[err.code] ?? 'Erreur de géolocalisation.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [setUserLocation, setLocationMode]);

  useEffect(() => {
    if (initialMode === 'geolocation') {
      detectLocation();
    } else if (initialMode === 'manual') {
      setLocationMode('manual');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (initialMode === 'map') {
      setLocationMode('map');
    }
  }, [initialMode, detectLocation, setLocationMode]);

  useEffect(() => {
    if (searchTab !== 'address') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await searchAddresses(addressQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [addressQuery, searchTab]);

  const selectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setLocationMode('manual');
    setUserLocation({ lat, lng, address: result.display_name });
    setAddressQuery(result.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const inputValue = searchTab === 'address' ? addressQuery : placeQuery;
  const inputPlaceholder =
    searchTab === 'address'
      ? 'Entrer une adresse à Paris...'
      : 'Entrez le nom du lieu recherché';

  return (
    <div className="shrink-0 px-4 py-3">
      {/* Search tabs */}
      <div className="relative inline-flex items-center rounded-full bg-white p-1 mb-3">
        {/* sliding thumb */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-app_blue transition-all duration-300"
          style={{
            width: 'calc(50% - 4px)',
            left: searchTab === 'address' ? '4px' : 'calc(50%)',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        <button
          type="button"
          onClick={() => { setSearchTab('address'); setShowSuggestions(false); }}
          className={`relative z-10 flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-medium transition-colors duration-200 ${searchTab === 'address' ? 'text-white' : 'text-app_blue/60 hover:text-app_blue'
            }`}
        >
          <MapPin size={14} strokeWidth={2.2} />
          Adresse
        </button>

        <button
          type="button"
          onClick={() => { setSearchTab('place'); setShowSuggestions(false); }}
          className={`relative z-10 flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-medium transition-colors duration-200 ${searchTab === 'place' ? 'text-white' : 'text-app_blue/60 hover:text-app_blue'
            }`}
        >
          <Search size={14} strokeWidth={2.2} />
          Lieu
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 relative">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app_blue/50 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {searchTab === 'address' ? (
                <>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </>
              ) : (
                <>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </>
              )}
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                if (searchTab === 'address') {
                  setAddressQuery(e.target.value);
                  setLocationMode('manual');
                } else {
                  setPlaceQuery(e.target.value);
                }
              }}
              onFocus={() => {
                if (searchTab === 'address') {
                  setLocationMode('manual');
                  if (suggestions.length > 0) setShowSuggestions(true);
                }
              }}
              placeholder={inputPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-app_surface text-app_black text-sm shadow-sm focus:outline-none focus:shadow-md"
            />
            {searchTab === 'address' && showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li key={`${s.lat}-${s.lon}-${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-app_black hover:bg-app_surface-2 transition-colors"
                    >
                      {s.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="relative">
          <FilterButton onClick={() => setFiltersOpen((o) => !o)} />
          <FilterPopover open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={loading}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-70 ${locationMode === 'geolocation'
            ? 'bg-app_blue text-white'
            : 'bg-app_blue text-white hover:bg-app_teal hover:text-white'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="hidden sm:inline">{loading ? '...' : 'Utiliser mon adresse'}</span>
          <span className="sm:hidden">{loading ? '...' : 'Ma position'}</span>
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}
