// SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team.
import { describe, expect, it } from 'vitest';
import climate from '../data/climate.json';
import {
  dailySeries, effectiveRain, evaluate, firstDeficitMonth, kcAt, minMax, monthlyStress,
  normalizeWeights, replaySeasons, seedDemandKg, simulate, uncertainty, DEFAULT_WEIGHTS,
} from './engine.js';
import { buildWhyCard } from './content.js';

const flat = (v) => ({ rain_imerg_mm: [v, v, v, v, v, v], rain_power_mm: [v, v, v, v, v, v],
  et0_mm: [124, 124, 112, 124, 120, 124], tmax_c: [30, 30, 30, 30, 30, 30], tmin_c: [20, 20, 20, 20, 20, 20],
  hot_days: [0, 0, 0, 0, 0, 0], wetness: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6] }); // ET0 = 4 mm/day

const base = { climate, scenarioId: 'typical', soilId: 'loam', waterMode: 'rainfed', plantingId: 'jan15', weights: DEFAULT_WEIGHTS };

describe('agro-climate maths', () => {
  it('effective rainfall follows USDA-SCS', () => {
    expect(effectiveRain(0)).toBe(0);
    expect(effectiveRain(100)).toBeCloseTo(84, 6);
    expect(effectiveRain(300)).toBeCloseTo(155, 6);
  });

  it('Kc curve hits FAO-56 stage values', () => {
    const kc = { ini: 0.4, mid: 1.05, end: 0.35 };
    const st = { ini: 0.18, dev: 0.27, mid: 0.35, late: 0.2 };
    expect(kcAt(0, 70, kc, st)).toBe(0.4);
    expect(kcAt(40, 70, kc, st)).toBe(1.05);
    expect(kcAt(69.999, 70, kc, st)).toBeCloseTo(0.35, 3);
  });

  it('mungbean water need matches the analytic average Kc', () => {
    const daily = dailySeries(flat(0));
    const r = simulate('rice_mungbean', { daily, plantingDay: 45, soilId: 'loam', waterMode: 'rainfed', wetRatio: 1 });
    const avgKc = 0.4 * 0.18 + ((0.4 + 1.05) / 2) * 0.27 + 1.05 * 0.35 + ((1.05 + 0.35) / 2) * 0.2;
    expect(r.etc).toBeCloseTo(4 * 70 * avgKc, 0);
    expect(r.peff).toBe(0);
    expect(r.storedWater).toBeCloseTo(0.155 * 0.6 * 1000 * 0.6, 6); // after_wet_rice default fraction 0.6
    expect(r.yieldLoss).toBeCloseTo(Math.min(1, 1.15 * (1 - r.pctMet)), 9);
  });

  it('irrigated mode removes yield loss and charges for water', () => {
    const daily = dailySeries(flat(0));
    const r = simulate('rice_corn', { daily, plantingDay: 45, soilId: 'loam', waterMode: 'irrigated', wetRatio: 1 });
    expect(r.yieldLoss).toBe(0);
    expect(r.irrigationMm).toBeGreaterThan(0);
    expect(r.irrigationCost).toBeCloseTo(r.irrigationMm * 30, 6);
  });

  it('rain what-if and warming move water balance the right way', () => {
    const wet = dailySeries(flat(100));
    const dry = dailySeries(flat(100), { rainPct: -50 });
    const hot = dailySeries(flat(100), { tempDelta: 2 });
    expect(dry.days[0].peff).toBeLessThan(wet.days[0].peff);
    expect(hot.days[0].et0).toBeGreaterThan(wet.days[0].et0);
  });
});

