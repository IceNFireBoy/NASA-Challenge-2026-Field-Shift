#!/usr/bin/env python3
# SI-ASSISTED: drafted by Claude (Anthropic, claude.ai) and tested in a sandbox; reviewed by the team.
# Space Apps 2026 requires labelling SI (AI) tool use. See SI_DISCLOSURE.md.
"""
Has Bean Planned - NASA climate pipeline for San Mateo, Isabela, Philippines.

Writes frontend/src/data/climate.json (schema_version 1) for the web app.

Usage (run from the repo root, inside the venv):
  python pipeline/fetch_climate.py --placeholder   # synthetic, clearly labelled, no network
  python pipeline/fetch_climate.py --skip-imerg    # NASA POWER only (no login needed)
  python pipeline/fetch_climate.py                 # NASA POWER + GPM IMERG (Earthdata login)
  python pipeline/fetch_climate.py --imerg-direct  # IMERG over plain HTTPS from GES DISC (no earthaccess)
  python pipeline/fetch_climate.py --imerg-csv pipeline/data/imerg_giovanni.csv --imerg-units mm/hr  # IMERG from the committed Giovanni CSV (what the app ships with)

Data:
  * NASA POWER daily point API (community AG): T2M_MAX, T2M_MIN, PRECTOTCORR, GWETROOT.
  * GPM IMERG Final, monthly, 0.1 deg, V07 (GPM_3IMERGM): a NASA Giovanni area-averaged CSV
    (--imerg-csv), plain HTTPS from GES DISC (--imerg-direct), or earthaccess + h5py (default).
  * NOAA CPC Oceanic Nino Index (ONI, DJF) to label seasons (table embedded below).
Failures: POWER failure stops the run (fail loudly). IMERG failure falls back to POWER
rainfall, records status "unavailable" and the error, and the app shows a banner.
"""
from __future__ import annotations

import argparse
import calendar
import datetime as dt
import json
import math
import os
import re
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
import requests

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT_PATH = ROOT / "frontend" / "src" / "data" / "climate.json"
CACHE_DIR = HERE / "cache"

LOCATION = {"name": "San Mateo, Isabela, Philippines", "lat": 16.88, "lon": 121.58}
FIRST_SEASON = 2001  # season Y = Dec Y .. May Y+1
LAST_SEASON = 2024   # last season = Dec 2024 .. May 2025
SEASON_MONTHS = [12, 1, 2, 3, 4, 5]
MONTH_LABELS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"]
SEASON_DAYS = [31, 31, 28, 31, 30, 31]
HOT_DAY_C = 35.0
HEAVY_RAIN_MM = 50.0

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
POWER_PARAMS = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETROOT"]
IMERG_SHORT_NAME = "GPM_3IMERGM"
IMERG_VERSION = "07"
IMERG_HALF_BOX_DEG = 0.1

# NOAA CPC ONI (ERSSTv6), DJF value keyed by season start year Y (Dec Y - Feb Y+1).
# Source: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/
# (table read 2026-11-15; it replaced the ERSSTv5 table used earlier in this project).
# CPC now uses the Relative ONI (RONI) for official monitoring; ONI values are still
# published and are used here only to label past seasons.
ONI_DJF = {
    2001: -0.1, 2002: 0.9, 2003: 0.3, 2004: 0.6, 2005: -0.9, 2006: 0.6,
    2007: -1.8, 2008: -0.9, 2009: 1.5, 2010: -1.3, 2011: -0.7, 2012: -0.2,
    2013: -0.2, 2014: 0.7, 2015: 2.5, 2016: -0.1, 2017: -0.7, 2018: 1.0,
    2019: 0.7, 2020: -1.0, 2021: -0.8, 2022: -0.5, 2023: 1.8, 2024: -0.5,
}
STRONG_EL_NINO_SEASONS = [2009, 2015, 2023]  # DJF ONI >= 1.5
ANALOG_SEASON = 2015  # strongest El Nino in the record used here (DJF ONI 2.5)

MONTHLY_KEYS = ["rain_imerg_mm", "rain_power_mm", "et0_mm", "tmax_c", "tmin_c",
                "hot_days", "heavy_rain_days", "max_1day_rain_mm", "wetness"]

POWER_ACK = ("These data were obtained from the NASA Langley Research Center (LaRC) POWER "
             "Project funded through the NASA Earth Science/Applied Science Program.")
IMERG_CITATION = ("Huffman, G.J., E.F. Stocker, D.T. Bolvin, E.J. Nelkin, J. Tan (2023), GPM IMERG "
                  "Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07, Greenbelt, MD, Goddard "
                  "Earth Sciences Data and Information Services Center (GES DISC), "
                  "doi:10.5067/GPM/IMERG/3B-MONTH/07")


def log(msg: str) -> None:
    print(f"[fetch_climate] {msg}", flush=True)


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ----------------------------------------------------------------------------- ENSO
def enso_label(oni: float) -> tuple[str, str | None]:
    """Phase from DJF ONI with the CPC +/-0.5 threshold; El Nino strength uses the
    unofficial classes weak 0.5-0.9, moderate 1.0-1.4, strong 1.5-1.9, very strong >=2.0."""
    if oni >= 0.5:
        if oni >= 2.0:
            return "el_nino", "very_strong"
        if oni >= 1.5:
            return "el_nino", "strong"
        if oni >= 1.0:
            return "el_nino", "moderate"
        return "el_nino", "weak"
    if oni <= -0.5:
        return "la_nina", None
    return "neutral", None


