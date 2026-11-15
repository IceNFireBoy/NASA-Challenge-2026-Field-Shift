# SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team. See SI_DISCLOSURE.md.
"""Offline tests for fetch_climate.py (no network). Run: python -m pytest pipeline -q"""
import json
import math

import numpy as np
import pandas as pd
import pytest

import fetch_climate as fc


def test_ra_matches_fao56_example_8():
    # FAO-56 Example 8: 20 deg S on 3 September (day 246) -> Ra = 32.2 MJ m-2 day-1
    ra = fc.extraterrestrial_radiation_mj(-20.0, np.array([246]))[0]
    assert abs(ra - 32.2) < 0.2


def test_hargreaves_matches_formula_and_is_plausible():
    tmax, tmin, doy = 32.0, 22.0, 60
    ra_mm = 0.408 * fc.extraterrestrial_radiation_mj(16.88, np.array([doy]))[0]
    expected = 0.0023 * (27.0 + 17.8) * math.sqrt(10.0) * ra_mm
    got = fc.hargreaves_et0_mm(np.array([tmax]), np.array([tmin]), 16.88, np.array([doy]))[0]
    assert abs(got - expected) < 1e-9
    assert 3.0 < got < 7.0  # tropical dry-season range, mm/day


def test_enso_labels():
    assert fc.enso_label(2.6) == ("el_nino", "very_strong")
    assert fc.enso_label(1.5) == ("el_nino", "strong")
    assert fc.enso_label(0.6) == ("el_nino", "weak")
    assert fc.enso_label(-0.5) == ("la_nina", None)
    assert fc.enso_label(0.4) == ("neutral", None)
    strong = [y for y, v in fc.ONI_DJF.items() if v >= 1.5]
    assert strong == fc.STRONG_EL_NINO_SEASONS


@pytest.mark.parametrize("units,expected", [("mm/hr", 0.5 * 24 * 31), ("mm/day", 0.5 * 31), ("mm/month", 0.5)])
def test_unit_conversion(units, expected):
    assert abs(fc.to_mm_per_month(0.5, units, 2016, 1) - expected) < 1e-9


def test_unit_conversion_rejects_unknown_and_implausible():
    with pytest.raises(RuntimeError):
        fc.to_mm_per_month(0.5, "kg m-2 s-1", 2016, 1)
    with pytest.raises(RuntimeError):
        fc.to_mm_per_month(50.0, "mm/hr", 2016, 1)  # 37,200 mm in a month is impossible


def _fake_imerg(path, order):
    import h5py
    lats = np.round(np.arange(-89.95, 90.0, 0.1), 2)
    lons = np.round(np.arange(-179.95, 180.0, 0.1), 2)
    with h5py.File(path, "w") as h5:
        g = h5.create_group("Grid")
        g["lat"] = lats
        g["lon"] = lons
        if order == "lonlat":
            data = np.full((1, lons.size, lats.size), 0.2, dtype="float32")
            j = np.where(np.abs(lons - 121.55) < 1e-6)[0][0]
            i = np.where(np.abs(lats - 16.85) < 1e-6)[0][0]
            data[0, j, i] = -9999.9
        else:
            data = np.full((1, lats.size, lons.size), 0.2, dtype="float32")
            i = np.where(np.abs(lats - 16.85) < 1e-6)[0][0]
            j = np.where(np.abs(lons - 121.55) < 1e-6)[0][0]
            data[0, i, j] = -9999.9
        ds = g.create_dataset("precipitation", data=data, chunks=True, compression="gzip")
        ds.attrs["units"] = b"mm/hr"
        ds.attrs["_FillValue"] = np.float32(-9999.9)


@pytest.mark.parametrize("order", ["lonlat", "latlon"])
def test_read_imerg_point_both_orders_and_fill(tmp_path, order):
    p = tmp_path / f"fake_{order}.h5"
    _fake_imerg(p, order)
    with open(p, "rb") as fh:
        val, units = fc.read_imerg_point(fh, 16.88, 121.58)
    assert units == "mm/hr"
    assert abs(val - 0.2) < 1e-6  # the fill cell is ignored, not averaged in


