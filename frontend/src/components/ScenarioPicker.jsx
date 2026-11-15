// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { useRef } from 'react';
import { SCENARIO_IDS } from '../engine/engine.js';

export default function ScenarioPicker({ climate, scenarioId, rainPct, tempDelta, dispatch }) {
  const tr = useTr();
  const refs = useRef({});
  const onKey = (e, i) => {
    const step = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = SCENARIO_IDS[(i + step + SCENARIO_IDS.length) % SCENARIO_IDS.length];
    dispatch({ type: 'set', key: 'scenarioId', value: next });
    refs.current[next]?.focus();
  };
  return (
    <section aria-labelledby="step3" className="card">
      <h2 id="step3" className="text-xl font-bold text-green-950">{tr('Step 3. Scenario')}</h2>
      <div role="radiogroup" aria-labelledby="step3" className="mt-2 grid gap-2">
        {SCENARIO_IDS.map((id, i) => (
          <button key={id} ref={(el) => { refs.current[id] = el; }} type="button" role="radio" aria-checked={scenarioId === id}
            tabIndex={scenarioId === id ? 0 : -1} onKeyDown={(e) => onKey(e, i)}
            onClick={() => dispatch({ type: 'set', key: 'scenarioId', value: id })}
            className={`min-h-[44px] rounded border px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${scenarioId === id ? 'border-green-800 bg-green-800 font-semibold text-white' : 'border-stone-400 bg-white'}`}>
            {scenarioId === id ? '● ' : '○ '}{climate.scenarios[id].label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-stone-600">{tr('Scenarios summarise past seasons; they are not forecasts.')}</p>

      <div className="mt-4 space-y-3 border-t border-stone-200 pt-3">
        <h3 className="text-sm font-bold">{tr('What if?')}</h3>
        <div>
          <div className="flex justify-between text-sm"><label htmlFor="rainpct" className="font-semibold">{tr('Rainfall change')}</label><span className="font-bold tabular-nums">{rainPct > 0 ? '+' : ''}{rainPct}%</span></div>
          <input id="rainpct" type="range" min="-50" max="20" step="10" value={rainPct} aria-valuetext={`Rainfall change ${rainPct > 0 ? '+' : ''}${rainPct} percent`}
            onChange={(e) => dispatch({ type: 'set', key: 'rainPct', value: Number(e.target.value) })} className="h-11 w-full accent-green-800" />
        </div>
        <div>
          <div className="flex justify-between text-sm"><label htmlFor="tempdelta" className="font-semibold">{tr('Warmer by')}</label><span className="font-bold tabular-nums">+{tempDelta.toFixed(1)} °C</span></div>
          <input id="tempdelta" type="range" min="0" max="3" step="0.5" value={tempDelta} aria-valuetext={`Warmer by ${tempDelta} degrees Celsius`}
            onChange={(e) => dispatch({ type: 'set', key: 'tempDelta', value: Number(e.target.value) })} className="h-11 w-full accent-green-800" />
        </div>
        <p className="text-sm text-stone-600">Warming raises crop water use (ET0); it does not recount hot days.</p>
      </div>
    </section>
  );
}