# ----------------------------------------------------------------------------- ET0
def extraterrestrial_radiation_mj(lat_deg: float, doy: np.ndarray) -> np.ndarray:
    """FAO-56 eq. 21-25: daily extraterrestrial radiation Ra in MJ m-2 day-1."""
    doy = np.asarray(doy, dtype="float64")
    phi = math.radians(lat_deg)
    dr = 1.0 + 0.033 * np.cos(2.0 * math.pi / 365.0 * doy)
    delta = 0.409 * np.sin(2.0 * math.pi / 365.0 * doy - 1.39)
    ws = np.arccos(np.clip(-math.tan(phi) * np.tan(delta), -1.0, 1.0))
    ra = (24.0 * 60.0 / math.pi) * 0.0820 * dr * (
        ws * math.sin(phi) * np.sin(delta) + math.cos(phi) * np.cos(delta) * np.sin(ws))
    return np.maximum(ra, 0.0)


def hargreaves_et0_mm(tmax: np.ndarray, tmin: np.ndarray, lat_deg: float, doy: np.ndarray) -> np.ndarray:
    """FAO-56 eq. 52 (Hargreaves-Samani): ET0 = 0.0023 (Tmean + 17.8) (Tmax - Tmin)^0.5 * 0.408 Ra."""
    tmax = np.asarray(tmax, dtype="float64")
    tmin = np.asarray(tmin, dtype="float64")
    ra_mm = 0.408 * extraterrestrial_radiation_mj(lat_deg, doy)
    tmean = (tmax + tmin) / 2.0
    et0 = 0.0023 * (tmean + 17.8) * np.sqrt(np.clip(tmax - tmin, 0.0, None)) * ra_mm
    return np.maximum(et0, 0.0)


# ----------------------------------------------------------------------------- NASA POWER
def parse_power_payload(payload: dict) -> tuple[pd.DataFrame, dict]:
    """Parse a POWER daily point JSON payload into a daily DataFrame (NaN for fill values)."""
    try:
        params = payload["properties"]["parameter"]
    except (KeyError, TypeError) as exc:
        raise RuntimeError(f"Unexpected POWER response; keys={list(payload)[:10]}") from exc
    header = payload.get("header", {}) or {}
    fill = float(header.get("fill_value", -999.0))
    frames = {}
    units = {}
    for p in POWER_PARAMS:
        if p not in params:
            log(f"WARNING: POWER returned no {p}; it will be NaN")
            continue
        s = pd.Series(params[p], dtype="float64")
        s[(s == fill) | (s <= -990.0)] = np.nan
        frames[p] = s
        units[p] = (payload.get("parameters", {}) or {}).get(p, {}).get("units", "unknown")
    if not frames:
        raise RuntimeError("POWER response contained none of the requested parameters")
    df = pd.DataFrame(frames)
    df.index = pd.to_datetime(df.index, format="%Y%m%d")
    df = df.sort_index()
    for p in POWER_PARAMS:
        if p not in df:
            df[p] = np.nan
    for p in ("T2M_MAX", "T2M_MIN", "PRECTOTCORR"):
        if df[p].isna().all():
            raise RuntimeError(f"POWER returned no usable {p}; cannot continue")
    if df["GWETROOT"].isna().all():
        log("WARNING: no GWETROOT values; the app will treat soil wetness as typical")
    if df["GWETROOT"].notna().any():
        v = df["GWETROOT"].dropna()
        if (v < 0).any() or (v > 1.05).any():
            raise RuntimeError(f"GWETROOT outside 0-1: min={v.min()} max={v.max()}")
    meta = {
        "api_version": (header.get("api", {}) or {}).get("version", "unknown"),
        "sources": header.get("sources", []),
        "units": units,
        "fill_value": fill,
    }
    return df, meta


def fetch_power(lat: float, lon: float, start: str, end: str, refresh: bool) -> tuple[pd.DataFrame, dict]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / f"power_{lat}_{lon}_{start}_{end}.json"
    if cache.exists() and not refresh:
        log(f"POWER: using cache {cache.name}")
        payload = json.loads(cache.read_text(encoding="utf-8"))
    else:
        query = {"parameters": ",".join(POWER_PARAMS), "community": "AG", "latitude": lat,
                 "longitude": lon, "start": start, "end": end, "format": "JSON",
                 "time-standard": "LST"}
        last = None
        for attempt in range(1, 4):
            try:
                log(f"POWER: requesting {start}-{end} (attempt {attempt})")
                r = requests.get(POWER_URL, params=query, timeout=120)
                r.raise_for_status()
                payload = r.json()
                break
            except Exception as exc:  # noqa: BLE001
                last = exc
                time.sleep(5 * attempt)
        else:
            raise RuntimeError(f"NASA POWER request failed after 3 attempts: {last}")
        cache.write_text(json.dumps(payload), encoding="utf-8")
    df, meta = parse_power_payload(payload)
    df["ET0"] = hargreaves_et0_mm(df["T2M_MAX"].to_numpy(), df["T2M_MIN"].to_numpy(),
                                  lat, df.index.day_of_year.to_numpy())
    return df, meta


def monthly_from_daily(df: pd.DataFrame) -> pd.DataFrame:
    """Calendar-month aggregates. Totals become NaN when >20% of days are missing."""
    g = df.groupby([df.index.year, df.index.month])
    out = pd.DataFrame({
        "n_days": g["PRECTOTCORR"].size(),
        "rain_valid": g["PRECTOTCORR"].count(),
        "rain_power_mm": g["PRECTOTCORR"].sum(min_count=1),
        "et0_mm": g["ET0"].sum(min_count=1),
        "tmax_c": g["T2M_MAX"].mean(),
        "tmin_c": g["T2M_MIN"].mean(),
        "hot_days": g["T2M_MAX"].apply(lambda s: float((s >= HOT_DAY_C).sum())),
        "heavy_rain_days": g["PRECTOTCORR"].apply(lambda s: float((s >= HEAVY_RAIN_MM).sum())),
        "max_1day_rain_mm": g["PRECTOTCORR"].max(),
        "wetness": g["GWETROOT"].mean(),
    })
    out.index.names = ["year", "month"]
    bad = out["rain_valid"] < 0.8 * out["n_days"]
    out.loc[bad, ["rain_power_mm", "et0_mm"]] = np.nan
    return out.drop(columns=["n_days", "rain_valid"])