def test_parse_power_payload_and_monthly():
    dates = pd.date_range("2015-12-01", "2016-05-31", freq="D")
    payload = {
        "header": {"fill_value": -999.0, "api": {"version": "test"}},
        "parameters": {"T2M_MAX": {"units": "C"}, "PRECTOTCORR": {"units": "mm/day"}},
        "properties": {"parameter": {
            "T2M_MAX": {d.strftime("%Y%m%d"): 36.0 for d in dates},
            "T2M_MIN": {d.strftime("%Y%m%d"): 22.0 for d in dates},
            "PRECTOTCORR": {d.strftime("%Y%m%d"): (2.0 if d.day != 5 else -999.0) for d in dates},
            "GWETROOT": {d.strftime("%Y%m%d"): 0.5 for d in dates},
        }},
    }
    df, meta = fc.parse_power_payload(payload)
    assert meta["units"]["T2M_MAX"] == "C"
    assert df["PRECTOTCORR"].isna().sum() == 6  # one fill day per month
    df["ET0"] = fc.hargreaves_et0_mm(df["T2M_MAX"], df["T2M_MIN"], 16.88, df.index.day_of_year)
    mon = fc.monthly_from_daily(df)
    jan = mon.loc[(2016, 1)]
    assert abs(jan["rain_power_mm"] - 2.0 * 30) < 1e-9
    assert jan["hot_days"] == 31
    assert abs(jan["wetness"] - 0.5) < 1e-9


def test_placeholder_payload_is_valid_and_labelled(tmp_path):
    payload = fc.placeholder_payload()
    fc.validate_climate(payload)
    assert payload["meta"]["data_status"] == "placeholder"
    assert len(payload["seasons"]) == 24
    s15 = next(s for s in payload["seasons"] if s["start_year"] == 2015)
    assert s15["enso"] == "el_nino" and s15["strength"] == "very_strong" and s15["id"] == "2015-16"
    assert payload["scenarios"]["elnino_strong"]["season_ids"] == ["2009-10", "2015-16", "2023-24"]
    out = tmp_path / "climate.json"
    out.write_text(json.dumps(payload))
    assert json.loads(out.read_text())["meta"]["schema_version"] == 1


def test_missing_soil_wetness_is_tolerated():
    payload = fc.placeholder_payload()
    for s in payload["seasons"]:
        s["monthly"]["wetness"] = [None] * 6
    for sc in payload["scenarios"].values():
        sc["monthly"]["wetness"] = [None] * 6
    fc.validate_climate(payload)


def test_missing_temperature_fails_loudly():
    dates = pd.date_range("2016-01-01", "2016-01-31", freq="D")
    payload = {"header": {"fill_value": -999.0}, "properties": {"parameter": {
        "T2M_MAX": {d.strftime("%Y%m%d"): -999.0 for d in dates},
        "T2M_MIN": {d.strftime("%Y%m%d"): 20.0 for d in dates},
        "PRECTOTCORR": {d.strftime("%Y%m%d"): 1.0 for d in dates},
    }}}
    with pytest.raises(RuntimeError):
        fc.parse_power_payload(payload)


def test_usda_texture_classes():
    from fetch_extras import summarise_ndvi, usda_texture
    assert usda_texture(40, 40, 20) == "loam"
    assert usda_texture(30, 35, 35) == "clay loam"
    assert usda_texture(20, 20, 60) == "clay"
    assert usda_texture(90, 5, 5) == "sand"
    out = summarise_ndvi([{"date": "2020-12-03", "ndvi": 0.4}, {"date": "2021-01-01", "ndvi": 0.6}, {"date": "2021-07-12", "ndvi": 0.8}])
    assert out["season_mean"] == [{"start_year": 2020, "ndvi": 0.5, "n": 2}]
    assert [m["ndvi"] for m in out["monthly_mean"] if m["month"] == 7] == [0.8]


