// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { CROPS, SOILS, FIELD_SITUATIONS, IRRIGATION, MODEL } from '../engine/params.js';
import { SOURCES, GLOSSARY, SOIL_HEALTH_PRIMER } from '../engine/content.js';
import { lazy, Suspense } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { LIGHT_RULES, MAX_PICKS, PICK_WEIGHTS, PRIORITIES } from '../lib/farmer.js';

// Leaflet loads only when this tab is opened.
const ResolutionMap = lazy(() => import('./ResolutionMap.jsx'));

const METHOD = [
  'Reference evapotranspiration (ET0) is estimated with the Hargreaves formula from NASA POWER daily temperatures.',
  'Crop water need = ET0 x FAO-56 crop coefficients (Kc) at each growth stage.',
  'Usable rain is the USDA-SCS effective rainfall, which discounts runoff and deep drainage.',
  'Stored soil water = FAO-56 available water x root depth x the starting fraction, scaled by NASA POWER root-zone wetness for the chosen scenario.',
  'Yield loss from water shortage uses FAO-33 yield-response factors (Ky).',
  'Each option gets a weighted score from your priorities (drought safety, soil, cover, income, labour, forage); weights are always normalised to 100%.',
  'Monte Carlo: the comparison is re-run 300 times with yields, prices, costs, durations, water-use factors, starting soil water and weights varied within plausible ranges.',
  'Scenarios (typical, strong El Nino, 2015 El Nino) summarise past seasons. They are not forecasts.',
];

const LIMITS = [
  'One point (San Mateo) is modelled; field-scale differences are not captured.',
  'Past seasons are not forecasts.',
  'Economics are illustrative until replaced with local prices and costs.',
  'No pest or disease model.',
  'No groundwater or capillary rise.',
  'No field validation yet.',
];

const rng = (x) => (x?.range ? `${x.range[0]} to ${x.range[1]}` : 'n/a');
const note = (x) => x?.source ?? x?.note ?? '';

function rows() {
  const out = [];
  Object.values(SOILS).forEach((s) => out.push({ k: `Soil: ${s.label}: available water (m3/m3 per m)`, p: s.tawPerM }));
  Object.values(FIELD_SITUATIONS).forEach((f) => out.push({ k: `Field: ${f.label}: starting soil water fraction`, p: f.initialFraction }));
  out.push({ k: 'Irrigation efficiency', p: IRRIGATION.efficiency }, { k: 'Irrigation cost (₱ per mm per ha)', p: IRRIGATION.costPhpPerMm });
  out.push({ k: 'Flowering window (share of mid stage)', p: MODEL.flowerFrac }, { k: 'Heat flag (days at 35 C or hotter)', p: MODEL.heatFlagDays });
  Object.values(CROPS).forEach((c) => {
    const n = c.short;
    if (c.durationDays) out.push({ k: `${n}: duration (days)`, p: c.durationDays });
    if (c.kc) out.push({ k: `${n}: Kc (ini ${c.kc.ini}, mid ${c.kc.mid}, end ${c.kc.end})`, p: { status: c.kc.status, source: c.kc.source } });
    if (c.rootDepthM) out.push({ k: `${n}: root depth (m)`, p: c.rootDepthM });
    if (c.ky) out.push({ k: `${n}: Ky`, p: c.ky });
    out.push({ k: `${n}: soil-health tier`, p: c.soilTier }, { k: `${n}: labour (man-days/ha)`, p: c.laborMdHa });
    if (c.econ && !c.isFallow) out.push({ k: `${n}: yield (kg/ha)`, p: c.econ.yieldKgHa }, { k: `${n}: price (₱/kg)`, p: c.econ.pricePhpKg }, { k: `${n}: cost (₱/ha)`, p: c.econ.costPhpHa });
    if (!c.isFallow) out.push({ k: `${n}: seed rate (kg/ha)`, p: c.seedRateKgHa });
  });
  return out;
}

