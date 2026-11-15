// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { describe, expect, it } from 'vitest';
import climate from '../data/climate.json';
import { evaluate, DEFAULT_WEIGHTS, SCENARIO_IDS, CRITERIA } from '../engine/engine.js';
import { buildWhyCard, dateOfDay } from '../engine/content.js';
import { SOILS, FIELD_SITUATIONS } from '../engine/params.js';
import { BANNED, PRIORITIES, picksToWeights, plainCard, plainReasons, plainText, trafficLights } from './farmer.js';
import { STRINGS, makeT } from './i18n.js';
import { INITIAL, reducer, sanitize } from './state.js';

const combos = [];
for (const scenarioId of SCENARIO_IDS) for (const soilId of Object.keys(SOILS)) for (const waterMode of ['rainfed', 'irrigated']) {
  for (const situationId of Object.keys(FIELD_SITUATIONS)) combos.push({ scenarioId, soilId, waterMode, situationId });
}

describe('farmer mode rules', () => {
  it('maps picks to weights and falls back to the defaults', () => {
    expect(picksToWeights([])).toEqual(DEFAULT_WEIGHTS);
    const w = picksToWeights(['safe', 'income']);
    expect(w.drought).toBe(40);
    expect(w.income).toBe(40);
    expect(w.soil).toBe(5);
    expect(Object.keys(w).sort()).toEqual(CRITERIA.map((c) => c.id).sort());
    expect(picksToWeights(['safe', 'income', 'feed']).forage).toBe(5); // third pick is dropped
    expect(picksToWeights(['nonsense'])).toEqual(DEFAULT_WEIGHTS);
  });

  it('strips technical asides but keeps the sentence', () => {
    expect(plainText('Most sensitive to drought here (Ky 1.25).')).toBe('Most sensitive to drought here.');
    expect(plainText('Crop water need 250 mm (FAO-56 crop coefficients x reference ET from NASA POWER temperatures).')).toBe('Crop water need 250 mm.');
    expect(plainText('NASA POWER is a gridded estimate (~50 km), not a weather station.')).toContain('(~50 km)');
  });

  it('never shows ET0, Ky or "normalised" on a farmer screen', () => {
    for (const lang of Object.keys(STRINGS)) {
      for (const s of Object.values(STRINGS[lang])) expect(s).not.toMatch(BANNED);
    }
    for (const c of combos) {
      const result = evaluate({ climate, ...INITIAL, ...c });
      const rankCount = result.ranked.filter((r) => !r.blocked).length;
      for (const r of result.ranked) {
        const card = plainCard(buildWhyCard(r, { waterMode: c.waterMode, scenarioLabel: climate.scenarios[c.scenarioId].label,
          rainSource: result.rainSource, soilLabel: SOILS[c.soilId].label, rankCount }));
        for (const v of Object.values(card).flat()) expect(v).not.toMatch(BANNED);
        for (const lang of Object.keys(STRINGS)) {
          const t = makeT(lang);
          for (const reason of plainReasons(r, { waterMode: c.waterMode, laborCap: 40 })) expect(t(reason.key, reason.vars)).not.toMatch(BANNED);
        }
      }
    }
  });

  it('gives the best option three reasons and four lights in every setting', () => {
    for (const c of combos) {
      const best = evaluate({ climate, ...INITIAL, ...c }).ranked.find((r) => !r.blocked);
      const ctx = { waterMode: c.waterMode, laborCap: 40 };
      const reasons = plainReasons(best, ctx);
      expect(reasons.length).toBeGreaterThanOrEqual(2);
      expect(reasons.length).toBeLessThanOrEqual(3);
      const lights = trafficLights(best, ctx);
      expect(Object.keys(lights)).toEqual(['water', 'soil', 'income', 'work']);
      for (const l of Object.values(lights)) expect(['good', 'ok', 'risk', 'none']).toContain(l.level);
    }
  });

  it('every translation key exists in both languages', () => {
    expect(Object.keys(STRINGS.fil).sort()).toEqual(Object.keys(STRINGS.en).sort());
    for (const p of PRIORITIES) expect(STRINGS.en[`q4.${p.id}`]).toBeTruthy();
  });
});

describe('shared state', () => {
  it('drops saved values this build does not understand', () => {
    const s = sanitize({ scenarioId: 'gone', soilId: 'sand', weights: 'x', rainPct: -999, mode: 'expert', picks: ['safe', 'x', 'soil', 'feed'] }, climate);
    expect(s.scenarioId).toBe('typical');
    expect(s.soilId).toBe('loam');
    expect(s.weights).toEqual(DEFAULT_WEIGHTS);
    expect(s.rainPct).toBe(-50);
    expect(s.mode).toBe('expert');
    expect(s.picks).toEqual(['safe', 'soil']);
    expect(sanitize(null, climate)).toEqual(INITIAL);
    expect(() => evaluate({ climate, ...s })).not.toThrow();
  });

  it('farmer answers write the settings expert mode reads', () => {
    let s = reducer(INITIAL, { type: 'picks', value: ['work'] });
    expect(s.weights.labor).toBe(40);
    s = reducer(s, { type: 'elNino', value: 'yes' });
    expect(s.scenarioId).toBe('elnino_strong');
    s = reducer(s, { type: 'elNino', value: 'unsure' });
    expect(s.scenarioId).toBe('typical');
    s = reducer({ ...s, mode: 'expert', lang: 'fil' }, { type: 'resetAll' });
    expect(s).toEqual({ ...INITIAL, mode: 'expert', lang: 'fil' });
  });
});

describe('dateOfDay', () => {
  it('rolls past May 31 into real calendar dates', () => {
    expect(dateOfDay(0)).toBe('Dec 1');
    expect(dateOfDay(181)).toBe('May 31');
    expect(dateOfDay(182)).toBe('Jun 1');
    expect(dateOfDay(121 + 105)).toBe('Jul 15'); // Apr 1 planting, 105-day crop (was "Jun 45")
  });
});
