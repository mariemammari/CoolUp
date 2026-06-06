import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    return {
        value: `750${num.toString().padStart(2, '0')}`,
        label: `${num}${num === 1 ? 'er' : 'ème'}`,
    };
});

function getDisplayLabel(arr: string | null): string {
    if (!arr) return 'Tout Paris';
    const item = ARRONDISSEMENTS.find(a => a.value === arr);
    return item ? `${item.label} arr.` : 'Tout Paris';
}

export default function ArrondissementDropdown() {
    const { arrondissement, setArrondissement } = useAppContext();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border border-border bg-app_surface text-app_black hover:border-app_green transition-colors min-w-[140px]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="flex-1 text-left truncate">{getDisplayLabel(arrondissement)}</span>
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

            {open && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-border rounded-xl shadow-lg z-[9999] py-1">
                    <p className="px-3 py-2 text-xs font-semibold text-app_blue uppercase tracking-wide border-b border-border">
                        Arrondissements
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setArrondissement(null);
                            setOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${arrondissement === null ? 'bg-app_surface-2 text-app_green font-medium' : 'text-app_black hover:bg-app_surface-2'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${arrondissement === null ? 'bg-app_green' : 'bg-border'}`} />
                        Tout Paris
                    </button>

                    {ARRONDISSEMENTS.map((arr) => {
                        const active = arrondissement === arr.value;
                        return (
                            <button
                                key={arr.value}
                                type="button"
                                onClick={() => {
                                    setArrondissement(arr.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${active ? 'bg-app_surface-2 text-app_green font-medium' : 'text-app_black hover:bg-app_surface-2'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${active ? 'bg-app_green' : 'bg-border'}`} />
                                {arr.label} arr.
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