describe('scoring and ranking', () => {
  it('normalises weights and handles all-zero', () => {
    const w = normalizeWeights({ drought: 2, soil: 1, cover: 1, income: 0, labor: 0, forage: 0 });
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    expect(w.drought).toBeCloseTo(0.5, 9);
    const eq = normalizeWeights({});
    expect(Object.values(eq).every((x) => Math.abs(x - 1 / 6) < 1e-9)).toBe(true);
  });

  it('min-max gives 50 to near-equal values and inverts correctly', () => {
    expect(minMax({ a: 100, b: 100.5 })).toEqual({ a: 50, b: 50 });
    const inv = minMax({ a: 0, b: 50, c: 100 }, true);
    expect(inv).toEqual({ a: 100, b: 50, c: 0 });
  });

  it('blocks peanut on heavy clay and lists it last', () => {
    const { ranked } = evaluate({ ...base, soilId: 'clay' });
    const last = ranked[ranked.length - 1];
    expect(last.id).toBe('rice_peanut');
    expect(last.blocked).toBe(true);
    expect(last.final).toBeNull();
    const loam = evaluate(base).ranked.find((r) => r.id === 'rice_peanut');
    expect(loam.blocked).toBe(false);
  });

  it('every ranked option gets a complete why card', () => {
    const { ranked, rainSource } = evaluate(base);
    for (const r of ranked) {
      const c = buildWhyCard(r, { waterMode: 'rainfed', scenarioLabel: 'a typical year', rainSource, soilLabel: 'loam', rankCount: 4 });
      expect(c.why.length).toBeGreaterThan(10);
      for (const k of ['evidence', 'benefits', 'gaps', 'risks', 'validate']) expect(c[k].length).toBeGreaterThan(0);
    }
  });

  it('field situation sets planting date and starting soil water', () => {
    const wet = evaluate({ ...base, plantingId: undefined, situationId: 'after_wet_rice' });
    const dry = evaluate({ ...base, plantingId: undefined, situationId: 'after_dry_rice' });
    expect(wet.planting.id).toBe('dec15');
    expect(dry.planting.id).toBe('mar15');
    expect(dry.planting.day).toBe(104);
    const mWet = wet.ranked.find((r) => r.id === 'rice_mungbean');
    const mDry = dry.ranked.find((r) => r.id === 'rice_mungbean');
    expect(mDry.storedWater / 0.85).toBeCloseTo(mWet.storedWater / 0.6 * (dry.ctx.wetRatio / wet.ctx.wetRatio), 6);
  });

  it('El Nino scenario lowers drought safety for mungbean', () => {
    const typ = evaluate(base).ranked.find((r) => r.id === 'rice_mungbean');
    const eln = evaluate({ ...base, scenarioId: 'elnino_strong' }).ranked.find((r) => r.id === 'rice_mungbean');
    expect(eln.pctMet).toBeLessThan(typ.pctMet);
  });
});

describe('uncertainty, replay and community helpers', () => {
  it('Monte Carlo is reproducible and shares sum to 1', () => {
    const a = uncertainty(base, { draws: 60 });
    const b = uncertainty(base, { draws: 60 });
    expect(a).toEqual(b);
    expect(Object.values(a.topShare).reduce((x, y) => x + y, 0)).toBeCloseTo(1, 9);
  });

  it('replays all 24 seasons', () => {
    const rows = replaySeasons(base);
    expect(rows).toHaveLength(24);
    expect(rows.find((r) => r.id === '2015-16').enso).toBe('el_nino');
  });

  it('flags vulnerable months and finds the first rainfall deficit', () => {
    const stress = monthlyStress(climate.scenarios.elnino_strong.monthly);
    expect(stress).toHaveLength(6);
    expect(firstDeficitMonth([100, 10, 5, 5, 5, 5], [100, 40, 30, 30, 30, 30])).toBe(1);
    expect(firstDeficitMonth([100, 40, 30, 30, 30, 30], [100, 40, 30, 30, 30, 30])).toBe(-1);
    expect(firstDeficitMonth([5, 40, 30, 30, 30, 30], [10, 40, 30, 30, 30, 30])).toBe(-1); // Dec below 20 mm floor
    expect(seedDemandKg(1000, 50, 25)).toBe(12500);
  });
});