# ----------------------------------------------------------------------------- GPM IMERG
_HOURLY = {"mm/hr", "mm/h", "mmhr-1", "mmh-1", "mm/hour", "mmperhour"}
_DAILY = {"mm/day", "mm/d", "mmday-1", "mmd-1", "mmperday"}
_MONTHLY = {"mm/month", "mm/mon", "mmmonth-1", "mmpermonth"}


def to_mm_per_month(value: float, units: str, year: int, month: int) -> float:
    """Convert an IMERG monthly-mean rate to a monthly total. Unknown units raise."""
    u = (units or "").strip().lower().replace(" ", "").replace("^", "")
    days = calendar.monthrange(year, month)[1]
    if u in _HOURLY:
        total = value * 24.0 * days
    elif u in _DAILY:
        total = value * days
    elif u in _MONTHLY:
        total = value
    else:
        raise RuntimeError(f"Unrecognized IMERG units {units!r}; refusing to guess")
    if not (0.0 <= total <= 2500.0):
        raise RuntimeError(f"IMERG monthly total {total:.1f} mm for {year}-{month:02d} is implausible; "
                           f"check unit handling (units={units!r})")
    return total


def read_imerg_point(fileobj, lat: float, lon: float, half: float = IMERG_HALF_BOX_DEG) -> tuple[float, str]:
    """Mean precipitation of IMERG grid cells whose centres lie within +/-half deg of the point.
    Works for Grid/precipitation stored as [time, lon, lat] (IMERG HDF5) or [time, lat, lon]."""
    import h5py
    with h5py.File(fileobj, "r") as h5:
        grid = h5["Grid"]
        lats = np.asarray(grid["lat"][:], dtype="float64")
        lons = np.asarray(grid["lon"][:], dtype="float64")
        ds = grid["precipitation"]
        units = ds.attrs.get("units", b"")
        units = units.decode() if isinstance(units, bytes) else str(units)
        fill = ds.attrs.get("_FillValue", None)
        li = np.where(np.abs(lats - lat) <= half + 1e-9)[0]
        lo = np.where(np.abs(lons - lon) <= half + 1e-9)[0]
        if li.size == 0:
            li = np.array([int(np.argmin(np.abs(lats - lat)))])
        if lo.size == 0:
            lo = np.array([int(np.argmin(np.abs(lons - lon)))])
        i0, i1 = int(li.min()), int(li.max()) + 1
        j0, j1 = int(lo.min()), int(lo.max()) + 1
        shape = ds.shape
        if ds.ndim == 3 and shape[1] == lons.size and shape[2] == lats.size:
            block = ds[0, j0:j1, i0:i1]
        elif ds.ndim == 3 and shape[1] == lats.size and shape[2] == lons.size:
            block = ds[0, i0:i1, j0:j1]
        elif ds.ndim == 2 and shape[0] == lons.size and shape[1] == lats.size:
            block = ds[j0:j1, i0:i1]
        elif ds.ndim == 2 and shape[0] == lats.size and shape[1] == lons.size:
            block = ds[i0:i1, j0:j1]
        else:
            raise RuntimeError(f"Unexpected IMERG precipitation shape {shape}")
        block = np.asarray(block, dtype="float64")
        if fill is not None:
            fv = float(np.asarray(fill).ravel()[0])
            block[block == fv] = np.nan
        block[block < 0] = np.nan
        if np.all(np.isnan(block)):
            raise RuntimeError("All IMERG cells near the point are missing")
        return float(np.nanmean(block)), units


def _granule_year_month(granule) -> tuple[int, int]:
    try:
        begin = granule["umm"]["TemporalExtent"]["RangeDateTime"]["BeginningDateTime"]
        ts = pd.Timestamp(begin)
        return int(ts.year), int(ts.month)
    except Exception:  # noqa: BLE001
        links = granule.data_links() if hasattr(granule, "data_links") else []
        for link in links:
            m = re.search(r"3IMERG\.(\d{4})(\d{2})01", link)
            if m:
                return int(m.group(1)), int(m.group(2))
    raise RuntimeError("Cannot determine month of an IMERG granule")


def _granule_name(granule) -> str:
    try:
        return str(granule["umm"].get("GranuleUR", ""))
    except Exception:  # noqa: BLE001
        return ""


