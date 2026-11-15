<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 0: bootstrap (model: Sonnet, effort low; about 15 minutes)

Goal: a working repo with placeholder data, passing tests and a build, committed to git.
Do these in order. Don't read the bundled code files; they are already tested.

1. Check tools and report versions in one line: `python --version` (on Windows try `py -V`
   if `python` is missing; need 3.11-3.13), `node --version` (need 20 or 22), `npm --version`,
   `git --version`. If Python or Node is missing or too old, stop and tell the human what to install.
2. Python: create `.venv` in the repo root (`python -m venv .venv`, Windows `py -m venv .venv`).
   From now on call the venv interpreter directly (`PY` in CLAUDE.md): `PY -m pip install
   --upgrade pip`, then `PY -m pip install -r pipeline/requirements.txt`.
3. Run `PY -m pytest pipeline -q`. Expect 13 passed.
4. Run `PY pipeline/fetch_climate.py --placeholder`. Expect `data_status=placeholder`.
5. In `frontend/`: `npm install`, then `npm test` (expect 14 passed) and `npm run build`.
6. Create `PROGRESS.md` (title, a "Done" list, a "Next" list, "Known issues").
7. `git init` (if needed), `git add -A`, commit "Phase 0: bootstrap with placeholder data".
   If git has no identity, ask the human for a name and email and set them with
   `git config user.name` / `git config user.email` (this repo only).
   Confirm `git status --short` shows no `.env`, `node_modules`, `dist` or `pipeline/cache`.

Done when all three checks pass and the commit exists. Then print, for the human:
the versions, the test counts, and "Phase 0 complete".
