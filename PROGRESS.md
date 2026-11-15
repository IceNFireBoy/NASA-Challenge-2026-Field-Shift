<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Has Bean Planned: progress

Team NASApusomo. NASA Space Apps 2026, challenge "Field Shift: Adapting Farms with NASA Data".
Deadline: Sun 15 Nov 2026, 23:59 Philippine time. This file was last updated at 21:15 that day.

## Where things stand right now

| Item | State |
| --- | --- |
| Live site (https://hasbeanplanned.netlify.app) | Serves `main` at commit `2baafc8`: the UX redesign, without Phase 5 |
| Branch `main` | UX redesign merged (PR 1). Tests and build pass |
| Branch `phase-5` | Pushed, **not merged**. Rename, peso sign, Filipino in both views, map, NDVI and SoilGrids code |
| SoilGrids soil data | **In `climate.json`** on `phase-5`: clay loam (32% clay, 42% sand, top 30 cm). Soil hint checked in the browser |
| MODIS NDVI data | **In `climate.json`** on `phase-5`: 552 composites, 2001-06-10 to 2025-05-25. Chart checked in the browser |
| Tests | Frontend 22 pass, pipeline 14 pass, `npm run build` OK (on `phase-5`) |

## Waiting on

- **Human decision only:** merge `phase-5` into `main`. Nothing is downloading any more.

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

### Phase 5 (branch `phase-5`, not merged)
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

## What went wrong

- **GPM IMERG never loaded.** Two attempts (full run, then `--imerg-limit 6`) hit an Earthdata
  gateway timeout; login worked. Stopped per the two-failures rule. All rainfall is NASA POWER,
  and the app says so in a banner. The "IMERG vs POWER" chart toggle is disabled.
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
- Decide on merging `phase-5`.
