<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Has Bean Planned: progress

Team NASApusomo. NASA Space Apps 2026, challenge "Field Shift: Adapting Farms with NASA Data".
Deadline: Sun 15 Nov 2026, 23:59 Philippine time. This file was last updated at 21:28 that day.

## Where things stand right now

| Item | State |
| --- | --- |
| Live site (https://hasbeanplanned.netlify.app) | Serves `main` at merge commit `b752b35`: UX redesign plus Phase 5. New title and bundle confirmed at 21:15; live pages not clicked through |
| Branch `main` | UX redesign (PR 1) and Phase 5 both merged. Tests and build pass |
| Branch `phase-5` | Merged into `main` at 21:14 on the human's instruction. Branch kept on GitHub |
| SoilGrids soil data | **In `climate.json`** on `main`: clay loam (32% clay, 42% sand, top 30 cm). Soil hint checked in the browser |
| MODIS NDVI data | **In `climate.json`** on `main`: 552 composites, 2001-06-10 to 2025-05-25. Chart checked in the browser |
| Tests | Frontend 22 pass, pipeline 14 pass, `npm run build` OK (on `main` after the merge) |

## Waiting on

- **IMERG, blocked on the human (rule 9: failed twice the same way).** The new direct download
  (`--imerg-direct`) was refused twice with `HTTP 401 from urs.earthdata.nasa.gov`, first with
  one login path and then after trying every configured method (token and netrc). The listing
  for one year never loaded, so no file name pattern was learned and no month was fetched.
  `climate.json` was not touched. Two ways forward:
  1. **Giovanni CSV (no login needed from the pipeline).** In a browser, sign in at
     https://giovanni.gsfc.nasa.gov, plot "Time Series, Area-Averaged" of GPM_3IMERGM v07
     precipitation for 2001-12 to 2025-05 over box `121.48,16.78,121.68,16.98`, download the
     CSV, save it as `pipeline/cache/imerg_giovanni.csv`, then run
     `PY pipeline/fetch_climate.py --imerg-csv pipeline/cache/imerg_giovanni.csv`.
  2. **Fix the Earthdata login.** Generate a fresh token at https://urs.earthdata.nasa.gov
     (tokens expire after 60 days), put it in `pipeline/.env`, and approve the application
     "NASA GESDISC DATA ARCHIVE" under Applications > Authorized Apps. Then run
     `PY pipeline/fetch_climate.py --imerg-direct --imerg-limit 2` to test.
- After either works: sanity checks (10 to 400 mm per month, IMERG vs POWER typical totals
  within about 40%), confirm `soilgrids` and `ndvi` survive, browser check of the IMERG banner
  and the "IMERG vs POWER" toggle, then the 3B-MONTH DOI fix in README and PROJECT_PAGE.

## Done

### Phases 0 to 4 (before the redesign)
- Phase 0: kit extracted, venv (Python 3.13), placeholder data.
- Phase 1: real NASA POWER data committed (`data_status=real`, `precip_source=power`).
- Phase 2: Compare view (field form, priority sliders, scenarios, ranked cards, why-cards,
  editable prices and costs, banners, footer).
- Phase 3: what-if sliders, Season calendar, Past seasons, uncertainty panel, Community tab,
  Data & methods tab.
- Phase 4: README, SI_DISCLOSURE, docs/PROJECT_PAGE, docs/DEMO_SCRIPT, docs/QA, MIT LICENSE,
  Netlify deploy from GitHub `main`.

### UX redesign (merged to `main`, live)
- **Farmer view (default):** welcome screen, five picture-card questions (last harvest, water,
  soil, up to 2 priorities, El Niño), 1.5 s skippable loading screen with counts read from the
  data, one answer card with three plain reasons and a water / soil / income / work
  traffic-light row, "what if it rains less?" slider, "Try a dry year", "Change my answers",
  expandable other options and why-card, English / Filipino toggle.
- **Analytics and Community view** (first called "Expert"; renamed so the label does not put
  farmers below experts): the previous tabs, sharing every setting with the Farmer view.
- **Plan together** (was Community): cooperative calculator kept; "Farmer Q&A (coming soon)"
  with three SAMPLE questions answered from the app's glossary. No agriculture-office link:
  one web search found no official San Mateo contact page.
- **Readability:** 18 px base text in both views, pill tabs, rounded cards, no text under
  about 14 px outside charts, dark left-rule callouts instead of coloured boxes, decorative
  and warning emoji removed, plain ranking cards.
- **Charts:** Past seasons rebuilt with Recharts 2.15.4 (rainfall / heat toggle, tooltips,
  clickable replay heatmap with a season detail panel, monthly rain vs demand). Season
  calendar rebuilt as an interactive timeline (pick a month or a row for details). The chart
  code is lazy-loaded so the Farmer view's first load stays near 85 kB gzipped.
- **Motion:** CSS only, 140 to 250 ms, transform and opacity, off under reduced motion.
  Guidance taken from the emilkowalski skills (`animate`, `emil-design-eng`, `mobile-native`,
  `pick-ui-library`); the skill files are installed locally and git-ignored.
- **New code:** `frontend/src/lib/farmer.js` (answer mapping, traffic lights, plain reasons),
  `i18n.js` (Farmer strings), `state.js` (reducer, saved-settings guard), `farmer.test.js`,
  `components/farmer/*`, `NumField.jsx`.
- **Assumptions added** (listed in Data & methods with an Assumption badge): a picked priority
  gets weight 40 and the rest 5; traffic-light cut-offs (water 80% / 50%, soil tier 70 / 40,
  income above / at / below zero, work 75% / 100% of the labour limit).

### Bugs found and fixed in the redesign
- Compare panel was shown under every tab (`hidden` attribute lost to Tailwind's `grid`).
- Harvest date read "Jun 45" for an Apr 1 planting of corn or peanut (`content.js`
  `dateOfDay`; one-line fix approved by the human, with a test).
- Footer said the Data tab was "coming in Phase 3".
- Season calendar legend was clipped and crop labels were white on orange and green.
- Price fields snapped back when cleared; edited values were badged "Assumption" (now "Your value").
- Number inputs showed "05" after clearing.
- A crop picked in Plan together stayed selected after the soil setting blocked it.
- Past seasons had "24 seasons" and "2001 to 2024" hard-coded and drew two identical bars on
  the typical scenario.
- A stale saved setting in localStorage could crash the app to a white screen.
- Scenario radio group had no arrow-key support. No favicon.

### Phase 5 (merged to `main`, live)
- App and docs renamed "Has Bean Planned"; team and contact email filled in; source-code link set.
- "PHP" replaced by the peso sign across the app. This touched `engine.js` (money formatter
  and one hint) and `params.js` (source notes); no maths changed.
- Stretch 1, Filipino labels: language toggle now in both views. Analytics and Community has
  Filipino main labels (`frontend/src/lib/lang.jsx`); details, sources, why-cards and chart
  captions stay English, and the notice says so. No Ilocano.
- Stretch 2, map: Leaflet 1.9.4 + OpenStreetMap in Data & methods with the point, one NASA
  POWER cell and one IMERG cell, attribution shown. Boxes are centred on the point to show
  cell size, not the true grid position (the caption says so). Checked in the browser.
- Stretch 4, SoilGrids: done. `pipeline/fetch_extras.py` added a `soilgrids` block (new key
  only; existing keys verified unchanged). A hint under the Soil dropdown says the global map
  suggests clay loam; it never changes the setting.
- Stretch 3, NDVI: done. `ndvi` block added (new key only; existing keys verified unchanged).
  Past seasons has a chart with a typical-year view (least green in Nov at 0.44, greenest in
  Aug at 0.59) and an each-dry-season view. The crop model does not use NDVI.

### IMERG groundwork (branch `phase-5`, not merged, 21:28)
- `fetch_climate.py --imerg-csv PATH` (+ optional `--imerg-units`): reads a Giovanni
  area-averaged time-series CSV, skips the comment lines and fill values, converts with the
  existing unit table and plausibility check, and returns the same monthly series as the
  earthaccess path. Refuses to guess if the file does not state its units.
- `fetch_climate.py --imerg-direct`: HTTPS download from GES DISC with `requests`, file names
  read from each year's directory listing, per-month append to `pipeline/cache/imerg_monthly.csv`,
  resume from cache, 60 s timeout, 3 retries with backoff, tries token, then
  username/password, then netrc. Written and unit-tested for the listing parser; **not yet
  proven against the real server** because the login is refused.
- `climate.json` rewrite now keeps top-level keys the script does not produce (`soilgrids`,
  `ndvi`), so re-running the climate fetch no longer wipes the Phase 5 blocks.
- Pipeline tests 14 -> 18 (CSV parsing, unit refusal, listing parser, key carry-over).
  No maths changed.

## MODIS NDVI in detail (Phase 5, stretch 3)

### What it is
- MODIS is an instrument on NASA's Terra satellite. Product **MOD13Q1 v061** gives NDVI
  (a 0 to 1 greenness index: near 0 is bare soil, higher is denser green plants) for 250 m
  pixels, as the best value in each 16-day window ("composite").
- We use one pixel, the one containing the San Mateo town-centre point (16.88, 121.58), from
  the ORNL DAAC MODIS/VIIRS subsetting web service (`https://modis.ornl.gov/rst/api/v1/`).

### What it is for
- It is the only **observed** land-surface data in the app. NASA POWER and the crop model
  estimate weather and water; NDVI shows what the ground actually looked like from space.
- It answers "when is this land green and when is it bare?" independently of our model, which
  speaks to the challenge's bare-field and vegetation-stress objectives.
- It is a cross-check and a teaching aid only. **The crop model, the ranking, the Farmer view
  answer and the traffic lights do not use NDVI.** No score changed because of it.

### What changed
- `pipeline/fetch_extras.py` (new): downloads the NDVI band `250m_16_days_NDVI`, 10 dates per
  request (the service's limit), 56 requests in all; drops fill values; saves each finished
  request to `pipeline/cache/ndvi_partial.json` so a restart resumes; writes the full series to
  `pipeline/cache/ndvi_mod13q1.json` (cache is git-ignored). The same script fetches SoilGrids.
- `frontend/src/data/climate.json`: one new top-level key, `ndvi`. The four existing keys
  (`meta`, `seasons`, `scenarios`, `trend`) were compared before and after and are unchanged.
  The block holds: `product`, `source`, `url`, `citation`, `accessed`, `note`,
  `monthly_mean` (12 rows, June to May: mean NDVI and how many composites went into it),
  `season_mean` (24 rows: mean December to May NDVI per season), `n_composites`,
  `first_date`, `last_date`.
- `frontend/src/components/PastSeasons.jsx`: new "Vegetation greenness from satellite (NDVI)"
  card at the bottom of Past seasons, with a "Typical year" / "Each dry season" switch,
  tooltips, a sentence naming the least and most green month, and the product, date range
  and caveats. It renders only when the `ndvi` block exists.
- `frontend/src/components/DataMethods.jsx`: the map card lists the MOD13Q1 citation, access
  date and note, read from the block.
- `pipeline/test_pipeline.py`: one new test covering the NDVI summary and the soil-texture
  classifier (pipeline tests 13 -> 14).
- `fetch_climate.py` and the engine maths were not touched.

### What the data shows
- 552 composites, 2001-06-10 to 2025-05-25, fetched 15 Nov 2026.
- Typical year, mean NDVI by month: Jun 0.50, Jul 0.53, Aug 0.59, Sep 0.51, Oct 0.46,
  Nov 0.44, Dec 0.45, Jan 0.54, Feb 0.51, Mar 0.45, Apr 0.48, May 0.50.
- Two green peaks (August and January) and two dips (October to December, and March). That
  pattern is what two crops a year would look like, with the dips at harvest and land
  preparation. This is our reading of the curve, not something the data states.
- Dry-season (Dec to May) means range from 0.40 (2020-21) to 0.57 (2012-13).

### Limits to state if asked
- One 250 m pixel at the town centre. It can include buildings, roads and trees, so it is
  not a clean rice-field signal and not any one farmer's field.
- No cloud or quality screening beyond the 16-day composite: the reliability band was not
  downloaded. The lowest season, 2020-21, is also the wettest season in our rainfall record,
  so cloud is a likely cause of that low value rather than bare fields.
- October has 30 composites and November 42, against 48 for other months, because of how the
  16-day windows fall; those two means rest on less data.
- Monthly means average all 24 years, so they hide year-to-year change.
- The glossary entry for NDVI in `frontend/src/engine/content.js` was reworded (text only, with
  the human's OK) to say the app shows MODIS NDVI but the model and rankings do not use it.

### How to re-run
- `PY pipeline/fetch_extras.py` reuses the cache and rewrites the two optional blocks.
  `--offline` never touches the network. Delete `pipeline/cache/ndvi_*.json` to force a fresh
  download; allow about 25 to 75 minutes, since the service took 25 to 80 seconds per request.

## What went wrong

- **GPM IMERG never loaded.** Two attempts (full run, then `--imerg-limit 6`) hit an Earthdata
  gateway timeout; login worked. Stopped per the two-failures rule. All rainfall is NASA POWER,
  and the app says so in a banner. The "IMERG vs POWER" chart toggle is disabled.
- **IMERG direct download refused (401) twice.** See "Waiting on". The earlier earthaccess
  runs reported "login OK" but earthaccess does not check a token against the data server,
  so the token may have been invalid all along.
- **Second NDVI download timed out.** After 3 of 56 requests the MODIS server stopped accepting
  connections (WinError 10060). Those 3 were saved; the third run resumed from them and finished at about 21:10.
- **First NDVI download was lost.** It ran in the background, the session ended before it
  finished, and the script only saved at the very end, so nothing was kept. The script now
  saves after every request and resumes, and fetches SoilGrids first.
- **Stretch 5 (rice-then-rice option) not built.** No sourced drought-sensitivity, yield or
  cost figures for dry-season rice, and the model has no term for paddy seepage, so it would
  have ranked on invented numbers.
- **Netlify preview never confirmed.** No Netlify check appeared on PR 1; the redesign was
  merged on the human's instruction and verified on the live site instead.
- **Skills were not installed when first asked.** The emilkowalski pack was installed during
  the redesign; `review-animations` and `break-ui` were never run as separate passes.

## Not verified

- Reduced-motion behaviour is coded but was never emulated in a browser.
- Chart tooltips were not hover-tested; the heatmap, toggles and calendar were clicked through.
- All Filipino text (Farmer view in `i18n.js`, analytics in `lang.jsx`) is SI-drafted and has
  had no native-speaker review.
- Not tested on a real phone, only at 360, 375 and 1280 px in a desktop browser.
- NDVI data has no cloud or quality screening beyond the 16-day composite, and it is one
  250 m pixel at the town centre, which may include buildings and roads rather than a rice field.

## Known issues

- Node v26 and Python 3.13 are outside the spec's version ranges; everything works so far.
- Economics are illustrative until local prices and costs are entered.
- The PAGASA El Niño banner and its source link in `content.js` were not re-checked.
- `docs/DEMO_SCRIPT.md` was written for the old Compare-first layout and "Field Shift" voice-over.
- OpenStreetMap tiles load from the public tile server at view time; the map is blank offline.

## Human to do before submitting

- Demo video link: `[DEMO_LINK]` (README, DEMO_SCRIPT) and `[LINK]` (PROJECT_PAGE).
- `SI_DISCLOSURE.md`: `[TEAM TO CONFIRM how claims ... were checked]` for the Gemini summary.
- README references still open: PSA, DOST-PCAARRD, PhilRice, Manila Times
  (`[ADD SPECIFIC ...]`), same four on PROJECT_PAGE.
- README line 111 says `[ADD LICENSE FILE TO REPOSITORY]`; the LICENSE file exists, so delete the tag.
- IMERG DOI: README and PROJECT_PAGE cite `3B-HH` marked `[VERIFY]`; the app uses `3B-MONTH`.
- Native read of the Filipino labels.
