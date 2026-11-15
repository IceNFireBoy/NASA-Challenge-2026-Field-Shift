<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 3: insight views (model: Sonnet, effort medium; auto mode)

Goal: cover the rest of the challenge brief: bare-field periods, vulnerable seasons, past
seasons, uncertainty, what-if sliders, community planning, plain-language science and sources.
Add a tab bar under the results header: Compare | Season calendar | Past seasons | Community |
Data & methods (horizontal scroll on phones, `role="tablist"`, arrow-key support).
Keep all charts hand-made SVG (no chart library), each with a title, axis labels, a legend
and a one-sentence text summary underneath for screen readers.

Work in this priority order and commit after each item, so a cut-off still ships:

## 1. What-if sliders (in Compare, under Scenario)
"Rainfall change" -50% to +20% (step 10, maps to `rainPct`) and "Warmer by" 0 to +3 C (step
0.5, maps to `tempDelta`). Note under them: "Warming raises crop water use (ET0); it does not
recount hot days."

## 2. Season calendar tab (bare fields + vulnerable months)
A 12-month strip per rotation from Jun to May: Jun-Nov "Wet-season rice (typical, assumed)";
for `after_dry_rice` also show "Dry-season rice" from Dec to the planting date; the dry-season
crop from `start` to `end` (convert days from Dec 1 with `dateOfDay` in content.js); every other
month "Bare field". Above the strips, mark vulnerable months from
`monthlyStress(scenarioMonthly, { rainPct, tempDelta })`: water stress (effective rain under half
of a full-cover crop's need) and heat (5+ days at 35 C or hotter). Text summary: e.g. "Fallow
leaves the field bare for about 6 months; mungbean covers it for 70 days."

## 3. Past seasons tab (long-term trends + replay)
a) Bar chart of Dec-May rainfall per season from `climate.trend.series` (24 bars), El Nino
seasons outlined, with the trend line and the slope label `trend.rain_mm_per_decade` mm per
decade; a second small line for mean Tmax with `tmax_c_per_decade`. Caption: rainfall source
(IMERG or POWER) and "a trend over 24 seasons is indicative, not conclusive".
b) Replay heatmap from `replaySeasons(inputs)`: rows = rotations, columns = seasons, cell colour
= share of water need met (red <50%, amber 50-80%, green >80%; fallow shows "no crop"), toggle
to show net PHP/ha sign instead; El Nino columns labelled. Summary line: "Mungbean met at
least 80% of its water need in N of 24 past seasons."
c) Scenario comparison chart: monthly rain (typical vs selected scenario) as paired bars with
ET0 as a line; a toggle compares IMERG vs POWER rainfall for the typical year with the caption
"Satellite-gauge (IMERG) vs model reanalysis (POWER): why combining sources matters".

## 4. Uncertainty panel (in Compare, above the cards)
Horizontal bars of `topShare` for each option from `uncertainty(...)`, with: "We re-ran the
comparison 300 times, varying yields, prices, costs, crop durations, water-use factors,
starting soil water and your weights within plausible ranges." If the top option wins less
than 60% of runs, show "Close call: local judgement matters most here."

## 5. Community tab (illustrative)
Tag at top: "Illustrative scenario, not an LGU plan." Inputs: hectares in the cooperative
(default 1,000, labelled illustrative), share adopting (default 60%), crop (default = current
top-ranked option, changeable). Outputs: seed needed (`seedDemandKg` with the crop's
`seedRateKgHa`, badge Illustrative), total labour (man-days), extra water if irrigating
(`irrigationMm` x ha x 10 = m3). Coordination prompt from
`firstDeficitMonth(scenarioRain, typicalRain)` (use `pickRain` on both scenarios):
"In this scenario, rainfall falls below half of normal from {month}. Agree on water sharing
and planting dates with the irrigators' association and the Municipal Agriculture Office
before then." If -1: "No month falls below half of normal in this scenario; this does not
rule out dry spells." List who to involve: Municipal Agriculture Office (San Mateo), PhilRice
Isabela (Malasin, San Mateo), Philippine Mungbean Center (ISU San Mateo), the irrigators'
association. Planting synchronisation note: neighbouring fields planting the same crop within
the same 2 weeks eases pest and water management (general practice; verify locally).

## 6. Data & methods tab
- Sources: render `climate.meta.sources` (name, status, url, citation, resolution note) and
  `SOURCES` from content.js; ENSO rule from `meta.enso`.
- Method in plain words, 6-8 bullets: Hargreaves ET0 from NASA POWER temperatures; FAO-56 crop
  coefficients; USDA-SCS effective rainfall; stored soil water = FAO-56 available water x root
  depth x starting fraction scaled by NASA root-zone wetness; FAO-33 yield response; weighted
  scoring with your priorities; Monte Carlo for uncertainty.
- "Harmonising data": everything is resampled to one point and a monthly time step; POWER cells
  are about 50 km, IMERG cells about 11 km, so field-scale differences are not captured.
- Parameter table built from `CROPS`, `SOILS`, `FIELD_SITUATIONS`, `IRRIGATION` with value,
  range, status badge and source/note.
- "Why rules and statistics, not an SI (AI) model": transparent, checkable by farmers and
  extension workers, works with small local data; SI was used only as a coding assistant.
- Glossary (`GLOSSARY`) and "How rotations build soil health" (`SOIL_HEALTH_PRIMER`).
- Limitations list: one point; past seasons are not forecasts; illustrative economics; no
  pest or disease model; no groundwater or capillary rise; no field validation yet.

Done when: tests and build pass, every tab works on a phone width, and PROGRESS.md is updated.
Commit "Phase 3: insight views" and redeploy.