def load_dotenv_file(path: Path) -> None:
    """Minimal .env loader (KEY=VALUE lines); never overrides variables already set."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def earthdata_login() -> None:
    """Environment variables (EARTHDATA_TOKEN or EARTHDATA_USERNAME/PASSWORD, also read from
    pipeline/.env) first, then ~/.netrc (_netrc on Windows). Never prompts interactively."""
    import earthaccess
    load_dotenv_file(HERE / ".env")
    errors = []
    for strategy in ("environment", "netrc"):
        try:
            auth = earthaccess.login(strategy=strategy)
            if auth is not None and getattr(auth, "authenticated", False):
                log(f"Earthdata login OK ({strategy})")
                return
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{strategy}: {type(exc).__name__}: {exc}")
    raise RuntimeError("Earthdata login failed. Set EARTHDATA_TOKEN (or EARTHDATA_USERNAME and "
                       "EARTHDATA_PASSWORD) in pipeline/.env, or create ~/.netrc. Details: "
                       + " | ".join(errors))


def fetch_imerg(months: list[tuple[int, int]], refresh: bool, limit: int | None) -> tuple[dict, dict]:
    """Return {(year, month): mm} for the requested months, caching each value as it arrives."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / "imerg_monthly.csv"
    values: dict[tuple[int, int], float] = {}
    units_seen = set()
    if cache.exists() and not refresh:
        c = pd.read_csv(cache)
        for row in c.itertuples(index=False):
            values[(int(row.year), int(row.month))] = float(row.rain_mm)
            units_seen.add(str(row.units))
    todo = [ym for ym in months if ym not in values]
    log(f"IMERG: {len(values)} months cached, {len(todo)} to fetch")
    if todo:
        import earthaccess
        earthdata_login()
        lat, lon = LOCATION["lat"], LOCATION["lon"]
        start = f"{min(todo)[0]}-{min(todo)[1]:02d}-01"
        last_y, last_m = max(todo)
        end = f"{last_y}-{last_m:02d}-{calendar.monthrange(last_y, last_m)[1]}"
        granules = earthaccess.search_data(short_name=IMERG_SHORT_NAME, version=IMERG_VERSION,
                                           temporal=(start, end),
                                           bounding_box=(lon - 0.2, lat - 0.2, lon + 0.2, lat + 0.2))
        if not granules:
            raise RuntimeError(f"No {IMERG_SHORT_NAME} v{IMERG_VERSION} granules found for {start}..{end}")
        by_month = {}
        for g in sorted(granules, key=_granule_name):  # later file versions sort last and win
            ym = _granule_year_month(g)
            if ym in todo:
                by_month[ym] = g
        missing = [ym for ym in todo if ym not in by_month]
        if missing:
            log(f"WARNING: no IMERG granule for {len(missing)} month(s), e.g. {missing[:3]}")
        jobs = sorted(by_month.items())
        if limit:
            jobs = jobs[:limit]
        new_file = not cache.exists() or refresh
        with cache.open("w" if new_file else "a", encoding="utf-8") as fh:
            if new_file:
                fh.write("year,month,rain_mm,units,granule\n")
            for k, ((y, m), g) in enumerate(jobs, 1):
                t0 = time.time()
                f = earthaccess.open([g], open_kwargs={"cache_type": "blockcache",
                                                       "block_size": 2 * 1024 * 1024})[0]
                rate, units = read_imerg_point(f, lat, lon)
                mm = to_mm_per_month(rate, units, y, m)
                values[(y, m)] = mm
                units_seen.add(units)
                fh.write(f"{y},{m},{mm:.3f},{units},{_granule_name(g)}\n")
                fh.flush()
                log(f"IMERG {k}/{len(jobs)} {y}-{m:02d}: {mm:7.1f} mm ({time.time() - t0:.1f}s)")
    meta = {"units_in_files": sorted(units_seen)}
    return values, meta


# ----------------------------------------------------------------------------- IMERG from a Giovanni CSV
def _units_from_text(text: str) -> str | None:
    """Find one of the unit spellings the converter already knows inside free text."""
    squashed = text.lower().replace(" ", "").replace("^", "")
    for table in (_HOURLY, _DAILY, _MONTHLY):
        for u in sorted(table, key=len, reverse=True):
            if u in squashed:
                return u
    return None


def read_imerg_csv(path: Path, units: str | None = None) -> tuple[dict, dict]:
    """Read a NASA Giovanni area-averaged time-series CSV of GPM_3IMERGM precipitation.

    The file starts with comment lines (title, dates, bounding box, fill value), then a header
    row whose first column is `time`, then one row per month. Units are taken from `units` or
    from the comment/header lines; if they cannot be found the function refuses to guess.
    Returns ({(year, month): mm}, meta) in the same shape as fetch_imerg."""
    lines = Path(path).read_text(encoding="utf-8-sig").splitlines()
    head = next((i for i, ln in enumerate(lines) if ln.strip().lower().startswith("time,")), None)
    if head is None:
        raise RuntimeError(f"{path}: no header row starting with 'time,' found")
    preamble = "\n".join(lines[: head + 1])
    units = units or _units_from_text(preamble)
    if not units:
        raise RuntimeError(f"{path}: precipitation units not stated in the file; pass --imerg-units (e.g. mm/hr)")
    fill = None
    for ln in lines[:head]:
        if ln.lower().startswith("fill value"):
            m = re.search(r"(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s*$", ln.strip())
            fill = float(m.group(1)) if m else None
    values: dict[tuple[int, int], float] = {}
    skipped = 0
    for ln in lines[head + 1:]:
        parts = [x.strip() for x in ln.split(",")]
        if len(parts) < 2 or not parts[0]:
            continue
        ts = pd.Timestamp(parts[0])
        try:
            rate = float(parts[1])
        except ValueError:
            skipped += 1
            continue
        if math.isnan(rate) or rate < 0 or (fill is not None and abs(rate - fill) < 1e-6):
            skipped += 1
            continue
        values[(int(ts.year), int(ts.month))] = to_mm_per_month(rate, units, int(ts.year), int(ts.month))
    if not values:
        raise RuntimeError(f"{path}: no usable rows")
    # Giovanni lists the box the user asked for and the box of grid cells it actually averaged;
    # the second one is what the numbers describe.
    boxes = {ln.split(":", 1)[0].strip().lower(): ln.split(":", 1)[1].strip(' ,"') for ln in lines[:head]
             if "bounding box" in ln.lower() and ":" in ln}
    bbox = boxes.get("data bounding box") or next(iter(boxes.values()), None)
    meta = {"units_in_files": [units], "via": "NASA Giovanni area-averaged time series (CSV)", "rows_skipped": skipped,
            "file": Path(path).name, "data_bounding_box": bbox,
            "resolution_note": "Satellite-gauge estimate, 0.1 deg grid (~11 km), area-averaged by NASA Giovanni"
                               + (f" over lon/lat box {bbox}" if bbox else "")}
    log(f"IMERG CSV: {len(values)} months read from {path} (units {units}, {skipped} skipped)")
    return values, meta


