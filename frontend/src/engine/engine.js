// SI-ASSISTED: drafted by Claude (Anthropic, claude.ai) and unit-tested; reviewed by the team.
// Pure functions only (no React). Water balance follows FAO-56 (single crop coefficient),
// yield response follows FAO-33 (Ky), effective rainfall uses the USDA-SCS method (FAO CROPWAT).
import { CROPS, SOILS, MODEL, IRRIGATION, ROTATION_IDS, FIELD_SITUATIONS } from './params.js';

export const SEASON_MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
export const SEASON_DAYS = [31, 31, 28, 31, 30, 31];
export const SEASON_LENGTH = 182;

export const PLANTING_OPTIONS = [
  { id: 'dec01', label: 'Dec 1', day: 0 },
  { id: 'dec15', label: 'Dec 15', day: 14 },
  { id: 'jan01', label: 'Jan 1', day: 31 },
  { id: 'jan15', label: 'Jan 15', day: 45 },
  { id: 'feb01', label: 'Feb 1', day: 62 },
  { id: 'feb15', label: 'Feb 15', day: 76 },
  { id: 'mar01', label: 'Mar 1', day: 90 },
  { id: 'mar15', label: 'Mar 15', day: 104 },
  { id: 'apr01', label: 'Apr 1', day: 121 },
];

export const SCENARIO_IDS = ['typical', 'elnino_strong', 'elnino_2015'];

export const CRITERIA = [
  { id: 'drought', label: 'Drought safety', hint: 'Share of the crop\'s water need covered by rain and stored soil water (fallow has no crop at risk)' },
  { id: 'soil', label: 'Soil health & nitrogen', hint: 'Nitrogen fixing and nutrient balance (ordinal)' },
  { id: 'cover', label: 'Ground cover', hint: 'Days with a living crop in Dec-May; bare soil erodes and crusts' },
  { id: 'income', label: 'Income', hint: 'Net PHP/ha compared across these options' },
  { id: 'labor', label: 'Low labour', hint: 'Fewer man-days per hectare scores higher' },
  { id: 'forage', label: 'Forage value', hint: 'Residues usable as animal feed (ordinal)' },
];

export const DEFAULT_WEIGHTS = { drought: 25, soil: 25, cover: 15, income: 25, labor: 10, forage: 0 };

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function monthIndexOfDay(day) {
  let d = day;
  for (let i = 0; i < 6; i += 1) {
    if (d < SEASON_DAYS[i]) return i;
    d -= SEASON_DAYS[i];
  }
  return 5; // days after May 31 reuse May conditions (documented approximation)
}

export function pickRain(monthly) {
  const im = monthly.rain_imerg_mm;
  if (Array.isArray(im) && im.length === 6 && im.every((v) => typeof v === 'number')) {
    return { rain: im, source: 'imerg' };
  }
  return { rain: monthly.rain_power_mm, source: 'power' };
}

// USDA-SCS effective rainfall for a monthly total P (mm), as used in FAO CROPWAT.
export function effectiveRain(P) {
  if (!(P > 0)) return 0;
  return P <= 250 ? (P * (125 - 0.2 * P)) / 125 : 125 + 0.1 * P;
}

// FAO-56 single crop coefficient curve; t is days since planting.
export function kcAt(t, dur, kc, stages) {
  const lIni = stages.ini * dur;
  const lDev = stages.dev * dur;
  const lMid = stages.mid * dur;
  const lLate = Math.max(dur - lIni - lDev - lMid, 1e-9);
  if (t < lIni) return kc.ini;
  if (t < lIni + lDev) return kc.ini + ((kc.mid - kc.ini) * (t - lIni)) / lDev;
  if (t < lIni + lDev + lMid) return kc.mid;
  return kc.mid + (kc.end - kc.mid) * Math.min(1, (t - lIni - lDev - lMid) / lLate);
}

