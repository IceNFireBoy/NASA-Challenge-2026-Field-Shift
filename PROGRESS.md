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
- Phase 3.6: Data & methods tab (sources, method, parameter table with badges, glossary, limitations). Phase 3 complete.
- Docs (haiku subagent): README, SI_DISCLOSURE, docs/PROJECT_PAGE, docs/DEMO_SCRIPT drafted; placeholders [DEMO_LINK] [LINK] [TEAM...] left; IMERG DOI marked [VERIFY].
- Deployed: https://hasbeanplanned.netlify.app (Netlify from GitHub main). LICENSE (MIT) and docs/QA.md added.
- UX redesign (branch `ux-redesign`, not merged): Farmer view is the default (welcome, 5 picture-card questions, loading, one answer card with reasons + traffic lights, rain slider, "Try a dry year", English/Filipino); Expert toggle keeps the old tabs; settings shared. Community tab is now "Plan together" with 3 SAMPLE Q&A from the glossary (no MAO link: no official contact page found). CSS-only motion (<= 250 ms, off under reduced motion). New `src/lib/{farmer,i18n,state}.js` + tests (22 pass); build OK; checked at 360, 375 and 1280 px.
- Bugs fixed: Compare panel leaked under every tab; `dateOfDay` "Jun 45" (content.js, approved); stale footer text; calendar legend clipped + low-contrast labels; price fields could not be cleared, now badged "Your value"; "05" number inputs; blocked crop stayed picked in Plan together; hard-coded "24 seasons"; duplicate typical bars; unsafe saved settings; scenario radio keys; favicon.
- Analytics pass: "Expert" renamed "Analytics and Community"; 18 px base, card/pill-tab restyle and no text under ~14 px in that view; Past seasons charts rebuilt with Recharts 2.15.4 (tooltips, rainfall/heat toggle, clickable replay heatmap with season detail), lazy-loaded so the farmer bundle stays ~85 kB gzip; decorative and warning emoji removed.

## Next
- Human: review the Netlify preview on the draft PR, native check of the Filipino labels, then merge.
- Human check of the dev server at phone and desktop width; one round of fixes.
- Human: phone-width check; fill demo link, team, source-code link, verify IMERG DOI.
- IMERG (optional): retry only if the human asks.

## Known issues
- GPM IMERG failed twice (full run, then `--imerg-limit 6`) with an Earthdata Launchpad
  gateway timeout (login itself OK). Stopped retrying per instruction; rainfall is NASA POWER.
  Cutoff for further attempts was 20:00. Reverted climate.json to the committed POWER version.
- Node v26 / Python 3.14 default are outside spec ranges; everything works so far.
- Plain Phase 2 gaps: user-edited prices show an "Assumption" badge. Phone width unverified by me.
- Reduced-motion behaviour is coded (CSS + loading skip) but was not emulated in the browser. README/docs still hold [DEMO_LINK], [LINK], [TEAM...]; README cites IMERG DOI 3B-HH while the app uses 3B-MONTH.
