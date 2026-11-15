<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 2: core app, "Compare" view (model: Sonnet, effort medium; start in plan mode)

Goal: a farmer-friendly page that compares the four dry-season options for the user's field
and priorities, with honest "why" cards. Deploy-ready by the end of this phase.

Read first (and only): `frontend/src/engine/engine.js` exports list (grep `^export`),
`frontend/src/engine/params.js` (skim), `frontend/src/engine/content.js` (skim),
and the `meta` + `scenarios` keys of `climate.json` via a Node one-liner. Don't modify engine files.

## Engine API you will use
- `evaluate({ climate, scenarioId, situationId, soilId, waterMode, plantingId, rainPct, tempDelta, weights, overrides })`
  returns `{ ranked, rainSource, planting, ctx }`. Each ranked item has: `id, crop, rank, blocked,
  fallow, final (0-100 or null), scores {drought, soil, cover, income, labor, forage},
  contributions, start, end, etc, peff, storedWater, pctMet, deficit, irrigationMm, yieldLoss,
  gross, irrigationCost, net, laborMd, coverFrac, hotFlowerDays, heatFlag, overlapsWetSeason`.
- `uncertainty(inputs, { draws: 300, currentId })` -> `{ topShare, beatsCurrentShare }` (about 15 ms).
- `buildWhyCard(result, { waterMode, scenarioLabel, rainSource, soilLabel, rankCount })` from
  `content.js` -> `{ why, evidence[], benefits[], gaps[], risks[], validate[], pest }`.
- Constants: `CRITERIA`, `DEFAULT_WEIGHTS`, `PLANTING_OPTIONS`, `SCENARIO_IDS`, `formatPhp`;
  from params: `CROPS`, `SOILS`, `FIELD_SITUATIONS`, `STATUS_LABELS`, `ROTATION_IDS`, `DEFAULT_CURRENT`.
- `overrides` shape: `{ [rotationId]: { yieldKgHa?, pricePhpKg?, costPhpHa?, laborMdHa? } }`.

## State (one `useReducer` or a few `useState` in App, persisted to localStorage in try/catch)
scenarioId 'typical' | situationId 'after_wet_rice' | soilId 'loam' | waterMode 'rainfed' |
plantingId null (= situation default) | currentId DEFAULT_CURRENT | weights DEFAULT_WEIGHTS |
overrides {} | laborCap 40 | rainPct 0 | tempDelta 0. Recompute with `useMemo`.

## Layout (mobile-first, works at 360 px; two columns from `lg`)
1. Header: "Field Shift" + "San Mateo, Isabela, Philippines" + one line: "Compare dry-season
   options after rice using NASA climate data, crop science and your priorities."
2. Persistent notice (amber, role="note"): "Decision support only. This tool highlights
   patterns in past NASA data to support, not replace, your judgement and local experts."
3. Data banners (only when true): placeholder data (red); IMERG not used, rainfall from NASA
   POWER (blue, show `meta.sources` status); strong El Nino context line: "PAGASA (5 Nov 2026):
   a very strong El Nino is under way, with impacts likely into mid-2027" (cite in Data tab).
4. Step 1 "Your field": field situation (radio cards from FIELD_SITUATIONS with hint), soil
   (loam/clay), water access (rainfed / can irrigate), planting date (select; default from
   situation, show "default" tag), current rotation (select, label "Your current rotation:
   assumed, please confirm"), labour available (man-days/ha number input).
5. Step 2 "Your priorities": one slider per CRITERIA item (0-100, step 5) with its hint;
   show the normalised share next to each ("27%"); "Reset" button. Use a `useNormalizedWeights`
   hook that wraps `normalizeWeights` (sum is always 100%).
6. Step 3 "Scenario": segmented control over SCENARIO_IDS using `climate.scenarios[id].label`,
   plus the line "Scenarios summarise past seasons; they are not forecasts."
7. Results: ranked cards (`RotationCard`), blocked last. Each card shows:
   rank badge; name; "Your current rotation" badge when `id === currentId`; final score bar
   (0-100) with the number; a stacked mini-bar of `contributions` by criterion (same colours
   as the sliders, with a text legend); key numbers row: water need met (pctMet, or "no crop"),
   net PHP/ha (`formatPhp`), labour man-days (red flag if > laborCap), heat flag, harvest date;
   uncertainty line "Top choice in X% of 300 plausible variations" and, for non-current options,
   "beats your current rotation in Y%"; blocked state shows `crop.blockReason` and no score.
   An expandable "Why this result" section renders `buildWhyCard` output as headed lists:
   Why it ranks here, Evidence, Benefits, Information gaps, Risks needing local review,
   Check locally, Pest cycle.
8. "Prices and costs" panel (collapsible): per crop, editable yield (kg/ha), price (PHP/kg),
   cost (PHP/ha) with the STATUS_LABELS badge from params and the source as a tooltip/title;
   "Reset to defaults". Edits go into `overrides`.
9. Footer: "Built for NASA Space Apps 2026. Not an official NASA product." + data credits
   (NASA POWER, GPM IMERG, NOAA ONI) + link to the Data & methods tab (Phase 3).

## Components (in `src/components/`)
`Header`, `Notice`, `DataBanners`, `FieldForm`, `PrioritySliders`, `ScenarioPicker`,
`RotationCard`, `WhyCard`, `EconomicsPanel`, `StatusBadge`, `ScoreBar`, `Footer`; hook
`src/hooks/useNormalizedWeights.js`; `src/lib/colors.js` with one colour per rotation and per
criterion (colour-blind safe, e.g. Okabe-Ito) used everywhere.

## Visual direction
Calm field-notebook look: warm stone background, white cards, deep green primary
(rice paddy), amber for cautions, red only for hard blocks. System font stack, base text
16 px, generous spacing, 44 px touch targets, visible focus rings. No external fonts, images
or icon packs; use simple inline SVG or text. Numbers use `toLocaleString('en-PH')`.

## Accessibility
Every input has a visible label; sliders have `aria-valuetext` like "Drought safety 30, 27% of
total"; colour is never the only signal (add text/icons); contrast WCAG AA; keyboard works.

## Plan mode
Present a short plan (components, state, order of work) for the human to approve. Approve
with auto mode, then build in this order: state + controls -> cards -> why cards -> economics
panel -> banners/footer.

## Done when
`npm test` and `npm run build` pass; changing any control updates the ranking instantly; heavy
clay blocks peanut; irrigating changes the El Nino results. Start `npm run dev` in the
background and ask the human to check, in a browser at phone width and desktop width: no
console errors, controls work, cards readable. Fix what they report (one round).
Update PROGRESS.md and commit "Phase 2: compare view". Then do Phase 4's deploy step early
(a working URL protects the submission), and continue with Phase 3.
