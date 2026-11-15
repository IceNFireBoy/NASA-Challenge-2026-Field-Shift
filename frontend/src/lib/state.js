// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
// Shared app state: defaults, reducer and a guard for settings restored from localStorage.
import { DEFAULT_WEIGHTS, PLANTING_OPTIONS } from '../engine/engine.js';
import { SOILS, FIELD_SITUATIONS, CROPS, DEFAULT_CURRENT } from '../engine/params.js';
import { picksToWeights, cleanPicks, EL_NINO_SCENARIO } from './farmer.js';

export const INITIAL = {
  scenarioId: 'typical', situationId: 'after_wet_rice', soilId: 'loam', waterMode: 'rainfed',
  plantingId: null, currentId: DEFAULT_CURRENT, weights: DEFAULT_WEIGHTS, overrides: {},
  laborCap: 40, rainPct: 0, tempDelta: 0,
  mode: 'farmer', lang: 'en', picks: [], elNino: null,
};

const num = (x, lo, hi, fallback) => (Number.isFinite(Number(x)) && x !== null && x !== '' ? Math.min(hi, Math.max(lo, Number(x))) : fallback);
const isObj = (x) => typeof x === 'object' && x !== null && !Array.isArray(x);

// Keep only saved values the current build understands, so an old or damaged
// localStorage entry can never crash the app.
export function sanitize(saved, climate) {
  if (!isObj(saved)) return INITIAL;
  const s = { ...INITIAL, ...saved };
  return {
    scenarioId: climate.scenarios[s.scenarioId] ? s.scenarioId : INITIAL.scenarioId,
    situationId: FIELD_SITUATIONS[s.situationId] ? s.situationId : INITIAL.situationId,
    soilId: SOILS[s.soilId] ? s.soilId : INITIAL.soilId,
    waterMode: s.waterMode === 'irrigated' ? 'irrigated' : 'rainfed',
    plantingId: PLANTING_OPTIONS.some((p) => p.id === s.plantingId) ? s.plantingId : null,
    currentId: CROPS[s.currentId] ? s.currentId : INITIAL.currentId,
    weights: isObj(s.weights) ? Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map((k) => [k, num(s.weights[k], 0, 100, DEFAULT_WEIGHTS[k])])) : DEFAULT_WEIGHTS,
    overrides: isObj(s.overrides) ? s.overrides : {},
    laborCap: num(s.laborCap, 0, 200, INITIAL.laborCap),
    rainPct: num(s.rainPct, -50, 20, 0),
    tempDelta: num(s.tempDelta, 0, 3, 0),
    mode: s.mode === 'expert' ? 'expert' : 'farmer',
    lang: s.lang === 'fil' ? 'fil' : 'en',
    picks: cleanPicks(s.picks),
    elNino: EL_NINO_SCENARIO[s.elNino] ? s.elNino : null,
  };
}

export function reducer(s, a) {
  switch (a.type) {
    case 'set': return { ...s, [a.key]: a.value };
    case 'situation': return a.value === s.situationId ? s : { ...s, situationId: a.value, plantingId: null };
    case 'weight': return { ...s, weights: { ...s.weights, [a.key]: a.value } };
    case 'resetWeights': return { ...s, weights: DEFAULT_WEIGHTS, picks: [] };
    case 'picks': { const picks = cleanPicks(a.value); return { ...s, picks, weights: picksToWeights(picks) }; }
    case 'elNino': return { ...s, elNino: a.value, scenarioId: EL_NINO_SCENARIO[a.value] ?? s.scenarioId };
    case 'override': {
      const cur = { ...(s.overrides[a.id] || {}) };
      if (a.value === undefined) delete cur[a.key]; else cur[a.key] = a.value;
      return { ...s, overrides: { ...s.overrides, [a.id]: cur } };
    }
    case 'clearExpertTweaks': return { ...s, overrides: {}, plantingId: null, tempDelta: 0 };
    case 'resetAll': return { ...INITIAL, mode: s.mode, lang: s.lang };
    case 'resetOverrides': return { ...s, overrides: {} };
    default: return s;
  }
}