# ----------------------------------------------------------------------------- IMERG over plain HTTPS
GESDISC_DIR = "https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/GPM_3IMERGM.07"
URS_HOST = "urs.earthdata.nasa.gov"


class _EarthdataSession(requests.Session):
    """requests drops credentials on cross-host redirects; keep them only for Earthdata Login."""

    def rebuild_auth(self, prepared_request, response):
        if "Authorization" in prepared_request.headers:
            host = requests.utils.urlparse(prepared_request.url).hostname
            if host != URS_HOST and host != requests.utils.urlparse(response.request.url).hostname:
                del prepared_request.headers["Authorization"]
        if self.trust_env and "Authorization" not in prepared_request.headers:
            super().rebuild_auth(prepared_request, response)  # lets ~/.netrc answer for URS


def earthdata_sessions() -> list[tuple[str, requests.Session]]:
    """Every login method that is configured, in order: token, then username/password (both from
    the environment; pipeline/.env is loaded), then ~/.netrc. Values are never logged."""
    load_dotenv_file(HERE / ".env")
    out = []
    token = os.environ.get("EARTHDATA_TOKEN", "").strip()
    user, pw = os.environ.get("EARTHDATA_USERNAME", "").strip(), os.environ.get("EARTHDATA_PASSWORD", "")
    if token:
        sess = _EarthdataSession()
        sess.trust_env = False
        sess.headers["Authorization"] = f"Bearer {token}"
        out.append(("token", sess))
    if user and pw:
        sess = _EarthdataSession()
        sess.trust_env = False
        sess.auth = (user, pw)
        out.append(("username/password", sess))
    out.append(("netrc", _EarthdataSession()))
    return out


class EarthdataAuthError(RuntimeError):
    pass


def _get_with_retry(sess: requests.Session, url: str, tries: int = 3, timeout: int = 60) -> requests.Response:
    last = None
    for attempt in range(tries):
        try:
            resp = sess.get(url, timeout=timeout, allow_redirects=True)
            if resp.status_code in (401, 403):  # a login problem does not heal on retry
                raise EarthdataAuthError(f"HTTP {resp.status_code} from {requests.utils.urlparse(resp.url).hostname}")
            if "text/html" in resp.headers.get("content-type", "") and url.upper().endswith(".HDF5"):
                raise EarthdataAuthError("got a login page instead of data")
            resp.raise_for_status()
            return resp
        except EarthdataAuthError:
            raise
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < tries - 1:
                time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"GET failed after {tries} tries: {url}: {type(last).__name__}: {last}")


def working_earthdata_session(probe_url: str) -> requests.Session:
    """First configured login method that the data server accepts for `probe_url`."""
    errors = []
    for name, sess in earthdata_sessions():
        try:
            _get_with_retry(sess, probe_url)
            log(f"Earthdata login OK ({name})")
            return sess
        except EarthdataAuthError as exc:
            errors.append(f"{name}: {exc}")
    raise RuntimeError("Earthdata login was refused by GES DISC with every configured method ("
                       + " | ".join(errors) + "). A token may have expired (they last 60 days), or the "
                       "'NASA GESDISC DATA ARCHIVE' application may not be approved for the account.")


def list_imerg_files(sess: requests.Session, year: int) -> dict[tuple[int, int], str]:
    """Read one year's directory listing and return {(year, month): file name} from its links."""
    html = _get_with_retry(sess, f"{GESDISC_DIR}/{year}/").text
    out: dict[tuple[int, int], str] = {}
    for name in sorted(set(re.findall(r'href="([^"/?]+\.HDF5)"', html, flags=re.I))):  # later versions sort last and win
        m = re.search(r"3IMERG\.(\d{4})(\d{2})01", name)
        if m:
            out[(int(m.group(1)), int(m.group(2)))] = name
    return out


def fetch_imerg_direct(months: list[tuple[int, int]], refresh: bool, limit: int | None) -> tuple[dict, dict]:
    """Same result as fetch_imerg, but downloads each monthly file over HTTPS with requests.
    Every month is appended to the cache at once, so an interrupted run resumes."""
    import io as _io
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / "imerg_monthly.csv"
    values: dict[tuple[int, int], float] = {}
    units_seen = set()
    if cache.exists() and not refresh:
        for row in pd.read_csv(cache).itertuples(index=False):
            values[(int(row.year), int(row.month))] = float(row.rain_mm)
            units_seen.add(str(row.units))
    todo = [ym for ym in months if ym not in values]
    log(f"IMERG direct: {len(values)} months cached, {len(todo)} to fetch")
    if limit:
        todo = todo[:limit]
    if todo:
        sess = working_earthdata_session(f"{GESDISC_DIR}/{todo[0][0]}/")
        lat, lon = LOCATION["lat"], LOCATION["lon"]
        names: dict[tuple[int, int], str] = {}
        new_file = not cache.exists() or refresh
        with cache.open("w" if new_file else "a", encoding="utf-8") as fh:
            if new_file:
                fh.write("year,month,rain_mm,units,granule\n")
            for k, (y, m) in enumerate(todo, 1):
                if not any(yy == y for yy, _ in names):
                    listing = list_imerg_files(sess, y)
                    if not listing:
                        raise RuntimeError(f"No IMERG files listed for {y}")
                    names.update(listing)
                    log(f"IMERG listing {y}: {len(listing)} files, e.g. {sorted(listing.values())[0]}")
                if (y, m) not in names:
                    log(f"WARNING: no IMERG file listed for {y}-{m:02d}")
                    continue
                t0 = time.time()
                resp = _get_with_retry(sess, f"{GESDISC_DIR}/{y}/{names[(y, m)]}")
                rate, units = read_imerg_point(_io.BytesIO(resp.content), lat, lon)
                mm = to_mm_per_month(rate, units, y, m)
                values[(y, m)] = mm
                units_seen.add(units)
                fh.write(f"{y},{m},{mm:.3f},{units},{names[(y, m)]}\n")
                fh.flush()
                log(f"IMERG {k}/{len(todo)} {y}-{m:02d}: {mm:7.1f} mm ({len(resp.content) / 1e6:.1f} MB, {time.time() - t0:.1f}s)")
    return values, {"units_in_files": sorted(units_seen), "via": "HTTPS download from GES DISC"}


