Status: complete

## Overview
Standalone Leaflet.js map viewer for London building footprints exported from
OS MasterMap (GeoJSON, EPSG:4326/CRS84). No backend or build step; building
data is fetched at runtime from a static GeoJSON file, the same way it would
work when hosted on GitHub Pages.

## Files
- `index.html` — page shell, Leaflet CSS/JS from cdnjs, Inter font, loading/
  error indicators, floating toggle + legend panel containers (hidden until
  data loads successfully).
- `style.css` — full-viewport map, glassy floating panel styling, popup
  styles, loading/error indicator styling, responsive tweaks.
- `data/buildings.geojson` — the building footprint data as a standalone
  static GeoJSON file (currently the 3-feature trimmed sample). Replace this
  single file with a full export to update the map — no code changes needed.
- `data.js` — unused placeholder, kept only for reference; safe to delete.
- `app.js` — fetches `data/buildings.geojson` on load, shows a loading
  message while the request is in flight and a visible error message if it
  fails (bad path, missing file, invalid JSON). Once loaded: Leaflet map
  init, fits bounds to data extent, CARTO Positron ("light_all") tile layer,
  two coloring modes (by `buildinguse_oslandusetiera` category and by
  `height_absolutemax_m` gradient), hover highlight, click popups with
  use/floors/area/height/connectivity, dynamic legend that updates per mode,
  toggle buttons wired to instant client-side re-styling (`layer.setStyle`,
  no reload).

## Running locally
`fetch()` of a local file requires `http://`, not `file://`, so open this
project through a simple static server rather than double-clicking
`index.html`. From the project directory, run one of:
- `npx serve .`
- `python3 -m http.server`
Then open the printed `http://localhost:...` URL in your browser.

## Deploying to GitHub Pages
1. Push this project directory to a GitHub repository (root of the repo, or
   a `/docs` folder).
2. In the repo settings, enable GitHub Pages pointing at that root or `/docs`
   folder on the branch you pushed.
3. No code changes are needed — `app.js` fetches `data/buildings.geojson`
   using a relative path, which resolves correctly under the Pages URL.

## Replacing the sample data
Overwrite `data/buildings.geojson` with your full export. It must be valid
GeoJSON in EPSG:4326/CRS84 with the same property names used by the sample:
`fid`, `osid`, `geometry_area_m2`, `buildinguse`, `buildinguse_oslandusetiera`,
`numberoffloors`, `height_absolutemin_m`, `height_absoluteroofbase_m`,
`height_absolutemax_m`, `connectivity`. Bounds, coloring, and the legend are
all computed generically from whatever features are present, so no other
file needs to change.

## Design decisions
- Basemap: CARTO Positron (`light_all`) raster tiles via cdnjs-hosted Leaflet,
  required `?key=` query param included per hosting requirements.
- "By Use" palette: fixed color per known tier (Residential Accommodation,
  Commercial Activity, Mixed Use) with an "Other" fallback bucket + gray
  default for missing values — legend only lists categories actually present
  in the data.
- "By Height" gradient: 5-stop cool→warm ramp (blue → teal → green-yellow →
  amber → red), min/max computed dynamically from `height_absolutemax_m`
  across all loaded features (not hardcoded), so it scales correctly with a
  larger dataset.
- Popups pull `buildinguse`, `buildinguse_oslandusetiera`, `numberoffloors`,
  `geometry_area_m2` (labeled m²), `height_absolutemax_m` (labeled m), and
  `connectivity`, with an "N/A" fallback for missing fields.
- All map logic works generically over the fetched FeatureCollection's
  `features` — no hardcoded assumption of exactly 3 buildings.

## Libraries / CDNs
- Leaflet 1.9.4 (cdnjs.cloudflare.com)
- Google Fonts: Inter
- CARTO Positron raster tiles (basemaps.cartocdn.com) with required API key

## Editing notes
- To load the full dataset: replace `data/buildings.geojson` with the
  complete FeatureCollection export.
- To add a new use category color: add an entry to `USE_COLORS` in `app.js`;
  it will automatically appear in the legend if present in the data.
- To adjust the height gradient stops/colors, edit `HEIGHT_STOPS` in `app.js`.

## Changelog (most recent first)
- Switched data loading from embedded `data.js` array to `fetch()` of
  `data/buildings.geojson` at runtime, added loading/error UI states, added
  `.gitignore`, updated README with local-server and GitHub Pages
  instructions.
