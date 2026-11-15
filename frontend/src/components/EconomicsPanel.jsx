// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { CROPS, ROTATION_IDS } from '../engine/params.js';
import StatusBadge from './StatusBadge.jsx';

const FIELDS = [
  ['yieldKgHa', 'Yield (kg/ha)'],
  ['pricePhpKg', 'Price (PHP/kg)'],
  ['costPhpHa', 'Cost (PHP/ha)'],
];

export default function EconomicsPanel({ overrides, dispatch }) {
  return (
    <details className="rounded-lg border border-stone-300 bg-white p-4">
      <summary className="min-h-[44px] cursor-pointer py-2 text-lg font-bold text-green-900">Prices and costs (editable)</summary>
      <p className="text-sm text-stone-600">Many of these are illustrative. Replace them with your own numbers; the ranking updates immediately.</p>
      <div className="mt-3 space-y-4">
        {ROTATION_IDS.filter((id) => !CROPS[id].isFallow).map((id) => (
          <fieldset key={id} className="rounded border border-stone-200 p-3">
            <legend className="px-1 font-semibold">{CROPS[id].name}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {FIELDS.map(([key, label]) => {
                const p = CROPS[id].econ[key];
                const cur = overrides[id]?.[key];
                return (
                  <div key={key}>
                    <label htmlFor={`${id}-${key}`} className="text-sm font-medium">{label}</label>
                    <input id={`${id}-${key}`} type="number" min="0" step="any" inputMode="decimal"
                      className="min-h-[44px] w-full rounded border border-stone-400 px-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
                      value={cur ?? p.value}
                      onChange={(e) => dispatch({ type: 'override', id, key, value: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} />
                    <div className="mt-1"><StatusBadge status={cur !== undefined ? 'assumption' : p.status} title={p.source ?? p.note ?? ''} /></div>
                    {p.source && <p className="mt-1 text-xs text-stone-600">{p.source}</p>}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <button type="button" onClick={() => dispatch({ type: 'resetOverrides' })} className="mt-3 min-h-[44px] rounded border border-stone-400 px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Reset to defaults</button>
    </details>
  );
}