# ----------------------------------------------------------------------------- seasons
def season_months(start_year: int) -> list[tuple[int, int]]:
    return [(start_year if m == 12 else start_year + 1, m) for m in SEASON_MONTHS]


def _r(x, nd=1):
    return None if x is None or (isinstance(x, float) and math.isnan(x)) else round(float(x), nd)


def build_seasons(monthly: pd.DataFrame, imerg: dict | None) -> list[dict]:
    seasons = []
    for y in range(FIRST_SEASON, LAST_SEASON + 1):
        rows = {k: [] for k in MONTHLY_KEYS}
        for (yy, mm) in season_months(y):
            if (yy, mm) not in monthly.index:
                raise RuntimeError(f"POWER has no data for {yy}-{mm:02d}")
            r = monthly.loc[(yy, mm)]
            rows["rain_imerg_mm"].append(None if imerg is None else _r(imerg.get((yy, mm))))
            rows["rain_power_mm"].append(_r(r["rain_power_mm"]))
            rows["et0_mm"].append(_r(r["et0_mm"]))
            rows["tmax_c"].append(_r(r["tmax_c"], 2))
            rows["tmin_c"].append(_r(r["tmin_c"], 2))
            rows["hot_days"].append(_r(r["hot_days"], 0))
            rows["heavy_rain_days"].append(_r(r["heavy_rain_days"], 0))
            rows["max_1day_rain_mm"].append(_r(r["max_1day_rain_mm"]))
            rows["wetness"].append(_r(r["wetness"], 3))
        if rows["rain_imerg_mm"] and any(v is None for v in rows["rain_imerg_mm"]):
            rows["rain_imerg_mm"] = None
        phase, strength = enso_label(ONI_DJF[y])
        seasons.append({"id": f"{y}-{str(y + 1)[2:]}", "start_year": y, "oni_djf": ONI_DJF[y],
                        "enso": phase, "strength": strength, "monthly": rows})
    return seasons


def median_monthly(seasons: list[dict], start_years: list[int]) -> dict:
    chosen = [s for s in seasons if s["start_year"] in start_years]
    if not chosen:
        raise RuntimeError(f"No seasons for {start_years}")
    out = {}
    for k in MONTHLY_KEYS:
        if any(s["monthly"][k] is None for s in chosen):
            out[k] = None
            continue
        arr = np.array([[np.nan if v is None else v for v in s["monthly"][k]] for s in chosen], dtype="float64")
        med = np.nanmedian(arr, axis=0)
        nd = 3 if k == "wetness" else (2 if k in ("tmax_c", "tmin_c") else 1)
        out[k] = [_r(v, nd) for v in med]
    return out


def build_scenarios(seasons: list[dict]) -> dict:
    all_years = [s["start_year"] for s in seasons]
    return {
        "typical": {"label": f"Typical year (median of {len(all_years)} dry seasons, "
                             f"{seasons[0]['id']} to {seasons[-1]['id']})",
                    "season_ids": [s["id"] for s in seasons],
                    "monthly": median_monthly(seasons, all_years)},
        "elnino_strong": {"label": "Strong El Nino (median of 2009-10, 2015-16, 2023-24)",
                          "season_ids": [s["id"] for s in seasons if s["start_year"] in STRONG_EL_NINO_SEASONS],
                          "monthly": median_monthly(seasons, STRONG_EL_NINO_SEASONS)},
        "elnino_2015": {"label": "2015-16 very strong El Nino (closest past analog)",
                        "season_ids": [s["id"] for s in seasons if s["start_year"] == ANALOG_SEASON],
                        "monthly": median_monthly(seasons, [ANALOG_SEASON])},
    }


def rain_series(season: dict) -> tuple[list, str]:
    r = season["monthly"]["rain_imerg_mm"]
    if r is not None and all(v is not None for v in r):
        return r, "imerg"
    return season["monthly"]["rain_power_mm"], "power"


def build_trend(seasons: list[dict]) -> dict:
    xs, rain, tmax = [], [], []
    for s in seasons:
        r, _ = rain_series(s)
        if r is None or any(v is None for v in r):
            continue
        xs.append(s["start_year"])
        rain.append(float(sum(r)))
        tmax.append(float(np.mean([v for v in s["monthly"]["tmax_c"] if v is not None])))
    out = {"method": "Ordinary least squares over dry seasons (Dec-May); slope per decade",
           "series": [{"start_year": x, "rain_total_mm": round(r, 1), "tmax_mean_c": round(t, 2)}
                      for x, r, t in zip(xs, rain, tmax)]}
    if len(xs) >= 5:
        out["rain_mm_per_decade"] = round(float(np.polyfit(xs, rain, 1)[0] * 10.0), 1)
        out["tmax_c_per_decade"] = round(float(np.polyfit(xs, tmax, 1)[0] * 10.0), 2)
    return out


