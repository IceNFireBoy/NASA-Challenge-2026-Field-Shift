// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { CRITERIA } from '../engine/engine.js';
import { useNormalizedWeights } from '../hooks/useNormalizedWeights.js';

export default function PrioritySliders({ weights, dispatch }) {
  const tr = useTr();
  const { percents } = useNormalizedWeights(weights);
  return (
    <section aria-labelledby="step2" className="card">
      <div className="flex items-center justify-between">
        <h2 id="step2" className="text-xl font-bold text-green-950">{tr('Step 2. Your priorities')}</h2>
        <button type="button" onClick={() => dispatch({ type: 'resetWeights' })} className="min-h-[44px] rounded border border-stone-400 px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">{tr('Reset')}</button>
      </div>
      <p className="text-sm text-stone-600">{tr('Move a slider up for what matters more. Shares always add up to 100%.')}</p>
      <div className="mt-3 space-y-4">
        {CRITERIA.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={`w-${c.id}`} className="flex items-center gap-2 text-sm font-semibold">
                {tr(c.label)}
              </label>
              <span className="text-sm font-bold tabular-nums">{percents[c.id]}%</span>
            </div>
            <input id={`w-${c.id}`} type="range" min="0" max="100" step="5" value={weights[c.id]}
              aria-valuetext={`${c.label} ${weights[c.id]}, ${percents[c.id]}% of total`}
              onChange={(e) => dispatch({ type: 'weight', key: c.id, value: Number(e.target.value) })}
              className="h-11 w-full accent-green-800" />
            <p className="text-sm text-stone-600">{c.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
