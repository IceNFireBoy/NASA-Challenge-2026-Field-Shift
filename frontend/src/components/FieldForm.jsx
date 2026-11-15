// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { FIELD_SITUATIONS, SOILS, CROPS, ROTATION_IDS } from '../engine/params.js';
import { PLANTING_OPTIONS, resolvePlanting } from '../engine/engine.js';
import NumField from './NumField.jsx';

const field = 'min-h-[44px] w-full rounded border border-stone-400 bg-white px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700';

export default function FieldForm({ state, dispatch }) {
  const defaultPlanting = FIELD_SITUATIONS[state.situationId].defaultPlanting;
  const planting = resolvePlanting(state.situationId, state.plantingId);
  const set = (key) => (e) => dispatch({ type: 'set', key, value: e.target.value });
  return (
    <section aria-labelledby="step1" className="rounded-lg border border-stone-300 bg-white p-4">
      <h2 id="step1" className="text-lg font-bold text-green-900">Step 1. Your field</h2>

      <fieldset className="mt-3">
        <legend className="text-sm font-semibold">Field situation</legend>
        <div className="mt-1 grid gap-2">
          {Object.values(FIELD_SITUATIONS).map((s) => (
            <label key={s.id} className={`flex min-h-[44px] cursor-pointer gap-2 rounded border p-3 focus-within:ring-2 focus-within:ring-green-700 ${state.situationId === s.id ? 'border-green-800 bg-green-50' : 'border-stone-300'}`}>
              <input type="radio" name="situation" className="mt-1" checked={state.situationId === s.id} onChange={() => dispatch({ type: 'situation', value: s.id })} />
              <span><span className="block font-medium">{s.label}</span><span className="block text-sm text-stone-600">{s.hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="soil" className="text-sm font-semibold">Soil</label>
          <select id="soil" className={field} value={state.soilId} onChange={set('soilId')}>
            {Object.values(SOILS).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="water" className="text-sm font-semibold">Water access</label>
          <select id="water" className={field} value={state.waterMode} onChange={set('waterMode')}>
            <option value="rainfed">Rainfed only</option>
            <option value="irrigated">Can irrigate</option>
          </select>
        </div>
        <div>
          <label htmlFor="planting" className="text-sm font-semibold">
            Planting date {!state.plantingId && <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-xs font-medium">default</span>}
          </label>
          <select id="planting" className={field} value={planting.id} onChange={(e) => dispatch({ type: 'set', key: 'plantingId', value: e.target.value === defaultPlanting ? null : e.target.value })}>
            {PLANTING_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}{p.id === defaultPlanting ? ' (default)' : ''}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="current" className="text-sm font-semibold">Your current rotation: assumed, please confirm</label>
          <select id="current" className={field} value={state.currentId} onChange={set('currentId')}>
            {ROTATION_IDS.map((id) => <option key={id} value={id}>{CROPS[id].name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="labor" className="text-sm font-semibold">Labour available (man-days per ha)</label>
          <NumField id="labor" max={200} inputMode="numeric" className={field} value={state.laborCap}
            onChange={(v) => dispatch({ type: 'set', key: 'laborCap', value: v })} />
        </div>
      </div>
    </section>
  );
}