GIOVANNI_CSV = """Title:,"Time Series, Area-Averaged of Merged satellite-gauge precipitation estimate monthly 0.1 deg. [GPM GPM_3IMERGM v07] mm/hr"
User Start Date:,2015-12-01T00:00:00Z
User End Date:,2016-03-31T23:59:59Z
Bounding Box:,"121.48,16.78,121.68,16.98"
Fill Value (mean_GPM_3IMERGM_07_precipitation):,-9999.9

time,mean_GPM_3IMERGM_07_precipitation
2015-12-01 00:00:00,0.25
2016-01-01 00:00:00,0.1
2016-02-01 00:00:00,-9999.9
2016-03-01 00:00:00,0.05
"""


def test_read_imerg_csv_converts_units_and_skips_fill(tmp_path):
    p = tmp_path / "giovanni.csv"
    p.write_text(GIOVANNI_CSV, encoding="utf-8")
    values, meta = fc.read_imerg_csv(p)
    assert set(values) == {(2015, 12), (2016, 1), (2016, 3)}  # the fill-value month is dropped
    assert abs(values[(2015, 12)] - 0.25 * 24 * 31) < 1e-9  # mm/hr x hours in December
    assert abs(values[(2016, 1)] - fc.to_mm_per_month(0.1, "mm/hr", 2016, 1)) < 1e-9
    assert meta["units_in_files"] == ["mm/hr"] and meta["rows_skipped"] == 1
    assert "121.48,16.78,121.68,16.98" in meta["resolution_note"]


def test_read_imerg_csv_refuses_to_guess_units(tmp_path):
    p = tmp_path / "nounits.csv"
    p.write_text("Title:,Area-averaged precipitation\n\ntime,precip\n2016-01-01 00:00:00,0.1\n", encoding="utf-8")
    with pytest.raises(RuntimeError):
        fc.read_imerg_csv(p)
    values, _ = fc.read_imerg_csv(p, units="mm/day")
    assert abs(values[(2016, 1)] - 3.1) < 1e-9
    bad = tmp_path / "bad.csv"
    bad.write_text("Title:,precip mm/hr\n\ntime,precip\n2016-01-01 00:00:00,50\n", encoding="utf-8")
    with pytest.raises(RuntimeError):  # existing plausibility check still applies
        fc.read_imerg_csv(bad)


def test_list_imerg_files_reads_names_from_the_listing():
    html = '<a href="3B-MO.MS.MRG.3IMERG.20160101-S000000-E235959.01.V07B.HDF5">x</a> <a href="3B-MO.MS.MRG.3IMERG.20160201-S000000-E235959.02.V07B.HDF5">y</a> <a href="doc.xml">z</a>'

    class Resp:
        text = html
    import unittest.mock as mock
    with mock.patch.object(fc, "_get_with_retry", return_value=Resp()):
        out = fc.list_imerg_files(None, 2016)
    assert out == {(2016, 1): "3B-MO.MS.MRG.3IMERG.20160101-S000000-E235959.01.V07B.HDF5",
                   (2016, 2): "3B-MO.MS.MRG.3IMERG.20160201-S000000-E235959.02.V07B.HDF5"}


def test_extra_top_level_keys_survive_a_rewrite(tmp_path):
    out = tmp_path / "climate.json"
    out.write_text(json.dumps({"meta": {"old": True}, "soilgrids": {"usda_texture": "clay loam"}, "ndvi": {"n_composites": 552}}), encoding="utf-8")
    payload = fc.placeholder_payload()
    kept = fc.carry_over_extra_keys(payload, out)
    assert sorted(kept) == ["ndvi", "soilgrids"]
    assert payload["soilgrids"] == {"usda_texture": "clay loam"} and payload["ndvi"] == {"n_composites": 552}
    assert payload["meta"]["data_status"] == "placeholder"  # produced keys are never overwritten
    fc.validate_climate(payload)
    assert fc.carry_over_extra_keys(fc.placeholder_payload(), tmp_path / "missing.json") == []

