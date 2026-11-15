// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useState } from 'react';
import { seedDemandKg, firstDeficitMonth, pickRain, SEASON_MONTHS } from '../engine/engine.js';
import { CROPS, ROTATION_IDS } from '../engine/params.js';
import StatusBadge from './StatusBadge.jsx';

const field = 'min-h-[44px] w-full rounded border border-stone-400 bg-white px-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700';
const n = (x) => Math.round(x).toLocaleString('en-PH');

export default function Community({ result, climate, scenarioId, waterMode }) {
  const [ha, setHa] = useState(1000);
  const [share, setShare] = useState(60);
  const [pick, setPick] = useState(null);
  const top = result.ranked.find((r) => !r.blocked);
  const cropId = pick ?? top?.id ?? ROTATION_IDS[0];
  const r = result.ranked.find((x) => x.id === cropId);
  const crop = CROPS[cropId];
  const adopted = Math.max(0, ha) * Math.min(100, Math.max(0, share)) / 100;
  const seed = seedDemandKg(ha, share, crop.seedRateKgHa.value);
  const labour = adopted * r.laborMd;
  const water = r.irrigationMm * adopted * 10;
  const scen = pickRain(climate.scenarios[scenarioId].monthly).rain;
  const typ = pickRain(climate.scenarios.typical.monthly).rain;
  const dm = firstDeficitMonth(scen, typ);

  return (
    <section aria-labelledby="com-t" className="space-y-4 rounded-lg border border-stone-300 bg-white p-4">
      <h2 id="com-t" className="text-lg font-bold text-green-900">Community view</h2>
      <p role="note" className="inline-block rounded border border-stone-400 bg-stone-100 px-2 py-1 text-sm font-semibold">Illustrative scenario, not an LGU plan.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="c-ha" className="text-sm font-semibold">Hectares in the cooperative</label>
          <input id="c-ha" type="number" min="0" inputMode="numeric" className={field} value={ha} onChange={(e) => setHa(Math.max(0, Number(e.target.value) || 0))} />
          <div className="mt-1"><StatusBadge status="illustrative" title="Default of 1,000 ha is a placeholder; enter your cooperative's real area" /></div>
        </div>
        <div>
          <label htmlFor="c-share" className="text-sm font-semibold">Share adopting (%)</label>
          <input id="c-share" type="number" min="0" max="100" inputMode="numeric" className={field} value={share} onChange={(e) => setShare(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
          <div className="mt-1"><StatusBadge status="illustrative" title="Placeholder adoption share" /></div>
        </div>
        <div>
          <label htmlFor="c-crop" className="text-sm font-semibold">Crop {pick === null && <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-xs">top-ranked</span>}</label>
          <select id="c-crop" className={field} value={cropId} onChange={(e) => setPick(e.target.value)}>
            {result.ranked.map((x) => <option key={x.id} value={x.id} disabled={x.blocked}>{x.crop.name}{x.blocked ? ' (blocked)' : ''}</option>)}
          </select>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Seed needed</dt><dd className="text-xl font-bold">{n(seed)} kg</dd>
          <dd className="mt-1 flex items-center gap-1 text-xs text-stone-600"><StatusBadge status={crop.seedRateKgHa.status} title={crop.seedRateKgHa.source ?? ''} /> {crop.seedRateKgHa.value} kg/ha seed rate</dd></div>
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Total labour</dt><dd className="text-xl font-bold">{n(labour)} man-days</dd>
          <dd className="mt-1 text-xs text-stone-600">{r.laborMd} man-days/ha on {n(adopted)} ha</dd></div>
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Extra water if irrigating</dt>
          <dd className="text-xl font-bold">{waterMode === 'irrigated' ? `${n(water)} m³` : `${n(r.irrigationMm * adopted * 10 || 0)} m³`}</dd>
          <dd className="mt-1 text-xs text-stone-600">{waterMode === 'irrigated' ? `About ${n(r.irrigationMm)} mm per ha pumped (illustrative cost model).` : 'Your Compare settings are rainfed, so this shows 0; switch to "Can irrigate" in Compare to see the pumped volume.'}</dd></div>
      </dl>

      <div className="rounded border border-sky-300 bg-sky-50 p-3 text-sm">
        <h3 className="font-semibold">Coordination prompt</h3>
        <p>{dm >= 0
          ? `In this scenario, rainfall falls below half of normal from ${SEASON_MONTHS[dm]}. Agree on water sharing and planting dates with the irrigators' association and the Municipal Agriculture Office before then.`
          : 'No month falls below half of normal in this scenario; this does not rule out dry spells.'}</p>
      </div>
      <div className="text-sm">
        <h3 className="font-semibold">Who to involve</h3>
        <ul className="list-disc pl-5">
          <li>Municipal Agriculture Office (San Mateo)</li>
          <li>PhilRice Isabela (Malasin, San Mateo)</li>
          <li>Philippine Mungbean Center (ISU San Mateo)</li>
          <li>The irrigators' association</li>
        </ul>
        <p className="mt-2 text-stone-700">Planting synchronisation: neighbouring fields planting the same crop within the same 2 weeks eases pest and water management (general practice; verify locally).</p>
      </div>
    </section>
  );
}
