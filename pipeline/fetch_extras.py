# SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
"""Phase 5 extras: MODIS NDVI and SoilGrids texture for the San Mateo point.

Adds two optional blocks, `ndvi` and `soilgrids`, to frontend/src/data/climate.json.
Existing keys are never changed. Raw responses are cached in pipeline/cache/.

  python pipeline/fetch_extras.py            # fetch (or reuse cache) and merge
  python pipeline/fetch_extras.py --offline  # merge from cache only
"""
import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "cache"
CLIMATE = ROOT.parent / "frontend" / "src" / "data" / "climate.json"
MODIS_API = "https://modis.ornl.gov/rst/api/v1/MOD13Q1"
SOIL_API = "https://rest.isric.org/soilgrids/v2.0/properties/query"
NDVI_BAND = "250m_16_days_NDVI"
SEASON_MONTHS = [12, 1, 2, 3, 4, 5]
YEAR_MONTHS = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5]


def get_json(url, tries=3):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "space-apps-student-project"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:  # noqa: BLE001 - retry any network error, re-raise on the last try
            if attempt == tries - 1:
                raise
            time.sleep(3 * (attempt + 1))
    return None


def chunks(items, n):
    return [items[i:i + n] for i in range(0, len(items), n)]


def fetch_ndvi(lat, lon, first_year, last_year):
    """16-day NDVI composites for the pixel at the point. The service allows 10 dates per call."""
    cache = CACHE / "ndvi_mod13q1.json"
    if cache.exists():
        return json.loads(cache.read_text())
    q = urllib.parse.urlencode({"latitude": lat, "longitude": lon})
    dates = [d for d in get_json(f"{MODIS_API}/dates?{q}")["dates"]
             if f"{first_year}-06-01" <= d["calendar_date"] <= f"{last_year}-05-31"]
    out = []
    for group in chunks(dates, 10):
        params = urllib.parse.urlencode({"latitude": lat, "longitude": lon, "band": NDVI_BAND,
                                         "startDate": group[0]["modis_date"], "endDate": group[-1]["modis_date"],
                                         "kmAboveBelow": 0, "kmLeftRight": 0})
        res = get_json(f"{MODIS_API}/subset?{params}")
        scale = float(res.get("scale") or 0.0001)
        for row in res["subset"]:
            raw = row["data"][0]
            if raw is not None and raw > -3000:  # -3000 is the fill value
                out.append({"date": row["calendar_date"], "ndvi": round(raw * scale, 4)})
    CACHE.mkdir(exist_ok=True)
    cache.write_text(json.dumps(out))
    return out


def summarise_ndvi(records):
    """Mean NDVI per calendar month (all years) and per Dec-May season."""
    by_month = {m: [] for m in YEAR_MONTHS}
    by_season = {}
    for r in records:
        y, m = int(r["date"][:4]), int(r["date"][5:7])
        by_month[m].append(r["ndvi"])
        if m in SEASON_MONTHS:
            start = y if m == 12 else y - 1
            by_season.setdefault(start, []).append(r["ndvi"])
    mean = lambda xs: round(sum(xs) / len(xs), 3) if xs else None  # noqa: E731
    return {
        "monthly_mean": [{"month": m, "ndvi": mean(by_month[m]), "n": len(by_month[m])} for m in YEAR_MONTHS],
        "season_mean": [{"start_year": y, "ndvi": mean(v), "n": len(v)} for y, v in sorted(by_season.items())],
        "n_composites": len(records),
        "first_date": records[0]["date"] if records else None,
        "last_date": records[-1]["date"] if records else None,
    }


