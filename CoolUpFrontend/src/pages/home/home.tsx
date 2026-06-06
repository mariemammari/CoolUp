import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import homeImage from '../../assets/home_image.png';
import fountainIcon from '../../assets/icons/tabler_fountain-filled.png';
import treeIcon from '../../assets/icons/ri_tree-fill.png';
import acIcon from '../../assets/icons/material-symbols_ac-unit-rounded.png';
import { useAppContext } from '../../context/AppContext';
import { reverseGeocode, searchAddresses, type NominatimResult } from '../../utils/geo';

export default function Home() {
  const navigate = useNavigate();
  const { setUserLocation, setLocationMode } = useAppContext();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddresses(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setUserLocation({ lat, lng, address: result.display_name });
    setLocationMode('manual');
    setQuery(result.display_name);
    setShowSuggestions(false);
    navigate('/map');
  };

  const handleAddressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      selectSuggestion(suggestions[0]);
    }
  };

  const detectLocation = () => {
    setGeoLoading(true);
    setLocationMode('geolocation');

    if (!navigator.geolocation) {
      setGeoLoading(false);
      navigate('/map?mode=geolocation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const address = await reverseGeocode(lat, lng);
          setUserLocation({ lat, lng, address });
        } finally {
          setGeoLoading(false);
          navigate('/map');
        }
      },
      () => {
        setGeoLoading(false);
        navigate('/map?mode=geolocation');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex w-full h-auto items-center flex-col lg:flex-row">

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center">
        <img
          src={homeImage}
          alt="Paris illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 h-3/4 flex flex-col justify-start items-start py-5 px-6 lg:px-10 gap-8">
        <div className="w-full text-start">
          <h1 className="text-4xl lg:text-6xl font-semibold text-app_blue leading-tight italic">
            Trouvez votre îlot de<br />
            fraîcheur<span className="text-app_green italic"> à Paris</span>
          </h1>
          <p className="mt-6 lg:mt-10 text-app_black italic text-lg lg:text-xl font-semibold leading-relaxed w-full">
            Fontaines, parcs et espaces ombragés dans les 20<br />
            arrondissements de Paris.
          </p>
        </div>

        {/* SEARCH BUTTONS */}
        <div className="flex items-center gap-6 w-full mt-4">
          <button
            type="button"
            onClick={detectLocation}
            disabled={geoLoading}
            className="shrink-0 flex items-center gap-3 bg-app_blue text-white px-6 py-3 rounded-full font-medium hover:bg-app_teal transition-colors disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {geoLoading ? 'Localisation...' : 'Utiliser mon adresse'}
          </button>

          <div className="h-6 w-px bg-gray-300 shrink-0" />

          <div ref={containerRef} className="relative flex-1 min-w-0">
            <div
              role="search"
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-3 border-2 border-app_blue text-app_blue px-6 py-3 rounded-full cursor-text transition-shadow focus-within:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 pointer-events-none">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleAddressKeyDown}
                placeholder="Entrer une adresse"
                className="flex-1 min-w-0 w-full bg-transparent outline-none font-medium text-app_blue placeholder:text-app_blue/60"
              />
              {searchLoading && (
                <svg className="animate-spin h-4 w-4 shrink-0 text-app_blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li key={`${s.lat}-${s.lon}-${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm text-app_black hover:bg-app_surface-2 transition-colors"
                    >
                      {s.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
 
        <div className="flex flex-col sm:flex-row items-start justify-start gap-6 sm:gap-12 mt-4 w-full">
          <div className="flex items-center gap-3">
            <img src={fountainIcon} alt="Fontaine" className="w-12 h-12" />
            <div>
              <p className="text-app_green font-bold text-xl">+1300</p>
              <p className="text-app_blue text-sm font-medium">fontaines à boire</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img src={treeIcon} alt="Arbre" className="w-12 h-12" />
            <div>
              <p className="text-app_green font-bold text-xl">+1000</p>
              <p className="text-app_blue text-sm font-medium">parcs & jardins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img src={acIcon} alt="Climatisation" className="w-12 h-12" />
            <div>
              <p className="text-app_green font-bold text-xl">+300</p>
              <p className="text-app_blue text-sm font-medium">espaces climatisés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