// Expand monthly scenario values into 182 daily records (Dec 1 .. May 31).
export function dailySeries(monthly, { rainPct = 0, tempDelta = 0 } = {}) {
  const { rain, source } = pickRain(monthly);
  const days = [];
  for (let i = 0; i < 6; i += 1) {
    const n = SEASON_DAYS[i];
    const P = Math.max(0, rain[i] * (1 + rainPct / 100));
    const tmean = (monthly.tmax_c[i] + monthly.tmin_c[i]) / 2;
    // Hargreaves ET0 scales with (Tmean + 17.8), so a uniform warming shifts it by this ratio.
    const tf = tempDelta ? Math.max(0, (tmean + tempDelta + 17.8) / (tmean + 17.8)) : 1;
    const rec = {
      month: i,
      rain: P / n,
      peff: effectiveRain(P) / n,
      et0: (monthly.et0_mm[i] * tf) / n,
      hot: (monthly.hot_days[i] ?? 0) / n,
    };
    for (let k = 0; k < n; k += 1) days.push(rec);
  }
  return { days, source };
}

export function wetRatio(scenarioMonthly, typicalMonthly, monthIdx) {
  const a = scenarioMonthly?.wetness?.[monthIdx];
  const b = typicalMonthly?.wetness?.[monthIdx];
  if (typeof a !== 'number' || typeof b !== 'number' || b <= 0) return 1;
  return clamp(a / b, 0.3, 1.5);
}

function val(p) {
  return typeof p === 'object' && p !== null && 'value' in p ? p.value : p;
}

// Resolve a crop with optional overrides {durationDays, yieldKgHa, pricePhpKg, costPhpHa, laborMdHa, ky, kcMid, rootDepthM, soilTier}
export function resolveCrop(id, overrides = {}) {
  const c = CROPS[id];
  const o = overrides[id] || {};
  return {
    ...c,
    duration: Math.round(o.durationDays ?? val(c.durationDays) ?? 0),
    kcv: c.kc ? { ini: c.kc.ini, mid: o.kcMid ?? c.kc.mid, end: c.kc.end } : null,
    rootDepth: o.rootDepthM ?? val(c.rootDepthM) ?? 0,
    kyv: o.ky ?? val(c.ky) ?? 0,
    yieldKgHa: o.yieldKgHa ?? val(c.econ.yieldKgHa),
    pricePhpKg: o.pricePhpKg ?? val(c.econ.pricePhpKg),
    costPhpHa: o.costPhpHa ?? val(c.econ.costPhpHa),
    laborMd: o.laborMdHa ?? val(c.laborMdHa),
    soilScore: o.soilTier ?? val(c.soilTier),
    forageScore: val(c.forageTier),
  };
}

/**
 * Simulate one rotation's dry-season slot.
 * ctx = { daily, plantingDay, soilId, waterMode: 'rainfed'|'irrigated', wetRatio, model?, irrigation? }
 */