# ----------------------------------------------------------------------------- output
def base_meta(data_status: str) -> dict:
    return {
        "schema_version": 1,
        "generated_at": utc_now(),
        "data_status": data_status,
        "location": LOCATION,
        "season_months": MONTH_LABELS,
        "season_days": SEASON_DAYS,
        "thresholds": {"hot_day_c": HOT_DAY_C, "heavy_rain_mm": HEAVY_RAIN_MM},
        "enso": {"index": "Oceanic Nino Index (ONI), DJF, NOAA CPC ERSSTv6",
                 "url": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/",
                 "accessed": "2026-11-15",
                 "rule": "El Nino if DJF ONI >= +0.5, La Nina if <= -0.5, else neutral; "
                         "strong El Nino = DJF ONI >= 1.5"},
        "notes": [
            "Scenarios summarise past seasons; they are not forecasts.",
            "NASA POWER values are gridded model/satellite estimates, not weather-station readings.",
            "IMERG is a satellite-gauge estimate averaged over 0.1 degree cells near the point.",
            "Reference ET0 uses the Hargreaves-Samani equation (FAO-56 eq. 52) from POWER temperatures.",
        ],
    }


def validate_climate(payload: dict) -> None:
    """Raise AssertionError if climate.json does not match schema_version 1."""
    m = payload["meta"]
    assert m["schema_version"] == 1
    assert m["data_status"] in ("real", "placeholder")
    assert m["season_months"] == MONTH_LABELS
    assert m["precip_source"] in ("imerg", "power")
    assert isinstance(m["sources"], list) and m["sources"]
    for src in m["sources"]:
        for key in ("id", "name", "status", "url", "citation"):
            assert key in src, f"source missing {key}"
    seasons = payload["seasons"]
    assert len(seasons) == LAST_SEASON - FIRST_SEASON + 1
    for s in seasons:
        assert s["enso"] in ("el_nino", "la_nina", "neutral")
        for k in MONTHLY_KEYS:
            v = s["monthly"][k]
            if k == "rain_imerg_mm" and v is None:
                continue
            assert isinstance(v, list) and len(v) == 6, f"{s['id']} {k}"
    for key in ("typical", "elnino_strong", "elnino_2015"):
        sc = payload["scenarios"][key]
        for k in MONTHLY_KEYS:
            v = sc["monthly"][k]
            if k == "rain_imerg_mm" and v is None:
                continue
            if k == "wetness":  # optional: missing GWETROOT means 'treat as typical'
                assert isinstance(v, list) and len(v) == 6, f"{key} {k}"
                continue
            assert isinstance(v, list) and len(v) == 6 and all(x is not None for x in v), f"{key} {k}"
    if m["precip_source"] == "imerg":
        assert all(s["monthly"]["rain_imerg_mm"] is not None for s in seasons)
    assert "series" in payload["trend"]


def build_payload(monthly: pd.DataFrame, imerg: dict | None, sources: list, data_status: str,
                  extra_notes: list[str] | None = None) -> dict:
    seasons = build_seasons(monthly, imerg)
    precip_source = "imerg" if all(s["monthly"]["rain_imerg_mm"] is not None for s in seasons) else "power"
    meta = base_meta(data_status)
    meta["precip_source"] = precip_source
    meta["sources"] = sources
    if extra_notes:
        meta["notes"].extend(extra_notes)
    payload = {"meta": meta, "seasons": seasons, "scenarios": build_scenarios(seasons),
               "trend": build_trend(seasons)}
    validate_climate(payload)
    return payload


def power_source(status: str, meta: dict | None, start: str, end: str) -> dict:
    return {"id": "nasa_power", "name": "NASA POWER Daily Agroclimatology (point API)",
            "url": "https://power.larc.nasa.gov/", "status": status,
            "parameters": POWER_PARAMS, "period": f"{start}..{end}",
            "units": (meta or {}).get("units", {}), "api_version": (meta or {}).get("api_version"),
            "resolution_note": "Gridded estimate (MERRA-2/GEOS meteorology, about 0.5 x 0.625 deg); "
                               "not a weather-station reading",
            "citation": POWER_ACK, "fetched_at": utc_now()}


def imerg_source(status: str, meta: dict | None, error: str | None = None) -> dict:
    src = {"id": "gpm_imerg", "name": "GPM IMERG Final Precipitation L3 1 month 0.1 deg V07 (GPM_3IMERGM)",
           "url": "https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07", "status": status,
           "parameters": ["Grid/precipitation"],
           "units": (meta or {}).get("units_in_files", []),
           "resolution_note": (meta or {}).get("resolution_note")
                              or "Satellite-gauge estimate, 0.1 deg grid (~11 km), cells within +/-0.1 deg averaged",
           "citation": IMERG_CITATION, "fetched_at": utc_now()}
    for key in ("via", "file", "data_bounding_box"):
        if (meta or {}).get(key):
            src[key] = meta[key]
    if error:
        src["error"] = error[:500]
    return src


def oni_source() -> dict:
    return {"id": "noaa_oni", "name": "NOAA CPC Oceanic Nino Index (ONI, ERSSTv6)",
            "url": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/",
            "status": "embedded_table", "citation": "NOAA Climate Prediction Center, ONI v6 (ERSSTv6) table, accessed 2026-11-15"}


def carry_over_extra_keys(payload: dict, path: Path) -> list[str]:
    """Copy top-level keys this script does not produce (e.g. soilgrids, ndvi from
    fetch_extras.py) from the existing output file into the new payload."""
    try:
        old = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    kept = [k for k in old if k not in payload] if isinstance(old, dict) else []
    for k in kept:
        payload[k] = old[k]
    return kept


