<!-- SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. -->
# Phase 1: real NASA data (model: Sonnet, effort low)

Goal: replace placeholder data with real NASA data, without blocking UI work.

## Step 1: NASA POWER first (no login, about 1 minute)
Run `PY pipeline/fetch_climate.py --skip-imerg` (`PY` = venv interpreter, see CLAUDE.md). It downloads daily NASA POWER data for
16.88 N, 121.58 E (Dec 2001 to May 2025) and writes `frontend/src/data/climate.json` with
`data_status=real`, `precip_source=power`. Commit: "Real NASA POWER data".

If POWER fails: read the error. Network errors retry automatically 3 times. If it still
fails, try once more after 2 minutes; if it fails again, keep the placeholder data, note it in
PROGRESS.md and continue with the UI. Don't loop.

## Step 2: GPM IMERG in the background (needs Earthdata login)
Only if `pipeline/.env` exists (check with `test -f pipeline/.env`; never open it) or the
human says a `~/.netrc` exists. Start
`PY pipeline/fetch_climate.py` as a background command (it reads about 144 monthly files,
a few MB each, caching every month to `pipeline/cache/imerg_monthly.csv`, so a rerun resumes).
It typically takes 5-20 minutes. Keep working on Phase 2 while it runs.

When it finishes, check the summary lines it prints:
- `precip_source=imerg` means success. If the source is `power`, read the IMERG `error` in
  `climate.json` (`meta.sources`) with a one-liner, report it, and continue on POWER data.
- Sanity: typical Dec-May monthly rain should be roughly 10-400 mm each, ET0 roughly
  80-220 mm per month, wetness between 0 and 1. A monthly value in the thousands means a
  unit problem: stop and report, don't patch silently.
- Compare the IMERG and POWER typical-year totals in one line; differences up to about 40%
  are normal (different products), larger ones go in PROGRESS.md as a known issue.

Common IMERG failures:
- 401/403: credentials. Ask the human to check the token, or to log in at
  https://urs.earthdata.nasa.gov and approve the "NASA GESDISC DATA ARCHIVE" application.
- No granules / timeouts: retry once with `--imerg-limit 6` to test, then the full run.
- Anything else after two tries: keep POWER data and move on.

Commit when done: "GPM IMERG rainfall" (the JSON only; `pipeline/cache` is git-ignored).
Then print the typical and strong El Nino rainfall rows for the human.