export default function DataMethods({ climate }) {
  const tr = useTr();
  const m = climate.meta;
  return (
    <div className="space-y-4">
      <section aria-labelledby="dm-src" className="card">
        <h2 id="dm-src" className="text-xl font-bold text-green-950">{tr('Data sources')}</h2>
        <ul className="mt-2 space-y-3 text-sm">
          {(m.sources || []).map((s) => (
            <li key={s.id}>
              <a className="font-semibold text-sky-800 underline" href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              <span className="ml-2 rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-sm">status: {s.status}</span>
              {s.resolution_note && <p className="text-stone-700">{s.resolution_note}</p>}
              {s.citation && <p className="text-stone-600">{s.citation}</p>}
            </li>
          ))}
        </ul>
        {m.enso && <p className="mt-3 text-sm"><strong>ENSO rule:</strong> {m.enso.rule}. Source: <a className="text-sky-800 underline" href={m.enso.url} target="_blank" rel="noreferrer">{m.enso.index}</a>.</p>}
        <h3 className="mt-3 font-semibold">Other references</h3>
        <ul className="list-disc pl-5 text-sm">
          {Object.values(SOURCES).map((s) => <li key={s.url}><a className="text-sky-800 underline" href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
        </ul>
      </section>

      <section aria-labelledby="dm-map" className="card">
        <h2 id="dm-map" className="text-xl font-bold text-green-950">{tr('Where the data comes from')}</h2>
        <p className="mb-3 mt-1 text-sm text-stone-700">One point is modelled. The map shows how large a single grid cell of each NASA product is compared with the town.</p>
        <Suspense fallback={<p className="text-sm">Loading map…</p>}><ResolutionMap location={m.location} /></Suspense>
        {(climate.ndvi || climate.soilgrids) && (
          <ul className="mt-3 space-y-2 text-sm">
            {[climate.ndvi, climate.soilgrids].filter(Boolean).map((x) => (
              <li key={x.url}><a className="font-semibold text-sky-800 underline" href={x.url} target="_blank" rel="noreferrer">{x.source}</a>
                <span className="block text-stone-700">{x.citation} Accessed {x.accessed}. {x.note}</span></li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="dm-method" className="card">
        <h2 id="dm-method" className="text-xl font-bold text-green-950">{tr('How it works, in plain words')}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{METHOD.map((t) => <li key={t}>{t}</li>)}</ul>
        <h3 className="mt-3 font-semibold">Harmonising data</h3>
        <p className="text-sm">Everything is resampled to one point and a monthly time step. NASA POWER cells are about 50 km and IMERG cells about 11 km, so field-scale differences are not captured.</p>
        <h3 className="mt-3 font-semibold">Why rules and statistics, not an SI (AI) model</h3>
        <p className="text-sm">Rules and statistics are transparent and can be checked by farmers and extension workers, and they work with small local data. SI was used only as a coding assistant.</p>
      </section>

      <section aria-labelledby="dm-par" className="card">
        <h2 id="dm-par" className="text-xl font-bold text-green-950">{tr('Parameters and their status')}</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Model parameters with value, range, status and source</caption>
            <thead><tr className="border-b border-stone-300"><th scope="col" className="py-1 pr-2">Parameter</th><th scope="col" className="pr-2">Value</th><th scope="col" className="pr-2">Range</th><th scope="col" className="pr-2">Status</th><th scope="col">Source or note</th></tr></thead>
            <tbody>
              {rows().map((r) => (
                <tr key={r.k} className="border-b border-stone-200 align-top">
                  <th scope="row" className="py-1 pr-2 font-normal">{r.k}</th>
                  <td className="pr-2">{typeof r.p.value === 'object' ? 'see note' : (r.p.value ?? 'n/a')}</td>
                  <td className="pr-2">{rng(r.p)}</td>
                  <td className="pr-2"><StatusBadge status={r.p.status} /></td>
                  <td className="text-stone-700">{note(r.p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="dm-farmer" className="card">
        <h2 id="dm-farmer" className="flex flex-wrap items-center gap-2 text-xl font-bold text-green-950">{tr('Farmer view rules')} <StatusBadge status="assumption" /></h2>
        <p className="mt-1 text-sm">The Farmer view uses the same engine and settings as this Analytics and Community view. These simplifications are our own choices:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Priorities: each picked card (up to {MAX_PICKS}) sets its criterion to weight {PICK_WEIGHTS.picked}; every other criterion gets {PICK_WEIGHTS.other}. No pick keeps the default weights. Cards map to: {PRIORITIES.map((p) => `${p.id} = ${p.criterion}`).join(', ')}.</li>
          <li>El Niño question: "yes" uses the strong El Niño scenario; "no" and "not sure" use the typical year, and the result also states what a strong El Niño year would change.</li>
          <li>Water light: good above {LIGHT_RULES.water.good * 100}% of crop water need met by rain and stored soil water, okay from {LIGHT_RULES.water.ok * 100}%, risky below; good when irrigating.</li>
          <li>Soil light: good at soil-health tier {LIGHT_RULES.soil.good} or more, okay from {LIGHT_RULES.soil.ok}, risky below.</li>
          <li>Income light: good when net return per hectare is positive, okay at zero, risky when negative (illustrative prices unless you edit them).</li>
          <li>Work light: good up to {LIGHT_RULES.work.good * 100}% of your labour limit, okay up to {LIGHT_RULES.work.ok * 100}%, risky above.</li>
          <li>Technical asides (crop coefficients, yield-response factors) are hidden from the Farmer view's why-card; the figures themselves are unchanged.</li>
          <li>Filipino labels were drafted with SI and checked by native speakers on the team.</li>
        </ul>
      </section>

      <section aria-labelledby="dm-gl"className="card">
        <h2 id="dm-gl" className="text-xl font-bold text-green-950">{tr('Glossary')}</h2>
        <dl className="mt-2 space-y-2 text-sm">{GLOSSARY.map((g) => <div key={g.term}><dt className="font-semibold">{g.term}</dt><dd className="text-stone-700">{g.text}</dd></div>)}</dl>
        <h3 className="mt-4 font-semibold">How rotations build soil health</h3>
        <dl className="mt-1 space-y-2 text-sm">{SOIL_HEALTH_PRIMER.map((g) => <div key={g.title}><dt className="font-semibold">{g.title}</dt><dd className="text-stone-700">{g.text}</dd></div>)}</dl>
      </section>

      <section aria-labelledby="dm-lim" className="card">
        <h2 id="dm-lim" className="text-xl font-bold text-green-950">{tr('Limitations')}</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">{LIMITS.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="callout mt-3 text-sm font-semibold">{tr('This tool supports, not replaces, farmer and expert judgement.')}</p>
      </section>
    </div>
  );
}