export function simulate(id, ctx, overrides = {}) {
  const crop = resolveCrop(id, overrides);
  const soil = SOILS[ctx.soilId];
  const situation = FIELD_SITUATIONS[ctx.situationId] ?? FIELD_SITUATIONS.after_wet_rice;
  const model = { initialFraction: val(situation.initialFraction), stages: val(MODEL.stages),
    flowerFrac: val(MODEL.flowerFrac), heatFlagDays: val(MODEL.heatFlagDays), ...(ctx.model || {}) };
  const irr = { efficiency: val(IRRIGATION.efficiency), costPhpPerMm: val(IRRIGATION.costPhpPerMm), ...(ctx.irrigation || {}) };
  const blocked = Boolean(crop.blockOnClay && soil.drainage === 'poor');
  if (crop.isFallow) {
    return { id, crop, blocked: false, fallow: true, start: ctx.plantingDay, end: ctx.plantingDay,
      etc: 0, peff: 0, storedWater: 0, supply: 0, pctMet: null, deficit: 0, irrigationMm: 0,
      yieldLoss: 0, gross: 0, irrigationCost: 0, net: -crop.costPhpHa, laborMd: crop.laborMd,
      coverFrac: 0, hotFlowerDays: 0, heatFlag: false, overlapsWetSeason: false };
  }
  const dur = crop.duration;
  const start = ctx.plantingDay;
  const fStart = (model.stages.ini + model.stages.dev) * dur;
  const fEnd = fStart + model.flowerFrac * dur;
  let etc = 0;
  let peff = 0;
  let hot = 0;
  for (let t = 0; t < dur; t += 1) {
    const d = ctx.daily.days[Math.min(start + t, SEASON_LENGTH - 1)];
    etc += kcAt(t + 0.5, dur, crop.kcv, model.stages) * d.et0;
    peff += d.peff;
    if (t >= fStart && t < fEnd) hot += d.hot;
  }
  const taw = val(soil.tawPerM) * crop.rootDepth * 1000;
  const f0 = clamp(model.initialFraction * (ctx.wetRatio ?? 1), 0, 1);
  const storedWater = taw * f0;
  const supply = Math.min(etc, peff + storedWater);
  const pctMet = etc > 0 ? supply / etc : 1;
  const deficit = Math.max(0, etc - supply);
  const irrigated = ctx.waterMode === 'irrigated';
  const yieldLoss = irrigated ? 0 : clamp(crop.kyv * (1 - pctMet), 0, 1);
  const irrigationMm = irrigated ? deficit / irr.efficiency : 0;
  const irrigationCost = irrigationMm * irr.costPhpPerMm;
  const gross = crop.yieldKgHa * (1 - yieldLoss) * crop.pricePhpKg;
  const net = gross - crop.costPhpHa - irrigationCost;
  return {
    id, crop, blocked, fallow: false, start, end: start + dur,
    etc, peff, storedWater, supply, pctMet, deficit, irrigationMm, yieldLoss, gross, irrigationCost, net,
    laborMd: crop.laborMd,
    coverFrac: Math.min(dur, SEASON_LENGTH - start) / SEASON_LENGTH,
    hotFlowerDays: hot,
    heatFlag: hot >= model.heatFlagDays,
    overlapsWetSeason: start + dur > SEASON_LENGTH,
  };
}

export function normalizeWeights(raw) {
  const ids = CRITERIA.map((c) => c.id);
  const clean = Object.fromEntries(ids.map((k) => [k, Math.max(0, Number(raw?.[k]) || 0)]));
  const sum = ids.reduce((a, k) => a + clean[k], 0);
  return Object.fromEntries(ids.map((k) => [k, sum > 0 ? clean[k] / sum : 1 / ids.length]));
}

// Min-max to 0-100 over the given ids. Near-equal values (spread < 2% of the largest magnitude) all get 50.
export function minMax(values, invert = false) {
  const ids = Object.keys(values);
  const xs = ids.map((k) => values[k]);
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const span = hi - lo;
  const tol = Math.max(1e-9, 0.02 * Math.max(Math.abs(lo), Math.abs(hi)));
  if (ids.length === 0) return {};
  if (span < tol) return Object.fromEntries(ids.map((k) => [k, 50]));
  return Object.fromEntries(ids.map((k) => [k, (100 * (invert ? hi - values[k] : values[k] - lo)) / span]));
}

export function scoreResults(results, rawWeights) {
  const w = normalizeWeights(rawWeights);
  const open = results.filter((r) => !r.blocked);
  const income = minMax(Object.fromEntries(open.map((r) => [r.id, r.net])));
  const labor = minMax(Object.fromEntries(open.map((r) => [r.id, r.laborMd])), true);
  const scored = results.map((r) => {
    if (r.blocked) return { ...r, scores: null, contributions: null, final: null };
    const scores = {
      drought: r.fallow ? 100 : 100 * r.pctMet,
      soil: r.crop.soilScore,
      cover: 100 * r.coverFrac,
      income: income[r.id],
      labor: labor[r.id],
      forage: r.crop.forageScore,
    };
    const contributions = Object.fromEntries(Object.keys(scores).map((k) => [k, w[k] * scores[k]]));
    const final = Object.values(contributions).reduce((a, b) => a + b, 0);
    return { ...r, scores, contributions, final };
  });
  return rank(scored);
}

