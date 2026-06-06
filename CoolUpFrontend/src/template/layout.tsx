import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import TemperatureBadge from '../components/TemperatureBadge';

export default function Layout() {
  const isMapPage = useLocation().pathname === '/map';

  return (
    <div className={`${isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col text-text-primary`}>
      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 px-4 py-4 bg-app_background/90 backdrop-blur-md shadow-sm border-b border-border flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="CoolUp Logo" className="h-10 w-10 object-contain" />
          <span className="font-bold text-cool-blue text-2xl tracking-tight">
            Cool<span className="text-app_green">UP</span>
          </span>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <li>
            <Link to="/" className="text-app_black hover:text-app_green font-medium transition-colors">Accueil</Link>
          </li>
          <li>
            <Link to="/how-it-works" className="text-app_black hover:text-app_green font-medium transition-colors">Comment ça marche</Link>
          </li>
          <li>
            <Link to="/about" className="text-app_black hover:text-app_green font-medium transition-colors">À propos</Link>
          </li>
        </ul>

        <TemperatureBadge />
      </nav>

      <main className={`flex-1 flex flex-col min-h-0 ${isMapPage ? '' : 'px-4'}`}>
        <Outlet />
      </main>

      {!isMapPage && (
        <footer className="px-4 py-6 border-t border-border text-center text-sm text-app_black/60">
          <p>
            CoolUp — Îlots de fraîcheur à Paris ·{' '}
            <a
              href="https://opendata.paris.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-app_green hover:text-app_teal transition-colors"
            >
              Données Paris Open Data
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}