// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useMemo } from 'react';
import { normalizeWeights } from '../engine/engine.js';

// Returns the share of each priority as a whole percent (largest-remainder, so they sum to 100).
export function useNormalizedWeights(weights) {
  return useMemo(() => {
    const n = normalizeWeights(weights);
    const ids = Object.keys(n);
    const floors = Object.fromEntries(ids.map((k) => [k, Math.floor(n[k] * 100)]));
    let left = 100 - ids.reduce((a, k) => a + floors[k], 0);
    const order = [...ids].sort((a, b) => (n[b] * 100 - floors[b]) - (n[a] * 100 - floors[a]));
    for (const k of order) { if (left <= 0) break; floors[k] += 1; left -= 1; }
    return { fractions: n, percents: floors };
  }, [weights]);
}
