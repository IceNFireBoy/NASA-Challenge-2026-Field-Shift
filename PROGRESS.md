<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Field Shift: progress

## Done
- Phase 0: kit extracted, venv (Python 3.13), placeholder data.
- Phase 1 Step 1: real NASA POWER data committed (`data_status=real`, `precip_source=power`).
- Phase 2: Compare view (field form, priority sliders, scenarios, ranked cards, why cards,
  editable prices/costs, banners, footer). Engine tests 14 passed; `npm run build` OK.

- Phase 3.1: what-if sliders (rainfall change, warmer by). Irrigation card shows pumped mm; Reset all settings button.
- Phase 3.2: tab bar + Season calendar (bare fields, vulnerable months).
- Phase 3.3: Past seasons tab (trend charts, replay heatmap, monthly rain vs ET0; IMERG-vs-POWER toggle disabled since no IMERG data).
- Phase 3.4: uncertainty panel above the cards (close-call note under 60%).
- Phase 3.5: Community tab (illustrative: seed, labour, extra water, coordination prompt, who to involve).
- Docs (haiku subagent): README, SI_DISCLOSURE, docs/PROJECT_PAGE, docs/DEMO_SCRIPT drafted; placeholders [LIVE_URL] [DEMO_LINK] [LINK] [TEAM...] left; IMERG DOI marked [VERIFY]; LICENSE file still missing.
- Deployed: pushed to GitHub (main). Netlify import is a human step.

## Next
- Human check of the dev server at phone and desktop width; one round of fixes.
- Phase 4 deploy step early, then Phase 3 (Data & methods tab).
- IMERG (optional): retry only if the human asks.

## Known issues
- GPM IMERG failed twice (full run, then `--imerg-limit 6`) with an Earthdata Launchpad
  gateway timeout (login itself OK). Stopped retrying per instruction; rainfall is NASA POWER.
  Cutoff for further attempts was 20:00. Reverted climate.json to the committed POWER version.
- Node v26 / Python 3.14 default are outside spec ranges; everything works so far.
- Plain Phase 2 gaps: user-edited prices show an "Assumption" badge; no rainPct/tempDelta controls yet.
