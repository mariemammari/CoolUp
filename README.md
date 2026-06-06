# 🌿 CoolUp — Îlots de fraîcheur à Paris

> Trouvez votre îlot de fraîcheur à Paris — fontaines à boire, parcs & jardins, espaces climatisés — en quelques clics, depuis n'importe quelle adresse.

---

## 📸 Aperçu

CoolUp est une application web interactive permettant aux Parisiens de localiser rapidement les spots de fraîcheur les plus proches pendant les épisodes de forte chaleur. Elle centralise trois datasets distincts issus de Paris Open Data sur une carte Leaflet interactive, avec filtres avancés, géolocalisation, et deux modes d'affichage (liste / grille).

---

## ✨ Fonctionnalités

### 🗺️ Carte interactive
- Carte Leaflet.js centrée sur Paris
- Clustering des marqueurs (`react-leaflet-cluster`)
- Marqueurs colorés par catégorie (fontaine / parc / climatisé)
- Marker "vous êtes ici" avec animation de pulse après géolocalisation
- Popups sur chaque marker avec nom, catégorie et distance
- Slider de rayon (500 m · 1 km · 2 km · 5 km) superposé à la carte
- Couche carte de chaleur (heatmap)
- Mode "Choisir sur la carte" pour définir sa position manuellement

### 📍 Localisation dynamique
- **"Utiliser mon adresse"** : géolocalisation via `navigator.geolocation` + reverse geocoding Nominatim
- **Recherche d'adresse** : autocomplétion en temps réel via l'API Nominatim (OpenStreetMap)
- **Recherche par nom de lieu** : filtrage client-side en temps réel
- Toggle animé **Adresse / Lieu** avec sliding thumb et icônes Lucide

### 🔍 Filtres avancés
- Catégorie (Fontaine à boire / Parc & jardin / Espace climatisé)
- Arrondissement (1er → 20e)
- Type d'accès (Tous / Gratuit / PMR)
- Tri (Proximité / Risque chaleur)
- Slider de rayon de recherche
- Badge compteur de filtres actifs
- Réinitialisation en un clic

### 📋 Affichage des résultats
- **Vue liste** : cartes détaillées avec nom, adresse, tags, score chaleur, distance, bouton itinéraire
- **Vue grille** : cartes compactes 2 colonnes
- Toggle liste / grille avec icônes `LayoutList` / `LayoutGrid`
- Pagination progressive ("Afficher plus de résultats")
- Score **Risque Chaleur** (0–100) avec code couleur :
  - 🟢 0–30 : faible
  - 🟡 31–60 : modéré
  - 🔴 61–100 : élevé
- Tooltip explicatif sur le score chaleur (premier résultat)
- Badge arrondissement (`5e` avec info-bulle)
- Bouton **Itinéraire** → ouvre Google Maps directions

### 🌡️ Température en temps réel
- Température actuelle de Paris dans la navbar via [Open-Meteo API](https://open-meteo.com/) (gratuite, sans clé)
- Rafraîchissement toutes les 10 minutes

### 📄 Pages
- `/` — Page d'accueil avec illustration et statistiques
- `/map` — Carte interactive + liste/grille des spots
- `/how-it-works` — Explication du fonctionnement en 4 étapes animées
- `/about` — Mission, équipe, sources de données

---

## 🗃️ Datasets

L'application exploite **3 datasets distincts** issus de [Paris Open Data](https://opendata.paris.fr/), normalisés dans un modèle de données commun (`DisplaySpot`) :

| Dataset | Catégorie | Source |
|---|---|---|
| Fontaines à boire | `fontaine` | Paris Open Data — Fontaines à boire |
| Espaces verts & jardins | `parc` | Paris Open Data — Espaces verts |
| Espaces climatisés | `climatise` | Paris Open Data — Rafraîchissement climatisation |

### Modèle commun `DisplaySpot`

```ts
interface DisplaySpot {
  id: string;
  name: string;
  category: 'fontaine' | 'parc' | 'climatise';
  lat: number;
  lng: number;
  adresse?: string;
  arrondissement?: string;
  isFree?: boolean;
  heatRiskScore: number;
  distance: number;
}
```

---

## 🛠️ Stack technique

| Outil | Usage |
|---|---|
| React 18 + Vite | Framework frontend |
| TypeScript | Typage statique |
| Tailwind CSS v4 | Styles utilitaires + thème custom |
| React Router v6 | Routing SPA |
| Leaflet + react-leaflet | Carte interactive |
| react-leaflet-cluster | Clustering des marqueurs |
| Lucide React | Icônes |
| Nominatim (OSM) | Geocoding & reverse geocoding |
| Open-Meteo API | Température en temps réel |

---

## 🚀 Installation & lancement

### Prérequis

- **Node.js** v22.x
- **npm** v10.8.2
- **Angular CLI** n'est pas requis — projet Vite pur

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/<your-username>/coolup.git
cd coolup

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
```

L'application sera disponible sur [http://localhost:5173](http://localhost:5173)

```bash
# Build de production
npm run build

# Prévisualiser le build
npm run preview
```


## 🎨 Thème de couleurs

```css
--color-app_blue:       #103A57   /* Principal, navbar, titres */
--color-app_teal:       #307B8E   /* Accents, espaces climatisés */
--color-app_green:      #366B2B   /* Distance, parcs */
--color-app_background: #E7F3EC   /* Fond global */
--color-app_surface:    #ffffff   /* Cartes */
--color-app_surface-2:  #e2ede7   /* Fond secondaire */
--color-border:         #c4d7cd   /* Bordures */
```

---


## 👤 Auteur

Mariem Ammari — Étudiante en informatique, ESPRIT school of engineering   


---

## 📜 Licence

Données : [Licence Ouverte / Open Licence — Etalab](https://www.etalab.gouv.fr/licence-ouverte-open-licence)  
Code : MIT
