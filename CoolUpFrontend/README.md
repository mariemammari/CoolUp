# CoolUp

CoolUp is a React + Vite frontend that helps Parisians find cool spots during hot weather — drinking fountains, parks, shaded areas, and air-conditioned spaces.

## Features

- **Homepage** — Hero section with CTAs to launch the map
- **Map page** (`/map`) — Interactive Leaflet map with clustered markers, geolocation, address search (Nominatim), filters, and radius control
- **How it works** (`/how-it-works`) — Step-by-step guide with scroll animations
- **About** (`/about`) — Mission statement and data sources

## Tech stack

- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- react-leaflet + leaflet + react-leaflet-cluster
- NestJS backend integration (`/api/spots/nearby`) via Vite proxy

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Prerequisites (full stack)

Start the backends before using the map:

```bash
# Terminal 1 — data pipeline (FastAPI, port 8000)
cd ../data-pipeline
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000

# Terminal 2 — NestJS API (port 3000)
cd ../CoolUpBackend
npm run start:dev
```

### Install & run frontend

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. API calls go through the Vite proxy: `/api/*` → `http://localhost:3000/*`.

### Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── FilterPanel.tsx    # Category toggles, radius, sort
│   ├── LocationBar.tsx    # Geolocation & address autocomplete
│   └── MapView.tsx        # Leaflet map with clustered markers
├── context/
│   └── AppContext.tsx     # Shared state (location, filters, radius)
├── data/
│   └── spots.ts           # Category labels & API mapping
├── hooks/
│   └── useNearbySpots.ts  # Fetches spots from NestJS API
├── pages/
│   ├── home/home.tsx      # Homepage
│   ├── MapPage.tsx        # Map page
│   ├── HowItWorks.tsx     # How it works page
│   └── About.tsx          # About page
├── template/
│   └── layout.tsx         # Navbar + footer shell
└── utils/
    └── geo.ts             # Distance, geocoding helpers
```

## Map usage

1. Click **Utiliser mon adresse** to detect your GPS position
2. Click **Entrer une adresse** to search via OpenStreetMap Nominatim
3. Click **Choisir sur la carte** then click anywhere on the map to pick an address
4. Toggle categories, adjust the search radius, and enable "Trier par proximité"
5. Click a marker popup's **Itinéraire** button for walking directions

## Data sources

Spots are fetched from the NestJS API (`GET /spots/nearby`), which syncs from the data-pipeline (Paris Open Data). Geocoding uses [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/). Map tiles from [OSM](https://www.openstreetmap.org/).

| Frontend category | Backend `dataset` |
|-------------------|-------------------|
| Fontaines à boire | `fountain` |
| Parcs & jardins   | `green_space` |
| Espaces climatisés| `equipment` |
