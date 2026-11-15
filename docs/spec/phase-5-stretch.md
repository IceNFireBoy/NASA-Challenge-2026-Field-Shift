<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 5: stretch goals (only if Phases 0-4 are done and deployed)

Pick in this order; time-box each to 30 minutes; if it fails, revert and move on.
These endpoints were NOT verified by us; test them before building UI around them.

1. Filipino/Ilocano labels toggle for the main controls and card headings (no data risk).
   Keep English as the default (submission language rule).
2. Small map (Data & methods tab): Leaflet + OpenStreetMap tiles (attribution
   "(c) OpenStreetMap contributors" is required) showing the San Mateo point, a 0.1 deg box
   (IMERG cells) and a 0.5 x 0.625 deg box (POWER cell) to explain resolution.
3. MODIS NDVI for the point (vegetation stress, observed bare periods): ORNL DAAC MODIS/VIIRS
   subsetting web service (`https://modis.ornl.gov/rst/api/v1/`), product MOD13Q1, small
   requests (it limits dates per call), cached to `pipeline/cache/`. Add as an optional
   `ndvi` block in climate.json (new keys only; do not change existing keys) and a chart in
   Past seasons. Cite: Didan, K. MOD13Q1 v061, NASA LP DAAC.
4. Soil texture from SoilGrids (ISRIC, CC-BY 4.0) REST API at the point to suggest a default
   soil option ("global soil map suggests clay loam; confirm for your field").
5. A fifth option "Rice, then dry-season rice" for irrigated fields (blocked when rainfed).
   Needs rice crop parameters with sources; add tests before UI.