export function rank(scored) {
  return [...scored].sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    if (a.blocked && b.blocked) return a.id.localeCompare(b.id);
    if (b.final !== a.final) return b.final - a.final;
    return a.id.localeCompare(b.id);
  }).map((r, i) => ({ ...r, rank: r.blocked ? null : i + 1 }));
}

export function topReasons(result, n = 2) {
  if (!result.contributions) return [];
  return CRITERIA.map((c) => ({ id: c.id, label: c.label, points: result.contributions[c.id] }))
    .filter((x) => x.points > 0.5)
    .sort((a, b) => b.points - a.points)
    .slice(0, n);
}

/**
 * Run all rotations for one scenario.
 * inputs = { climate, scenarioId, situationId, soilId, waterMode, plantingId, rainPct, tempDelta, weights, overrides }
 */
export function resolvePlanting(situationId, plantingId) {
  const situation = FIELD_SITUATIONS[situationId] ?? FIELD_SITUATIONS.after_wet_rice;
  return PLANTING_OPTIONS.find((p) => p.id === (plantingId || situation.defaultPlanting))
    ?? PLANTING_OPTIONS.find((p) => p.id === situation.defaultPlanting);
}

export function evaluate(inputs) {
  const { climate, scenarioId, situationId = 'after_wet_rice', soilId, waterMode, plantingId, rainPct = 0, tempDelta = 0, weights, overrides = {} } = inputs;
  const scen = climate.scenarios[scenarioId].monthly;
  const typical = climate.scenarios.typical.monthly;
  const planting = resolvePlanting(situationId, plantingId);
  const daily = dailySeries(scen, { rainPct, tempDelta });
  const ctx = { daily, plantingDay: planting.day, situationId, soilId, waterMode,
    wetRatio: wetRatio(scen, typical, monthIndexOfDay(planting.day)), model: inputs.model, irrigation: inputs.irrigation };
  const results = ROTATION_IDS.map((id) => simulate(id, ctx, overrides));
  return { ranked: scoreResults(results, weights), rainSource: daily.source, planting, ctx };
}

// Deterministic PRNG so the uncertainty numbers are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uni = (rnd, lo, hi) => lo + (hi - lo) * rnd();

/**
 * Monte Carlo over the parameter ranges and +/-20% weight jitter.
 * Returns { draws, topShare: {id: 0..1}, beatsCurrentShare: {id: 0..1} }.
 */
export function uncertainty(inputs, { draws = 300, seed = 20261115, currentId = 'rice_fallow' } = {}) {
  const rnd = mulberry32(seed);
  const top = Object.fromEntries(ROTATION_IDS.map((id) => [id, 0]));
  const beats = Object.fromEntries(ROTATION_IDS.map((id) => [id, 0]));
  const baseW = normalizeWeights(inputs.weights);
  for (let k = 0; k < draws; k += 1) {
    const overrides = {};
    for (const id of ROTATION_IDS) {
      const c = CROPS[id];
      const base = resolveCrop(id, inputs.overrides || {});
      if (c.isFallow) continue;
      const pick = (p, fallback) => (p?.range ? uni(rnd, p.range[0], p.range[1]) : fallback);
      overrides[id] = {
        durationDays: Math.round(pick(c.durationDays, base.duration)),
        kcMid: base.kcv.mid + uni(rnd, -0.05, 0.05),
        ky: pick(c.ky, base.kyv),
        rootDepthM: pick(c.rootDepthM, base.rootDepth),
        yieldKgHa: base.yieldKgHa * uni(rnd, 0.8, 1.2),
        pricePhpKg: base.pricePhpKg * uni(rnd, 0.85, 1.15),
        costPhpHa: base.costPhpHa * uni(rnd, 0.9, 1.1),
        laborMdHa: base.laborMd * uni(rnd, 0.85, 1.15),
        soilTier: clamp(base.soilScore + uni(rnd, -10, 10), 0, 100),
      };
    }
    const weights = Object.fromEntries(Object.entries(baseW).map(([key, v]) => [key, v * uni(rnd, 0.8, 1.2)]));
    const sit = FIELD_SITUATIONS[inputs.situationId] ?? FIELD_SITUATIONS.after_wet_rice;
    const model = { initialFraction: uni(rnd, sit.initialFraction.range[0], sit.initialFraction.range[1]) };
    const { ranked } = evaluate({ ...inputs, overrides, weights, model });
    const first = ranked.find((r) => !r.blocked);
    if (first) top[first.id] += 1;
    const cur = ranked.find((r) => r.id === currentId);
    for (const r of ranked) {
      if (r.blocked || r.id === currentId) continue;
      if (!cur || cur.blocked || r.final > cur.final) beats[r.id] += 1;
    }
  }
  return {
    draws,
    topShare: Object.fromEntries(ROTATION_IDS.map((id) => [id, top[id] / draws])),
    beatsCurrentShare: Object.fromEntries(ROTATION_IDS.map((id) => [id, beats[id] / draws])),
  };
}

