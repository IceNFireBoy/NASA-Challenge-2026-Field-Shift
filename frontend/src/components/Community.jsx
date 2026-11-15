// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useState } from 'react';
import { seedDemandKg, firstDeficitMonth, pickRain, SEASON_MONTHS } from '../engine/engine.js';
import { CROPS, ROTATION_IDS } from '../engine/params.js';
import { GLOSSARY, SOIL_HEALTH_PRIMER } from '../engine/content.js';
import StatusBadge from './StatusBadge.jsx';
import NumField from './NumField.jsx';

// Sample questions written by the team. Every answer is read from the app's own glossary.
const answer = (list, key, name) => list.find((g) => g[key] === name)?.text;
const SAMPLE_QA = [
  { q: 'What is El Niño, and why does it matter for my dry season?', a: answer(GLOSSARY, 'term', 'El Nino and ONI') },
  { q: 'How do mungbean and peanut help my soil?', a: answer(SOIL_HEALTH_PRIMER, 'title', 'Nitrogen-fixing crops') },
  { q: 'Why can I not count on all the rain that falls?', a: answer(GLOSSARY, 'term', 'Effective rainfall') },
].filter((x) => x.a);

const field = 'min-h-[44px] w-full rounded border border-stone-400 bg-white px-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700';
const n = (x) => Math.round(x).toLocaleString('en-PH');

export default function Community({ result, climate, scenarioId, waterMode }) {
  const [ha, setHa] = useState(1000);
  const [share, setShare] = useState(60);
  const [pick, setPick] = useState(null);
  const top = result.ranked.find((r) => !r.blocked);
  // A crop picked earlier can become blocked when the soil setting changes; fall back to the top option.
  const picked = result.ranked.some((x) => x.id === pick && !x.blocked);
  const cropId = picked ? pick : top?.id ?? ROTATION_IDS[0];
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
    <section aria-labelledby="com-t" className="space-y-4 card">
      <h2 id="com-t" className="text-xl font-bold text-green-950">Plan together</h2>
      <p role="note" className="inline-block rounded border border-stone-400 bg-stone-100 px-2 py-1 text-sm font-semibold">Illustrative scenario, not an LGU plan.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="c-ha" className="text-sm font-semibold">Hectares in the cooperative</label>
          <NumField id="c-ha" inputMode="numeric" className={field} value={ha} onChange={setHa} />
          <div className="mt-1"><StatusBadge status="illustrative" title="Default of 1,000 ha is a placeholder; enter your cooperative's real area" /></div>
        </div>
        <div>
          <label htmlFor="c-share" className="text-sm font-semibold">Share adopting (%)</label>
          <NumField id="c-share" max={100} inputMode="numeric" className={field} value={share} onChange={setShare} />
          <div className="mt-1"><StatusBadge status="illustrative" title="Placeholder adoption share" /></div>
        </div>
        <div>
          <label htmlFor="c-crop" className="text-sm font-semibold">Crop {!picked && <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-sm">top-ranked</span>}</label>
          <select id="c-crop" className={field} value={cropId} onChange={(e) => setPick(e.target.value)}>
            {result.ranked.map((x) => <option key={x.id} value={x.id} disabled={x.blocked}>{x.crop.name}{x.blocked ? ' (blocked)' : ''}</option>)}
          </select>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Seed needed</dt><dd className="text-xl font-bold">{n(seed)} kg</dd>
          <dd className="mt-1 flex items-center gap-1 text-sm text-stone-600"><StatusBadge status={crop.seedRateKgHa.status} title={crop.seedRateKgHa.source ?? ''} /> {crop.seedRateKgHa.value} kg/ha seed rate</dd></div>
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Total labour</dt><dd className="text-xl font-bold">{n(labour)} man-days</dd>
          <dd className="mt-1 text-sm text-stone-600">{r.laborMd} man-days/ha on {n(adopted)} ha</dd></div>
        <div className="rounded border border-stone-200 p-3"><dt className="text-sm text-stone-600">Extra water if irrigating</dt>
          <dd className="text-xl font-bold">{waterMode === 'irrigated' ? `${n(water)} m³` : `${n(r.irrigationMm * adopted * 10 || 0)} m³`}</dd>
          <dd className="mt-1 text-sm text-stone-600">{waterMode === 'irrigated' ? `About ${n(r.irrigationMm)} mm per ha pumped (illustrative cost model).` : 'Your Compare settings are rainfed, so this shows 0; switch to "Can irrigate" in Compare to see the pumped volume.'}</dd></div>
      </dl>

      <div className="callout text-sm">
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

      <section aria-labelledby="qa-t" className="border-t border-stone-300 pt-4">
        <h3 id="qa-t" className="text-xl font-bold text-green-950">Farmer Q&amp;A (coming soon)</h3>
        <p className="mt-1 text-sm text-stone-700">A place for farmers to ask questions is planned but not built. The three questions below are <strong>samples written by the team</strong> to show how it could look: nobody posted them, and each answer is copied from this app's glossary (Data &amp; methods tab).</p>
        <ul className="mt-3 space-y-3">
          {SAMPLE_QA.map((x) => (
            <li key={x.q} className="rounded border border-dashed border-stone-400 bg-stone-50 p-3 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-semibold"><span className="rounded border border-stone-500 bg-white px-1.5 py-0.5 text-sm font-bold tracking-wide">SAMPLE</span>{x.q}</p>
              <p className="mt-1 text-stone-800">{x.a}</p>
            </li>
          ))}
        </ul>
        <button type="button" disabled className="mt-3 min-h-[44px] cursor-not-allowed rounded border border-stone-400 bg-stone-200 px-3 text-sm font-medium text-stone-700">Ask a question (coming soon)</button>
        <p className="mt-2 text-sm text-stone-700">For advice today, visit the San Mateo Municipal Agriculture Office in person. We found no official contact page to link to.</p>
      </section>
    </section>
  );
}
