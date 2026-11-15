// SI-ASSISTED: drafted by Claude (Anthropic); reviewed by the team.
// Phase-0 shell: proves data + engine + build work. Claude Code replaces this in Phase 2.
import climate from './data/climate.json';
import { evaluate, DEFAULT_WEIGHTS, formatPhp } from './engine/engine.js';

export default function App() {
  const { ranked, rainSource } = evaluate({ climate, scenarioId: 'typical', situationId: 'after_wet_rice', soilId: 'loam', waterMode: 'rainfed', weights: DEFAULT_WEIGHTS });
  return (
    <main className="mx-auto max-w-3xl p-4">
      <p className="rounded bg-amber-100 p-3 text-sm">Decision support only: this tool highlights historical patterns to support, not replace, local farmer judgment.</p>
      {climate.meta.data_status === 'placeholder' && <p className="mt-2 rounded bg-red-100 p-3 text-sm font-semibold">Placeholder data - not real observations.</p>}
      <h1 className="mt-4 text-2xl font-bold">Field Shift - San Mateo, Isabela</h1>
      <p className="text-sm text-stone-600">Rain source: {rainSource}</p>
      <ol className="mt-4 space-y-2">
        {ranked.map((r) => (
          <li key={r.id} className="rounded border bg-white p-3">
            <b>{r.crop.name}</b>: {r.blocked ? 'blocked' : `${Math.round(r.final)} / 100`} | water met {r.pctMet == null ? 'n/a' : `${Math.round(100 * r.pctMet)}%`} | net {formatPhp(r.net)}/ha
          </li>
        ))}
      </ol>
    </main>
  );
}
