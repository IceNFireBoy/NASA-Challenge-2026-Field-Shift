# Field Shift: San Mateo, Isabela (NASA Space Apps 2026)

Decision-support web app for the challenge "Field Shift: Adapting Farms with NASA Data".
It compares dry-season options after rice (fallow, mungbean, corn, peanut) for San Mateo,
Isabela, Philippines, using NASA POWER + GPM IMERG climate data, FAO crop-water science,
local soil/crop facts and the farmer's own priorities. Hard deadline: Sun 15 Nov 2026,
23:59 Philippine time (UTC+8). A deployed, honest, working app beats a fancier broken one.

## Where things are
- `pipeline/fetch_climate.py` NASA data -> `frontend/src/data/climate.json` (tested, verified)
- `pipeline/test_pipeline.py` offline tests
- `frontend/src/engine/engine.js` all maths: water balance, yield loss, scoring, Monte Carlo, replay (tested)
- `frontend/src/engine/params.js` every crop/soil/economic number with its status and source
- `frontend/src/engine/content.js` why-card text, glossary, sources
- `frontend/src/engine/engine.test.js` Vitest tests
- `frontend/src/App.jsx` + `frontend/src/components/` the UI (you build these)
- `docs/spec/` phase instructions; `PROGRESS.md` running log (keep it current)

## Commands (run from the repo root unless noted)
- Shell state does not persist between commands, so never rely on `activate`. Call the venv
  interpreter directly; below, `PY` means `.venv/bin/python` (macOS/Linux) or
  `.venv/Scripts/python.exe` (Windows). Create the venv with `python -m venv .venv`
  (Windows: `py -m venv .venv`).
- Pipeline tests: `PY -m pytest pipeline -q`
- Data: `PY pipeline/fetch_climate.py --placeholder | --skip-imerg | (no flag = POWER + IMERG)`
- Frontend (in `frontend/`): `npm install`, `npm test`, `npm run dev`, `npm run build`

## Rules
1. Do not change the maths in `engine.js` or `fetch_climate.py` unless a test fails or a spec
   tells you to. Add functions instead. After any change there, run both test suites.
2. Never invent data, citations or numbers. Every number on screen comes from `climate.json`,
   `params.js` or user input. Show the status badge (Sourced / Local source / Secondary source /
   Assumption / Illustrative) next to economic and agronomic inputs.
3. Keep the framing honest everywhere: the tool supports, not replaces, farmer and expert
   judgement; scenarios summarise past seasons and are not forecasts; NASA POWER is a gridded
   estimate, not a weather station.
4. Space Apps requires labelling SI (AI) use: put this first-line comment in every source file
   you create: `// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.`
   (use `#` in Python, `<!-- -->` in HTML/Markdown).
5. No NASA logos or insignia, no photos of people, no copyrighted images or fonts from
   unknown sources. Use plain text, Tailwind and hand-made SVG.
6. Never read or print `pipeline/.env`, `~/.netrc` or any credential.
7. Save tokens: don't `cat` big or generated files (`climate.json`, `package-lock.json`,
   `node_modules/`, `dist/`, `pipeline/cache/`); use `head`, `grep` or a short Python/Node
   one-liner. Edit files instead of rewriting them. Don't re-run the IMERG download unless asked.
8. Finish every phase by running the relevant tests and `npm run build`, updating
   `PROGRESS.md` (done / next / known issues, 15 lines max) and making a git commit.
9. If something fails twice the same way, stop, write the error and two options in
   `PROGRESS.md`, and ask the human instead of looping.
