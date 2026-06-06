import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { ALL_CATEGORIES, CATEGORY_LABELS, type SpotCategory } from '../data/spots';
import CategoryIcon from './CategoryIcon';

const CATEGORY_DOT: Record<SpotCategory, string> = {
  fontaine: 'bg-app_blue',
  parc: 'bg-app_green',
  climatise: 'bg-app_teal',
};

function categoryButtonLabel(activeFilters: SpotCategory[]): string {
  if (activeFilters.length === ALL_CATEGORIES.length) return 'Toutes';
  if (activeFilters.length === 1) return CATEGORY_LABELS[activeFilters[0]];
  if (activeFilters.length === 0) return 'Aucune catégorie';
  return `${activeFilters.length} catégories`;
}

export default function CategoryDropdown() {
  const { activeFilters, setActiveFilters, toggleFilter } = useAppContext();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties | undefined>(undefined);

  const allSelected = activeFilters.length === ALL_CATEGORIES.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Position the portal menu relative to the button
  useEffect(() => {
    function updatePosition() {
      const el = dropdownRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        zIndex: 9999,
      });
    }

    if (open) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
    // clear styles when closed
    setMenuStyles(undefined);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border border-border bg-app_surface text-app_black hover:border-app_green transition-colors min-w-[140px]"
      >
        <span className="flex-1 text-left truncate">{categoryButtonLabel(activeFilters)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyles}
            className="w-56 bg-white border border-border rounded-xl shadow-lg py-1"
          >
            <p className="px-3 py-2 text-xs font-semibold text-app_blue uppercase tracking-wide border-b border-border">
              Catégories
            </p>

            <button
              type="button"
              onClick={() => {
                setActiveFilters([...ALL_CATEGORIES]);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${allSelected ? 'bg-app_surface-2 text-app_green font-medium' : 'text-app_black hover:bg-app_surface-2'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${allSelected ? 'bg-app_green' : 'bg-border'}`} />
              Toutes
            </button>

            {ALL_CATEGORIES.map((cat) => {
              const active = activeFilters.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    toggleFilter(cat);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${active ? 'bg-app_surface-2 text-app_green font-medium' : 'text-app_black hover:bg-app_surface-2'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat]}`} />
                  <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
