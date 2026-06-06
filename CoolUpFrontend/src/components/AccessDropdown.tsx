import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';

function getDisplayLabel(isFree: boolean | null): string {
    if (isFree === null) return 'Tous les accès';
    if (isFree) return 'Gratuit';
    return 'Payant';
}

export default function AccessDropdown() {
    const { isFree, setIsFree } = useAppContext();
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

    const options = [
        { value: null, label: 'Tous les accès', icon: '🔓' },
        { value: true, label: 'Gratuit', icon: '💚' },
        { value: false, label: 'Payant', icon: '💳' },
    ];

    return (
        <div ref={dropdownRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border border-border bg-app_surface text-app_black hover:border-app_green transition-colors min-w-[140px]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9m4.6-4.6l-6.5 6.5" />
                </svg>
                <span className="flex-1 text-left truncate">{getDisplayLabel(isFree)}</span>
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
                        Accès
                    </p>

                    {options.map((option) => {
                        const active = isFree === option.value;
                        return (
                            <button
                                key={option.value === null ? 'all' : option.value.toString()}
                                type="button"
                                onClick={() => {
                                    setIsFree(option.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${active ? 'bg-app_surface-2 text-app_green font-medium' : 'text-app_black hover:bg-app_surface-2'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${active ? 'bg-app_green' : 'bg-border'}`} />
                                <span>{option.icon}</span>
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