def usda_texture(sand, silt, clay):
    """USDA soil texture class from percent sand, silt and clay."""
    if silt + 1.5 * clay < 15:
        return "sand"
    if silt + 2 * clay < 30:
        return "loamy sand"
    if (7 <= clay < 20 and sand > 52 and silt + 2 * clay >= 30) or (clay < 7 and silt < 50 and silt + 2 * clay >= 30):
        return "sandy loam"
    if 7 <= clay < 27 and 28 <= silt < 50 and sand <= 52:
        return "loam"
    if (silt >= 50 and 12 <= clay < 27) or (50 <= silt < 80 and clay < 12):
        return "silt loam"
    if silt >= 80 and clay < 12:
        return "silt"
    if 20 <= clay < 35 and silt < 28 and sand > 45:
        return "sandy clay loam"
    if 27 <= clay < 40 and 20 < sand <= 45:
        return "clay loam"
    if 27 <= clay < 40 and sand <= 20:
        return "silty clay loam"
    if clay >= 35 and sand > 45:
        return "sandy clay"
    if clay >= 40 and silt >= 40:
        return "silty clay"
    if clay >= 40:
        return "clay"
    return "loam"


def fetch_soil(lat, lon):
    cache = CACHE / "soilgrids.json"
    if cache.exists():
        return json.loads(cache.read_text())
    params = [("lon", lon), ("lat", lat), ("value", "mean")]
    params += [("property", p) for p in ("clay", "sand", "silt")]
    params += [("depth", d) for d in ("0-5cm", "5-15cm", "15-30cm")]
    res = get_json(f"{SOIL_API}?{urllib.parse.urlencode(params)}")
    CACHE.mkdir(exist_ok=True)
    cache.write_text(json.dumps(res))
    return res


def summarise_soil(res):
    """Thickness-weighted 0-30 cm mean of each fraction, in percent."""
    pct = {}
    for layer in res["properties"]["layers"]:
        d = layer["unit_measure"]["d_factor"]
        total = weight = 0
        for depth in layer["depths"]:
            v = depth["values"]["mean"]
            if v is None:
                continue
            w = depth["range"]["bottom_depth"] - depth["range"]["top_depth"]
            total += w * v / d
            weight += w
        pct[layer["name"]] = round(total / weight, 1) if weight else None
    if any(pct.get(k) is None for k in ("sand", "silt", "clay")):
        return None
    return {"depth": "0-30 cm", "sand_pct": pct["sand"], "silt_pct": pct["silt"], "clay_pct": pct["clay"],
            "usda_texture": usda_texture(pct["sand"], pct["silt"], pct["clay"])}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true", help="use cached responses only")
    args = ap.parse_args()
    climate = json.loads(CLIMATE.read_text(encoding="utf-8"))
    loc = climate["meta"]["location"]
    years = [s["start_year"] for s in climate["seasons"]]
    today = time.strftime("%Y-%m-%d")

    if not (args.offline and not (CACHE / "ndvi_mod13q1.json").exists()):
        records = fetch_ndvi(loc["lat"], loc["lon"], min(years), max(years) + 1)
        climate["ndvi"] = {
            "product": "MOD13Q1 v061, 250 m, 16-day composites, band 250m_16_days_NDVI",
            "source": "ORNL DAAC MODIS/VIIRS subsetting web service", "url": "https://modis.ornl.gov/rst/api/v1/",
            "citation": "Didan, K. (2021). MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061. NASA LP DAAC. doi:10.5067/MODIS/MOD13Q1.061",
            "accessed": today,
            "note": "One 250 m pixel at the town-centre point; fill values dropped; no extra cloud or quality screening.",
            **summarise_ndvi(records),
        }
        print(f"ndvi: {len(records)} composites")
    if not (args.offline and not (CACHE / "soilgrids.json").exists()):
        soil = summarise_soil(fetch_soil(loc["lat"], loc["lon"]))
        if soil:
            climate["soilgrids"] = {
                "source": "ISRIC SoilGrids 2.0 (250 m), CC BY 4.0", "url": "https://soilgrids.org/",
                "citation": "Poggio, L. et al. (2021). SoilGrids 2.0. SOIL 7, 217-240. doi:10.5194/soil-7-217-2021",
                "accessed": today,
                "note": "Global map prediction at one point, not a field soil test.",
                **soil,
            }
            print(f"soilgrids: {soil}")
    CLIMATE.write_text(json.dumps(climate, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
