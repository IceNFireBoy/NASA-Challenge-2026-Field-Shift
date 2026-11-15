<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 4: ship (deploy: Sonnet low effort; docs: a Haiku subagent)

## A. Deploy early (do this right after Phase 2, then redeploy after each phase)
Preferred: GitHub + Netlify.
1. Human creates a PUBLIC GitHub repo (no README/licence, to avoid conflicts) and gives you the URL.
2. You: `git remote add origin <url>`, `git branch -M main`, `git push -u origin main`.
   If the push needs a login, stop and let the human finish the browser sign-in, then retry once.
3. Human, once: Netlify > Add new site > Import from Git > pick the repo. `netlify.toml`
   already sets base `frontend`, command `npm run build`, publish `dist`, Node 22. Deploy.
4. Every later `git push` redeploys. Ask the human for the live URL and put it in README.
Fallback (no GitHub yet): `cd frontend && npm run build`, then the human drags
`frontend/dist` onto https://app.netlify.com/drop.

## B. Docs (spawn ONE background subagent with model `haiku`; give it this section's text,
`CLAUDE.md`, `PROGRESS.md` and the list of features actually built; it must not read code)
Space Apps rules: English; demo video at most 30 seconds OR at most 7 slides (including title
and intro); all links public; NASA data use stated; references listed; SI use disclosed and
SI-made content labelled; no NASA logos; no images of people under 18.

1. `README.md`: title and one-line pitch; live app link; demo link (placeholder for the human);
   the problem in San Mateo (Munggo Capital, El Nino 2026-27 context); what the tool does,
   mapped to the challenge objectives (compare 4 rotations incl. the current one; why/evidence/
   benefits/gaps/risks; bare-field periods; vulnerable months; pest-cycle notes; farmer
   priorities and constraints; uncertainty; what-if sliders; community view; plain-language
   glossary; satellite vs ground explanation); NASA data used (NASA POWER, GPM IMERG V07 with
   DOI); other data (NOAA ONI; FAO-56/FAO-33; PSA, DOST-PCAARRD, PhilRice, Manila Times facts);
   method summary; limitations (copy from the Data & methods tab); how to run and test; SI
   disclosure summary + link; licence (MIT); team; references with URLs.
2. `SI_DISCLOSURE.md`: tools used and for what (Claude in claude.ai: research, verification,
   core pipeline/engine drafting and this build kit; Claude Code: UI, docs, deployment; Gemini:
   an early literature summary used as a secondary reference; any image/video tools). State
   that every SI-generated source file starts with an `SI-ASSISTED` comment, that the team
   reviewed and tested the code, and that numbers come from cited data, not from SI.
3. `docs/PROJECT_PAGE.md`: ready-to-paste text for the Space Apps project page fields: project
   name, high-level summary (about 150 words), project details, use of NASA data, space agency
   partner and other data, references, use of SI tools. Leave `[LINK]` placeholders.
4. `docs/DEMO_SCRIPT.md`: a 28-second screen-recording script with 5 timed shots and an
   English caption line for each (problem 4 s, pick field and priorities 6 s, El Nino flips
   the answer 7 s, why card and evidence 6 s, calendar/past seasons and "supports, not
   replaces" 5 s), plus a 7-slide fallback outline.

## C. Final QA (you, Sonnet; about 10 minutes)
Run both test suites and the build. Then fill `docs/QA.md` with a table: challenge item ->
where it is in the app -> status. Items: NASA data used; local soil; crop characteristics;
farmer priorities; constraints (water, labour, market prices); 3+ strategies incl. existing;
why/evidence/benefits/gaps/risks per strategy; bare-field periods; vulnerable seasons;
pest-cycle disruption; reduce water demand; infiltration/erosion (ground cover); supplemental
income; uncertainty; where human judgement matters; plain-language terms (ET, soil moisture
anomaly, NDVI, frost, water balance); satellite vs ground data; harmonised resolution;
scenario sliders; supports-not-replaces framing; SI labelling; no NASA logos. Fix any gap
that takes under 10 minutes; list the rest honestly. Commit and push.
