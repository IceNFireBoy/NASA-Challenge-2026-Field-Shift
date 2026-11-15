// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { CROPS, SOILS, FIELD_SITUATIONS, IRRIGATION, MODEL } from '../engine/params.js';
import { SOURCES, GLOSSARY, SOIL_HEALTH_PRIMER } from '../engine/content.js';
import StatusBadge from './StatusBadge.jsx';

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
  out.push({ k: 'Irrigation efficiency', p: IRRIGATION.efficiency }, { k: 'Irrigation cost (PHP per mm per ha)', p: IRRIGATION.costPhpPerMm });
  out.push({ k: 'Flowering window (share of mid stage)', p: MODEL.flowerFrac }, { k: 'Heat flag (days at 35 C or hotter)', p: MODEL.heatFlagDays });
  Object.values(CROPS).forEach((c) => {
    const n = c.short;
    if (c.durationDays) out.push({ k: `${n}: duration (days)`, p: c.durationDays });
    if (c.kc) out.push({ k: `${n}: Kc (ini ${c.kc.ini}, mid ${c.kc.mid}, end ${c.kc.end})`, p: { status: c.kc.status, source: c.kc.source } });
    if (c.rootDepthM) out.push({ k: `${n}: root depth (m)`, p: c.rootDepthM });
    if (c.ky) out.push({ k: `${n}: Ky`, p: c.ky });
    out.push({ k: `${n}: soil-health tier`, p: c.soilTier }, { k: `${n}: labour (man-days/ha)`, p: c.laborMdHa });
    if (c.econ && !c.isFallow) out.push({ k: `${n}: yield (kg/ha)`, p: c.econ.yieldKgHa }, { k: `${n}: price (PHP/kg)`, p: c.econ.pricePhpKg }, { k: `${n}: cost (PHP/ha)`, p: c.econ.costPhpHa });
    if (!c.isFallow) out.push({ k: `${n}: seed rate (kg/ha)`, p: c.seedRateKgHa });
  });
  return out;
}

export default function DataMethods({ climate }) {
  const m = climate.meta;
  return (
    <div className="space-y-4">
      <section aria-labelledby="dm-src" className="rounded-lg border border-stone-300 bg-white p-4">
        <h2 id="dm-src" className="text-lg font-bold text-green-900">Data sources</h2>
        <ul className="mt-2 space-y-3 text-sm">
          {(m.sources || []).map((s) => (
            <li key={s.id}>
              <a className="font-semibold text-sky-800 underline" href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              <span className="ml-2 rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-xs">status: {s.status}</span>
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

      <section aria-labelledby="dm-method" className="rounded-lg border border-stone-300 bg-white p-4">
        <h2 id="dm-method" className="text-lg font-bold text-green-900">How it works, in plain words</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{METHOD.map((t) => <li key={t}>{t}</li>)}</ul>
        <h3 className="mt-3 font-semibold">Harmonising data</h3>
        <p className="text-sm">Everything is resampled to one point and a monthly time step. NASA POWER cells are about 50 km and IMERG cells about 11 km, so field-scale differences are not captured.</p>
        <h3 className="mt-3 font-semibold">Why rules and statistics, not an SI (AI) model</h3>
        <p className="text-sm">Rules and statistics are transparent and can be checked by farmers and extension workers, and they work with small local data. SI was used only as a coding assistant.</p>
      </section>

      <section aria-labelledby="dm-par" className="rounded-lg border border-stone-300 bg-white p-4">
        <h2 id="dm-par" className="text-lg font-bold text-green-900">Parameters and their status</h2>
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

      <section aria-labelledby="dm-gl" className="rounded-lg border border-stone-300 bg-white p-4">
        <h2 id="dm-gl" className="text-lg font-bold text-green-900">Glossary</h2>
        <dl className="mt-2 space-y-2 text-sm">{GLOSSARY.map((g) => <div key={g.term}><dt className="font-semibold">{g.term}</dt><dd className="text-stone-700">{g.text}</dd></div>)}</dl>
        <h3 className="mt-4 font-semibold">How rotations build soil health</h3>
        <dl className="mt-1 space-y-2 text-sm">{SOIL_HEALTH_PRIMER.map((g) => <div key={g.title}><dt className="font-semibold">{g.title}</dt><dd className="text-stone-700">{g.text}</dd></div>)}</dl>
      </section>

      <section aria-labelledby="dm-lim" className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h2 id="dm-lim" className="text-lg font-bold text-amber-900">Limitations</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">{LIMITS.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="mt-2 text-sm">This tool supports, not replaces, farmer and expert judgement.</p>
      </section>
    </div>
  );
}
