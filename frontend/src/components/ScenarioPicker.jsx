// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { SCENARIO_IDS } from '../engine/engine.js';

export default function ScenarioPicker({ climate, scenarioId, dispatch }) {
  return (
    <section aria-labelledby="step3" className="rounded-lg border border-stone-300 bg-white p-4">
      <h2 id="step3" className="text-lg font-bold text-green-900">Step 3. Scenario</h2>
      <div role="radiogroup" aria-labelledby="step3" className="mt-2 grid gap-2">
        {SCENARIO_IDS.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={scenarioId === id}
            onClick={() => dispatch({ type: 'set', key: 'scenarioId', value: id })}
            className={`min-h-[44px] rounded border px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${scenarioId === id ? 'border-green-800 bg-green-800 font-semibold text-white' : 'border-stone-400 bg-white'}`}>
            {scenarioId === id ? '● ' : '○ '}{climate.scenarios[id].label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-stone-600">Scenarios summarise past seasons; they are not forecasts.</p>
    </section>
  );
}