// Replay every past dry season with the current settings (no weights): water met and net income.
export function replaySeasons(inputs) {
  const { climate, situationId = 'after_wet_rice', soilId, waterMode, plantingId, rainPct = 0, tempDelta = 0, overrides = {} } = inputs;
  const typical = climate.scenarios.typical.monthly;
  const planting = resolvePlanting(situationId, plantingId);
  return climate.seasons.map((s) => {
    const daily = dailySeries(s.monthly, { rainPct, tempDelta });
    const ctx = { daily, plantingDay: planting.day, situationId, soilId, waterMode,
      wetRatio: wetRatio(s.monthly, typical, monthIndexOfDay(planting.day)) };
    const cells = Object.fromEntries(ROTATION_IDS.map((id) => {
      const r = simulate(id, ctx, overrides);
      return [id, { pctMet: r.pctMet, net: r.net, blocked: r.blocked, heatFlag: r.heatFlag }];
    }));
    return { id: s.id, enso: s.enso, strength: s.strength, oni: s.oni_djf, rainSource: daily.source, cells };
  });
}

// Month-by-month stress for the season calendar ("vulnerable months").
export function monthlyStress(monthly, { rainPct = 0, tempDelta = 0, kcRef = 1.05, hotDaysFlag = 5 } = {}) {
  const daily = dailySeries(monthly, { rainPct, tempDelta });
  let day = 0;
  return SEASON_MONTHS.map((label, i) => {
    const d = daily.days[day];
    day += SEASON_DAYS[i];
    const demand = kcRef * d.et0 * SEASON_DAYS[i];
    const supply = d.peff * SEASON_DAYS[i];
    const hotDays = monthly.hot_days[i] ?? 0;
    return { month: label, demandMm: demand, peffMm: supply, ratio: demand > 0 ? supply / demand : 1,
      hotDays, waterStress: supply < 0.5 * demand, heatStress: hotDays >= hotDaysFlag };
  });
}

export function seedDemandKg(hectares, sharePct, seedRateKgHa) {
  return Math.max(0, hectares) * clamp(sharePct, 0, 100) / 100 * Math.max(0, seedRateKgHa);
}

// First month where scenario rain < ratio x typical and typical rain >= minTypical mm; -1 if none.
export function firstDeficitMonth(scenRain, typicalRain, { ratio = 0.5, minTypical = 20 } = {}) {
  for (let i = 0; i < 6; i += 1) {
    if (typicalRain[i] >= minTypical && scenRain[i] < ratio * typicalRain[i]) return i;
  }
  return -1;
}

export function formatPhp(x) {
  const sign = x < 0 ? '-' : '';
  return `${sign}PHP ${Math.round(Math.abs(x)).toLocaleString('en-PH')}`;
}
