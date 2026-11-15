// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
// Farmer-mode rules. Pure functions, no React. Nothing here changes the engine maths:
// it only maps picture-card answers onto the shared settings and turns engine results
// into plain words. Every threshold below is an assumption and is listed in Data & methods.
import { CRITERIA, DEFAULT_WEIGHTS, topReasons, formatPhp } from '../engine/engine.js';

export const MAX_PICKS = 2;

// Farmer priority card -> engine criterion.
export const PRIORITIES = [
  { id: 'safe', criterion: 'drought', icon: '🛡️' },
  { id: 'soil', criterion: 'soil', icon: '🌱' },
  { id: 'income', criterion: 'income', icon: '💰' },
  { id: 'work', criterion: 'labor', icon: '⏳' },
  { id: 'feed', criterion: 'forage', icon: '🐃' },
];

export const PICK_WEIGHTS = { picked: 40, other: 5 };

export function cleanPicks(picks) {
  const ids = PRIORITIES.map((p) => p.id);
  return [...new Set(Array.isArray(picks) ? picks : [])].filter((p) => ids.includes(p)).slice(0, MAX_PICKS);
}

// Picked priorities get a heavy weight, everything else a light one, so nothing is ignored.
// No picks = the app's balanced defaults.
export function picksToWeights(picks) {
  const clean = cleanPicks(picks);
  if (!clean.length) return DEFAULT_WEIGHTS;
  const chosen = new Set(clean.map((id) => PRIORITIES.find((p) => p.id === id).criterion));
  return Object.fromEntries(CRITERIA.map((c) => [c.id, chosen.has(c.id) ? PICK_WEIGHTS.picked : PICK_WEIGHTS.other]));
}

// El Nino answer -> scenario. "Not sure" stays on the typical year; the results screen
// then also shows what a dry year would change.
export const EL_NINO_SCENARIO = { yes: 'elnino_strong', no: 'typical', unsure: 'typical' };

export const LIGHT_RULES = {
  water: { good: 0.8, ok: 0.5 }, // share of crop water need met (same cut-offs as the Replay heatmap)
  soil: { good: 70, ok: 40 }, // soil-health tier, 0-100
  work: { good: 0.75, ok: 1 }, // share of the labour limit
};

const STATUS_ORDER = ['illustrative', 'assumption', 'secondary', 'sourced', 'local-sourced'];
// Weakest data status among the three numbers behind an option's income.
export function incomeStatus(crop) {
  const found = ['yieldKgHa', 'pricePhpKg', 'costPhpHa'].map((k) => crop?.econ?.[k]?.status).filter(Boolean);
  return STATUS_ORDER.find((s) => found.includes(s)) ?? 'illustrative';
}

const level = (x, rule) => (x >= rule.good ? 'good' : x >= rule.ok ? 'ok' : 'risk');

// Traffic lights for one engine result. Each light = { level, detail: { key, vars } }.
export function trafficLights(r, { waterMode, laborCap }) {
  const water = r.fallow ? { level: 'none', detail: { key: 'light.water.none' } }
    : waterMode === 'irrigated' ? { level: 'good', detail: { key: 'light.water.irrigated' } }
      : { level: r.pctMet > LIGHT_RULES.water.good ? 'good' : r.pctMet >= LIGHT_RULES.water.ok ? 'ok' : 'risk',
        detail: { key: 'light.water.detail', vars: { pct: Math.round(100 * r.pctMet) } } };
  const soilLevel = level(r.crop.soilScore, LIGHT_RULES.soil);
  const net = Math.round(r.net);
  const cap = Number(laborCap) || 0;
  const ratio = cap > 0 ? r.laborMd / cap : Infinity;
  return {
    water,
    soil: { level: soilLevel, detail: { key: `light.soil.${soilLevel}` } },
    income: { status: incomeStatus(r.crop), level: net > 0 ? 'good' : net === 0 ? 'ok' : 'risk',
      detail: { key: net === 0 ? 'light.income.none' : 'light.income.detail', vars: { php: formatPhp(net) } } },
    work: { level: ratio <= LIGHT_RULES.work.good ? 'good' : ratio <= LIGHT_RULES.work.ok ? 'ok' : 'risk',
      detail: { key: 'light.work.detail', vars: { days: Math.round(r.laborMd) } } },
  };
}

// One plain sentence per criterion, only when it is honestly a point in the option's favour.
const REASON = {
  drought: (r, { waterMode }) => {
    if (r.fallow) return { key: 'reason.fallow' };
    if (waterMode === 'irrigated' && r.irrigationMm >= 1) return { key: 'reason.irrigated', vars: { mm: Math.round(r.irrigationMm) } };
    return r.pctMet >= LIGHT_RULES.water.ok ? { key: 'reason.water', vars: { pct: Math.round(100 * r.pctMet) } } : null;
  },
  soil: (r) => (/legume/i.test(r.crop.family || '') && r.crop.soilScore >= LIGHT_RULES.soil.good ? { key: 'reason.soil' } : null),
  cover: (r) => (r.fallow ? null : { key: 'reason.cover', vars: { days: r.crop.duration } }),
  income: (r) => (Math.round(r.net) > 0 ? { key: 'reason.income', vars: { php: formatPhp(r.net) } } : null),
  labor: (r, { laborCap }) => (r.laborMd <= (Number(laborCap) || 0) ? { key: 'reason.work', vars: { days: Math.round(r.laborMd) } } : null),
  forage: (r) => (r.crop.forageScore >= 70 ? { key: 'reason.feed' } : null),
};

// Up to n plain reasons, strongest contribution first (engine's topReasons), then the rest.
export function plainReasons(r, ctx, n = 3) {
  if (!r || r.blocked) return [];
  const order = [...topReasons(r, CRITERIA.length).map((x) => x.id), ...CRITERIA.map((c) => c.id)];
  const out = [];
  for (const id of [...new Set(order)]) {
    const reason = REASON[id](r, ctx);
    if (reason) out.push({ id, ...reason });
  }
  if (r.fallow && r.crop.costPhpHa === 0) out.push({ id: 'nocost', key: 'reason.nocost' });
  return out.slice(0, n);
}

// Remove technical asides such as "(Ky 1.25)" or "(FAO-56 ... reference ET ...)" from why-card lines.
const JARGON = /\s*\((?=[^()]*(?:\bKy\b|\bET0?\b|\bFAO-\d+))[^()]*\)/g;
export const plainText = (s) => String(s ?? '').replace(JARGON, '');

export function plainCard(card) {
  return Object.fromEntries(Object.entries(card).map(([k, v]) => [k, Array.isArray(v) ? v.map(plainText) : plainText(v)]));
}

// Words that must never reach a farmer-mode screen.
export const BANNED = /\bKy\b|\bET0?\b|normali[sz]/i;