def placeholder_payload() -> dict:
    """Synthetic but realistic-looking data, clearly labelled, for parallel UI work."""
    rng = np.random.default_rng(42)
    rows = []
    base_rain = np.array([110, 55, 35, 35, 55, 150], dtype="float64")
    base_tmax = np.array([28.5, 28.3, 29.6, 31.8, 33.9, 34.4])
    base_tmin = np.array([20.0, 19.3, 19.6, 20.8, 22.4, 23.3])
    base_wet = np.array([0.74, 0.66, 0.58, 0.51, 0.47, 0.55])
    index = []
    for y in range(FIRST_SEASON, LAST_SEASON + 1):
        phase, strength = enso_label(ONI_DJF[y])
        dry = 0.5 if strength in ("strong", "very_strong") else (0.75 if phase == "el_nino" else 1.0)
        warm = 0.9 if strength in ("strong", "very_strong") else (0.4 if phase == "el_nino" else 0.0)
        for i, (yy, mm) in enumerate(season_months(y)):
            rain = max(0.0, base_rain[i] * dry * rng.uniform(0.6, 1.4))
            tmax = base_tmax[i] + warm + rng.normal(0, 0.4)
            tmin = base_tmin[i] + warm * 0.5 + rng.normal(0, 0.3)
            doy = dt.date(yy, mm, 15).timetuple().tm_yday
            et0 = float(hargreaves_et0_mm(np.array([tmax]), np.array([tmin]), LOCATION["lat"], np.array([doy]))[0])
            days = calendar.monthrange(yy, mm)[1]
            index.append((yy, mm))
            rows.append({"rain_power_mm": rain, "et0_mm": et0 * days, "tmax_c": tmax, "tmin_c": tmin,
                         "hot_days": float(max(0, round((tmax - 31.0) * 3 + rng.normal(0, 1)))),
                         "heavy_rain_days": float(rng.integers(0, 2)), "max_1day_rain_mm": rain * 0.3,
                         "wetness": float(np.clip(base_wet[i] * (0.8 if dry < 1 else 1.0) + rng.normal(0, 0.02), 0, 1))})
    monthly = pd.DataFrame(rows, index=pd.MultiIndex.from_tuples(index, names=["year", "month"]))
    imerg = {ym: float(v * rng.uniform(0.9, 1.15)) for ym, v in monthly["rain_power_mm"].items()}
    sources = [power_source("placeholder", None, "synthetic", "synthetic"),
               imerg_source("placeholder", None), oni_source()]
    return build_payload(monthly, imerg, sources, "placeholder",
                         ["PLACEHOLDER DATA - synthetic numbers for interface testing only. "
                          "Run `python pipeline/fetch_climate.py` for real NASA data."])


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--placeholder", action="store_true", help="write labelled synthetic data and exit")
    ap.add_argument("--skip-imerg", action="store_true", help="use NASA POWER rainfall only")
    ap.add_argument("--imerg-limit", type=int, default=None, help="fetch at most N IMERG months (testing)")
    ap.add_argument("--imerg-csv", type=Path, default=None, help="read IMERG from a Giovanni area-averaged time-series CSV")
    ap.add_argument("--imerg-units", default=None, help="units of the --imerg-csv values if the file does not state them")
    ap.add_argument("--imerg-direct", action="store_true", help="download IMERG over HTTPS from GES DISC instead of earthaccess")
    ap.add_argument("--refresh", action="store_true", help="ignore caches")
    ap.add_argument("--out", type=Path, default=OUT_PATH)
    args = ap.parse_args()

    if args.placeholder:
        payload = placeholder_payload()
    else:
        start = f"{FIRST_SEASON}1201"
        end = f"{LAST_SEASON + 1}0531"
        daily, pmeta = fetch_power(LOCATION["lat"], LOCATION["lon"], start, end, args.refresh)
        monthly = monthly_from_daily(daily)
        sources = [power_source("ok", pmeta, start, end)]
        notes = []
        imerg = None
        if args.skip_imerg:
            sources.append(imerg_source("skipped", None))
            notes.append("GPM IMERG was skipped; rainfall comes from NASA POWER (PRECTOTCORR).")
        else:
            needed = [ym for y in range(FIRST_SEASON, LAST_SEASON + 1) for ym in season_months(y)]
            try:
                if args.imerg_csv:
                    imerg, imeta = read_imerg_csv(args.imerg_csv, args.imerg_units)
                elif args.imerg_direct:
                    imerg, imeta = fetch_imerg_direct(needed, args.refresh, args.imerg_limit)
                else:
                    imerg, imeta = fetch_imerg(needed, args.refresh, args.imerg_limit)
                complete = all(ym in imerg for ym in needed)
                sources.append(imerg_source("ok" if complete else "partial", imeta))
                if not complete:
                    notes.append("GPM IMERG is incomplete for some months; those seasons use NASA POWER rainfall.")
            except Exception as exc:  # noqa: BLE001
                log(f"WARNING: IMERG unavailable, falling back to POWER rainfall: {exc}")
                sources.append(imerg_source("unavailable", None, str(exc)))
                notes.append("GPM IMERG could not be fetched; rainfall comes from NASA POWER (PRECTOTCORR).")
                imerg = None
        sources.append(oni_source())
        payload = build_payload(monthly, imerg, sources, "real", notes)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    kept = carry_over_extra_keys(payload, args.out)
    if kept:
        log(f"kept existing blocks: {', '.join(kept)}")
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    m = payload["meta"]
    log(f"wrote {args.out} | data_status={m['data_status']} | precip_source={m['precip_source']}")
    typ = payload["scenarios"]["typical"]["monthly"]
    eln = payload["scenarios"]["elnino_strong"]["monthly"]
    rkey = "rain_imerg_mm" if m["precip_source"] == "imerg" else "rain_power_mm"
    log("Typical  rain mm Dec..May: " + ", ".join(f"{v:.0f}" for v in typ[rkey]))
    log("El Nino  rain mm Dec..May: " + ", ".join(f"{v:.0f}" for v in eln[rkey]))
    log("Typical  ET0 mm  Dec..May: " + ", ".join(f"{v:.0f}" for v in typ["et0_mm"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
